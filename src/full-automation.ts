import { NS } from "@ns";
import { availablePortExploits, portExploits } from "./utils/server-hacking";
import { startAutoDeploy } from "./deployer";
import { networkingTools } from "./utils/networking-tools";

const purchasedServerTargetRam = 2 ** 5;

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    await startAutoDeploy(ns);

    while (true) {
        buyRouter(ns);

        await networkingToolsRoutine(ns);
        var newExploits = await portExploitsRoutine(ns);
        var newServers = await buyServersRoutine(ns);
        var newUpgrades = await upgradeServersRoutine(ns);
        if (newExploits || newServers || newUpgrades) {
            await startAutoDeploy(ns);
        }

        // TODO Exploit again when hacking level changes 

        await ns.sleep(5_000)
    }
}

function buyRouter(ns: NS) {
    if (ns.hasTorRouter()) {
        return
    }

    // TODO: Use when singularity is available
    // if (ns.getServerMoneyAvailable("home") > 200_000_000) {
    //     ns.tprint("Tor Router acquired!")
    //     ns.singularity.purchaseTor()
    // }

    if (ns.getServerMoneyAvailable("home") > 200_000_000) {
        ns.tprint("Tor Router ready to be aquired!")
    }
}

var lastNumberExploits = 0;
async function portExploitsRoutine(ns: NS) {
    // TODO Automatic buy exploits
    printAvailableExploits(ns);
    const numberOfAvailableExploits = availablePortExploits(ns).length;
    var newExploits = lastNumberExploits != numberOfAvailableExploits;
    lastNumberExploits = numberOfAvailableExploits;
    return newExploits
}

async function networkingToolsRoutine(ns: NS) {
    // TODO Automatic buy networking Tools
    printAvailableNetworkingTools(ns);
}


function printAvailableExploits(ns: NS) {
    portExploits
        .filter(([name, ,]) => !ns.fileExists(name, "home"))
        .filter(([, cost,]) => ns.getServerMoneyAvailable("home") > cost)
        .forEach(([name, ,]) => {
            if (ns.hasTorRouter()) {
                ns.tprint(`buy ${name}`)
            }
        })
}

function printAvailableNetworkingTools(ns: NS) {
    networkingTools
        .filter(([name,]) => !ns.fileExists(name, "home"))
        .filter(([, cost]) => ns.getServerMoneyAvailable("home") > cost)
        .forEach(([name,]) => {
            if (ns.hasTorRouter()) {
                ns.tprint(`buy ${name}`)
            }
        })
}

async function buyServersRoutine(ns: NS) {
    const ownedServers = ns.getPurchasedServers();
    if (ownedServers.length >= ns.getPurchasedServerLimit()) {
        return false
    }

    if (ns.getServerMoneyAvailable("home") < ns.getPurchasedServerCost(purchasedServerTargetRam)) {
        return false
    }

    const newServer = `minion-${ownedServers.length + 1}`;
    ns.purchaseServer(newServer, purchasedServerTargetRam)
    ns.tprint(`Server purchased ${newServer}!`)

    return true
}

async function upgradeServersRoutine(ns: NS) {
    const ownedServers = ns.getPurchasedServers();
    var upgraded = false
    for (const server of ownedServers) {
        if (ns.getServerMaxRam(server) < purchasedServerTargetRam && ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(purchasedServerTargetRam)) {
            if (ns.upgradePurchasedServer(server, purchasedServerTargetRam)) {
                upgraded = true;
            }
        }
    }

    return upgraded
}