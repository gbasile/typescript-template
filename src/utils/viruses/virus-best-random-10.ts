import { NS } from "@ns";
import { canGainControl, gainControl } from "../server.hack";
import { available_servers, validHackTarget } from "../server.explore";

/** @param {NS} ns */
export async function main(ns: NS) {
    const ideal_index = ns.args[0] as number;
    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    while (true) {
        const servers = await available_servers(ns);
        // ns.tprint(`${servers}`)
        const bestServers = servers
            .filter((server) => canGainControl(ns, server))
            .filter(validHackTarget)
            .filter((server) => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel() / 2)
            .filter((server) => ns.getServerMoneyAvailable(server) != 0)
            .sort((a, b) => getFitness(ns, b) - getFitness(ns, a));

        if (bestServers.length == 0) {
            ns.tprint(`ERROR: Not hackable servers available anymore, available servers: ${servers.join(',')}`);
            return
        }

        const target = bestServers[Math.min(bestServers.length - 1, ideal_index)];
        gainControl(ns, target);
        const moneyThresh: number = ns.getServerMaxMoney(target) * 0.9;
        const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.1;

        if (ns.getServerSecurityLevel(target) > securityThresh) {
            await ns.weaken(target, { threads: availableThreads });
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

function getFitness(ns: NS, host: string) {
    const growthFactor = ns.getServerMoneyAvailable(host) * ns.getServerGrowth(host);
    const distanceFactor = 1 / 10 * ns.getServerRequiredHackingLevel(host) - ns.getHackingLevel()
    return ns.getServerMaxMoney(host) * growthFactor * distanceFactor
}