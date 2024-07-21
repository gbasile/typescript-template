import { NS } from "@ns";
import { connectCommand } from "./find-server";

export const portExploits: [string, number, (ns: NS, host: string) => void][] = [
    ["BruteSSH.exe", 500_000, (ns: NS, host: string) => ns.brutessh(host)],
    ["FTPCrack.exe", 1_500_000, (ns: NS, host: string) => ns.ftpcrack(host)],
    ["relaySMTP.exe", 5_000_000, (ns: NS, host: string) => ns.relaysmtp(host)],
    ["HTTPWorm.exe", 30_000_000, (ns: NS, host: string) => ns.httpworm(host)],
    ["SQLInject.exe", 250_000_000, (ns: NS, host: string) => ns.sqlinject(host)]
];

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = ns.args[0] as string;
    if (!canGainControl(ns, target)) {
        ns.tprint(`${target} can't be hacked`);
        return
    }
    portExploits.forEach(
        ([file, , command]) => {
            if (ns.fileExists(file, 'home')) {
                command(ns, target);
            }
        }
    )

    ns.nuke(target);

    const path = connectCommand(ns, ns.getHostname(), target, ns.getHostname());
    ns.tprint(`${path} backdoor`);
}

export function availablePortExploits(ns: NS) {
    return portExploits
        .filter(([name, ,]) => ns.fileExists(name, "home"))
}

export function canGainControl(ns: NS, host: string): boolean {
    if (ns.hasRootAccess(host)) {
        return true
    }

    if (ns.getServerRequiredHackingLevel(host) > ns.getHackingLevel()) {
        return false
    }

    return ns.getServerNumPortsRequired(host) <= availablePortExploits(ns).length;
}

export function gainControl(ns: NS, host: string) {
    if (ns.hasRootAccess(host)) {
        return true;
    }

    if (!canGainControl(ns, host)) {
        ns.tprint(`Trying to get control of ${host} but not possible`);
        return false;
    }

    portExploits
        .filter(([name,]) => ns.fileExists(name, "home"))
        .forEach(([, , method]) => method(ns, host))

    ns.nuke(host);

    if (!ns.hasRootAccess(host)) {
        ns.tprint(`ERROR: can not get root on ${host} with ${ns.getServerNumPortsRequired(host)} ports (we should)`);
        return false;
    }

    return true;
}