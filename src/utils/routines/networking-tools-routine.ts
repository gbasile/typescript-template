import { NS } from "@ns";
import { availablePortExploits, portExploits } from "../server-hacking";
import { networkingTools } from "../networking-tools";

export function networkingToolsRoutine(ns: NS) {
    // TODO Automatic buy networking Tools
    if (availablePortExploits(ns).length < portExploits.length) {
        return
    }
    printAvailableNetworkingTools(ns);
}

var notifiedTools = new Set<string>()
function printAvailableNetworkingTools(ns: NS) {
    var networkingToolsToPurchase = networkingTools
        .filter(([name,]) => !ns.fileExists(name, "home"))
        .filter(([, cost]) => ns.getServerMoneyAvailable("home") > cost)
        .filter(([name, ,]) => !notifiedTools.has(name))

    if (networkingToolsToPurchase.length == 0) {
        return
    }

    networkingToolsToPurchase
        .forEach(([name, ,]) => notifiedTools.add(name));

    var command = networkingToolsToPurchase
        .reduce((command, [name, ,]) => `${command} buy ${name};`, ">");
    ns.tprint(`WARN: Execute ${command}`)
}