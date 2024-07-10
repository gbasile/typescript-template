import { NS } from "@ns";
import { gain_control } from "./server-hacking";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const args = ns.args;
    if (args.length !== 2) {
        ns.tprint("Usage: run deploy.js <host> <script>");
        return;
    }

    const host: string = args[0] as string;
    const script: string = args[1] as string;

    await deploy(ns, host, script, ['best_server.js', 'server-hacking.js']);
}

export async function deploy(ns: NS, host: string, script: string, dependencies: string[]) {
    gain_control(ns, host);
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