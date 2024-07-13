import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = "n00dles";

    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    const moneyThresh: number = ns.getServerMaxMoney(target) * 0.8;

    // Defines the maximum security level the target server can have. 
    // If the target's security level is higher than this, we'll weaken it before doing anything else
    const securityThresh: number = ns.getServerMinSecurityLevel(target) * 1.5;

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
            await ns.hack(target);
        }
    }
}
