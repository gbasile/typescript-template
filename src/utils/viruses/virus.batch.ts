import { NS } from "@ns";
import { calculate_threads, calculate_times } from "../server.analyze";
import { GROW_SCRIPT, HACK_SCRIPT, optimalState, prepare, WEAKEN_SCRIPT } from "./virus.prepare";
import { ramAvailable } from "../server.ram";

const SAFETY_DELAY = 50;
const TARGET_PERCENTAGE = 0.1;

var hacksPids: number[] = [];

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const source = ns.args[0] as string || 'home';
    const target = ns.args[1] as string || 'n00dles';

    disableLogs(ns);
    await prepare(ns, source, target);

    var cycle = 0;
    while (true) {
        ns.tprint(`Start cycle ${cycle}`);
        const BATCH_OFFSET = 4 * SAFETY_DELAY;
        const [, weakenTime, ,] = calculate_times(ns, target);
        const BATCH_DURATION = BATCH_OFFSET + weakenTime;
        const BATCHES_PER_CYCLE = Math.floor(BATCH_DURATION / BATCH_OFFSET);
        const CYCLE_DURATION = BATCHES_PER_CYCLE * BATCH_OFFSET;

        ns.tprint(`Batch duration = ${BATCH_DURATION} Batches/Cycle = ${BATCHES_PER_CYCLE}, Cycle Duration = ${CYCLE_DURATION}`);

        for (var i = 0; i < BATCHES_PER_CYCLE; i++) {
            const [hackThreads, weakenThreads, growThreads, weaken2Threads] = calculate_threads(ns, target, TARGET_PERCENTAGE);
            const RAM_FOR_BATCH = Math.ceil(
                hackThreads * ns.getScriptRam(HACK_SCRIPT) +
                weakenThreads * ns.getScriptRam(WEAKEN_SCRIPT) +
                growThreads * ns.getScriptRam(GROW_SCRIPT) +
                weaken2Threads * ns.getScriptRam(WEAKEN_SCRIPT)
            );
            while (ramAvailable(ns, source) < RAM_FOR_BATCH) {
                await ns.sleep(BATCH_OFFSET);
            }

            singleBatch(ns, source, target, i, i * SAFETY_DELAY);
        }

        ns.tprint(`Cycle ${cycle} ended`);
        if (!optimalState(ns, target)) {
            ns.tprint(`Not optimal state, readjusting`);
            killNextHack(ns);
        }

        cycle += 1;
    }
}

// Returns offset for the new batch
export function singleBatch(ns: NS, source: string, target: string, batchId: number = 0, delay: number = 0) {
    const [hackThreads, weakenThreads, growThreads, weaken2Threads] = calculate_threads(ns, target, TARGET_PERCENTAGE);
    const [hackTime, weakenTime, growTime, weaken2Time] = calculate_times(ns, target);

    // ns.tprint(`[TIME] H = ${hackTime}, W = ${weakenTime}, G = ${growTime}, W2 = ${weaken2Time}`);

    const weakenStartTime = delay;
    const weakenEndTime = weakenStartTime + weakenTime;
    const hackEndTime = weakenEndTime - SAFETY_DELAY;
    const hackStartTime = hackEndTime - hackTime;
    const growEndTime = weakenEndTime + SAFETY_DELAY;
    const growStartTime = growEndTime - growTime;
    const weaken2EndTime = growEndTime + SAFETY_DELAY;
    const weaken2StartTime = weaken2EndTime - weaken2Time;

    if (hackEndTime > weakenEndTime) {
        ns.tprint(`ERROR 1`)
        ns.tprint(`[START] H = ${hackStartTime}, W = ${weakenStartTime}`);
        ns.tprint(`[END]   H = ${weaken2EndTime}, W = ${weakenEndTime}`);

        return
    }

    // ns.tprint(`[START] H = ${hackStartTime}, W = ${weakenStartTime}, G = ${growStartTime}, W2 = ${weaken2StartTime}`);
    // ns.tprint(`[END]   H = ${hackEndTime}, W = ${weakenEndTime}, G = ${growEndTime}, W2 = ${growEndTime}`);

    const hackPid = ns.exec('utils/bin.hack.js', source, hackThreads, target, hackStartTime, batchId);
    hacksPids.push(hackPid);
    ns.exec('utils/bin.weaken.js', source, weakenThreads, target, weakenStartTime, batchId);
    ns.exec('utils/bin.grow.js', source, growThreads, target, growStartTime, batchId)
    ns.exec('utils/bin.weaken.js', source, weaken2Threads, target, weaken2StartTime, batchId);
}

function killNextHack(ns: NS) {
    var cancelledFirstHack = false;
    while (!cancelledFirstHack) {
        var firstHackPid = hacksPids.shift()
        if (firstHackPid == undefined) {
            cancelledFirstHack = true;
            continue;
        }

        if (!ns.isRunning(firstHackPid)) {
            continue;
        }

        ns.tprint(`Killing ${firstHackPid}`);
        ns.kill(firstHackPid);
        cancelledFirstHack = true;
    }
}

function disableLogs(ns: NS) {
    ns.disableLog('sleep');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getHackingLevel');
    ns.clearLog();
}