import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    let host = ns.args[0] as string
    let delay = ns.args[1] as number

    await ns.sleep(delay);
    await ns.hack(host);
}