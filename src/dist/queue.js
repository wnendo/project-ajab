import { players, tables, officialQueue } from "./store";
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}
function initialDraw() {
    let s = shuffle([...players]);
    let pairs = [];
    for (let i = 0; i < s.length; i += 2) {
        if (s[i + 1])
            pairs.push([s[i], s[i + 1]]);
    }
    return pairs;
}
export function buildQueue() {
    if (players.every(p => p.games === 0)) {
        officialQueue.length = 0;
        initialDraw().forEach(m => officialQueue.push(m));
        return;
    }
    const winners = players.filter(p => p.active && p.wins > p.losses);
    const losers = players.filter(p => p.active && p.wins < p.losses);
    const neutral = players.filter(p => p.active && p.wins === p.losses);
    let queue = [];
    function pair(group) {
        let s = shuffle([...group]);
        for (let i = 0; i < s.length; i += 2) {
            if (s[i + 1])
                queue.push([s[i], s[i + 1]]);
        }
    }
    pair(winners);
    pair(losers);
    pair(neutral);
    officialQueue.length = 0;
    queue.forEach(m => officialQueue.push(m));
}
export function fillTables() {
    let newTables = [...tables];
    for (let i = 0; i < newTables.length; i++) {
        if (!newTables[i].p1 && officialQueue.length) {
            let m = officialQueue.shift();
            newTables[i] = { p1: m[0], p2: m[1] };
        }
    }
    return newTables;
}
