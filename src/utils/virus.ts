import { NS } from "@ns";
import { best_server } from "./best-server";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    // const targets: Array<string> = await best_server(ns, "home", 3);
    // const random_index = Math.floor(Math.random() * targets.length);
    // const target = targets[random_index]
    const target: string = "n00dles";
    // ns.tprint(`${ns.getHostname()} hacking ${target}`)

    // Defines how much money a server should have before we hack it
    // In this case, it is set to the maximum amount of money.
    const moneyThresh: number = ns.getServerMaxMoney(target) * 0.5;

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
