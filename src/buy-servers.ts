import { NS } from "@ns";
import { deploy } from "./utils/deploy";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    // How much RAM each purchased server will have. Power of 2
    const ram: number = 8;

    // Iterator we'll use for our loop
    let i: number = 0;

    // Continuously try to purchase servers until we've reached the maximum amount of servers
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money to purchase a server
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // If we have enough money, then:
            // 1. Purchase the server
            // 2. Copy our hacking script onto the newly-purchased server
            // 3. Run our hacking script on the newly-purchased server with 3 threads
            // 4. Increment our iterator to indicate that we've bought a new server
            const hostname: string = ns.purchaseServer("minion-" + i, ram);
            await deploy(ns, hostname, 'utils/virus.js', ['utils/best-server.js', 'utils/server-hacking.js']);
            ++i;
        }
        // Make the script wait for a second before looping again.
        // Removing this line will cause an infinite loop and crash the game.
        await ns.sleep(1000);
    }
}