import { NS } from "@ns";
import { canGainControl, gainControl } from "../server.hack";
import { available_servers, validHackTarget } from "../server.explore";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    while (true) {
        const servers = (await available_servers(ns, "home"))
            .filter((server) => canGainControl(ns, server))
            .filter(validHackTarget)
            .sort((a, b) => ns.getServerMoneyAvailable(b) - ns.getServerMoneyAvailable(a));

        const hackingLevel = ns.getHackingLevel()
        const bestFastServer = servers.filter((server) => ns.getServerRequiredHackingLevel(server) < hackingLevel / 2)
        const target = bestFastServer[0] || servers[0];
        gainControl(ns, target);
        await ns.hack(target);
    }
}
