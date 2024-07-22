import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    let host = ns.args[0] as string

    await analyze(ns, host);
}

export async function analyze(ns: NS, host: string) {
    const minSec = ns.getServerMinSecurityLevel(host);
    const maxMoney = ns.getServerMaxMoney(host);
    const porcentageTarget = 0.1;

    while (true) {
        ns.clearLog();
        const sec = ns.getServerSecurityLevel(host);
        const money = Math.max(ns.getServerMoneyAvailable(host), 0.1);

        const [weakenThreads, growThreads, weaken2Threads, hackThreads] = calculate_threads(ns, host, porcentageTarget);
        const [weakenTime, growthTime, weaken2Time, hackTime] = calculate_times(ns, host);

        ns.print(`Money       : ${ns.formatNumber(money, 2)} / ${ns.formatNumber(maxMoney, 2)} (${ns.formatPercent(money / maxMoney)})`)
        ns.print(`Security    : ${ns.formatNumber(sec, 1)} / ${ns.formatNumber(minSec, 1)} = +${sec - minSec}`);
        ns.print(`weaken_time : ${ns.tFormat(weakenTime)} (t=${Math.ceil(weakenThreads)})`);
        ns.print(`growth_time : ${ns.tFormat(growthTime)} (t=${Math.ceil(growThreads)})`);
        ns.print(`weaken_time : ${ns.tFormat(weaken2Time)} (t=${Math.ceil(weaken2Threads)})`);
        ns.print(`hack_time   : ${ns.tFormat(hackTime)} (t=${Math.ceil(hackThreads)})`);

        await ns.sleep(2_000);
    }
}

export function calculate_threads(ns: NS, target: string, porcentageTarget: number): [number, number, number, number] {
    const HACK_MONEY_PERCENTAGE = ns.hackAnalyze(target);
    const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, ns.getServer(target).cpuCores);
    const S_MAX_MONEY = ns.getServerMaxMoney(target);
    const HACK_PER_THREAD = ns.hackAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
    const GROW_PER_THREAD = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;

    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(target, S_MAX_MONEY * porcentageTarget));
    const weakenThreads = Math.ceil(hackThreads * HACK_PER_THREAD);
    const growThreads = Math.ceil(ns.growthAnalyze(target, 1 / (1 - HACK_MONEY_PERCENTAGE * hackThreads)));
    const weaken2Threads = Math.ceil(growThreads * GROW_PER_THREAD);


    return [
        Math.max(hackThreads, 1),
        Math.max(weakenThreads, 1),
        Math.max(growThreads, 1),
        Math.max(weaken2Threads, 1)
    ]
}

export function calculate_times(ns: NS, host: string, safetyDelay: number = 0): [number, number, number, number] {
    const hackTime = ns.getHackTime(host) + safetyDelay;
    const weakenTime = ns.getWeakenTime(host) + safetyDelay;
    const growthTime = ns.getGrowTime(host) + safetyDelay;
    const weaken2Time = ns.getWeakenTime(host) + safetyDelay;

    return [hackTime, weakenTime, growthTime, weaken2Time]
}