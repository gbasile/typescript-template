import { NS } from "@ns";
import { availablePortExploits } from "../server.hack";
import { minPurchasedServerRam } from "./routines/routine.buy.server";

export type PhaseTarget =
    | { type: "dumb"; }
    | { type: "greedy" }
    | { type: "random-10" }
    | { type: "best-10" };

export class PhaseConfig {
    constructor(
        public deployment: Deployment
    ) { }
}


export class Deployment {
    constructor(
        public script: string,
        public strategy: DeploymentStrategy
    ) { }
}

export type DeploymentStrategy =
    | { name: "copy"; }
    | { name: "run-once" }

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
        "0 - 3 Port Exploits",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-greedy.js', { name: 'copy' })
        ),
        new PhaseRequirements(3, 0, 2 ** 3, 0, [])
    ),
    new Phase(
        "0B - Servers 8GB",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
        ),
        new PhaseRequirements(3, 25, 2 ** 3, 0, [])
    ),
    new Phase(
        "1 - Servers 32GB",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
        ),
        new PhaseRequirements(3, 25, 2 ** 5, 0, [])
    ),
    new Phase(
        "2 - Servers 128GB",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
        ),
        new PhaseRequirements(3, 25, 2 ** 7, 0, [])
    ),
    new Phase(
        "3 - All Ports exploits",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
        ),
        new PhaseRequirements(6, 25, 2 ** 10, 0, [])
    ),
    // new Phase(
    //     "4 - Servers 1TB",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 10, 0, [])
    // ),
    // new Phase(
    //     "5 - Formulas",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/virus-best-random-10.js', { name: 'copy' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 10, 0, ["Formulas.exe"])
    // ),
    // new Phase(
    //     "6 - Servers 4TB",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/loops/virus-loop-coordinator.js', { name: 'run-once' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 12, 0, ["Formulas.exe"])
    // ),
    // new Phase(
    //     "7 - Hacking level 2_500 + Daedalus + Server 64TB",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/virus-best-hack-10.js', { name: 'copy' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 16, 2_500, ["Formulas.exe"])
    // ),
    // new Phase(
    //     "8 - Servers 256TB",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/virus-best-hack-10.js', { name: 'copy' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 18, 2_500, ["Formulas.exe"])
    // ),
    // new Phase(
    //     "9 - Servers 1PB",
    //     new PhaseConfig(
    //         new Deployment('utils/viruses/virus-best-hack-10.js', { name: 'copy' })
    //     ),
    //     new PhaseRequirements(5, 25, 2 ** 20, 2_500, ["Formulas.exe"], ["Daedalus"])
    // ),
    new Phase(
        "10 - 6 exploits (infinity)",
        new PhaseConfig(
            new Deployment('utils/viruses/virus-best-hack-10.js', { name: 'copy' })
        ),
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
    // ns.tprint(`${requirements.purchasedServer} < ${ns.getPurchasedServers().length} = ${requirements.purchasedServer <= ns.getPurchasedServers().length}`);
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
