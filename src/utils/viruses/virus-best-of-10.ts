import { NS } from "@ns";
import { canGainControl } from "../server-hacking";
import { available_servers } from "../server-exploring";

/** @param {NS} ns */
export async function main(ns: NS) {
    var changeServer = false;
    var alreadyHacked = new Set<string>()

    while (true) {
        const servers = await available_servers(ns, "home", 10);
        const bestServers = servers
            .filter((server) => canGainControl(ns, server.name))
            .filter((server) => !alreadyHacked.has(server.name))
            .sort((a, b) => ns.getServerMaxMoney(b.name) - ns.getServerMaxMoney(a.name));

        if (bestServers.length == 0) {
            ns.tprint(`ERROR: Not hackable servers available anymore, available servers: ${servers.reduce((acc, server) => `${acc}, [${server.name}|${server.moneyAvailable}|${server.maxMoney}}]`, "")}`);
            return
        }

        const target = bestServers[Math.floor(Math.random() * Math.min(bestServers.length, 10))].name;
        alreadyHacked.add(target);

        // Defines how much money a server should have before we hack it
        // In this case, it is set to the maximum amount of money.
        const moneyThresh: number = ns.getServerMaxMoney(target) * 0.8;

        // Defines the maximum security level the target server can have. 
        // If the target's security level is higher than this, we'll weaken it before doing anything else
        const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.5;

        // Infinite loop that continuously hacks/grows/weakens the target server
        while (!changeServer) {
            if (ns.getServerSecurityLevel(target) > securityThresh) {
                // If the server's security level is above our threshold, weaken it
                await ns.weaken(target);
            } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
                // If the server's money is less than our threshold, grow it
                await ns.grow(target);
            } else {
                // Otherwise, hack it
                if (await ns.hack(target) == 0) {
                    changeServer = true
                }
            }
        }
    }

}
