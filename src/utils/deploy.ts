import { NS } from "@ns";
import { gainControl } from "./server-hacking";

/** @param {NS} ns */

/** @param {NS} ns */
export async function main(ns: NS) {
    let host = ns.args[0] as string
    let script = ns.args[1] as string

    deploy(ns, host, script);
}
export function deploy(ns: NS, host: string, script: string) {
    gainControl(ns, host);
    ns.killall(host);

    ns.scp(script, host);
    const dependencies = ['utils/server-hacking.js', 'utils/server-exploring.js'];
    for (var dependency of dependencies) {
        ns.scp(dependency, host)
    }
    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));

    if (threads == 0) {
        return;
    }

    ns.exec(script, host, threads);
}