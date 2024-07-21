import { NS } from "@ns";
import { available_servers } from "./server.explore";
import { gainControl } from "./server.hack";

/** @param {NS} ns */
export async function main(ns: NS) {
    const servers = await available_servers(ns);
    for (let server of servers.filter(s => ns.ls(s, ".lit").length > 0)) {
        gainControl(ns, server);
        for (let file of ns.ls(server, ".lit")) {
            ns.tprint("[LIT] ", server, ": ", file)
            if (!ns.scp(file, server, "home")) {
                ns.tprint("Error");
            }
        }
    }
}
