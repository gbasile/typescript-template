import { NS } from "@ns";
import { canGainControl, gainControl } from "../server.hack";
import { available_servers, canRunScript, validHackTarget } from "../server.explore";

/** @param {NS} ns */
export async function main(ns: NS) {
    const ideal_index = ns.args[0] as number;

    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    while (true) {
        const target = await getTarget(ns, ideal_index);
        gainControl(ns, target);

        const moneyThresh: number = ns.getServerMaxMoney(target);
        const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.15;
        while (true) {
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

                break; // Done with this server, get a new target
            }
        }
    }
}

async function getTarget(ns: NS, ideal_index: number): Promise<string> {
    const servers = await available_servers(ns);

    const bestServers = servers
        .filter((server) => canGainControl(ns, server))
        .filter(canRunScript)
        .filter(validHackTarget)
        .filter((server) => ns.getServerMoneyAvailable(server) != 0)
        .filter((server) => !["n00dles", "zer0", "nectar-net", "omega-net"].includes(server))
        .sort((a, b) => getFitness(ns, b) - getFitness(ns, a));

    if (bestServers.length == 0) {
        ns.tprint(`ERROR: Not hackable servers available anymore, available servers: ${servers.join(',')}`);
        return "nectar-net"
    }

    return bestServers[ideal_index % bestServers.length];
}

function getFitness(ns: NS, host: string) {
    return ns.getServerMaxMoney(host) * ns.formulas.hacking.hackChance(ns.getServer(host), ns.getPlayer()) / (
        ns.formulas.hacking.hackTime(ns.getServer(host), ns.getPlayer())
        + ns.formulas.hacking.weakenTime(ns.getServer(host), ns.getPlayer())
        + ns.formulas.hacking.growTime(ns.getServer(host), ns.getPlayer())
    )
}