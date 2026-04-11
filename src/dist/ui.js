import { players, tables, officialQueue, lastPositions } from "./store";
function updateInfo() {
    let playing = new Set();
    for (let i = 0; i < tables.length; i++) {
        const t = tables[i];
        if (t.p1)
            playing.add(t.p1.id);
        if (t.p2)
            playing.add(t.p2.id);
    }
    document.getElementById("playersPlaying").innerText = String(playing.size);
    document.getElementById("playersWaiting").innerText =
        String(players.filter(p => p.active && !playing.has(p.id)).length);
    document.getElementById("playersTotal").innerText =
        String(players.length);
}
;
window.showHistory = (id) => {
    const p = players.find(p => p.id === id);
    const title = document.getElementById("historyTitle");
    const modal = document.getElementById("historyModal");
    title.innerText = "Histórico - " + p.name;
    modal.style.display = "flex";
};
export function render() {
    let sorted = [...players].sort((a, b) => {
        if (b.wins !== a.wins)
            return b.wins - a.wins;
        return a.losses - b.losses;
    });
    const ranking = document.getElementById("ranking");
    const tablesEl = document.getElementById("tables");
    const queueEl = document.getElementById("queue");
    ranking.innerHTML = sorted.map((p, i) => {
        let prev = lastPositions[p.id];
        let move = "";
        if (prev !== undefined) {
            if (i < prev)
                move = "moved-up";
            else if (i > prev)
                move = "moved-down";
        }
        lastPositions[p.id] = i;
        return `
    <div class="player-row ${move}">
      <div class="player-main">
        <span>${i + 1}</span>
        <span class="player-name" onclick="showHistory('${p.id}')">${p.name}</span>
      </div>
      <div class="player-info">W:${p.wins} | L:${p.losses} | J:${p.games}</div>
    </div>`;
    }).join("");
    tablesEl.innerHTML = tables.map((t, i) => {
        var _a;
        return `
    <div class="match ${t.p1 ? '' : 'free'}">
      ${t.p1 ? `
        <div>${t.p1.name} vs ${(_a = t.p2) === null || _a === void 0 ? void 0 : _a.name}</div>
        <input id="s1_${i}" value="0"> x <input id="s2_${i}" value="0">
        <button onclick="finish(${i})">Finalizar</button>
      ` : "Livre"}
    </div>
  `;
    }).join("");
    queueEl.innerHTML = officialQueue.map(m => `<div>${m[0].name} vs ${m[1].name}</div>`).join("");
    updateInfo();
}
