import { NS } from "@ns";
import { gainControl } from "./server.hack";

/** @param {NS} ns */
export async function main(ns: NS) {
    let host = ns.args[0] as string
    let script = ns.args[1] as string

    deploy(ns, host, script, -1);
}
export function deploy(ns: NS, host: string, script: string, index: number) {
    gainControl(ns, host);
    var processInfos = ns.ps(host);
    const processInfosToKill = processInfos
        .filter((process) => process.filename != ns.getScriptName())
    for (var process of processInfosToKill) {
        ns.kill(process.pid);
    }


    ns.scp(script, host);
    const dependencies = ['utils/server.hack.js', 'utils/server.explore.js', 'utils/server.find.js'];
    for (var dependency of dependencies) {
        ns.scp(dependency, host)
    }
    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));

    if (threads == 0) {
        return;
    }

    ns.exec(script, host, threads, index)
}