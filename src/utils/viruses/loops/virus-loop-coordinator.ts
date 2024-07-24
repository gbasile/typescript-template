import { NS } from "@ns";
import { canGainControl, gainControl } from "/utils/server.hack";
import { available_servers, canRunScript } from "/utils/server.explore";

const hackRatio = 0.10;
const weakenRatio = 0.10;
const growRatio = 0.80;

var ramAvailable = 0;

/** @param {NS} ns */
export async function main(ns: NS) {
    const target = await bestTarget(ns);
    const servers = await available_servers(ns);
    const hackableHosts = servers
        .filter((server) => canGainControl(ns, server))
        .filter(canRunScript)
    const allHosts = ['home', ...hackableHosts];

    ramAvailable = allHosts.reduce((acc, host) => acc + ns.getServerMaxRam(host), 0);

    var ramAllocatedToHack = 0;
    var ramAllocatedToWeaken = 0;
    var ramAllocatedToGrow = 0;

    const hackScript = 'utils/viruses/loops/virus-loop-hack.js';
    const hackScriptRam = ns.getScriptRam(hackScript);
    const growScript = 'utils/viruses/loops/virus-loop-grow.js';
    const growScriptRam = ns.getScriptRam(growScript);
    const weakenScript = 'utils/viruses/loops/virus-loop-weaken.js';
    const weakenScriptRam = ns.getScriptRam(weakenScript);

    for (const host of allHosts) {
        gainControl(ns, host);
        var processInfos = ns.ps(host);
        const processInfosToKill = processInfos
            .filter((process) => process.filename != ns.getScriptName())
        for (var process of processInfosToKill) {
            ns.kill(process.pid);
        }
    }
    var [desiredRamToHack, desiredRamToGrow, desiredRamToWeaken] = desiredRam(ns);
    for (const host of allHosts) {
        while (ramAllocatedToHack < desiredRamToHack) {
            const ramToAllocate = Math.min(desiredRamToHack - ramAllocatedToHack, ns.getServerMaxRam(host) - ns.getServerUsedRam(host));
            var numberOfThreads = Math.floor(ramToAllocate / hackScriptRam);
            if (numberOfThreads == 0) {
                break;
            }
            // ns.tprint(`Hacking from ${host}/${numberOfThreads}`)
            ramAllocatedToHack += ramToAllocate
            ns.scp(hackScript, host);
            ns.exec(hackScript, host, { threads: numberOfThreads }, target);
        }

        while (ramAllocatedToGrow < desiredRamToGrow) {
            const ramToAllocate = Math.min(desiredRamToGrow - ramAllocatedToGrow, ns.getServerMaxRam(host) - ns.getServerUsedRam(host));
            var numberOfThreads = Math.floor(ramToAllocate / growScriptRam);
            if (numberOfThreads == 0) {
                break;
            }
            // ns.tprint(`Growing from ${host}/${numberOfThreads}`)
            ramAllocatedToGrow += ramToAllocate
            ns.scp(growScript, host);
            ns.exec(growScript, host, { threads: numberOfThreads }, target);
        }

        while (ramAllocatedToWeaken < desiredRamToWeaken) {
            const ramToAllocate = Math.min(desiredRamToWeaken - ramAllocatedToWeaken, ns.getServerMaxRam(host) - ns.getServerUsedRam(host));
            var numberOfThreads = Math.floor(ramToAllocate / weakenScriptRam);
            if (numberOfThreads == 0) {
                break;
            }
            // ns.tprint(`Weakening from ${host}/${numberOfThreads}`)
            ramAllocatedToWeaken += ramToAllocate
            ns.scp(weakenScript, host);
            ns.exec(weakenScript, host, { threads: numberOfThreads }, target);
        }
    }
}

function desiredRam(ns: NS): [number, number, number] {

    let desiredRamToHack = ramAvailable * hackRatio;
    let desiredRamToGrow = ramAvailable * growRatio;
    let desiredRamToWeaken = ramAvailable * weakenRatio;

    // ns.tprint(`Desired hack/${desiredRamToHack} grow/${desiredRamToGrow} weaken/${desiredRamToWeaken}`);
    return [desiredRamToHack, desiredRamToGrow, desiredRamToWeaken];

}

async function bestTarget(ns: NS) {
    const servers = await available_servers(ns);
    const bestServers = servers
        .filter((server) => canGainControl(ns, server))
        .filter(canRunScript)
        .filter((server) => ns.getServerRequiredHackingLevel(server) < ns.getHackingLevel() / 2)
        .filter((server) => ns.getServerMoneyAvailable(server) != 0)
        .sort((a, b) => getFitness(ns, b) - getFitness(ns, a));
    return bestServers[0];
}

function getFitness(ns: NS, host: string) {
    return ns.getServerMaxMoney(host) * ns.getServerRequiredHackingLevel(host)
}