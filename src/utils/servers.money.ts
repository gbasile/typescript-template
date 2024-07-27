import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const start = Date.now();
    const moneyStart = ns.getServerMoneyAvailable('home');
    disableLogs(ns);

    while (true) {
        await ns.sleep(2_000);
        const moneyNow = ns.getServerMoneyAvailable('home');
        const moneyDiff = moneyNow - moneyStart;
        const now = Date.now();
        const timeDiff = now - start;

        ns.clearLog();
        ns.print(`Money growth rate = ${ns.formatNumber((moneyDiff / timeDiff) * 1000, 3, 1000, true)} / s`);
    }
}

function disableLogs(ns: NS) {
    ns.disableLog('sleep');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getHackingLevel');

}