import { NS } from "@ns";
import { deploy } from "./utils/deploy";
import { canGainControl } from "./utils/server-hacking";

/** @param {NS} ns */
export async function main(ns: NS) {
    await startAutoDeploy(ns)
}

export async function startAutoDeploy(ns: NS) {
    ns.tprint(`Spreading the virus over the network`);
    await autoDeploy(ns, "home", new Set<string>());
}

async function autoDeploy(ns: NS, target: string, visitedHosts: Set<string>) {
    if (visitedHosts.has(target)) {
        return;
    }
    visitedHosts.add(target);

    if (target != "home" && canGainControl(ns, target)) {
        // ns.tprint(`Starting deploy on '${target}'`)
        await deploy(ns, target, 'utils/virus.js', ['utils/best-server.js', 'utils/server-hacking.js']);
    }

    // Explores connected nodes
    var hosts: string[] = ns.scan(target);
    // ns.tprint(`'${target}' connected servers:\n ['${hosts.join(', ')}']`)
    for (var host of hosts) {
        await autoDeploy(ns, host, visitedHosts);
    }
}
