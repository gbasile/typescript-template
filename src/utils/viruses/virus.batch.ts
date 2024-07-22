import { NS } from "@ns";
import { calculate_threads, calculate_times } from "../server.analyze";
import { prepare } from "./virus.prepare";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const source = ns.args[0] as string || 'home';
    const target = ns.args[1] as string || 'n00dles';

    await singleBatch(ns, source, target);
}

// Returns offset for the new batch
export async function singleBatch(ns: NS, source: string, target: string) {
    await prepare(ns, source, target);

    const SAFETY_DELAY = 50;
    const [hackThreads, weakenThreads, growThreads, weaken2Threads] = calculate_threads(ns, target, 0.1);
    const [hackTime, weakenTime, growTime, weaken2Time] = calculate_times(ns, target, SAFETY_DELAY);

    ns.tprint(`[TIME] W = ${weakenTime}, G = ${growTime}, W2 = ${weaken2Time}, H = ${hackTime}`);

    const delay = 50;
    const hackStartTime = Math.abs(hackTime - weakenTime + delay);
    const weakenStartTime = hackStartTime + hackTime - weakenTime + delay;
    const growStartTime = weakenStartTime + weakenTime - growTime + delay;
    const weaken2StartTime = growStartTime + growTime - weaken2Time + delay;

    ns.tprint(`[START] W = ${weakenStartTime}, G = ${growStartTime}, W2 = ${weaken2StartTime}, H = ${hackStartTime}`);

    ns.exec('utils/bin.hack.js', source, hackThreads, target, hackStartTime);
    ns.exec('utils/bin.weaken.js', source, weakenThreads, target, weakenStartTime);
    ns.exec('utils/bin.grow.js', source, growThreads, target, growStartTime)
    ns.exec('utils/bin.weaken.js', source, weaken2Threads, target, weaken2StartTime);

    return delay * 4
}
