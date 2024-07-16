import { NS } from "@ns";
import { canGainControl, gainControl } from "../server-hacking";
import { available_servers, notHackableServers } from "../server-exploring";

/** @param {NS} ns */
export async function main(ns: NS) {
    const ideal_index = ns.args[0] as number;
    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    while (true) {
        const servers = await available_servers(ns, "home", 10);
        const bestServers = servers
            .filter((server) => canGainControl(ns, server.name))
            .filter((server) => !notHackableServers.has(server.name))
            .filter((server) => !server.name.startsWith('minion'))
            .filter((server) => ns.getServerRequiredHackingLevel(server.name) < ns.getHackingLevel() / 2)
            .filter((server) => server.moneyAvailable != 0)
            .sort((a, b) =>
                ns.getServerMaxMoney(b.name) / ns.getServerRequiredHackingLevel(b.name) -
                ns.getServerMaxMoney(a.name) / ns.getServerRequiredHackingLevel(a.name)
            );

        if (bestServers.length == 0) {
            ns.tprint(`ERROR: Not hackable servers available anymore, available servers: ${servers.reduce((acc, server) => `${acc}, [${server.name}|${server.moneyAvailable}|${server.maxMoney}}]`, "")}`);
            return
        }

        const target = bestServers[Math.min(bestServers.length - 1, ideal_index)].name;
        gainControl(ns, target);
        const moneyThresh: number = ns.getServerMaxMoney(target) * 0.9;
        const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.1;

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            const currentMoney = ns.getServerMoneyAvailable(target);
            const maxMoney = ns.getServerMaxMoney(target);
            const multiplier = maxMoney / Math.max(currentMoney, 1);
            const targetThreads = ns.growthAnalyze(target, multiplier);

            await ns.grow(target, { threads: Math.min(targetThreads, availableThreads) });
        } else {
            const targetThreads = ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.1)
            if (await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) }) == 0) {
                ns.tprint(`ERROR: Earned no money after hacking ${target}, add it to the blacklist`)
            }
        }
    }
}
