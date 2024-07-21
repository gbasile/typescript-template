import { NS } from "@ns";

export async function buyRouterRoutine(ns: NS) {
    if (ns.hasTorRouter()) {
        return
    }

    if (ns.getServerMoneyAvailable("home") > 200_000) {
        ns.tprint("WARN: Tor Router ready to be aquired!")
    }

    while (!ns.hasTorRouter()) {
        await ns.sleep(1_000);
    }
}