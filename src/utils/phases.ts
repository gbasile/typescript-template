import { NS } from "@ns";
import { availablePortExploits } from "./server-hacking";
import { minPurchasedServerRam } from "./purchased-server";

export type PhaseTarget =
    | { type: "dumb"; }
    | { type: "greedy" }
    | { type: "random-10" }
    | { type: "best-10" };

export class PhaseConfig {
    constructor(
        public target: PhaseTarget
    ) { }
}

export class PhaseRequirements {
    constructor(
        public portsExploited: number,
        public purchasedServer: number,
        public purchasedServerRAM: number,
        public hackingLevel: number,
        public scripts: string[],
        public factions: string[] = [],
    ) { }
}

export class Phase {
    constructor(
        public name: string,
        public config: PhaseConfig,
        public requirements: PhaseRequirements,
    ) { }
}

export const phases: Phase[] = [
    // Greedy step: take eveything as soon as possible until we can hack a couple of ports
    new Phase(
        "0 - Servers 8GB",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(3, 25, 2 ** 3, 0, [])
    ),
    new Phase(
        "1 - Servers 8GB + All port exploits",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(5, 25, 2 ** 3, 0, [])
    ),
    new Phase(
        "2 - Servers 32GB",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(5, 25, 2 ** 5, 0, [])
    ),
    new Phase(
        "3 - Servers 128GB",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(5, 25, 2 ** 7, 0, [])
    ),
    new Phase(
        "4 - Servers 1TB",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(5, 25, 2 ** 10, 0, [])
    ),
    new Phase(
        "5 - Formulas",
        new PhaseConfig({ type: "random-10" }),
        new PhaseRequirements(5, 25, 2 ** 10, 0, ["Formulas.exe"])
    ),
    new Phase(
        "6 - Servers 4TB",
        new PhaseConfig({ type: "best-10" }),
        new PhaseRequirements(5, 25, 2 ** 12, 0, ["Formulas.exe"])
    ),
    new Phase(
        "7 - Hacking level 2_500 + Daedalus + Server 64TB",
        new PhaseConfig({ type: "best-10" }),
        new PhaseRequirements(5, 25, 2 ** 16, 2_500, ["Formulas.exe"])
    ),
    new Phase(
        "8 - Servers 256TB",
        new PhaseConfig({ type: "best-10" }),
        new PhaseRequirements(5, 25, 2 ** 18, 2_500, ["Formulas.exe"])
    ),
    new Phase(
        "9 - Servers 1PB",
        new PhaseConfig({ type: "best-10" }),
        new PhaseRequirements(5, 25, 2 ** 20, 2_500, ["Formulas.exe"], ["Daedalus"])
    ),
    new Phase(
        "10 - 6 exploits (infinity)",
        new PhaseConfig({ type: "best-10" }),
        new PhaseRequirements(6, 25, 2 ** 20, 2_500, ["Formulas.exe"], ["Daedalus"])
    )
];

export function nextPhase(ns: NS): Phase {
    for (const phase of phases) {
        if (!requirementsMet(ns, phase.requirements)) {
            return phase;
        }
    }

    return phases[phases.length - 1]
}

export function requirementsMet(ns: NS, requirements: PhaseRequirements) {

    // ns.tprint(`${requirements.portsExploited <= availablePortExploits(ns).length}`);
    // ns.tprint(`${requirements.purchasedServer <= ns.getPurchasedServers().length}`);
    // ns.tprint(`${requirements.purchasedServerRAM} <= ${minPurchasedServerRam(ns)} = ${requirements.purchasedServerRAM <= minPurchasedServerRam(ns)}`);
    return requirements.portsExploited <= availablePortExploits(ns).length
        && requirements.purchasedServer <= ns.getPurchasedServers().length
        && requirements.purchasedServerRAM <= minPurchasedServerRam(ns)
        && requirements.hackingLevel <= ns.getHackingLevel()
        && hasAllTheFactions(ns, requirements)
        && requirements.scripts.every((script) => ns.fileExists(script))
}

function hasAllTheFactions(ns: NS, requirements: PhaseRequirements) {
    const joinedFactions = ns.getPlayer().factions;
    return requirements.factions.reduce((acc, faction) => acc && joinedFactions.includes(faction), true);
}

export function getScript(phase: Phase) {
    switch (phase.config.target.type) {
        case "dumb":
            return 'utils/viruses/virus-dumb.js'
        case "greedy":
            return 'utils/viruses/virus-greedy.js'
        case "random-10":
            return 'utils/viruses/virus-best-random-10.js'
        case "best-10":
            return 'utils/viruses/virus-best-hack-10.js'
    }
}