import { NS } from "@ns";

const exploits: [string, (ns: NS, host: string) => void][] = [
    ["BruteSSH.exe", (ns: NS, host: string) => ns.brutessh(host)],
    ["FTPCrack.exe", (ns: NS, host: string) => ns.ftpcrack(host)],
    ["relaySMTP.exe", (ns: NS, host: string) => ns.relaysmtp(host)],
    ["HTTPWorm.exe", (ns: NS, host: string) => ns.httpworm(host)],
    ["SQLInject.exe", (ns: NS, host: string) => ns.sqlinject(host)]
];

export function can_gain_control(ns: NS, host: string): boolean {
    if (ns.hasRootAccess(host)) {
        return true
    }

    var ports_hackeables = 0;

    exploits
        .filter(([name,]) => ns.fileExists(name, "home"))
        .reduce((acc,) => acc + 1, 0)

    return ns.getServerNumPortsRequired(host) <= ports_hackeables
}

export function can_be_hacked(ns: NS, host: string): boolean {
    return ns.getServerRequiredHackingLevel(host) <= ns.getHackingLevel()
}

export async function gain_control(ns: NS, host: string) {
    if (!can_gain_control(ns, host)) {
        return
    }

    exploits
        .filter(([name,]) => ns.fileExists(name, "home"))
        .forEach(([, method]) => method(ns, host))

    // Get root access to target server
    if (!ns.hasRootAccess(host)) {
        // ns.tprint(`Can't get root on ${host} with ${ns.getServerNumPortsRequired(host)} ports`);
        return;
    }

    ns.nuke(host);
}