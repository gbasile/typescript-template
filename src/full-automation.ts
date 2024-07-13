import { NS } from "@ns";
import { availablePortExploits, portExploits } from "./utils/server-hacking";
import { startAutoDeploy } from "./deployer";
import { networkingTools } from "./utils/networking-tools";
import { deploy } from "./utils/deploy";
import { getScript, Phase, PhaseRequirements, phases } from "./utils/phases";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    buyRouter(ns);

    while (!ns.hasTorRouter()) {
        await ns.sleep(1_000);
    }

    for (var phase of phases) {
        ns.tprint(`INFO: Phase started ${phase.name}`)
        const start = new Date().getTime();
        var phaseCompleted = false;
        await startAutoDeploy(ns, phase);

        while (!phaseCompleted) {
            networkingToolsRoutine(ns);
            var newExploits = portExploitsRoutine(ns);
            buyServersRoutine(ns, phase);
            upgradeServersRoutine(ns, phase);
            if (newExploits) {
                await startAutoDeploy(ns, phase);
            }

            phaseCompleted = requirementsMet(ns, phase.requirements);
            if (phaseCompleted) {
                const end = new Date().getTime();
                const duration = end - start;
                ns.tprint(`INFO: Phase completed in ${duration / 1000}s`)
            }
            await ns.sleep(5_000)
        }
    }
}

function requirementsMet(ns: NS, requirements: PhaseRequirements) {
    // ns.tprint(`${requirements.portsExploited <= availablePortExploits(ns).length}`);
    // ns.tprint(`${requirements.purchasedServer <= ns.getPurchasedServers().length}`);
    // ns.tprint(`${requirements.purchasedServerRAM >= minPurchasedServerRam(ns)}`);
    return requirements.portsExploited <= availablePortExploits(ns).length
        && requirements.purchasedServer <= ns.getPurchasedServers().length
        && requirements.purchasedServerRAM >= minPurchasedServerRam(ns)
}

function minPurchasedServerRam(ns: NS) {
    return ns.getPurchasedServers()
        .reduce((minRam, server) => Math.min(minRam, ns.getServerMaxRam(server)), 0)
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

    if (ns.getServerMoneyAvailable("home") > 200_000) {
        ns.tprint("WARN: Tor Router ready to be aquired!")
    }
}

var lastNumberExploits = 0;
function portExploitsRoutine(ns: NS) {
    // TODO Automatic buy exploits
    printAvailableExploits(ns);
    const numberOfAvailableExploits = availablePortExploits(ns).length;
    var newExploits = lastNumberExploits != numberOfAvailableExploits;
    lastNumberExploits = numberOfAvailableExploits;
    return newExploits
}

function networkingToolsRoutine(ns: NS) {
    // TODO Automatic buy networking Tools
    if (availablePortExploits(ns).length < portExploits.length) {
        return
    }
    printAvailableNetworkingTools(ns);
}

var notifiedExploits = new Set<string>()
function printAvailableExploits(ns: NS) {
    if (!ns.hasTorRouter()) {
        return
    }
    var exploitsToPurchase = portExploits
        .filter(([name, ,]) => !ns.fileExists(name, "home"))
        .filter(([, cost,]) => ns.getServerMoneyAvailable("home") > cost)
        .filter(([name, ,]) => !notifiedExploits.has(name))

    if (exploitsToPurchase.length == 0) {
        return
    }

    exploitsToPurchase
        .forEach(([name, ,]) => notifiedExploits.add(name));

    var command = exploitsToPurchase
        .reduce((command, [name, ,]) => `${command} buy ${name};`, ">");

    ns.tprint(`WARN: Execute ${command}`)
}

var notifiedTools = new Set<string>()
function printAvailableNetworkingTools(ns: NS) {
    var networkingToolsToPurchase = networkingTools
        .filter(([name,]) => !ns.fileExists(name, "home"))
        .filter(([, cost]) => ns.getServerMoneyAvailable("home") > cost)
        .filter(([name, ,]) => !notifiedTools.has(name))

    if (networkingToolsToPurchase.length == 0) {
        return
    }

    networkingToolsToPurchase
        .forEach(([name, ,]) => notifiedTools.add(name));

    var command = networkingToolsToPurchase
        .reduce((command, [name, ,]) => `${command} buy ${name};`, ">");
    ns.tprint(`WARN: Execute ${command}`)
}

function buyServersRoutine(ns: NS, phase: Phase) {
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

    const newServer = `minion-${ownedServers.length + 1}`;
    ns.purchaseServer(newServer, phase.requirements.purchasedServerRAM)
    ns.tprint(`INFO: Server purchased ${newServer}!`)
    deploy(ns, newServer, getScript(phase));
}

function upgradeServersRoutine(ns: NS, phase: Phase) {
    if (minPurchasedServerRam(ns) >= phase.requirements.purchasedServerRAM) {
        return
    }

    const ownedServers = ns.getPurchasedServers();
    for (const server of ownedServers) {
        if (ns.getServerMaxRam(server) < phase.requirements.purchasedServerRAM && ns.getServerMoneyAvailable("home") >= ns.getPurchasedServerCost(phase.requirements.purchasedServerRAM)) {
            if (ns.upgradePurchasedServer(server, phase.requirements.purchasedServerRAM)) {
                ns.tprint(`INFO: Server ${server} upgraded to ${phase.requirements.purchasedServerRAM}!`)
                deploy(ns, server, getScript(phase))
            }
        }
    }
}