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

        const [hackThreads, growThreads, weakenThreads] = calculate_threads(ns, host, porcentageTarget);
        const [hackTime, growthTime, weakenTime] = calculate_times(ns, host);

        ns.print(`Money       : ${ns.formatNumber(money, 2)} / ${ns.formatNumber(maxMoney, 2)} (${ns.formatPercent(money / maxMoney)})`)
        ns.print(`Security    : ${ns.formatNumber(sec, 1)} / ${ns.formatNumber(minSec, 1)} = +${sec - minSec}`);
        ns.print(`hack_time   : ${ns.tFormat(hackTime)} (t=${Math.ceil(hackThreads)})`);
        ns.print(`growth_time : ${ns.tFormat(growthTime)} (t=${Math.ceil(growThreads)})`);
        ns.print(`weaken_time : ${ns.tFormat(weakenTime)} (t=${Math.ceil(weakenThreads)})`);

        await ns.sleep(2_000);
    }
}

export function calculate_threads(ns: NS, host: string, porcentageTarget: number): [number, number, number] {
    const minSec = ns.getServerMinSecurityLevel(host);
    const maxMoney = ns.getServerMaxMoney(host);
    const sec = ns.getServerSecurityLevel(host);
    const money = Math.max(ns.getServerMoneyAvailable(host), 0.1);

    const hackThreads = Math.ceil(ns.hackAnalyzeThreads(host, maxMoney * porcentageTarget));
    const growThreads = Math.ceil(ns.growthAnalyze(host, maxMoney / money));
    const weakenThreads = Math.ceil(sec - minSec) * 20

    return [hackThreads, growThreads, weakenThreads]
}

export function calculate_times(ns: NS, host: string): [number, number, number] {
    const hackTime = ns.getHackTime(host);
    const growthTime = ns.getGrowTime(host);
    const weakenTime = ns.getWeakenTime(host);

    return [hackTime, growthTime, weakenTime]
}