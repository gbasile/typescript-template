var hostIndex: { [key: string]: number } = {
    'home': 0,
    'minion-01': 1,
    'minion-02': 2,
    'minion-03': 3,
    'minion-04': 4,
    'minion-05': 5,
    'minion-06': 6,
    'minion-07': 7,
    'minion-08': 8,
    'minion-09': 9,
    'minion-10': 10,
    'minion-11': 11,
    'minion-12': 12,
    'minion-13': 13,
    'minion-14': 14,
    'minion-15': 15,
    'minion-16': 16,
    'minion-17': 17,
    'minion-18': 18,
    'minion-19': 19,
    'minion-20': 20,
    'minion-21': 21,
    'minion-22': 22,
    'minion-23': 23,
    'minion-24': 24,
    'minion-25': 25
};
export function getIndex(host: string): number {
    if (host in hostIndex) {
        return hostIndex[host];
    } else {
        const nextIndex = getNextIndex();
        hostIndex[host] = nextIndex;
        return nextIndex;
    }
}

function getNextIndex(): number {
    let highestValue = -1;

    for (const key in hostIndex) {
        if (hostIndex[key] > highestValue) {
            highestValue = hostIndex[key];
        }
    }

    return highestValue + 1;
}