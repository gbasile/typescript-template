import { NS } from "@ns";

/** @param {NS} ns */
export function ramAvailable(ns: NS, host: string) {
    return ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
}