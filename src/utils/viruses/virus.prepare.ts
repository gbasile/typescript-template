import { NS } from "@ns";
import { ramAvailable } from "../server.ram";
import { canGainControl, gainControl } from "../server.hack";

export const HACK_SCRIPT = 'utils/bin.hack.js';
export const GROW_SCRIPT = 'utils/bin.grow.js';
export const WEAKEN_SCRIPT = 'utils/bin.weaken.js';


/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const source = ns.args[0] as string || 'home';
    const target = ns.args[1] as string || 'n00dles';

    await prepare(ns, source, target);
}

// Returns offset for the new batch
export async function prepare(ns: NS, source: string, target: string) {
    // ns.tprint(`Preparing ${target} from ${source}`);
    if (ns.getServerMaxRam(source) == 0) {
        ns.tprint(`No ram available on ${source}`)
        return;
    }

    if (!canGainControl(ns, target)) {
        ns.tprint(`Cant' gain control of ${target}`)
        return;
    }

    gainControl(ns, target);

    const SAFETY_DELAY = 100;
    const SCRIPT_RAM_COST = ns.getScriptRam(GROW_SCRIPT);
    const THREADS_AVAILABLE = Math.floor(ramAvailable(ns, source) / SCRIPT_RAM_COST);
    const S_MAX_MONEY = ns.getServerMaxMoney(target);
    const S_MIN_SEC_LEVEL = ns.getServerMinSecurityLevel(target);

    const startMoney = ns.getServerMoneyAvailable(target);
    const startSec = ns.getServerSecurityLevel(target);
    // ns.tprint(`Money       : ${ns.formatNumber(startMoney, 2)} / ${ns.formatNumber(S_MAX_MONEY, 2)} (${ns.formatPercent(startMoney / S_MAX_MONEY)})`)
    // ns.tprint(`Security    : ${ns.formatNumber(startSec, 1)} / ${ns.formatNumber(S_MIN_SEC_LEVEL, 1)} = +${startSec - S_MIN_SEC_LEVEL}`);

    while (!optimalState(ns, target)) {
        const WEAKEN_PER_THREAD = ns.weakenAnalyze(1, ns.getServer(target).cpuCores);
        const WEAKEN_TIME = ns.getWeakenTime(target) + SAFETY_DELAY;
        const GROW_PER_THREAD = ns.growthAnalyzeSecurity(1) / WEAKEN_PER_THREAD;
        const GROW_TIME = ns.getGrowTime(target) + SAFETY_DELAY;

        if (ns.getServerSecurityLevel(target) > S_MIN_SEC_LEVEL) {
            const threadCostToWeaken = Math.ceil((ns.getServerSecurityLevel(target) - S_MIN_SEC_LEVEL) / WEAKEN_PER_THREAD);
            const threads = Math.min(threadCostToWeaken, THREADS_AVAILABLE);
            if (ns.exec(WEAKEN_SCRIPT, source, threads, target) != 0) {
                await ns.sleep(WEAKEN_TIME);
            } else {
                ns.tprint(`Sleeping 1 sec`);
                await ns.sleep(1_000);
            }
            continue;
        }

        if (ns.getServerMoneyAvailable(target) < S_MAX_MONEY) {
            const threadCostToGrow = Math.ceil((S_MAX_MONEY - ns.getServerMoneyAvailable(target)) / GROW_PER_THREAD);
            const threads = Math.min(threadCostToGrow, THREADS_AVAILABLE);
            if (ns.exec(GROW_SCRIPT, source, threads, target) != 0) {
                await ns.sleep(GROW_TIME);
            } else {
                ns.tprint(`Sleeping 1 sec`);
                await ns.sleep(1_000);
            }
            continue;
        }
    }

    const maxMoney = ns.getServerMaxMoney(target);
    const money = Math.max(ns.getServerMoneyAvailable(target), 0.1);
    const minSec = ns.getServerMinSecurityLevel(target);
    const sec = ns.getServerSecurityLevel(target);
    // ns.tprint(`${target} ready `);
    // ns.tprint(`Money       : ${ns.formatNumber(money, 2)} / ${ns.formatNumber(maxMoney, 2)} (${ns.formatPercent(money / maxMoney)})`)
    // ns.tprint(`Security    : ${ns.formatNumber(sec, 1)} / ${ns.formatNumber(minSec, 1)} = +${sec - minSec}`);
}

export function optimalState(ns: NS, target: string) {
    return ns.getServerSecurityLevel(target) == ns.getServerMinSecurityLevel(target)
        && ns.getServerMoneyAvailable(target) == ns.getServerMaxMoney(target);
}