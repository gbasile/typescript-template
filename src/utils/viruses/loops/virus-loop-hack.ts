import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = ns.args[0] as string;

    while (true) {
        if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target) * 0.9) {
            if (ns.getServerMoneyAvailable(target) * 1.8 < ns.getServerMaxMoney(target) * 0.7) {
                // Funds < 70%, helps to growth
                await ns.grow(target);
            } else {
                // Slow wait for the cycle
                await ns.sleep(5_000);
            }
        } else {
            // Hack it
            const availableThreads = ns.ps(ns.getHostname())
                .filter((process) => process.filename == ns.getScriptName())
                .reduce((acc, process) => process.threads + acc, 0);
            const targetThreads = ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.1)
            await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) });
        }
    }
}