import { NS } from "@ns";
import { available_servers } from "./server-exploring";
import { gainControl } from "./server-hacking";

/** @param {NS} ns */
export async function main(ns: NS) {
    const servers = await available_servers(ns, "home", 200);
    for (let server of servers.filter(s => ns.ls(s.name, ".lit").length > 0)) {
        gainControl(ns, server.name);
        for (let file of ns.ls(server.name, ".lit")) {
            ns.tprint("[LIT] ", server.name, ": ", file)
            if (!ns.scp(file, server.name, "home")) {
                ns.tprint("Error");
            }
        }
    }
}
