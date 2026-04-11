var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { buildQueue, fillTables } from "./queue";
import { render } from "./ui";
import { initializeApp } from "firebase/app";
import { db } from "../services/firebase";
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";
import { players, tables, matches } from "./store";

export let started = false;
// ================= LOAD =================
export function loadPlayers() {
    return __awaiter(this, void 0, void 0, function* () {
        const snap = yield getDocs(collection(db, "players"));
        const loadedPlayers = snap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
        players.splice(0, players.length, ...loadedPlayers);
        render();
    });
}
// ================= ADD =================
;
window.addPlayer = () => __awaiter(void 0, void 0, void 0, function* () {
    const input = document.getElementById("name");
    const name = input.value.trim();
    if (!name)
        return;
    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert("Jogador já existe");
        return;
    }
    const player = { name, wins: 0, losses: 0, games: 0, active: true };
    const ref = yield addDoc(collection(db, "players"), player);
    players.push(Object.assign({ id: ref.id }, player));
    input.value = "";
    render();
});
window.resetMatches = () => __awaiter(void 0, void 0, void 0, function* () {
    matches.splice(0, matches.length);
    for (let p of players) {
        p.wins = 0;
        p.losses = 0;
        p.games = 0;
        yield updateDoc(doc(db, "players", p.id), { wins: 0, losses: 0, games: 0 });
    }
    tables.splice(0, tables.length, ...tables.map(() => ({})));
    render();
});
window.start = () => {
    started = true;
    document.getElementById("playBtn").style.display = "none";
    document.getElementById("pauseBtn").style.display = "block";
    buildQueue();
    const filledTables = fillTables();
    tables.splice(0, tables.length, ...filledTables);
    render();
};
window.stop = () => {
    started = false;
    document.getElementById("playBtn").style.display = "block";
    document.getElementById("pauseBtn").style.display = "none";
    window.confetti();
};
window.finish = (i) => __awaiter(void 0, void 0, void 0, function* () {
    const t = tables[i];
    const s1 = parseInt(document.getElementById(`s1_${i}`).value);
    const s2 = parseInt(document.getElementById(`s2_${i}`).value);
    if (isNaN(s1) || isNaN(s2))
        return;
    const w = s1 > s2 ? t.p1 : t.p2;
    const l = s1 > s2 ? t.p2 : t.p1;
    w.wins++;
    l.losses++;
    w.games++;
    l.games++;
    yield updateDoc(doc(db, "players", w.id), { wins: w.wins, games: w.games });
    yield updateDoc(doc(db, "players", l.id), { losses: l.losses, games: l.games });
    matches.push({ p1: w.id, p2: l.id, score: `${s1}x${s2}`, winner: w.id });
    tables[i] = {};
    buildQueue();
    const filledTables = fillTables();
    tables.splice(0, tables.length, ...filledTables);
    render();
});
// ================= INIT =================
loadPlayers();
