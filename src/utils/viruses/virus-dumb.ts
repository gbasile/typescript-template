import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = "n00dles";
    const availableThreads = ns.ps(ns.getHostname())
        .filter((process => process.filename == ns.getScriptName()))
        .reduce((acc, process) => process.threads + acc, 0);

    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    const moneyThresh: number = ns.getServerMaxMoney(target) * 0.8;

    // Defines the maximum security level the target server can have. 
    // If the target's security level is higher than this, we'll weaken it before doing anything else
    const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.3;

    // Infinite loop that continuously hacks/grows/weakens the target server
    while (true) {
        if (ns.getServerSecurityLevel(target) > securityThresh) {
            // If the server's security level is above our threshold, weaken it
            await ns.weaken(target);
        } else if (ns.getServerMoneyAvailable(target) < moneyThresh) {
            // If the server's money is less than our threshold, grow it
            await ns.grow(target);
        } else {
            // Otherwise, hack it
            const targetThreads = ns.hackAnalyzeThreads(target, ns.getServerMaxMoney(target) * 0.1)
            const availableThreads = ns.getRunningScript("utils/viruses/virus-best-hack-10.js")?.threads ?? 1;
            if (await ns.hack(target, { threads: Math.min(targetThreads, availableThreads) }) == 0) {
                ns.tprint(`ERROR: Earned no money after hacking ${target}, add it to the blacklist`)
            }
        }
    }
}
