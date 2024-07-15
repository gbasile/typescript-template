import { NS } from "@ns";
import { canGainControl, gainControl } from "../server-hacking";
import { available_servers, notHackableServers } from "../server-exploring";

/** @param {NS} ns */
export async function main(ns: NS) {
    const ideal_index = ns.args[0] as number;

    const servers = await available_servers(ns, "home", 10);

    const bestServers = servers
        .filter((server) => canGainControl(ns, server.name))
        .filter((server) => !notHackableServers.has(server.name))
        .filter((server) => !server.name.startsWith('minion'))
        .filter((server) => server.moneyAvailable != 0)
        .sort((a, b) => ns.getServerMaxMoney(b.name) - ns.getServerMaxMoney(a.name));

    // TODO: Create a fitness method
    const fastServers = servers
        .splice(0, 30)
        .sort(
            (a, b) =>
                (
                    ns.formulas.hacking.hackTime(ns.getServer(a.name), ns.getPlayer())
                    + ns.formulas.hacking.weakenTime(ns.getServer(a.name), ns.getPlayer())
                    + ns.formulas.hacking.growTime(ns.getServer(a.name), ns.getPlayer())
                ) - (
                    ns.formulas.hacking.hackTime(ns.getServer(b.name), ns.getPlayer())
                    + ns.formulas.hacking.weakenTime(ns.getServer(b.name), ns.getPlayer())
                    + ns.formulas.hacking.growTime(ns.getServer(b.name), ns.getPlayer())
                )
        );

    if (fastServers.length == 0) {
        ns.tprint(`ERROR: Not hackable servers available anymore, available servers: ${servers.reduce((acc, server) => `${acc}, [${server.name}|${server.moneyAvailable}|${server.maxMoney}}]`, "")}`);
        return
    }

    const target = bestServers[Math.min(bestServers.length - 1, ideal_index)].name;
    gainControl(ns, target);

    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    while (true) {
        // Defines how much money a server should have before we hack it
        // In this case, it is set to the maximum amount of money.
        const moneyThresh: number = ns.getServerMaxMoney(target);

        // Defines the maximum security level the target server can have. 
        // If the target's security level is higher than this, we'll weaken it before doing anything else
        const securityThresh: number = ns.getServerMinSecurityLevel(target);

        // Infinite loop that continuously hacks/grows/weakens the target server

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            const currentMoney = ns.getServerMoneyAvailable(target);
            const maxMoney = ns.getServerMaxMoney(target);
            const multiplier = maxMoney / Math.max(currentMoney, 1);  // Avoid division by zero
            const targetThreads = ns.growthAnalyze(target, multiplier);


            await ns.grow(target, { threads: Math.min(targetThreads, availableThreads) });
        } else {
            // Otherwise, hack it
            const targetThreads = ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.1)
            if (await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) }) == 0) {
                ns.tprint(`ERROR: Earned no money after hacking ${target}, add it to the blacklist`)
            }
        }

    }
}
