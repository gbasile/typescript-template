import { NS } from "@ns";
import { can_be_hacked, can_gain_control } from "./server-hacking";

class ServerInfo {
    name: string;
    maxMoney: number

    constructor(name: string, maxMoney: number) {
        this.name = name;
        this.maxMoney = maxMoney;
    }
}

/** @param {NS} ns */
export async function main(ns: NS): Promise<void> {
    const servers = await best_server(ns, "home", 3);
    ns.tprint(`[${servers.map((s) => "'" + s + "'").join(", ")}]`)
}

export async function best_server(ns: NS, target: string, max_depth: number) {
    const server_infos = new Array<ServerInfo>();
    await get_server_infos(ns, target, server_infos, 0, max_depth)
    const best_servers = server_infos.sort((a, b) => b.maxMoney - a.maxMoney);
    const hackable_servers = best_servers.filter((s) => can_be_hacked(ns, s.name))
    const top_servers = hackable_servers.slice(0, 10)

    // ns.tprint(`[${top_servers.map((s) => `"${s.name} (${s.maxMoney})"`).join(", ")}]`)
    return top_servers.map((s) => s.name);
}

export async function get_server_infos(ns: NS, target: string, server_infos: Array<ServerInfo>, depth: number, max_depth: number) {
    if (depth == max_depth) {
        return;
    }
    // Avoid revisiting hosts
    if (server_infos.map((s) => s.name).includes(target)) {
        // ns.tprint(`Skipping '${target}', already visited`)
        return;
    }

    var hosts: string[] = ns.scan(target);
    const server_info = new ServerInfo(target, ns.getServerMaxMoney(target));
    server_infos.push(server_info);
    // ns.tprint(`'${target}' connected servers:\n ['${hosts.join(', ')}']`)
    for (var host of hosts) {
        await get_server_infos(ns, host, server_infos, depth + 1, max_depth);
    }
}