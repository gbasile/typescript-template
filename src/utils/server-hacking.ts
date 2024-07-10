import { NS } from "@ns";

const ports_hackeables = 2;

export function can_gain_control(ns: NS, host: string): boolean {
    if (ns.hasRootAccess(host)) {
        return true
    }

    return ns.getServerNumPortsRequired(host) <= ports_hackeables
}

export function can_be_hacked(ns: NS, host: string): boolean {
    return ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel()
}

export async function gain_control(ns: NS, host: string): Promise<void> {
    if (!can_gain_control(ns, host)) {
        return
    }

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
}