import { NS } from "@ns";
import { deploy } from "./utils/deploy";

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    await auto_deploy(ns, "home", new Set<string>());
}

export async function auto_deploy(ns: NS, target: string, visitedHosts: Set<string>) {
    // Avoid revisiting hosts
    if (visitedHosts.has(target)) {
        // ns.tprint(`Skipping '${target}', already visited`)
        return;
    }

    // Mark the target as visited
    visitedHosts.add(target);

    if (target != "home") {
        // ns.tprint(`Starting deploy on '${target}'`)
        await deploy(ns, target, 'utils/virus.js', ['utils/best-server.js']);
    }

    // Explores connected nodes
    var hosts: string[] = ns.scan(target);
    // ns.tprint(`'${target}' connected servers:\n ['${hosts.join(', ')}']`)
    for (var host of hosts) {
        await auto_deploy(ns, host, visitedHosts);
    }
}
