import { NS } from "@ns";

export function minPurchasedServerRam(ns: NS) {
    return ns.getPurchasedServers()
        .reduce((minRam, server) => Math.min(minRam, ns.getServerMaxRam(server)), 0)
}