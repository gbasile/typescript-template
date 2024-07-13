import { NS } from "@ns";

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

export async function available_servers(ns: NS, target: string, max_depth: number): Promise<ServerInfo[]> {
    const server_infos = new Array<ServerInfo>();
    await get_server_infos(ns, target, server_infos, 0, max_depth)

    return server_infos;
}

async function get_server_infos(ns: NS, target: string, server_infos: Array<ServerInfo>, depth: number, max_depth: number) {
    if (depth == max_depth) {
        return;
    }
    // Avoid revisiting hosts
    if (server_infos.map((s) => s.name).includes(target)) {
        // ns.tprint(`Skipping '${target}', already visited`)
        return;
    }

    var hosts: string[] = ns.scan(target);
    if (target != "home") {
        const server_info = new ServerInfo(target, ns.getServerMaxMoney(target), ns.getServerMoneyAvailable(target));
        server_infos.push(server_info);
    }

    // ns.tprint(`'${target}' connected servers:\n ['${hosts.join(', ')}']`)
    for (var host of hosts) {
        await get_server_infos(ns, host, server_infos, depth + 1, max_depth);
    }
}
