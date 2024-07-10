import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const args = ns.args;
    if (args.length !== 2) {
        ns.tprint("Usage: run deploy.js <host> <script>");
        return;
    }

    const host: string = args[0] as string;
    const script: string = args[1] as string;

    await deploy(ns, host, script, ['best_server.js']);
}

export async function deploy(ns: NS, host: string, script: string, dependencies: [string]) {
    let openPorts = 0;

    // If we have the BruteSSH.exe program, use it to open the SSH Port on the target server
    if (ns.fileExists("BruteSSH.exe", "home")) {
        ns.brutessh(host);
        openPorts += 1;
    }

    // If we have the FTPCrack.exe program, use it to open the FTP Port on the target server
    if (ns.fileExists("FTPCrack.exe", "home")) {
        ns.ftpcrack(host);
        openPorts += 1;
    }

    // Get root access to target server
    if (!ns.hasRootAccess(host) && ns.getServerNumPortsRequired(host) > openPorts) {
        // ns.tprint(`Can't get root on ${host} with ${ns.getServerNumPortsRequired(host)} ports`);
        return;
    }

    ns.nuke(host);
    ns.killall(host);

    await ns.scp(script, host);
    for (var dependency of dependencies) {
        await ns.scp(dependency, host)
    }
    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));

    if (threads == 0) {
        // ns.tprint("Not enough ram");
        return;
    }

    ns.exec(script, host, threads);
    ns.tprint(`'${script}' deployed on '${host}' with ${threads} threads`);
}