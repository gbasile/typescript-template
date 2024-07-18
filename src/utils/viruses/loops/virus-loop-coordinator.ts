import { NS } from "@ns";
import { available_servers, notHackableServers } from "/utils/server-exploring";
import { canGainControl, gainControl } from "/utils/server-hacking";

const hackRatio = 0.15;
const weakenRatio = 0.05;
const growRatio = 0.80;

var ramAllocatedToHack = 0;
var ramAllocatedToWeaken = 0;
var ramAllocatedToGrow = 0;
var ramAvailable = 0


/** @param {NS} ns */
export async function main(ns: NS) {
    const target = await bestTarget(ns);
    const serverInfos = await available_servers(ns, "home");
    const hackableHosts = serverInfos
        .filter((server) => canGainControl(ns, server.name))
        .map((server) => server.name);
    const allHosts = ['home', ...hackableHosts];

    ramAvailable = allHosts.reduce((acc, host) => acc + ns.getServerMaxRam(host), 0);

    ramAllocatedToHack = 0;
    ramAllocatedToWeaken = 0;
    ramAllocatedToGrow = 0;

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
            await ns.sleep(Math.random() * 500);
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
            await ns.sleep(Math.random() * 500);
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
            await ns.sleep(Math.random() * 500);
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
    const servers = await available_servers(ns, "home", 10);
    const bestServers = servers
        .filter((server) => canGainControl(ns, server.name))
        .filter((server) => !notHackableServers.has(server.name))
        .filter((server) => !server.name.startsWith('minion'))
        .filter((server) => ns.getServerRequiredHackingLevel(server.name) < ns.getHackingLevel() / 2)
        .filter((server) => server.moneyAvailable != 0)
        .sort((a, b) => getFitness(ns, b.name) - getFitness(ns, a.name));
    return bestServers[0].name;
}

function getFitness(ns: NS, host: string) {
    return ns.getServerMaxMoney(host) / ns.getServerRequiredHackingLevel(host)
}