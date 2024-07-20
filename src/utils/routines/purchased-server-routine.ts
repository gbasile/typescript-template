import { NS } from "@ns";
import { Phase } from "../phases";
import { deploy } from "../deploy";
import { minPurchasedServerRam } from "../purchased-server";
import { getIndex } from "../index-host-mapping";

export function buyServersRoutine(ns: NS, phase: Phase) {
    const ownedServers = ns.getPurchasedServers();
    if (ownedServers.length >= ns.getPurchasedServerLimit()) {
        return false;
    }

    if (ownedServers.length >= phase.requirements.purchasedServer) {
        return false;
    }

    if (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)) {
        return false;
    }

    const serverNumber = (ownedServers.length + 1).toString().padStart(2, '0');
    const newServer = `minion-${serverNumber}`;
    ns.purchaseServer(newServer, phase.requirements.purchasedServerRAM)
    ns.tprint(`INFO: Server purchased ${newServer}!`)
    return true;
}

export function upgradeServersRoutine(ns: NS, phase: Phase) {
    if (minPurchasedServerRam(ns) >= phase.requirements.purchasedServerRAM) {
        return
    }

    // ns.tprint(`Upgrading machines to ${phase.requirements.purchasedServerRAM}, cost: ${ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)}`)
    const ownedServers = ns.getPurchasedServers();
    var upgraded = false;
    for (const server of ownedServers) {
        if (ns.getServerMaxRam(server) < phase.requirements.purchasedServerRAM && ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)) {
            if (ns.upgradePurchasedServer(server, phase.requirements.purchasedServerRAM)) {
                ns.tprint(`INFO: Server ${server} upgraded to ${phase.requirements.purchasedServerRAM}!`)
                upgraded = true;
            }
        }
    }
    return upgraded
}