import { NS } from "@ns";
import { availablePortExploits, portExploits } from "./utils/server-hacking";
import { startAutoDeploy } from "./deployer";
import { PhaseRequirements, phases } from "./utils/phases";
import { networkingToolsRoutine } from "./utils/routines/networking-tools-routine";
import { portExploitsRoutine } from "./utils/routines/port-exploits-routine";
import { buyServersRoutine, upgradeServersRoutine } from "./utils/routines/purchased-server-routine";
import { buyRouterRoutine } from "./utils/routines/buy-router-routine";
import { minPurchasedServerRam } from "./utils/purchased-server";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    await buyRouterRoutine(ns);

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
                const duration = new Date().getTime() - start;
                ns.tprint(`INFO: Phase completed in ${duration / 1000}s`)
            }
            await ns.sleep(5_000)
        }
    }
}

function requirementsMet(ns: NS, requirements: PhaseRequirements) {

    // ns.tprint(`${requirements.portsExploited <= availablePortExploits(ns).length}`);
    // ns.tprint(`${requirements.purchasedServer <= ns.getPurchasedServers().length}`);
    // ns.tprint(`${requirements.purchasedServerRAM} <= ${minPurchasedServerRam(ns)} = ${requirements.purchasedServerRAM <= minPurchasedServerRam(ns)}`);
    return requirements.portsExploited <= availablePortExploits(ns).length
        && requirements.purchasedServer <= ns.getPurchasedServers().length
        && requirements.purchasedServerRAM <= minPurchasedServerRam(ns)
        && requirements.scripts.every((script) => ns.fileExists(script))
}