import { NS } from "@ns";
import { deploy } from "./deploy";
import { canGainControl } from "./server-hacking";
import { Phase } from "./phases";
import { available_servers, canRunScript } from "./server-exploring";
import { getIndex } from "./index-host-mapping";

export async function startAutoDeploy(ns: NS, phase: Phase) {
    ns.tprint(`INFO: Spreading the virus over the network`);
    await autoDeploy(ns, phase);
}

async function autoDeploy(ns: NS, phase: Phase) {
    const servers = await available_servers(ns);

    var hackableServers = servers
        .filter((server) => canGainControl(ns, server))
        .filter(canRunScript);

    hackableServers.push('home');
    switch (phase.config.deployment.strategy.name) {
        case 'copy':
            for (const server of hackableServers) {
                deploy(ns, server, phase.config.deployment.script, getIndex(server));
            }
            break;
        case 'run-once':
            ns.exec(phase.config.deployment.script, 'home');
    }
}