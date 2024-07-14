import { NS } from "@ns";
import { deploy } from "./utils/deploy";
import { canGainControl } from "./utils/server-hacking";
import { getScript, Phase } from "./utils/phases";

export async function startAutoDeploy(ns: NS, phase: Phase) {
    ns.tprint(`INFO: Spreading the virus over the network`);
    autoDeploy(ns, "home", phase, new Set<string>());
}

function autoDeploy(ns: NS, currentHost: string, phase: Phase, visitedHosts: Set<string>) {
    if (visitedHosts.has(currentHost)) {
        return;
    }
    visitedHosts.add(currentHost);

    if (canGainControl(ns, currentHost)) {
        deploy(ns, currentHost, getScript(phase));
    }

    var hosts: string[] = ns.scan(currentHost);
    for (var host of hosts) {
        autoDeploy(ns, host, phase, visitedHosts);
    }
}