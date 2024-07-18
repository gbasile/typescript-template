import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = ns.args[0] as string;
    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    while (true) {
        if (ns.getServerMoneyAvailable(target) < ns.getServerMaxMoney(target)) {
            await ns.sleep(5_000);
            continue;
        }
        const targetThreads = ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.1)
        await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) });
    }
}