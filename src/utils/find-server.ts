import { NS } from "@ns";

/** @param {NS} ns */
export async function main(ns: NS) {
    let target = ns.args[0] as string

    let path = connectCommand(ns, "home", target, "home")
    if (path == "") {
        ns.tprint("Could not find " + target)
        return
    }

    ns.tprint(path)
}

export function connectCommand(ns: NS, server: string, target: string, from: string): string {
    if (server == target) {
        return target
    }
    let nodes = ns.scan(server)
    for (let i = 0; i < nodes.length; i++) {
        let child = nodes[i]
        if (child == from) {
            continue
        }
        if (child == target) {
            return `connect ${target};`
        }
        let children = ns.scan(server)
        if (children.length === 0) {
            continue
        }
        let foundOn = connectCommand(ns, child, target, server)
        if (foundOn != "") {
            return `connect ${child}; ${foundOn}`
        }
    }
    return ""
}