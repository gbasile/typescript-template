import { NS } from "@ns";
import { calculate_threads, calculate_times } from "../server.analyze";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const source = ns.args[0] as string || 'home';
    const target = ns.args[1] as string || 'n00dles';
    while (true) {
        const [hackThreads, growthThreads, weakenThreds] = calculate_threads(ns, target, 0.1);
        const [hackTime, growthTime, weakenTime] = calculate_times(ns, target);

        if (weakenThreds > 0) {
            ns.exec('utils/bin.weaken.js', source, weakenThreds, target);
        }

        if (growthThreads > 0) {
            ns.exec('utils/bin.grow.js', source, growthThreads, target);
        }

        if (hackThreads > 0) {
            ns.exec('utils/bin.hack.js', source, hackThreads, target);
        }

        await ns.sleep(Math.max(hackTime, growthTime, weakenTime) + 20);
    }
}
