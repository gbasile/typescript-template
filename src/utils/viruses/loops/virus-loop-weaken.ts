import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = ns.args[0] as string;

    while (true) {
        await ns.weaken(target);
        await ns.sleep(Math.random() * 5_000);
    }
}