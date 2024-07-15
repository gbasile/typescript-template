import { NS } from "@ns";
import { deploy } from "./utils/deploy";
import { canGainControl } from "./utils/server-hacking";
import { getScript, Phase } from "./utils/phases";
import { available_servers, notHackableServers } from "./utils/server-exploring";
import { getIndex } from "./utils/index-host-mapping";

export async function startAutoDeploy(ns: NS, phase: Phase) {
    ns.tprint(`INFO: Spreading the virus over the network`);
    await autoDeploy(ns, "home", phase, new Set<string>());
}

async function autoDeploy(ns: NS, currentHost: string, phase: Phase, visitedHosts: Set<string>) {
    const server_infos = await available_servers(ns, "home", 10);
    const servers = server_infos
        .map((server) => server.name);

    const ownedServers = [...servers, 'home']
        .filter((server) => canGainControl(ns, server))
        .filter((server) => notHackableServers.has(server));

    for (const server of ownedServers) {
        deploy(ns, server, getScript(phase), getIndex(server));
    }
}