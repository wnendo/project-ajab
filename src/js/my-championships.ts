import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserTournamentRegistration
} from "./types"
import { getTournamentType } from "./tournament-rules"

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = (value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function getRegisteredChampionshipCategories(registration: UserTournamentRegistration) {
  if (Array.isArray(registration.categories) && registration.categories.length) {
    return registration.categories
  }

  return registration.category ? registration.category.split(",").map((entry) => entry.trim()).filter(Boolean) : []
}

function getPlayerNameFromTournament(
  tournamentPlayerMap: Map<string, string> | undefined,
  playerId: string,
  currentUserId: string,
  currentUserName: string
) {
  if (playerId === currentUserId) {
    return currentUserName
  }

  return tournamentPlayerMap?.get(playerId) || "A definir"
}

function renderCategoryCard(
  tournament: UpcomingTournament,
  category: ChampionshipCategory,
  categoryState: ChampionshipCategoryState | undefined,
  user: User,
  tournamentPlayerMap: Map<string, string> | undefined
) {
  const groups = categoryState?.groups ?? []
  const playerGroup = groups.find((group) => group.playerIds.includes(user.id))
  const activeTable = (categoryState?.activeTables ?? []).find((table) => table.match?.playerIds.includes(user.id))
  const queuedMatch = (categoryState?.queue ?? []).find((match) => match.playerIds.includes(user.id))

  const nextMatchMarkup = activeTable?.match
    ? (() => {
        const opponentId = activeTable.match?.playerIds.find((playerId) => playerId !== user.id) ?? ""
        const opponentName = getPlayerNameFromTournament(tournamentPlayerMap, opponentId, user.id, user.name)
        return `
          <div class="stack-item">
            <div class="stack-item-header">
              <div>
                <strong>Proximo jogo</strong>
                <span>Categoria ${category}</span>
              </div>
              <span class="result-pill win">Em andamento</span>
            </div>
            <div class="stack-item-grid">
              <span>Mesa: ${activeTable.id}</span>
              <span>Adversario: ${opponentName}</span>
            </div>
          </div>
        `
      })()
    : queuedMatch
      ? (() => {
          const opponentId = queuedMatch.playerIds.find((playerId) => playerId !== user.id) ?? ""
          const opponentName = getPlayerNameFromTournament(tournamentPlayerMap, opponentId, user.id, user.name)
          return `
            <div class="stack-item">
              <div class="stack-item-header">
                <div>
                  <strong>Proximo jogo</strong>
                  <span>Categoria ${category}</span>
                </div>
                <span class="result-pill neutral">Na fila</span>
              </div>
              <div class="stack-item-grid">
                <span>Grupo: ${queuedMatch.groupId || "Fase de grupos"}</span>
                <span>Adversario: ${opponentName}</span>
              </div>
            </div>
          `
        })()
      : '<div class="empty-state">Nenhum proximo jogo encontrado nesta categoria.</div>'

  return `
    <article class="card profile-card">
      <div class="section-header">
        <div>
          <span class="section-label">${tournament.title}</span>
          <h3>Categoria ${category}</h3>
        </div>
      </div>
      <div class="stack-list">
        ${nextMatchMarkup}
        ${
          playerGroup
            ? `
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${playerGroup.name}</strong>
                    <span>Jogadores do seu grupo</span>
                  </div>
                </div>
                <div class="stack-item-grid">
                  ${playerGroup.playerIds.map((playerId) => `<span>${tournamentPlayerMap?.get(playerId) || "Atleta"}</span>`).join("")}
                </div>
              </div>
            `
            : '<div class="empty-state">Seu grupo ainda não foi definido nesta categoria.</div>'
        }
        ${
          groups.length >= 2
            ? `
              <div class="championship-bracket-frame-wrap championship-bracket-frame-wrap-profile">
                <iframe
                  class="championship-bracket-frame championship-bracket-frame-profile"
                  title="Bracket da categoria ${category}"
                  loading="lazy"
                  src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(category)}&highlight=${encodeURIComponent(user.id)}"
                ></iframe>
              </div>
            `
            : ""
        }
      </div>
    </article>
  `
}

async function loadPage(uid: string) {
  const [userSnapshot, registrationsSnapshot, upcomingSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDocs(query(collection(db, "users", uid, "registrations"), orderBy("registeredAt", "desc"))),
    getDocs(query(collection(db, "tournaments"), orderBy("startDate", "asc")))
  ])

  if (!userSnapshot.exists()) {
    window.location.replace("/pages/profile.html")
    return
  }

  const user = { id: userSnapshot.id, ...userSnapshot.data() } as User
  const registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UserTournamentRegistration)
  const championships = upcomingSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
    .filter((entry) => getTournamentType(entry) === "championship")

  const approvedChampionshipRegistrations = registrations.filter(
    (entry) => entry.paymentStatus === "approved" && championships.some((tournament) => tournament.id === (entry.tournamentId || entry.id))
  )

  const tournamentPlayerEntries = await Promise.all(
    approvedChampionshipRegistrations.map(async (registration) => {
      const tournamentId = registration.tournamentId || registration.id
      const tournamentRegistrationsSnapshot = await getDocs(collection(db, "tournaments", tournamentId, "registrations"))
      const playerMap = new Map<string, string>()
      tournamentRegistrationsSnapshot.docs.forEach((entry) => {
        const tournamentRegistration = { id: entry.id, ...entry.data() } as TournamentRegistration
        playerMap.set(tournamentRegistration.id, tournamentRegistration.name)
      })
      return [tournamentId, playerMap] as const
    })
  )

  const tournamentPlayersByTournament = new Map<string, Map<string, string>>(tournamentPlayerEntries)
  const container = document.getElementById("myChampionshipsList")
  if (!container) return

  const cards: string[] = []

  for (const registration of approvedChampionshipRegistrations) {
    const tournamentId = registration.tournamentId || registration.id
    const tournament = championships.find((entry) => entry.id === tournamentId)
    if (!tournament) continue

    const tournamentPlayerMap = tournamentPlayersByTournament.get(tournamentId)

    for (const categoryValue of getRegisteredChampionshipCategories(registration)) {
      const category = normalizeChampionshipCategory(categoryValue)
      if (!category) continue
      const categoryState = tournament.championshipState?.[category] as ChampionshipCategoryState | undefined
      cards.push(renderCategoryCard(tournament, category, categoryState, user, tournamentPlayerMap))
    }
  }

  container.innerHTML = cards.length
    ? cards.join("")
    : '<div class="empty-state">Você ainda não possui campeonatos aprovados para acompanhar aqui.</div>'
}

;(window as any).goBackToProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadPage(user.uid)
  } catch (error) {
    console.error("Erro ao carregar meus campeonatos:", error)
    const container = document.getElementById("myChampionshipsList")
    if (container) {
      container.innerHTML = '<div class="empty-state">Não foi possível carregar seus campeonatos agora.</div>'
    }
  }
})
