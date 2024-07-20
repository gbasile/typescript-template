import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    const servers = await available_servers(ns, "home");
    servers.forEach(
        (server) => {
            ns.tprint(`${server.name}`)
        }
    )
}

export class ServerInfo {
    name: string;
    maxMoney: number;
    moneyAvailable: number;

    constructor(name: string, maxMoney: number, moneyAvailable: number) {
        this.name = name;
        this.maxMoney = maxMoney;
        this.moneyAvailable = moneyAvailable
    }
}

export const notHackableServers = new Set<string>(['CSEC', 'darkweb', 'home']);

export async function available_servers(ns: NS, target: string, max_depth: number = 1000): Promise<ServerInfo[]> {
    const server_infos = new Array<ServerInfo>();
    await get_server_infos(ns, target, server_infos, 0, max_depth)

    return server_infos;
}

async function get_server_infos(ns: NS, target: string, server_infos: Array<ServerInfo>, depth: number, max_depth: number) {
    if (depth >= max_depth) {
        return;
    }
    // Avoid revisiting hosts
    if (server_infos.map((s) => s.name).includes(target)) {
        return;
    }

    var hosts: string[] = ns.scan(target);
    if (target != "home") {
        const server_info = new ServerInfo(target, ns.getServerMaxMoney(target), ns.getServerMoneyAvailable(target));
        server_infos.push(server_info);
    }

    for (var host of hosts) {
        await get_server_infos(ns, host, server_infos, depth + 1, max_depth);
    }
}
