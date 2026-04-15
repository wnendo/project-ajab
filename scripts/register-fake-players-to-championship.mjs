import { initializeApp } from "firebase/app"
import { collection, doc, getDoc, getDocs, getFirestore, writeBatch } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDnjZcbhtm03HNLQHSr6Wlz6TqOfB-KU9E",
  authDomain: "ranking-ajab.firebaseapp.com",
  projectId: "ranking-ajab"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

const tournamentId = process.argv[2]

function normalizeChampionshipCategory(value) {
  const normalized = (value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function formatRegistrationCategories(categories) {
  return categories.join(", ")
}

async function resolveTournamentId() {
  if (tournamentId) {
    return tournamentId
  }

  const tournamentsSnapshot = await getDocs(collection(db, "tournaments"))
  const championships = tournamentsSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => (entry.tournamentType ?? "championship") === "championship")
    .sort((a, b) => (b.startDate ?? 0) - (a.startDate ?? 0))

  if (!championships.length) {
    throw new Error("Nenhum campeonato encontrado.")
  }

  return championships[0].id
}

async function registerFakePlayers() {
  const resolvedTournamentId = await resolveTournamentId()
  const tournamentSnapshot = await getDoc(doc(db, "tournaments", resolvedTournamentId))

  if (!tournamentSnapshot.exists()) {
    throw new Error(`Torneio ${resolvedTournamentId} nao encontrado.`)
  }

  const tournament = { id: tournamentSnapshot.id, ...tournamentSnapshot.data() }
  const registrationFee = tournament.registrationFee
  const usersSnapshot = await getDocs(collection(db, "users"))
  const fakePlayers = usersSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }))
    .filter((entry) => entry.isFakeSeed === true)
    .sort((a, b) => (a.category ?? "").localeCompare(b.category ?? "") || (a.name ?? "").localeCompare(b.name ?? ""))

  if (!fakePlayers.length) {
    throw new Error("Nenhum atleta ficticio encontrado para registrar.")
  }

  const batch = writeBatch(db)
  const now = Date.now()

  fakePlayers.forEach((player) => {
    const normalizedCategory = normalizeChampionshipCategory(player.category)
    if (!normalizedCategory) {
      return
    }

    const categories = [normalizedCategory]
    const categoryLabel = formatRegistrationCategories(categories)

    batch.set(doc(db, "tournaments", resolvedTournamentId, "registrations", player.id), {
      id: player.id,
      uid: player.id,
      name: player.name,
      email: player.email,
      club: player.club ?? "",
      category: categoryLabel,
      categories,
      registrationFee,
      paymentStatus: "approved",
      paymentMethod: "pix",
      registeredAt: now,
      status: "registered"
    }, { merge: true })

    batch.set(doc(db, "users", player.id, "registrations", resolvedTournamentId), {
      id: resolvedTournamentId,
      tournamentId: resolvedTournamentId,
      title: tournament.title,
      location: tournament.location ?? "",
      category: categoryLabel,
      categories,
      registrationFee,
      paymentStatus: "approved",
      paymentMethod: "pix",
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      registrationDeadline: tournament.registrationDeadline,
      registeredAt: now,
      status: "registered"
    }, { merge: true })
  })

  await batch.commit()

  console.log(`Inscricoes concluidas no campeonato ${tournament.title} (${resolvedTournamentId}).`)
  console.log(`Atletas inscritos: ${fakePlayers.length}`)
}

registerFakePlayers().catch((error) => {
  console.error("Falha ao registrar atletas ficticios:", error)
  process.exitCode = 1
})
