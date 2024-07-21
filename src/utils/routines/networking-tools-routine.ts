import { NS } from "@ns";
import { availablePortExploits, portExploits } from "../server.hack";
import { networkingTools } from "../networking-tools";
import { Phase } from "../phases";

export function networkingToolsRoutine(ns: NS) {
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