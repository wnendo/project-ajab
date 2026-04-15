import { initializeApp } from "firebase/app"
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDnjZcbhtm03HNLQHSr6Wlz6TqOfB-KU9E",
  authDomain: "ranking-ajab.firebaseapp.com",
  projectId: "ranking-ajab"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const tournamentId = process.argv[2]
const rawCategory = process.argv[3]

function normalizeChampionshipCategory(value) {
  const normalized = String(value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

if (!tournamentId) {
  throw new Error("Informe o tournamentId.")
}

const category = normalizeChampionshipCategory(rawCategory)
if (!category) {
  throw new Error("Informe uma categoria valida: A, B, C, D ou Iniciante.")
}

const tournamentRef = doc(db, "tournaments", tournamentId)
const snapshot = await getDoc(tournamentRef)

if (!snapshot.exists()) {
  throw new Error(`Torneio ${tournamentId} nao encontrado.`)
}

const tournament = { id: snapshot.id, ...snapshot.data() }
const currentState = tournament.championshipState?.[category] ?? {}
const tableCount = Math.max(1, currentState.tableCount ?? 1)
const groupSize = Math.max(2, currentState.groupSize ?? 3)

const nextCategoryState = {
  groupSize,
  groups: [],
  defined: false,
  started: false,
  knockoutStarted: false,
  finished: false,
  tableCount,
  queue: [],
  activeTables: Array.from({ length: tableCount }, (_, index) => ({ id: index + 1 })),
  completedMatches: [],
  finalStandings: []
}

await updateDoc(tournamentRef, {
  championshipState: {
    ...(tournament.championshipState ?? {}),
    [category]: nextCategoryState
  },
  updatedAt: Date.now()
})

console.log(`Categoria ${category} resetada com sucesso no torneio ${tournament.title} (${tournamentId}).`)
