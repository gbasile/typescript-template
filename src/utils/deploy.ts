import { NS } from "@ns";
import { gainControl } from "./server-hacking";

/** @param {NS} ns */
export async function deploy(ns: NS, host: string, script: string, dependencies: string[]) {
    // ns.tprint(`'${script}' deploying on '${host}'`);
    gainControl(ns, host);
    ns.killall(host);

    ns.scp(script, host);
    for (var dependency of dependencies) {
        ns.scp(dependency, host)
    }
    const threads = Math.floor((ns.getServerMaxRam(host) - ns.getServerUsedRam(host)) / ns.getScriptRam(script));

    if (threads == 0) {
        // ns.tprint("Not enough ram");
        return;
    }

    ns.exec(script, host, threads);
    // ns.tprint(`'${script}' deployed on '${host}' with ${threads} threads`);
}