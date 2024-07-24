import { NS } from "@ns";
import { canGainControl } from "./server.hack";

/** @param {NS} ns */
export async function main(ns: NS) {
    const servers = await available_servers(ns);
    ns.tprint(`${servers.join(",")}`)
}

export function canRunScript(server: string) {
    if (['CSEC', 'darkweb'].includes(server)) {
        return false
    }

    return true;
}

export function validHackTarget(server: string) {
    return server != "home" && !server.startsWith('minion-') && !['silver-helix'].includes(server)
}

export async function available_servers(ns: NS, from: string = "home", max_depth: number = 1000): Promise<string[]> {
    const servers = new Array<string>();
    await explore_servers(ns, from, servers, 0, max_depth)

    return servers;
}

async function explore_servers(ns: NS, from: string, visited: Array<string>, depth: number, max_depth: number) {
    if (depth >= max_depth) {
        return;
    }
    // Avoid revisiting hosts
    if (visited.map((s) => s).includes(from)) {
        return;
    }

    var hosts: string[] = ns.scan(from);
    if (from != "home") {
        visited.push(from);
    }

    for (var host of hosts) {
        await explore_servers(ns, host, visited, depth + 1, max_depth);
    }
}
