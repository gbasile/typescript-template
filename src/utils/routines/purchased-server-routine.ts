import { NS } from "@ns";
import { getScript, Phase } from "../phases";
import { deploy } from "../deploy";
import { minPurchasedServerRam } from "../purchased-server";
import { getIndex } from "../index-host-mapping";

export function buyServersRoutine(ns: NS, phase: Phase) {
    const ownedServers = ns.getPurchasedServers();
    if (ownedServers.length >= ns.getPurchasedServerLimit()) {
        return
    }

    if (ownedServers.length >= phase.requirements.purchasedServer) {
        return
    }

    if (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)) {
        return
    }

    const serverNumber = (ownedServers.length + 1).toString().padStart(2, '0');
    const newServer = `minion-${serverNumber}`;
    ns.purchaseServer(newServer, phase.requirements.purchasedServerRAM)
    ns.tprint(`INFO: Server purchased ${newServer}!`)
    deploy(ns, newServer, getScript(phase), getIndex(newServer));
}

export function upgradeServersRoutine(ns: NS, phase: Phase) {
    if (minPurchasedServerRam(ns) >= phase.requirements.purchasedServerRAM) {
        return
    }

    // ns.tprint(`Upgrading machines to ${phase.requirements.purchasedServerRAM}, cost: ${ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)}`)
    const ownedServers = ns.getPurchasedServers();
    for (const server of ownedServers) {
        if (ns.getServerMaxRam(server) < phase.requirements.purchasedServerRAM && ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)) {
            if (ns.upgradePurchasedServer(server, phase.requirements.purchasedServerRAM)) {
                ns.tprint(`INFO: Server ${server} upgraded to ${phase.requirements.purchasedServerRAM}!`)
                deploy(ns, server, getScript(phase), getIndex(server))
            }
        }
    }
}