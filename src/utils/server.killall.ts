import { NS } from "@ns";
import { available_servers } from "./server.explore";

/** @param {NS} ns */
export async function main(ns: NS) {
    const availableServers = await available_servers(ns);
    availableServers.push('home');
    availableServers.forEach((server) => {
        var processInfos = ns.ps(server);
        const processInfosToKill = processInfos
            .filter((process) => process.filename != ns.getScriptName())
        for (var process of processInfosToKill) {
            ns.kill(process.pid);
        }
    })
}