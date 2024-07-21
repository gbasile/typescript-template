import { NS } from "@ns";
import { canGainControl, gainControl } from "../server-hacking";
import { canRunScript, validHackTarget } from "../server-exploring";

/** @param {NS} ns */
export async function main(ns: NS) {
    const ideal_index = ns.args[0] as number;
    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    // Infinite loop that continuously hacks/grows/weakens the target server
    while (true) {
        const targets = ["n00dles", "zer0", "nectar-net", "omega-net", "foodnstuff"]
            .filter((server) => canGainControl(ns, server))
            .filter(canRunScript)
            .filter(validHackTarget)
            .filter((server) => ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel())
        const target = targets[ideal_index % targets.length]
        gainControl(ns, target);
        const moneyThresh: number = ns.getServerMaxMoney(target) * 0.8;
        const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.3;

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
            const availableThreads = ns.getRunningScript("utils/viruses/virus-best-hack-10.js")?.threads ?? 1;
            if (await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) }) == 0) {
                ns.tprint(`ERROR: Earned no money after hacking ${target}, add it to the blacklist`)
            }
        }
    }
}
