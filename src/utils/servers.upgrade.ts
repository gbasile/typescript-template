import { NS } from "@ns";
import { maxPurchasedServerRam, minPurchasedServerRam } from "./automation/routines/routine.buy.server";
import { availableWorkers } from "./server.explore";

const INITIAL_RAM = 2 ** 3;

/** @param {NS} ns */
export async function main(ns: NS) {
    const serversLeftToPurchase = ns.getPurchasedServers().length < ns.getPurchasedServerLimit();
    if (serversLeftToPurchase) {
        buyMissingServers(ns);
        return
    }

    upgradeServers(ns);
}

function buyMissingServers(ns: NS) {
    var purchasedServers = 0;
    var costForServer = ns.getPurchasedServerCost(INITIAL_RAM);
    while (ns.getPurchasedServers().length < ns.getPurchasedServerLimit()) {
        if (costForServer > ns.getServerMoneyAvailable('home')) {
            ns.tprint(`No more money available, purchased ${purchasedServers} servers`);
            return;
        }

        const serverNumber = (ns.getPurchasedServers().length + 1).toString().padStart(2, '0');
        const newServer = `minion-${serverNumber}`;
        ns.purchaseServer(newServer, INITIAL_RAM);
        purchasedServers += 1;
    }

    ns.tprint(`Purchased ${purchasedServers} servers with ${ns.formatRam(INITIAL_RAM)}`);
}

function upgradeServers(ns: NS) {
    let diffRam = maxPurchasedServerRam(ns) - minPurchasedServerRam(ns);
    let targetRam = (diffRam > 0) ? maxPurchasedServerRam(ns) : maxPurchasedServerRam(ns) * 2;

    ns.tprint(`diffRam ${diffRam} targetRam ${targetRam}`);

    const serversToUpgrade = ns.getPurchasedServers()
        .filter((worker) => ns.getServerMaxRam(worker) == minPurchasedServerRam(ns));

    var upgradedServers = 0;
    var cost = 0;
    for (const server of serversToUpgrade) {
        const upgradeCost = ns.getPurchasedServerCost(targetRam)
        if (upgradeCost > ns.getServerMoneyAvailable('home')) {
            ns.tprint(`No more money available, upgraded ${upgradedServers} servers to ${ns.formatRam(targetRam)}`);
            return;
        }

        ns.upgradePurchasedServer(server, targetRam);
        upgradedServers += 1;
        cost += upgradeCost;
    }


    ns.tprint(`Upgraded ${upgradedServers} servers to ${ns.formatRam(targetRam)}, total cost ${ns.formatNumber(cost, 0)}`);

}