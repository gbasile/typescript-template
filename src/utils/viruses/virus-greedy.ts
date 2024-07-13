import { NS } from "@ns";
import { canGainControl, gainControl } from "../server-hacking";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    while (true) {
        const bestServers = ns.scan("home")
            .filter((server) => canGainControl(ns, server))
            .sort((a, b) => ns.getServerMoneyAvailable(b) - ns.getServerMoneyAvailable(a));

        const bestFastServer = bestServers.filter((server) => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel() / 2)
        const target = bestFastServer[0] || bestServers[0];
        gainControl(ns, target);
        await ns.hack(target);
    }
}
