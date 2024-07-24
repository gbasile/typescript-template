import { NS } from "@ns";
import { canGainControl } from "./server.hack";
import { Phase } from "./automation/phases";
import { available_servers, canRunScript, validHackTarget } from "./server.explore";


/** @param {NS} ns */
export async function main(ns: NS) {
    ns.tprint(`INFO: Spreading the virus over the network`);
    await autoDeploy(ns);
}
async function autoDeploy(ns: NS) {
    const servers = await available_servers(ns);

    var workers = servers
        .filter((server) => canGainControl(ns, server))
        .filter((server) => ns.getServerMaxRam(server) > 16)
        .filter(canRunScript)
        .sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));

    workers.unshift('home');

    var targets = servers
        .filter((server) => canGainControl(ns, server))
        .filter(canRunScript)
        .filter(validHackTarget)
        // .filter((server) => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel() / 2)
        .filter((server) => ns.getServerMoneyAvailable(server) != 0)
        .sort((a, b) => getFitness(ns, b) - getFitness(ns, a));


    for (var i = 0; i < workers.length && i < targets.length; i++) {
        const worker = workers[i];
        const target = targets[i];

        ns.tprint(`${worker} --> ${target}`)
        killOtherProcesses(ns, worker);
        ns.ls('home', 'utils')
            .forEach((file) => ns.scp(file, worker));
        ns.ls('home', 'utils/viruses')
            .forEach((file) => ns.scp(file, worker));

        ns.exec('utils/server.analyze.js', worker, 1, target);
        ns.exec('utils/viruses/virus.batch.js', worker, 1, worker, target);
    }
}

function killOtherProcesses(ns: NS, host: string) {
    var processInfos = ns.ps(host);
    const processInfosToKill = processInfos
        .filter((process) => process.filename != ns.getScriptName())
    for (var process of processInfosToKill) {
        ns.kill(process.pid);
    }
}

function getFitness(ns: NS, host: string) {
    const growthFactor = ns.getServerMoneyAvailable(host) * ns.getServerGrowth(host);
    const distanceFactor = 1 / 10 * ns.getServerRequiredHackingLevel(host) - ns.getHackingLevel()
    return ns.getServerMaxMoney(host) * growthFactor * distanceFactor
}