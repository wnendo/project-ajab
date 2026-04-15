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

function getRegistrationByUserId(userId: string) {
  return registrations.find((entry) => entry.id === userId || entry.uid === userId)
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

function getCandidateStatus(candidate: AthleteSearchCandidate) {
  if (candidate.player?.active) {
    return {
      label: "Inscrito e ativo",
      tone: "neutral"
    }
  }

  if (candidate.registration?.paymentStatus === "approved") {
    return {
      label: "Pronto para ativar",
      tone: "win"
    }
  }

  if (candidate.registration?.paymentStatus === "pending_payment") {
    return {
      label: "Pagamento pendente",
      tone: "loss"
    }
  }

  return {
    label: "Sem inscrição",
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
          const displayName = candidate.user.name.trim()
          const meta = [candidate.user.club || "Sem clube", candidate.user.category || "Sem categoria"].join(" · ")

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
              </div>
              <span class="result-pill ${status.tone}">${status.label}</span>
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
    throw new Error("Torneio não carregado.")
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
    categories: tournament.categories ?? [],
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
    "Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para analise."
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
    currentTournament?.title || "Torneio não encontrado"
  ;(document.getElementById("tournamentStatusLabel") as HTMLElement).textContent =
    currentTournament?.status === "finished"
      ? "Finalizado"
      : currentTournament?.isActive
        ? "Em andamento"
        : currentTournament?.status === "open"
          ? "Inscrições abertas"
          : "Em breve"
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
    players.length = 0
    registeredAthleteIds = new Set<string>()
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

export function getPlayersForGroup(group: CompetitionGroup) {
  return players.filter(
    (player) => player.active && getPlayerCompetitionGroup(currentTournament, player.registrationCategory) === group
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
  return Boolean(currentTournament && currentTournament.status !== "finished") && getPlayersForGroup(group).length >= 2
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
    console.error("Erro ao atualizar inscrições do torneio:", error)
  }
}

function getTournamentParticipants() {
  return players.filter((player) => player.games > 0 || player.active)
}

export function getTournamentRegistrations() {
  return [...registrations].sort((a, b) => a.name.localeCompare(b.name))
}

function getTournamentRanking() {
  return [...getTournamentParticipants()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (a.losses !== b.losses) return a.losses - b.losses
    if (b.games !== a.games) return b.games - a.games
    return a.name.localeCompare(b.name)
  })
}

function getPlacementLabel(position: number) {
  if (position === 1) return "Campeão"
  if (position === 2) return "Vice-campeão"
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
      alert("Selecione um atleta da busca para ativar.")
      return
    }

    if (selectedCandidate.player?.active) {
      alert("Esse jogador já esta inscrito e ativo neste torneio.")
      return
    }

    if (selectedCandidate.registration?.paymentStatus === "approved") {
      const inactiveUser = players.find((entry) => entry.id === selectedCandidate.user.id && !entry.active)
      if (!inactiveUser) {
        alert("Não foi possível ativar esse atleta agora.")
        return
      }

      await updateDoc(doc(db, "users", inactiveUser.id), {
        "playerProfile.active": true,
        updatedAt: Date.now()
      })

      inactiveUser.active = true
      selectedAthleteId = null
      const group = getPlayerCompetitionGroup(currentTournament, inactiveUser.registrationCategory)
      if (isGroupStarted(group) && !hasBusyTables(group)) {
        clearQueueForGroup(group)
        buildQueueForGroup(group, getPlayersForGroup(group))
        fillOpenTables(group)
        await persistRankingLiveState()
      }

      players.sort((a, b) => a.name.localeCompare(b.name))
      input.value = ""
      syncAthleteSearch()
      render()
      return
    }

    openAthleteActivationModal(selectedCandidate)
  } catch (error: any) {
    alert("Erro ao ativar atleta: " + error.message)
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
      const group = getPlayerCompetitionGroup(currentTournament, candidate.user.category)
      if (isGroupStarted(group) && !hasBusyTables(group)) {
        clearQueueForGroup(group)
        buildQueueForGroup(group, getPlayersForGroup(group))
        fillOpenTables(group)
        await persistRankingLiveState()
      }
    }

    if (status === "approved") {
      alert("Atleta adicionado automaticamente ao campeonato.")
    } else {
      alert("Inscricao adicionada para analise no gerenciamento de inscricoes.")
    }

    selectedAthleteId = null
    if (input) {
      input.value = ""
    }

    closeAthleteActivationModal()
    syncAthleteSearch()
    render()
  } catch (error: any) {
    alert("Erro ao registrar atleta: " + error.message)
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
    alert("Erro ao aprovar pagamento: " + error.message)
  }
}

;(window as any).removeRegistration = async (userId: string) => {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  if (!confirm(`Remover a inscrição de ${registration.name}?`)) return

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
    alert("Erro ao remover inscrição: " + error.message)
  }
}

;(window as any).toggleRankingMode = async () => {
  if (!currentTournament || !isRankingTournament(currentTournament)) return

  if (matches.length > 0) {
    alert("Não é possível juntar ou separar categorias após iniciar partidas.")
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
    alert("Torneio não encontrado.")
    return
  }

  if (!groupCanStart(group)) {
    alert("Essa categoria precisa de pelo menos 2 atletas ativos.")
    return
  }

  await ensureTournamentActive()
  if (!isGroupStarted(group)) {
    await saveGroupState(group, { started: true })
  }

  if (!hasBusyTables(group)) {
    clearQueueForGroup(group)
  }

  buildQueueForGroup(group, getPlayersForGroup(group))
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
    alert("Erro ao resetar campeonato: " + error.message)
  }
}

;(window as any).finishTournament = async () => {
  const tournament = currentTournament
  if (!tournament) return

  const ranking = getTournamentRanking()
  if (!ranking.length) {
    alert("Adicione atletas e finalize partidas antes de encerrar o torneio.")
    return
  }

  if (!confirm(`Encerrar o torneio "${tournament.title}"?`)) return

  try {
    const batch = writeBatch(db)
    const now = Date.now()

    ranking.forEach((player, index) => {
      const position = index + 1
      const tournamentRecord: UserTournament = {
        id: tournament.id,
        tournamentId: tournament.id,
        title: tournament.title,
        category: player.registrationCategory || tournament.category || "Livre",
        placement: `${position}o lugar`,
        result: getPlacementLabel(position),
        matchCount: player.games,
        wins: player.wins,
        losses: player.losses,
        playedAt: now
      }

      batch.set(
        doc(db, "users", player.id, "tournaments", tournament.id),
        tournamentRecord,
        { merge: true }
      )

      batch.update(doc(db, "users", player.id), {
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
      updatedAt: now,
      completedAt: now
    })

    await batch.commit()
    currentTournament = { ...tournament, isActive: false, status: "finished", updatedAt: now }
    updateTournamentSummary()
    resetLocalChampionshipState()
    await persistRankingLiveState()
    render()
  } catch (error: any) {
    alert("Erro ao encerrar torneio: " + error.message)
  }
}

;(window as any).deletePlayer = async (id: string) => {
  if (!confirm("Remover atleta deste torneio?")) return

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
    alert("Erro ao remover atleta do torneio: " + error.message)
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
    alert("Erro ao editar atleta: " + error.message)
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
    alert("Erro ao atualizar atleta: " + error.message)
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

  if (!confirm("Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?")) return

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
    alert("Preencha o placar corretamente.")
    return
  }

  if (s1 < 0 || s2 < 0) {
    alert("O placar não pode ser negativo.")
    return
  }

  if (s1 === s2) {
    alert("O jogo precisa ter um vencedor.")
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
    buildQueueForGroup(group, getPlayersForGroup(group))
    fillOpenTables(group)
    await persistRankingLiveState()
    render()
  } catch (error: any) {
    alert("Erro ao finalizar partida: " + error.message)
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
      alert("Finalize algum jogo antes de remover mesas.")
      return
    }

    tables.splice(emptyIndex, 1)
  }

  await saveGroupState(group, { tableCount: tables.length })
  await persistRankingLiveState()
  render()
}
