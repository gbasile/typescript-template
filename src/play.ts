import { NS } from "@ns";
import { nextPhase, requirementsMet } from "./utils/automation/phases";
import { portExploitsRoutine } from "./utils/automation/routines/routine.ports.exploits";
import { buyServersRoutine, upgradeServersRoutine } from "./utils/automation/routines/routine.buy.server";
import { networkingToolsRoutine } from "./utils/automation/routines/routine.networking.tools";
import { startAutoDeploy } from "./utils/deployer";


/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    //Logs are nice to know whats going on
    disableLogs(ns);

    // await buyRouterRoutine(ns);
    var phase;
    while (phase = nextPhase(ns)) {
        ns.tprint(`INFO: Phase started ${phase.name}`)
        const start = new Date().getTime();
        var phaseCompleted = false;
        await startAutoDeploy(ns, phase);

        while (!phaseCompleted) {
            networkingToolsRoutine(ns);
            var newExploits = portExploitsRoutine(ns);
            var newServers = buyServersRoutine(ns, phase);
            var newUpgrades = upgradeServersRoutine(ns, phase);
            if (newExploits || newServers || newUpgrades) {
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

function disableLogs(ns: NS) {
    ns.disableLog('sleep');
    ns.disableLog('getServerMaxRam');
    ns.disableLog('getServerUsedRam');
    ns.disableLog('getServerSecurityLevel');
    ns.disableLog('getServerMinSecurityLevel');
    ns.disableLog('getServerMaxMoney');
    ns.disableLog('getServerMoneyAvailable');
    ns.disableLog('getHackingLevel');
    ns.clearLog();
}