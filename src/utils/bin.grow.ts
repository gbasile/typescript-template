import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    let host = ns.args[0] as string

    await ns.grow(host);
}