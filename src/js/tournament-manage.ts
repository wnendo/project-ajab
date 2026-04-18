import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  PartialWithFieldValue,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { buildQueueForGroup } from "./group-queue"
import { clearQueueForGroup, getNextTableId, matches, officialQueues, players, resetTablesForGroup, tablesByGroup } from "./store"
import {
  CompetitionGroup,
  Match,
  Player,
  PlayerProfile,
  RankingLiveGroupState,
  TournamentFinalStanding,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserMatchHistory,
  UserTournamentRegistration,
  UserTournament
} from "./types"
import {
  getAllowedRegistrationCategories,
  getCompetitionGroups,
  getRegistrationFeeForSelection,
  getGroupLabel,
  getPlayerCompetitionGroup,
  getTournamentType,
  isRankingTournament
} from "./tournament-rules"
import { render } from "./tournament-manage-ui"
import { confirmAction } from "./confirm-modal"
import { showToast } from "./toast"
import { buildRankingStats, sortRankingRows } from "./ranking-standings"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let allUsers: User[] = []
let registeredAthleteIds = new Set<string>()
let registrations: TournamentRegistration[] = []
let registrationsRefreshInterval: number | null = null
let selectedAthleteId: string | null = null
let pendingAthleteCandidate: AthleteSearchCandidate | null = null

type AthleteSearchCandidate = {
  user: User
  registration?: TournamentRegistration
  player?: Player
}

type AthleteCandidateStatus = {
  label: string
  helper: string
  tone: "neutral" | "win" | "loss"
}

function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getDefaultPlayerProfile(): PlayerProfile {
  return {
    wins: 0,
    losses: 0,
    games: 0,
    active: true,
    createdAt: Date.now()
  }
}

function mapUserToPlayer(userData: User): Player {
  const playerProfile = userData.playerProfile ?? getDefaultPlayerProfile()
  const registration = getRegistrationByUserId(userData.id)

  return {
    id: userData.id,
    name: userData.name,
    wins: playerProfile.wins ?? 0,
    losses: playerProfile.losses ?? 0,
    games: playerProfile.games ?? 0,
    active: playerProfile.active ?? true,
    registrationCategory: registration?.category,
    createdAt: playerProfile.createdAt ?? userData.createdAt,
    lastPlayed: playerProfile.lastPlayed
  }
}

function normalizeText(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function abbreviateAthleteName(name: string, maxLength = 13) {
  const trimmed = name.trim()
  if (trimmed.length <= maxLength) return trimmed

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]
    const last = parts[parts.length - 1]
    const middleParts = parts
      .slice(1, -1)
      .filter((part) => !["de", "da", "do", "dos", "das", "e"].includes(part.toLowerCase()))

    if (middleParts.length) {
      const withMiddleInitial = `${first} ${middleParts[0][0]}. ${last}`
      if (withMiddleInitial.length <= maxLength + 6) return withMiddleInitial

      const withInitials = `${first} ${middleParts.map((part) => `${part[0]}.`).join(" ")} ${last}`
        .replace(/\s+/g, " ")
        .trim()
      if (withInitials.length <= maxLength + 8) return withInitials
    }

    const shortLast = `${first} ${last}`
    if (shortLast.length <= maxLength + 4) return shortLast
  }

  return `${trimmed.slice(0, Math.max(1, maxLength - 3)).trimEnd()}...`
}

function formatDate(value?: number) {
  if (!value) return "Nao informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(value)
}

function getRegistrationByUserId(userId: string) {
  return registrations.find((entry) => entry.id === userId || entry.uid === userId)
}

function getUserById(userId: string) {
  return allUsers.find((entry) => entry.id === userId) ?? null
}

function getAthleteSearchCandidates(search = "") {
  const normalized = normalizeText(search)

  return allUsers
    .filter((user) => {
      if (!user.profileComplete || (user.role !== "user" && user.role !== "admin")) {
        return false
      }

      if (!normalized) {
        return true
      }

      return [user.name, user.email, user.club, user.category].some((value) =>
        normalizeText(value).includes(normalized)
      )
    })
    .map((user) => ({
      user,
      registration: getRegistrationByUserId(user.id),
      player: players.find((entry) => entry.id === user.id)
    }))
    .sort((a, b) => a.user.name.localeCompare(b.user.name))
}

function getCandidateStatus(candidate: AthleteSearchCandidate): AthleteCandidateStatus {
  if (candidate.player?.active) {
    return {
      label: "Ativo",
      helper: "Participando",
      tone: "neutral"
    }
  }

  if (candidate.registration?.paymentStatus === "approved") {
    return {
      label: "Pronto",
      helper: "Inativo",
      tone: "win"
    }
  }

  if (candidate.registration?.paymentStatus === "pending_payment") {
    return {
      label: "Pendente",
      helper: "Pagamento não aprovado",
      tone: "loss"
    }
  }

  return {
    label: "Novo",
    helper: "Sem inscrição",
    tone: "neutral"
  }
}

function renderAthleteSearchResults(search = "") {
  const resultsEl = document.getElementById("athleteSearchResults")
  const messageEl = document.getElementById("athleteSearchMessage")
  if (!resultsEl || !messageEl) return

  const trimmed = search.trim()
  const candidates = getAthleteSearchCandidates(trimmed)

  if (!trimmed) {
    messageEl.textContent = "Digite para buscar atletas cadastrados."
  } else if (!candidates.length) {
    messageEl.textContent = "Nenhum atleta encontrado para essa busca."
  } else {
    messageEl.textContent = `${candidates.length} atleta(s) encontrado(s).`
  }

  resultsEl.innerHTML = candidates.length
      ? candidates
          .map((candidate) => {
            const status = getCandidateStatus(candidate)
            const displayName = abbreviateAthleteName(candidate.user.name.trim(), 16)
            const meta = [candidate.user.club || "Sem clube", candidate.user.category || "Sem categoria"].join(" - ")

            return `
            <button
              type="button"
              class="athlete-search-item"
              onclick="selectAthleteCandidate('${candidate.user.id}')"
              title="${candidate.user.name}"
            >
              <div class="athlete-search-copy">
                <strong>${displayName}</strong>
                <span>${meta}</span>
                <small class="athlete-search-status ${status.tone}">${status.helper}</small>
              </div>
              <span class="result-pill athlete-search-pill ${status.tone}">${status.label}</span>
            </button>
          `
        })
        .join("")
    : ""
}

function syncAthleteSearch() {
  const input = document.getElementById("name") as HTMLInputElement | null
  renderAthleteSearchResults(input?.value ?? "")
}

function getRegistrationCategory(user: User) {
  if (currentTournament) {
    const allowedCategories = getAllowedRegistrationCategories(currentTournament, user.category)
    if (allowedCategories.length) {
      return allowedCategories[0]
    }
  }

  return user.category || currentTournament?.category || "Livre"
}

function buildRegistrationPayload(user: User, paymentStatus: TournamentRegistration["paymentStatus"]) {
  const tournament = currentTournament

  if (!tournament) {
    throw new Error("Torneio nao carregado.")
  }
  const now = Date.now()
  const category = getRegistrationCategory(user)
  const registrationFee = getRegistrationFeeForSelection(tournament, [category])

  const registrationPayload: TournamentRegistration = {
    id: user.id,
    uid: user.id,
    name: user.name,
    email: user.email,
    club: user.club,
    category,
    registrationFee,
    paymentStatus,
    paymentMethod: "pix",
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: tournament.id,
    tournamentId: tournament.id,
    title: tournament.title,
    location: tournament.location ?? "",
    category,
    categories: [category],
    registrationFee,
    paymentStatus,
    paymentMethod: "pix",
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    registrationDeadline: tournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  return { registrationPayload, userRegistrationPayload }
}

function openAthleteActivationModal(candidate: AthleteSearchCandidate) {
  const modal = document.getElementById("athleteActivationModal") as HTMLElement | null
  const title = document.getElementById("athleteActivationTitle") as HTMLElement | null
  const description = document.getElementById("athleteActivationDescription") as HTMLElement | null
  if (!modal || !title || !description) return

  pendingAthleteCandidate = candidate
  title.textContent = `Ativar ${candidate.user.name}?`
  description.textContent =
    "Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para análise."
  modal.style.display = "flex"
}

function closeAthleteActivationModal() {
  const modal = document.getElementById("athleteActivationModal") as HTMLElement | null
  if (!modal) return

  pendingAthleteCandidate = null
  modal.style.display = "none"
}

async function saveAthleteRegistration(candidate: AthleteSearchCandidate, paymentStatus: TournamentRegistration["paymentStatus"]) {
  const tournament = currentTournament
  if (!tournament) return

  const { registrationPayload, userRegistrationPayload } = buildRegistrationPayload(candidate.user, paymentStatus)
  const batch = writeBatch(db)

  batch.set(doc(db, "tournaments", tournament.id, "registrations", candidate.user.id), registrationPayload)
  batch.set(doc(db, "users", candidate.user.id, "registrations", tournament.id), userRegistrationPayload)

  if (paymentStatus === "approved") {
    batch.set(
      doc(db, "users", candidate.user.id),
      {
        playerProfile: {
          ...getDefaultPlayerProfile(),
          active: true
        },
        updatedAt: Date.now()
      },
      { merge: true }
    )
  }

  await batch.commit()
}

export function hasActiveTournament() {
  return Boolean(currentTournament && currentTournament.status !== "finished")
}

function getActiveGroups() {
  return getCompetitionGroups(currentTournament)
}

function ensureGroupStates() {
  if (!currentTournament) return

  currentTournament.groupStates = {
    general: { started: false, tableCount: 1, ...currentTournament.groupStates?.general },
    A: { started: false, tableCount: 1, ...currentTournament.groupStates?.A },
    B: { started: false, tableCount: 1, ...currentTournament.groupStates?.B }
  }
}

function getGroupState(group: CompetitionGroup) {
  ensureGroupStates()
  return currentTournament?.groupStates?.[group] ?? { started: false, tableCount: 1 }
}

function isGroupStarted(group: CompetitionGroup) {
  return Boolean(getGroupState(group).started)
}

function getGroupTableCount(group: CompetitionGroup) {
  return getGroupState(group).tableCount ?? 1
}

function resetTables(group?: CompetitionGroup) {
  const groups = group ? [group] : (["general", "A", "B"] as CompetitionGroup[])
  groups.forEach((entry) => resetTablesForGroup(entry, getGroupTableCount(entry)))
}

function clearQueue(group?: CompetitionGroup) {
  const groups = group ? [group] : (["general", "A", "B"] as CompetitionGroup[])
  groups.forEach((entry) => clearQueueForGroup(entry))
}

function removeTournamentRegistration(batch: ReturnType<typeof writeBatch>, playerId: string) {
  if (!currentTournament) {
    return
  }

  batch.delete(doc(db, "tournaments", currentTournament.id, "registrations", playerId))
  batch.delete(doc(db, "users", playerId, "registrations", currentTournament.id))
  registrations = registrations.filter((entry) => entry.id !== playerId && entry.uid !== playerId)
  registeredAthleteIds.delete(playerId)
}

async function saveGroupState(group: CompetitionGroup, partial: { started?: boolean; tableCount?: number }) {
  if (!currentTournament) return

  ensureGroupStates()
  currentTournament.groupStates = {
    ...currentTournament.groupStates,
    [group]: {
      ...currentTournament.groupStates?.[group],
      ...partial
    }
  }

  await updateDoc(doc(db, "tournaments", currentTournament.id), {
    groupStates: currentTournament.groupStates,
    updatedAt: Date.now()
  })
}

function loadSavedTableCount() {
  ensureGroupStates()
  ;(["general", "A", "B"] as CompetitionGroup[]).forEach((group) => {
    resetTablesForGroup(group, getGroupTableCount(group))
  })
}

function getRankingLiveGroupState(group: CompetitionGroup): RankingLiveGroupState {
  return currentTournament?.rankingLiveState?.[group] ?? {}
}

function restoreRankingLiveState() {
  ;(["general", "A", "B"] as CompetitionGroup[]).forEach((group) => {
    clearQueueForGroup(group)
    resetTablesForGroup(group, getGroupTableCount(group))

    const liveState = getRankingLiveGroupState(group)

    ;(liveState.queue ?? []).forEach((entry) => {
      const [p1Id, p2Id] = entry.playerIds
      const p1 = players.find((player) => player.id === p1Id)
      const p2 = players.find((player) => player.id === p2Id)
      if (p1 && p2) {
        officialQueues[group].push([p1, p2])
      }
    })

    ;(liveState.activeTables ?? []).forEach((entry, index) => {
      const playerIds = entry.playerIds
      const p1 = playerIds ? players.find((player) => player.id === playerIds[0]) : undefined
      const p2 = playerIds ? players.find((player) => player.id === playerIds[1]) : undefined
      tablesByGroup[group][index] = {
        id: entry.id,
        group,
        ...(p1 ? { p1 } : {}),
        ...(p2 ? { p2 } : {})
      }
    })
  })
}

async function persistRankingLiveState() {
  const tournament = currentTournament
  if (!tournament) return

  tournament.rankingLiveState = {
    general: {
      queue: officialQueues.general.map(([p1, p2]) => ({ playerIds: [p1.id, p2.id] })),
      activeTables: tablesByGroup.general.map((table) => ({
        id: table.id,
        ...(table.p1 && table.p2 ? { playerIds: [table.p1.id, table.p2.id] as [string, string] } : {})
      }))
    },
    A: {
      queue: officialQueues.A.map(([p1, p2]) => ({ playerIds: [p1.id, p2.id] })),
      activeTables: tablesByGroup.A.map((table) => ({
        id: table.id,
        ...(table.p1 && table.p2 ? { playerIds: [table.p1.id, table.p2.id] as [string, string] } : {})
      }))
    },
    B: {
      queue: officialQueues.B.map(([p1, p2]) => ({ playerIds: [p1.id, p2.id] })),
      activeTables: tablesByGroup.B.map((table) => ({
        id: table.id,
        ...(table.p1 && table.p2 ? { playerIds: [table.p1.id, table.p2.id] as [string, string] } : {})
      }))
    }
  }

  currentTournament = tournament

  await updateDoc(doc(db, "tournaments", tournament.id), {
    rankingLiveState: tournament.rankingLiveState,
    updatedAt: Date.now()
  })
}

function setUserHeader(userData: User) {
  const header = document.getElementById("userSummary")
  if (!header) return

  header.innerHTML = `
    <strong>${userData.name}</strong>
    <span>${userData.club || "Sem clube"}</span>
    <span>${userData.category}</span>
  `
}

function updateTournamentSummary() {
  ;(document.getElementById("activeTournamentName") as HTMLElement).textContent =
    currentTournament?.title || "Torneio nao encontrado"
  ;(document.getElementById("tournamentStatusLabel") as HTMLElement).textContent =
    currentTournament?.status === "finished"
      ? "Finalizado"
      : currentTournament?.isActive
        ? "Em andamento"
        : currentTournament?.status === "open"
          ? "Inscricoes abertas"
          : "Aguardando inicio"
}

function renderFinalResultsModal(standings = currentTournament?.finalStandings ?? []) {
  const container = document.getElementById("finalResultsList")
  if (!container) return

  if (!standings.length) {
    container.innerHTML = '<div class="empty-state">O resultado final ainda nao foi gerado.</div>'
    return
  }

  const grouped = getActiveGroups().filter((group) => standings.some((entry) => entry.group === group))
  container.innerHTML = grouped
    .map((group) => {
      const items = standings.filter((entry) => entry.group === group)
      return `
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${getGroupLabel(group)}</span>
            <strong>${items.length} atleta${items.length === 1 ? "" : "s"}</strong>
          </div>
          <div class="ranking-showcase">
            <div class="ranking-showcase-podium">
              ${items
                .slice(0, 3)
                .map(
                  (entry, index) => `
                    <article class="ranking-showcase-podium-card place-${index + 1}">
                      <span class="ranking-showcase-place">${escapeHtml(entry.placement)}</span>
                      <strong>${escapeHtml(entry.name)}</strong>
                      <small>${escapeHtml(entry.category)}</small>
                      <div class="ranking-showcase-score">${entry.wins}V - ${entry.losses}D - ${entry.games} jogos</div>
                    </article>
                  `
                )
                .join("")}
            </div>
            <div class="ranking-showcase-table">
              ${items
                .map(
                  (entry) => `
                    <div class="ranking-showcase-row">
                      <span>${escapeHtml(entry.placement)}</span>
                      <strong>${escapeHtml(entry.name)}</strong>
                      <small>${escapeHtml(entry.result)}</small>
                      <span>${entry.wins}V / ${entry.losses}D</span>
                    </div>
                  `
                )
                .join("")}
            </div>
          </div>
        </section>
      `
    })
    .join("")
}

function openFinalResultsModal() {
  renderFinalResultsModal()
  const modal = document.getElementById("finalResultsModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "flex"
  }
}

function closeFinalResultsModal() {
  const modal = document.getElementById("finalResultsModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

function renderAthleteProfileModal(userId: string) {
  const modal = document.getElementById("athleteProfileModal") as HTMLElement | null
  const content = document.getElementById("athleteProfileContent") as HTMLElement | null
  if (!modal || !content) return

  const user = getUserById(userId)
  const player = players.find((entry) => entry.id === userId)
  if (!user) {
    showToast("Nao foi possivel carregar o perfil do atleta.", "warning")
    return
  }

  const stats = getPlayerStats(userId)
  const initials = getInitials(user.name || "Atleta")
  const avatar = user.photoURL
    ? `<img class="profile-avatar" src="${escapeHtml(user.photoURL)}" alt="Foto de ${escapeHtml(user.name)}">`
    : `<div class="profile-avatar profile-avatar-fallback">${escapeHtml(initials)}</div>`

  content.innerHTML = `
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${avatar}</div>
        <div class="athlete-profile-copy">
          <h3>${escapeHtml(user.name)}</h3>
          <p>${escapeHtml(user.club || "Sem clube")} - ${escapeHtml(user.category || "Sem categoria")}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${player?.active ? "Ativo no ranking" : "Sem jogos ativos"}</span>
            <span class="result-pill ${getRegistrationByUserId(userId)?.paymentStatus === "approved" ? "win" : "loss"}">${getRegistrationByUserId(userId)?.paymentStatus === "approved" ? "Inscricao aprovada" : "Inscricao pendente"}</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${escapeHtml(user.email || "Nao informado")}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${escapeHtml(user.phone || "Nao informado")}</strong></div>
        <div class="info-card"><span>Partidas</span><strong>${stats.games}</strong></div>
        <div class="info-card"><span>Vitorias</span><strong>${stats.wins}</strong></div>
        <div class="info-card"><span>Derrotas</span><strong>${stats.losses}</strong></div>
        <div class="info-card"><span>Ultimo jogo</span><strong>${formatDate(player?.lastPlayed)}</strong></div>
      </div>
      <div class="athlete-profile-actions">
        <button class="btn danger" onclick="resetAthleteMatches('${userId}')">Resetar partidas do atleta</button>
      </div>
    </div>
  `

  modal.style.display = "flex"
}

async function loadTournament() {
  if (!tournamentId) {
    window.location.replace("/pages/dashboard.html")
    return
  }

  const snapshot = await getDoc(doc(db, "tournaments", tournamentId))
  if (!snapshot.exists()) {
    window.location.replace("/pages/dashboard.html")
    return
  }

  currentTournament = { id: snapshot.id, ...snapshot.data() } as UpcomingTournament
  ensureGroupStates()
  updateTournamentSummary()
}

async function loadPlayers() {
  if (!currentTournament) {
    allUsers = []
    registrations = []
    players.length = 0
    return
  }

  const [usersSnapshot, registrationsSnapshot] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "tournaments", currentTournament.id, "registrations"))
  ])

  registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
  registeredAthleteIds = new Set(
    registrations.filter((entry) => entry.paymentStatus === "approved").map((entry) => entry.id)
  )

  allUsers = usersSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as User)
    .filter((entry) => entry.role === "user" || entry.role === "admin")
    .sort((a, b) => a.name.localeCompare(b.name))

  players.length = 0
  players.push(
    ...allUsers
      .filter((user) => user.profileComplete && registeredAthleteIds.has(user.id))
      .map((user) => mapUserToPlayer(user))
      .sort((a, b) => a.name.localeCompare(b.name))
  )

  syncAthleteSearch()
}

export function getTournamentTypeLabel() {
  return getTournamentType(currentTournament) === "ranking" ? "Ranking" : "Campeonato"
}

export function isRankingModeEnabled() {
  return isRankingTournament(currentTournament)
}

export function getVisibleGroups() {
  return getActiveGroups()
}

export function getEligiblePlayersForGroup(group: CompetitionGroup) {
  const tournament = currentTournament
  if (!tournament) return []

  return players.filter(
    (player) => player.active && getPlayerCompetitionGroup(tournament, player.registrationCategory) === group
  )
}

export function getPlayersForGroup(group: CompetitionGroup) {
  const tournament = currentTournament
  if (!tournament) return []

  return players.filter(
    (player) =>
      getPlayerCompetitionGroup(tournament, player.registrationCategory) === group &&
      getRegistrationByUserId(player.id)?.paymentStatus === "approved"
  )
}

export function getTablesForGroup(group: CompetitionGroup) {
  return tablesByGroup[group]
}

export function getQueueForGroup(group: CompetitionGroup) {
  return officialQueues[group]
}

export function getGroupHeading(group: CompetitionGroup) {
  return getGroupLabel(group)
}

export function groupCanStart(group: CompetitionGroup) {
  return Boolean(currentTournament && currentTournament.status !== "finished") && getEligiblePlayersForGroup(group).length >= 2
}

export function isGroupAlreadyStarted(group: CompetitionGroup) {
  return isGroupStarted(group)
}

export function getStartedGroupsCount() {
  return getActiveGroups().filter((group) => isGroupStarted(group)).length
}

async function loadMatches() {
  matches.length = 0

  if (!currentTournament) {
    return
  }

  const snapshot = await getDocs(collection(db, "matches"))
  matches.push(
    ...snapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }) as Match)
      .filter((match) => match.tournamentId === currentTournament?.id)
      .sort((a, b) => a.createdAt - b.createdAt)
  )
}

async function loadPageData() {
  await loadTournament()
  await Promise.all([loadPlayers(), loadMatches()])
  restoreRankingLiveState()
  updateTournamentSummary()
  render()
}

async function refreshRegistrations() {
  if (!currentTournament) return

  try {
    await loadPlayers()
    render()
  } catch (error) {
    console.error("Erro ao atualizar inscricoes do torneio:", error)
  }
}

export function getTournamentRegistrations() {
  return [...registrations].sort((a, b) => a.name.localeCompare(b.name))
}

function getTournamentParticipants() {
  return players.filter((player) => getRegistrationByUserId(player.id)?.paymentStatus === "approved")
}

export function sortPlayersByRanking(list: Player[], group: CompetitionGroup = "general") {
  return sortRankingRows(list, getPlayedMatchesForGroup(group))
}

function getTournamentRanking() {
  return sortPlayersByRanking(getTournamentParticipants(), getActiveGroups()[0] ?? "general")
}

function getPlayedMatchesForGroup(group: CompetitionGroup) {
  return matches.filter((match) => match.tournamentId === currentTournament?.id && (match.group ?? "general") === group)
}

function getPendingRoundRobinMatches(group: CompetitionGroup) {
  const groupPlayers = getEligiblePlayersForGroup(group)
  const pending: Array<[Player, Player]> = []

  for (let index = 0; index < groupPlayers.length; index++) {
    for (let nextIndex = index + 1; nextIndex < groupPlayers.length; nextIndex++) {
      const current = groupPlayers[index]
      const opponent = groupPlayers[nextIndex]
      const alreadyPlayed = getPlayedMatchesForGroup(group).some(
        (match) =>
          (match.p1 === current.id && match.p2 === opponent.id) || (match.p1 === opponent.id && match.p2 === current.id)
      )

      if (!alreadyPlayed) {
        pending.push([current, opponent])
      }
    }
  }

  return pending
}

function getFinalStandings() {
  const tournament = currentTournament
  if (!tournament) return []

  return getActiveGroups().flatMap((group) =>
    (() => {
      const groupedPlayers = getTournamentParticipants().filter(
        (player) => getPlayerCompetitionGroup(tournament, player.registrationCategory) === group
      )
      const { stats } = buildRankingStats(groupedPlayers.map((player) => player.id), getPlayedMatchesForGroup(group))

      return sortPlayersByRanking(groupedPlayers, group).map((player, index) => {
        const position = index + 1
        const computedStats = stats.get(player.id) ?? { wins: 0, losses: 0, games: 0 }
        return {
          playerId: player.id,
          name: player.name,
          category: player.registrationCategory || getGroupLabel(group),
          group,
          placement: `${position}o lugar`,
          result: getPlacementLabel(position),
          wins: computedStats.wins,
          losses: computedStats.losses,
          games: computedStats.games
        } satisfies TournamentFinalStanding
      })
    })()
  )
}

function getPlacementLabel(position: number) {
  if (position === 1) return "Campeao"
  if (position === 2) return "Vice-campeao"
  if (position === 3) return "3o lugar"
  return `${position}o lugar`
}

function resetLocalChampionshipState() {
  players.forEach((player) => {
    player.wins = 0
    player.losses = 0
    player.games = 0
    player.active = false
    player.lastPlayed = undefined
  })

  matches.length = 0
  clearQueue()
  resetTables()
}

async function ensureTournamentActive() {
  const tournament = currentTournament

  if (!tournament || tournament.isActive) {
    return
  }

  const snapshot = await getDocs(query(collection(db, "tournaments"), where("isActive", "==", true)))
  const batch = writeBatch(db)

  snapshot.forEach((entry) => {
    if (entry.id !== tournament.id) {
      batch.update(entry.ref, { isActive: false, updatedAt: Date.now() })
    }
  })

  batch.update(doc(db, "tournaments", tournament.id), {
    isActive: true,
    status: "open",
    updatedAt: Date.now()
  })

  await batch.commit()
  currentTournament = { ...tournament, isActive: true, status: "open", updatedAt: Date.now() }
  updateTournamentSummary()
}

async function writeMatchHistoryForUsers(match: Match, winnerId: string, loserId: string) {
  const tournament = currentTournament

  if (!tournament) {
    return
  }

  const winner = players.find((entry) => entry.id === winnerId)
  const loser = players.find((entry) => entry.id === loserId)
  if (!winner || !loser) return

  const winnerMatch: UserMatchHistory = {
    id: match.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    opponentName: loser.name,
    scoreLabel: `${match.score1} x ${match.score2}`,
    tableLabel: match.tableLabel,
    result: "win",
    playedAt: match.createdAt
  }

  const loserMatch: UserMatchHistory = {
    id: match.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    opponentName: winner.name,
    scoreLabel: `${match.score2} x ${match.score1}`,
    tableLabel: match.tableLabel,
    result: "loss",
    playedAt: match.createdAt
  }

  const winnerTournamentUpdate: PartialWithFieldValue<UserTournament> = {
    tournamentId: tournament.id,
    title: tournament.title,
    category: winner.registrationCategory || tournament.category || "Livre",
    result: "Em andamento",
    matchCount: increment(1),
    wins: increment(1),
    losses: increment(0),
    playedAt: match.createdAt
  }

  const loserTournamentUpdate: PartialWithFieldValue<UserTournament> = {
    tournamentId: tournament.id,
    title: tournament.title,
    category: loser.registrationCategory || tournament.category || "Livre",
    result: "Em andamento",
    matchCount: increment(1),
    wins: increment(0),
    losses: increment(1),
    playedAt: match.createdAt
  }

  const batch = writeBatch(db)
  batch.set(doc(db, "users", winner.id, "matches", match.id), winnerMatch)
  batch.set(doc(db, "users", loser.id, "matches", match.id), loserMatch)
  batch.set(doc(db, "users", winner.id, "tournaments", tournament.id), winnerTournamentUpdate, { merge: true })
  batch.set(doc(db, "users", loser.id, "tournaments", tournament.id), loserTournamentUpdate, { merge: true })

  await batch.commit()
}

function fillOpenTables(group: CompetitionGroup) {
  const tables = tablesByGroup[group]
  const queue = officialQueues[group]

  for (let i = 0; i < tables.length; i++) {
    if (!tables[i].p1 && queue.length) {
      const nextMatch = queue.shift()!
      tables[i] = { id: tables[i].id, group, p1: nextMatch[0], p2: nextMatch[1] }
    }
  }
}

function hasBusyTables(group: CompetitionGroup) {
  return tablesByGroup[group].some((table) => table.p1 && table.p2)
}

function redirectByRole(userData?: User | null) {
  if (!userData) {
    window.location.replace("/pages/login.html")
    return null
  }

  if (!userData.profileComplete) {
    window.location.replace("/pages/complete-profile.html")
    return null
  }

  if (userData.role !== "admin") {
    window.location.replace("/pages/profile.html")
    return null
  }

  return userData
}

async function requireAdminUserData(firebaseUserId: string) {
  const snapshot = await getDoc(doc(db, "users", firebaseUserId))
  const userData = snapshot.data() as User | undefined
  return redirectByRole(userData)
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).editCurrentTournament = () => {
  if (!currentTournament) return
  window.location.href = `/pages/tournament-form.html?id=${currentTournament.id}`
}

;(window as any).openProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).openAthleteProfile = (userId: string) => {
  renderAthleteProfileModal(userId)
}

;(window as any).closeAthleteProfileModal = () => {
  const modal = document.getElementById("athleteProfileModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

;(window as any).openFinalResultsModal = () => {
  openFinalResultsModal()
}

;(window as any).closeFinalResultsModal = () => {
  closeFinalResultsModal()
}

;(window as any).openTournamentRegistrations = () => {
  if (!currentTournament) return
  window.location.href = `/pages/tournament-registrations.html?id=${currentTournament.id}`
}

;(window as any).closeAthleteActivationModal = () => {
  closeAthleteActivationModal()
}

onAuthStateChanged(auth, async (user) => {
  if (checked) return
  checked = true

  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  const data = await requireAdminUserData(user.uid)
  if (!data) return

  setUserHeader(data)
  loadSavedTableCount()
  await loadPageData()

  window.addEventListener("focus", refreshRegistrations)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      refreshRegistrations()
    }
  })

  registrationsRefreshInterval = window.setInterval(() => {
    refreshRegistrations()
  }, 15000)
})

window.addEventListener("beforeunload", () => {
  if (registrationsRefreshInterval !== null) {
    window.clearInterval(registrationsRefreshInterval)
    registrationsRefreshInterval = null
  }
})

;(window as any).addPlayer = async () => {
  const input = document.getElementById("name") as HTMLInputElement
  const name = input.value.trim()
  if (!name) return

  await loadPlayers()

  try {
    const selectedCandidate =
      (selectedAthleteId ? getAthleteSearchCandidates().find((entry) => entry.user.id === selectedAthleteId) : undefined) ??
      getAthleteSearchCandidates(name).find((entry) => normalizeText(entry.user.name) === normalizeText(name))

    if (!selectedCandidate) {
      showToast("Selecione um atleta da busca para ativar.", "warning")
      return
    }

    if (selectedCandidate.player?.active) {
      showToast("Esse jogador ja esta inscrito e ativo neste torneio.", "warning")
      return
    }

    if (selectedCandidate.registration?.paymentStatus === "approved") {
      const inactiveUser = players.find((entry) => entry.id === selectedCandidate.user.id && !entry.active)
      if (!inactiveUser) {
        showToast("Nao foi possivel ativar esse atleta agora.", "error")
        return
      }

      const tournament = currentTournament
      if (!tournament) {
        showToast("Torneio nao encontrado.", "error")
        return
      }

      await updateDoc(doc(db, "users", inactiveUser.id), {
        "playerProfile.active": true,
        updatedAt: Date.now()
      })

      inactiveUser.active = true
      selectedAthleteId = null
      const group = getPlayerCompetitionGroup(tournament, inactiveUser.registrationCategory)
      if (isGroupStarted(group)) {
        await persistRankingLiveState()
        showToast("Atleta reativado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.", "info")
      }

      players.sort((a, b) => a.name.localeCompare(b.name))
      input.value = ""
      syncAthleteSearch()
      render()
      showToast("Atleta reativado com sucesso.", "success")
      return
    }

    openAthleteActivationModal(selectedCandidate)
  } catch (error: any) {
    showToast("Erro ao ativar atleta: " + error.message, "error")
  }
}

;(window as any).searchAthletes = () => {
  selectedAthleteId = null
  syncAthleteSearch()
}

;(window as any).selectAthleteCandidate = (userId: string) => {
  const input = document.getElementById("name") as HTMLInputElement | null
  const candidate = getAthleteSearchCandidates().find((entry) => entry.user.id === userId)
  if (!input || !candidate) return

  selectedAthleteId = userId
  input.value = candidate.user.name
  renderAthleteSearchResults(candidate.user.name)
}

;(window as any).confirmAthletePaymentStatus = async (status: "approved" | "pending_payment" | "cancel") => {
  const candidate = pendingAthleteCandidate
  const input = document.getElementById("name") as HTMLInputElement | null

  if (!candidate) return

  if (status === "cancel") {
    closeAthleteActivationModal()
    return
  }

  try {
    await saveAthleteRegistration(candidate, status)
    await loadPlayers()

    if (status === "approved") {
      const tournament = currentTournament
      if (!tournament) {
        showToast("Torneio nao encontrado.", "error")
        return
      }

      const group = getPlayerCompetitionGroup(tournament, candidate.user.category)
      if (isGroupStarted(group)) {
        await persistRankingLiveState()
        showToast("Atleta adicionado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.", "info")
      }
    }

    if (status === "approved") {
      showToast("Atleta adicionado automaticamente ao campeonato.", "success")
    } else {
      showToast("Inscrição adicionada para análise no gerenciamento de inscrições.", "info")
    }

    selectedAthleteId = null
    if (input) {
      input.value = ""
    }

    closeAthleteActivationModal()
    syncAthleteSearch()
    render()
  } catch (error: any) {
    showToast("Erro ao registrar atleta: " + error.message, "error")
  }
}

;(window as any).approveRegistration = async (userId: string) => {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  try {
    const batch = writeBatch(db)
    batch.update(doc(db, "tournaments", currentTournament.id, "registrations", userId), {
      paymentStatus: "approved"
    })
    batch.update(doc(db, "users", userId, "registrations", currentTournament.id), {
      paymentStatus: "approved"
    })
    await batch.commit()
    await loadPlayers()
    render()
  } catch (error: any) {
    showToast("Erro ao aprovar pagamento: " + error.message, "error")
  }
}

;(window as any).removeRegistration = async (userId: string) => {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  const confirmed = await confirmAction({
    title: "Remover inscrição",
    message: `Remover a inscrição de ${registration.name}?`,
    confirmLabel: "Remover",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const batch = writeBatch(db)
    removeTournamentRegistration(batch, userId)
    batch.update(doc(db, "users", userId), {
      "playerProfile.active": false,
      "playerProfile.games": 0,
      "playerProfile.wins": 0,
      "playerProfile.losses": 0,
      "playerProfile.lastPlayed": null
    })
    await batch.commit()
    await loadPlayers()
    render()
  } catch (error: any) {
    showToast("Erro ao remover inscrição: " + error.message, "error")
  }
}

;(window as any).toggleRankingMode = async () => {
  if (!currentTournament || !isRankingTournament(currentTournament)) return

  if (matches.length > 0) {
    showToast("Nao e possivel juntar ou separar categorias apos iniciar partidas.", "warning")
    return
  }

  const nextMode = currentTournament.rankingMode === "split" ? "single" : "split"
  await updateDoc(doc(db, "tournaments", currentTournament.id), {
    rankingMode: nextMode,
    groupStates: {
      general: { started: false, tableCount: 1 },
      A: { started: false, tableCount: 1 },
      B: { started: false, tableCount: 1 }
    },
    rankingLiveState: {
      general: { queue: [], activeTables: [{ id: 1 }] },
      A: { queue: [], activeTables: [{ id: 2 }] },
      B: { queue: [], activeTables: [{ id: 3 }] }
    },
    updatedAt: Date.now()
  })

  currentTournament = {
    ...currentTournament,
    rankingMode: nextMode,
    groupStates: {
      general: { started: false, tableCount: 1 },
      A: { started: false, tableCount: 1 },
      B: { started: false, tableCount: 1 }
    },
    rankingLiveState: {
      general: { queue: [], activeTables: [{ id: 1 }] },
      A: { queue: [], activeTables: [{ id: 2 }] },
      B: { queue: [], activeTables: [{ id: 3 }] }
    }
  }

  clearQueue()
  resetTables()
  await persistRankingLiveState()
  render()
}

;(window as any).startGroup = async (group: CompetitionGroup) => {
  if (!currentTournament) {
    showToast("Torneio nao encontrado.", "error")
    return
  }

  if (!groupCanStart(group)) {
    showToast("Essa categoria precisa de pelo menos 2 atletas ativos.", "warning")
    return
  }

  await ensureTournamentActive()
  if (!isGroupStarted(group)) {
    await saveGroupState(group, { started: true })
  }

  if (!hasBusyTables(group)) {
    clearQueueForGroup(group)
  }

  buildQueueForGroup(group, getEligiblePlayersForGroup(group))
  fillOpenTables(group)
  await persistRankingLiveState()
  render()
}

;(window as any).resetMatches = async () => {
  if (!currentTournament) return

  try {
    const batch = writeBatch(db)

    matches.forEach((match) => {
      batch.delete(doc(db, "matches", match.id))
      batch.delete(doc(db, "users", match.p1, "matches", match.id))
      batch.delete(doc(db, "users", match.p2, "matches", match.id))
    })

    getTournamentParticipants().forEach((player) => {
      batch.update(doc(db, "users", player.id), {
        "playerProfile.wins": 0,
        "playerProfile.losses": 0,
        "playerProfile.games": 0,
        "playerProfile.lastPlayed": null
      })
      batch.delete(doc(db, "users", player.id, "tournaments", currentTournament!.id))
    })

    await batch.commit()
    matches.length = 0
    clearQueue()
    resetTables()
    await persistRankingLiveState()
    render()
  } catch (error: any) {
    showToast("Erro ao resetar campeonato: " + error.message, "error")
  }
}

;(window as any).resetAthleteMatches = async (userId: string) => {
  if (!currentTournament) return

  const user = getUserById(userId)
  const player = players.find((entry) => entry.id === userId)
  if (!user || !player) {
    showToast("Atleta nao encontrado no torneio atual.", "warning")
    return
  }

  const athleteMatches = matches.filter(
    (match) => match.tournamentId === currentTournament?.id && (match.p1 === userId || match.p2 === userId)
  )

  if (!athleteMatches.length) {
    showToast("Esse atleta ainda nao possui partidas registradas neste ranking.", "info")
    return
  }

  const confirmed = await confirmAction({
    title: "Resetar partidas do atleta",
    message: `Limpar ${athleteMatches.length} partida(s) de ${user.name} neste ranking?`,
    confirmLabel: "Resetar partidas",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const tournament = currentTournament
    if (!tournament) {
      showToast("Torneio nao encontrado.", "error")
      return
    }

    const affectedIds = new Set<string>([userId])
    athleteMatches.forEach((match) => {
      affectedIds.add(match.p1)
      affectedIds.add(match.p2)
    })

    const remainingMatches = matches.filter((match) => !athleteMatches.some((entry) => entry.id === match.id))
    const batch = writeBatch(db)

    athleteMatches.forEach((match) => {
      batch.delete(doc(db, "matches", match.id))
      batch.delete(doc(db, "users", match.p1, "matches", match.id))
      batch.delete(doc(db, "users", match.p2, "matches", match.id))
    })

    affectedIds.forEach((affectedId) => {
      const playerMatches = remainingMatches.filter(
        (match) => match.tournamentId === currentTournament?.id && (match.p1 === affectedId || match.p2 === affectedId)
      )
      const wins = playerMatches.filter((match) => match.winner === affectedId).length
      const losses = playerMatches.length - wins
      const lastPlayed = playerMatches.length ? Math.max(...playerMatches.map((match) => match.createdAt)) : null

      batch.update(doc(db, "users", affectedId), {
        "playerProfile.wins": wins,
        "playerProfile.losses": losses,
        "playerProfile.games": playerMatches.length,
        "playerProfile.lastPlayed": lastPlayed
      })

      if (playerMatches.length) {
        batch.set(
          doc(db, "users", affectedId, "tournaments", tournament.id),
          {
            tournamentId: tournament.id,
            title: tournament.title,
            category: getRegistrationByUserId(affectedId)?.category || tournament.category || "Livre",
            result: "Em andamento",
            matchCount: playerMatches.length,
            wins,
            losses,
            playedAt: lastPlayed ?? Date.now()
          },
          { merge: true }
        )
      } else {
        batch.delete(doc(db, "users", affectedId, "tournaments", tournament.id))
      }
    })

    await batch.commit()

    matches.length = 0
    matches.push(...remainingMatches)

    affectedIds.forEach((affectedId) => {
      const playerEntry = players.find((entry) => entry.id === affectedId)
      const playerMatches = remainingMatches.filter(
        (match) => match.tournamentId === currentTournament?.id && (match.p1 === affectedId || match.p2 === affectedId)
      )
      if (!playerEntry) return

      playerEntry.wins = playerMatches.filter((match) => match.winner === affectedId).length
      playerEntry.losses = playerMatches.length - playerEntry.wins
      playerEntry.games = playerMatches.length
      playerEntry.lastPlayed = playerMatches.length ? Math.max(...playerMatches.map((match) => match.createdAt)) : undefined
    })

    const group = getPlayerCompetitionGroup(tournament, player.registrationCategory)
    clearQueueForGroup(group)
    tablesByGroup[group] = tablesByGroup[group].map((table) =>
      table.p1?.id === userId || table.p2?.id === userId ? { id: table.id, group } : table
    )

    if (isGroupStarted(group) && !hasBusyTables(group)) {
        buildQueueForGroup(group, getEligiblePlayersForGroup(group))
        fillOpenTables(group)
    }

    await persistRankingLiveState()
    render()
    renderAthleteProfileModal(userId)
    showToast("Partidas do atleta resetadas com sucesso.", "success")
  } catch (error: any) {
    showToast("Erro ao resetar partidas do atleta: " + error.message, "error")
  }
}

;(window as any).finishTournament = async () => {
  const tournament = currentTournament
  if (!tournament) return

  const standings = getFinalStandings()
  if (!standings.length) {
    showToast("Adicione atletas e finalize partidas antes de encerrar o torneio.", "warning")
    return
  }

  const pendingMatches = getActiveGroups().flatMap((group) => getPendingRoundRobinMatches(group))
  if (pendingMatches.length) {
    showToast("Ainda existem confrontos obrigatorios pendentes neste ranking.", "warning")
    return
  }

  const confirmed = await confirmAction({
    title: "Encerrar torneio",
    message: `Encerrar o torneio "${tournament.title}"?\n\nEssa ação finaliza o ranking e grava a classificação dos atletas.`,
    confirmLabel: "Encerrar",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const batch = writeBatch(db)
    const now = Date.now()

    standings.forEach((entry) => {
      const tournamentRecord: UserTournament = {
        id: tournament.id,
        tournamentId: tournament.id,
        title: tournament.title,
        category: entry.category || tournament.category || "Livre",
        placement: entry.placement,
        result: entry.result,
        matchCount: entry.games,
        wins: entry.wins,
        losses: entry.losses,
        playedAt: now
      }

      batch.set(doc(db, "users", entry.playerId, "tournaments", tournament.id), tournamentRecord, { merge: true })

      batch.update(doc(db, "users", entry.playerId), {
        "playerProfile.wins": 0,
        "playerProfile.losses": 0,
        "playerProfile.games": 0,
        "playerProfile.active": false,
        "playerProfile.lastPlayed": null
      })
    })

    batch.update(doc(db, "tournaments", tournament.id), {
      isActive: false,
      status: "finished",
      finalStandings: standings,
      updatedAt: now,
      completedAt: now
    })

    await batch.commit()
    currentTournament = { ...tournament, isActive: false, status: "finished", finalStandings: standings, updatedAt: now }
    updateTournamentSummary()
    resetLocalChampionshipState()
    await persistRankingLiveState()
    render()
    openFinalResultsModal()
    showToast("Torneio encerrado com sucesso.", "success")
  } catch (error: any) {
    showToast("Erro ao encerrar torneio: " + error.message, "error")
  }
}

;(window as any).deletePlayer = async (id: string) => {
  const confirmed = await confirmAction({
    title: "Remover atleta",
    message: "Remover este atleta do torneio atual?",
    confirmLabel: "Remover",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const batch = writeBatch(db)
    batch.update(doc(db, "users", id), {
      "playerProfile.active": false,
      "playerProfile.games": 0,
      "playerProfile.wins": 0,
      "playerProfile.losses": 0,
      "playerProfile.lastPlayed": null
    })
    removeTournamentRegistration(batch, id)
    batch.delete(doc(db, "users", id, "tournaments", currentTournament!.id))
    await batch.commit()

    const player = players.find((entry) => entry.id === id)
    if (player) {
      player.active = false
      player.games = 0
      player.wins = 0
      player.losses = 0
      player.lastPlayed = undefined
    }

    clearQueue()
    ;(["general", "A", "B"] as CompetitionGroup[]).forEach((group) => {
      tablesByGroup[group].forEach((table) => {
        if (table.p1?.id === id || table.p2?.id === id) {
          table.p1 = undefined
          table.p2 = undefined
        }
      })
    })

    await persistRankingLiveState()
    render()
  } catch (error: any) {
    showToast("Erro ao remover atleta do torneio: " + error.message, "error")
  }
}

;(window as any).editPlayer = async (id: string) => {
  const player = players.find((entry) => entry.id === id)
  if (!player) return

  const name = prompt("Novo nome:", player.name)?.trim()
  if (!name) return

  player.name = name

  try {
    await updateDoc(doc(db, "users", id), { name, updatedAt: Date.now() })
    players.sort((a, b) => a.name.localeCompare(b.name))
    render()
  } catch (error: any) {
    showToast("Erro ao editar atleta: " + error.message, "error")
  }
}

;(window as any).togglePlayer = async (id: string) => {
  const player = players.find((entry) => entry.id === id)
  if (!player) return

  player.active = !player.active

  try {
    await updateDoc(doc(db, "users", id), { "playerProfile.active": player.active })
    clearQueue()
    await persistRankingLiveState()
    render()
  } catch (error: any) {
    showToast("Erro ao atualizar atleta: " + error.message, "error")
  }
}

;(window as any).showHistory = (playerId: string) => {
  const player = players.find((entry) => entry.id === playerId)
  if (!player) return

  const history = matches.filter((match) => match.p1 === playerId || match.p2 === playerId)
  const list = history
    .map((match) => {
      const isP1 = match.p1 === playerId
      const opponentId = isP1 ? match.p2 : match.p1
      const opponent = players.find((entry) => entry.id === opponentId)
      const isWin = match.winner === playerId
      const myScore = isP1 ? match.score1 : match.score2
      const opponentScore = isP1 ? match.score2 : match.score1

      return `
        <div class="history-item ${isWin ? "win" : "loss"}">
          <div>vs ${opponent?.name ?? "Jogador removido"}</div>
          <div>${myScore} x ${opponentScore}</div>
        </div>
      `
    })
    .join("")

  ;(document.getElementById("historyTitle") as HTMLElement).innerText = `Historico - ${player.name}`

  const stats = getPlayerStats(playerId)
  const statsHtml = `
    <div class="history-stats">
      <span>${stats.wins} vitorias</span>
      <span>${stats.losses} derrotas</span>
      <span>${stats.setsWon} sets ganhos</span>
      <span>${stats.setsLost} sets perdidos</span>
      <span>${stats.winRate}% aproveitamento</span>
    </div>
  `

  document.getElementById("historyList")!.innerHTML = statsHtml + (list || "<div>Nenhum jogo ainda</div>")
  ;(document.getElementById("historyModal") as HTMLElement).style.display = "flex"
}

export function getPlayerStats(playerId: string) {
  const playerMatches = matches.filter((match) => match.p1 === playerId || match.p2 === playerId)

  let wins = 0
  let losses = 0
  let setsWon = 0
  let setsLost = 0

  playerMatches.forEach((match) => {
    const isP1 = match.p1 === playerId
    const myScore = isP1 ? match.score1 : match.score2
    const opponentScore = isP1 ? match.score2 : match.score1

    setsWon += myScore
    setsLost += opponentScore

    if (match.winner === playerId) wins++
    else losses++
  })

  const games = playerMatches.length
  const winRate = games > 0 ? ((wins / games) * 100).toFixed(1) : "0"

  return { wins, losses, games, setsWon, setsLost, winRate }
}

;(window as any).clearPlayers = async () => {
  if (!currentTournament) return

  const confirmed = await confirmAction({
    title: "Limpar torneio atual",
    message: "Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?",
    confirmLabel: "Limpar",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const batch = writeBatch(db)

    getTournamentParticipants().forEach((player) => {
      batch.update(doc(db, "users", player.id), {
        "playerProfile.wins": 0,
        "playerProfile.losses": 0,
        "playerProfile.games": 0,
        "playerProfile.active": false,
        "playerProfile.lastPlayed": null
      })
      removeTournamentRegistration(batch, player.id)
      batch.delete(doc(db, "users", player.id, "tournaments", currentTournament!.id))
    })

    matches.forEach((match) => {
      batch.delete(doc(db, "matches", match.id))
      batch.delete(doc(db, "users", match.p1, "matches", match.id))
      batch.delete(doc(db, "users", match.p2, "matches", match.id))
    })

    await batch.commit()
    resetLocalChampionshipState()
    await persistRankingLiveState()
    render()
  } catch (error) {
    console.error("Erro ao limpar campeonato:", error)
  }
}

;(window as any).finish = async (group: CompetitionGroup, index: number) => {
  const table = tablesByGroup[group][index]
  const tournament = currentTournament
  if (!table?.p1 || !table?.p2 || !tournament) return

  const s1 = parseInt((document.getElementById(`s1_${group}_${index}`) as HTMLInputElement).value, 10)
  const s2 = parseInt((document.getElementById(`s2_${group}_${index}`) as HTMLInputElement).value, 10)

  if (isNaN(s1) || isNaN(s2)) {
    showToast("Preencha o placar corretamente.", "warning")
    return
  }

  if (s1 < 0 || s2 < 0) {
    showToast("O placar nao pode ser negativo.", "warning")
    return
  }

  if (s1 === s2) {
    showToast("O jogo precisa ter um vencedor.", "warning")
    return
  }

  const winner = s1 > s2 ? table.p1 : table.p2
  const loser = s1 > s2 ? table.p2 : table.p1
  const now = Date.now()

  winner.wins += 1
  loser.losses += 1
  winner.games += 1
  loser.games += 1
  winner.lastPlayed = now
  loser.lastPlayed = now

  try {
    const matchPayload: Omit<Match, "id"> = {
      p1: table.p1.id,
      p2: table.p2.id,
      score1: s1,
      score2: s2,
      winner: winner.id,
      createdAt: now,
      tournamentId: tournament.id,
      tournamentTitle: tournament.title,
      tableLabel: `${getGroupLabel(group)} - Mesa ${index + 1}`,
      group,
      registrationCategory: winner.registrationCategory
    }

    const matchRef = await addDoc(collection(db, "matches"), matchPayload)
    const batch = writeBatch(db)

    batch.update(doc(db, "users", winner.id), {
      "playerProfile.wins": winner.wins,
      "playerProfile.games": winner.games,
      "playerProfile.lastPlayed": now
    })
    batch.update(doc(db, "users", loser.id), {
      "playerProfile.losses": loser.losses,
      "playerProfile.games": loser.games,
      "playerProfile.lastPlayed": now
    })

    await batch.commit()

    const savedMatch: Match = { id: matchRef.id, ...matchPayload }
    await writeMatchHistoryForUsers(savedMatch, winner.id, loser.id)

    matches.push(savedMatch)
    tablesByGroup[group][index] = { id: tablesByGroup[group][index].id, group }
    clearQueueForGroup(group)
    buildQueueForGroup(group, getEligiblePlayersForGroup(group))
    fillOpenTables(group)
    await persistRankingLiveState()
    render()
  } catch (error: any) {
    showToast("Erro ao finalizar partida: " + error.message, "error")
  }
}

;(window as any).changeTables = async (group: CompetitionGroup, delta: number) => {
  const tables = tablesByGroup[group]

  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      tables.push({ id: getNextTableId(), group })
    }
  } else {
    const emptyIndex = tables.findIndex((table) => !table.p1)

    if (emptyIndex === -1) {
      showToast("Finalize algum jogo antes de remover mesas.", "warning")
      return
    }

    tables.splice(emptyIndex, 1)
  }

  await saveGroupState(group, { tableCount: tables.length })
  await persistRankingLiveState()
  render()
}




