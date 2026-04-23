import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  ChampionshipMatch,
  ChampionshipTable,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserMatchHistory,
  UserTournament
} from "./types"
import { getTournamentType } from "./tournament-rules"
import { showToast } from "./toast"

const params = new URLSearchParams(window.location.search)
const tournamentId = params.get("id")
const categoryParam = params.get("category")

let checked = false
let currentTournament: UpcomingTournament | null = null
let currentCategory: ChampionshipCategory | null = null
let registrations: TournamentRegistration[] = []

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = (value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function setUserHeader(userData: User) {
  const header = document.getElementById("userSummary")
  if (!header) return
  header.innerHTML = `<strong>${userData.name}</strong><span>${userData.club || "Sem clube"}</span><span>${userData.category || "Sem categoria"}</span>`
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

function parseRegistrationCategories(registration: TournamentRegistration) {
  const source = Array.isArray(registration.categories) ? registration.categories : (registration.category ?? "").split(",")
  return [...new Set(source.map((entry) => normalizeChampionshipCategory(entry)).filter(Boolean))] as ChampionshipCategory[]
}

function getRegistrationsForCategory(category: ChampionshipCategory) {
  return registrations
    .filter((registration) => registration.paymentStatus === "approved")
    .filter((registration) => parseRegistrationCategories(registration).includes(category))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function getRegistrationById(category: ChampionshipCategory, playerId: string) {
  return getRegistrationsForCategory(category).find((registration) => registration.id === playerId)
}

function normalizeTables(tables: ChampionshipTable[] | undefined, tableCount: number) {
  return Array.from({ length: Math.max(1, tableCount) }, (_, index) => {
    const previous = tables?.[index]
    return {
      id: previous?.id ?? index + 1,
      ...(previous?.groupId ? { groupId: previous.groupId } : {}),
      ...(previous?.match ? { match: previous.match } : {})
    }
  })
}

function getCategoryState(category: ChampionshipCategory): ChampionshipCategoryState {
  const state = currentTournament?.championshipState?.[category]
  const tableCount = Math.max(1, state?.tableCount ?? 1)
  return {
    groupSize: Math.max(2, state?.groupSize ?? 3),
    groups: state?.groups ?? [],
    defined: state?.defined ?? false,
    started: state?.started ?? false,
    knockoutStarted: state?.knockoutStarted ?? false,
    finished: state?.finished ?? false,
    tableCount,
    queue: state?.queue ?? [],
    activeTables: normalizeTables(state?.activeTables, tableCount),
    completedMatches: state?.completedMatches ?? [],
    finalStandings: state?.finalStandings ?? []
  }
}

function buildRoundRobinMatchesForGroup(category: ChampionshipCategory, group: ChampionshipGroup): ChampionshipMatch[] {
  const matches: ChampionshipMatch[] = []
  for (let first = 0; first < group.playerIds.length; first++) {
    for (let second = first + 1; second < group.playerIds.length; second++) {
      matches.push({
        id: `${category}_${group.id}_${group.playerIds[first]}_${group.playerIds[second]}`,
        stage: "groups",
        category,
        groupId: group.id,
        playerIds: [group.playerIds[first], group.playerIds[second]]
      })
    }
  }
  return matches
}

function getPlayerDisplayName(playerId: string) {
  return currentCategory ? getRegistrationById(currentCategory, playerId)?.name || "Atleta" : "Atleta"
}

function getPlayerMeta(playerId: string) {
  return currentCategory ? getRegistrationById(currentCategory, playerId)?.club || "Sem clube" : "Sem clube"
}

function getFinalPlacementLabel(position: number) {
  if (position === 1) return "1º lugar"
  if (position === 2) return "2º lugar"
  if (position === 3) return "3º lugar"
  return "4º lugar"
}

function getFinalPlacementClass(position: number) {
  if (position === 1) return "podium-gold"
  if (position === 2) return "podium-silver"
  return "podium-bronze"
}

function getKnockoutFinalStandings(state: ChampionshipCategoryState) {
  const rounds = buildBracketRounds(state.groups ?? [], state)
  if (rounds.length < 2) return null

  const finalRound = rounds[rounds.length - 1]
  const semifinalRound = rounds[rounds.length - 2]
  const finalMatch = finalRound.matches[0]
  if (!finalMatch?.playerIds || !finalMatch.resolvedWinnerId) return null

  const champion = finalMatch.resolvedWinnerId
  const runnerUp = finalMatch.playerIds.find((playerId) => playerId !== champion)
  if (!runnerUp) return null

  const semifinalMatches = semifinalRound.matches.filter((match) => match.playerIds && match.resolvedWinnerId)
  if (semifinalMatches.length < 2) return null

  const championSemifinal = semifinalMatches.find((match) => match.playerIds?.includes(champion))
  const runnerUpSemifinal = semifinalMatches.find((match) => match.playerIds?.includes(runnerUp))
  if (!championSemifinal || !runnerUpSemifinal) return null

  const thirdPlace = championSemifinal.playerIds?.find((playerId) => playerId !== champion)
  const fourthPlace = runnerUpSemifinal.playerIds?.find((playerId) => playerId !== runnerUp)
  if (!thirdPlace || !fourthPlace) return null

  return [champion, runnerUp, thirdPlace, fourthPlace]
}

function getPlacementLabel(position: number) {
  if (position === 1) return "Campeão"
  if (position === 2) return "Vice-campeão"
  if (position === 3) return "3o lugar"
  if (position === 4) return "4o lugar"
  return `${position}o lugar`
}

function getPlayerStatsForCategory(state: ChampionshipCategoryState, playerId: string) {
  return (state.completedMatches ?? []).reduce(
    (acc, match) => {
      if (!match.playerIds.includes(playerId)) {
        return acc
      }

      acc.matchCount += 1
      if (match.winnerId === playerId) {
        acc.wins += 1
      } else {
        acc.losses += 1
      }
      return acc
    },
    { matchCount: 0, wins: 0, losses: 0 }
  )
}

function getTournamentRecordForPlayer(
  tournament: UpcomingTournament,
  category: ChampionshipCategory,
  playerId: string,
  state: ChampionshipCategoryState,
  finalStandings: string[],
  playedAt: number
) {
  const stats = getPlayerStatsForCategory(state, playerId)
  const standingIndex = finalStandings.indexOf(playerId)
  const recordId = `${tournament.id}_${category}`

  return {
    id: recordId,
    tournamentId: tournament.id,
    title: tournament.title,
    category,
    ...(standingIndex >= 0 ? { placement: `${standingIndex + 1}o lugar` } : {}),
    result: standingIndex >= 0 ? getPlacementLabel(standingIndex + 1) : "Participacao",
    matchCount: stats.matchCount,
    wins: stats.wins,
    losses: stats.losses,
    playedAt
  } satisfies UserTournament
}

function getTournamentProgressRecordForPlayer(
  tournament: UpcomingTournament,
  category: ChampionshipCategory,
  playerId: string,
  state: ChampionshipCategoryState,
  playedAt: number
) {
  const stats = getPlayerStatsForCategory(state, playerId)
  const recordId = `${tournament.id}_${category}`

  return {
    id: recordId,
    tournamentId: tournament.id,
    title: tournament.title,
    category,
    result: "Em andamento",
    matchCount: stats.matchCount,
    wins: stats.wins,
    losses: stats.losses,
    playedAt
  } satisfies UserTournament
}

function getUserMatchEntries(match: ChampionshipMatch, tournament: UpcomingTournament) {
  const [playerOneId, playerTwoId] = match.playerIds
  const playerOneName = getPlayerDisplayName(playerOneId)
  const playerTwoName = getPlayerDisplayName(playerTwoId)
  const score1 = match.score1 ?? 0
  const score2 = match.score2 ?? 0
  const playedAt = match.playedAt ?? Date.now()
  const stageLabel =
    match.stage === "knockout"
      ? match.roundTitle || "Mata-mata"
      : match.groupId
        ? `Fase de grupos - ${match.groupId}`
        : "Fase de grupos"

  const playerOneEntry: UserMatchHistory = {
    id: match.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    opponentName: playerTwoName,
    scoreLabel: `${score1} x ${score2}`,
    tableLabel: match.groupId || match.roundTitle,
    stage: stageLabel,
    result: match.winnerId === playerOneId ? "win" : "loss",
    playedAt
  }

  const playerTwoEntry: UserMatchHistory = {
    id: match.id,
    tournamentId: tournament.id,
    tournamentTitle: tournament.title,
    opponentName: playerOneName,
    scoreLabel: `${score2} x ${score1}`,
    tableLabel: match.groupId || match.roundTitle,
    stage: stageLabel,
    result: match.winnerId === playerTwoId ? "win" : "loss",
    playedAt
  }

  return {
    playerOneId,
    playerTwoId,
    playerOneEntry,
    playerTwoEntry
  }
}

async function writeFinalStandingsToUsers(category: ChampionshipCategory, state: ChampionshipCategoryState, finalStandings: string[]) {
  const tournament = currentTournament
  if (!tournament || !finalStandings.length) return

  const batch = writeBatch(db)
  const now = Date.now()
  const playerIds = getRegistrationsForCategory(category).map((registration) => registration.id)

  ;(state.completedMatches ?? []).forEach((match) => {
    const { playerOneId, playerTwoId, playerOneEntry, playerTwoEntry } = getUserMatchEntries(match, tournament)
    batch.set(doc(db, "users", playerOneId, "matches", match.id), playerOneEntry, { merge: true })
    batch.set(doc(db, "users", playerTwoId, "matches", match.id), playerTwoEntry, { merge: true })
  })

  playerIds.forEach((playerId) => {
    const tournamentRecord = getTournamentRecordForPlayer(tournament, category, playerId, state, finalStandings, now)
    batch.set(doc(db, "users", playerId, "tournaments", tournamentRecord.id), tournamentRecord, { merge: true })
  })

  await batch.commit()
}

async function writeMatchHistoryForUsers(
  category: ChampionshipCategory,
  state: ChampionshipCategoryState,
  completedMatch: ChampionshipMatch
) {
  const tournament = currentTournament
  if (!tournament) return

  const { playerOneId, playerTwoId, playerOneEntry, playerTwoEntry } = getUserMatchEntries(completedMatch, tournament)
  const playerOneTournamentRecord = getTournamentProgressRecordForPlayer(
    tournament,
    category,
    playerOneId,
    state,
    completedMatch.playedAt ?? Date.now()
  )
  const playerTwoTournamentRecord = getTournamentProgressRecordForPlayer(
    tournament,
    category,
    playerTwoId,
    state,
    completedMatch.playedAt ?? Date.now()
  )

  const batch = writeBatch(db)
  batch.set(doc(db, "users", playerOneId, "matches", completedMatch.id), playerOneEntry, { merge: true })
  batch.set(doc(db, "users", playerTwoId, "matches", completedMatch.id), playerTwoEntry, { merge: true })
  batch.set(doc(db, "users", playerOneId, "tournaments", playerOneTournamentRecord.id), playerOneTournamentRecord, { merge: true })
  batch.set(doc(db, "users", playerTwoId, "tournaments", playerTwoTournamentRecord.id), playerTwoTournamentRecord, { merge: true })
  await batch.commit()
}

async function syncCategoryHistoryToUsers(category: ChampionshipCategory, state: ChampionshipCategoryState) {
  const tournament = currentTournament
  if (!tournament) return

  const completedMatches = state.completedMatches ?? []
  if (!completedMatches.length) return

  const batch = writeBatch(db)
  const playerIds = getRegistrationsForCategory(category).map((registration) => registration.id)

  completedMatches.forEach((match) => {
    const { playerOneId, playerTwoId, playerOneEntry, playerTwoEntry } = getUserMatchEntries(match, tournament)
    batch.set(doc(db, "users", playerOneId, "matches", match.id), playerOneEntry, { merge: true })
    batch.set(doc(db, "users", playerTwoId, "matches", match.id), playerTwoEntry, { merge: true })
  })

  playerIds.forEach((playerId) => {
    const tournamentRecord = state.finished && (state.finalStandings ?? []).length
      ? getTournamentRecordForPlayer(tournament, category, playerId, state, state.finalStandings ?? [], Date.now())
      : getTournamentProgressRecordForPlayer(tournament, category, playerId, state, Date.now())
    batch.set(doc(db, "users", playerId, "tournaments", tournamentRecord.id), tournamentRecord, { merge: true })
  })

  await batch.commit()
}

async function clearCategoryHistoryFromUsers(category: ChampionshipCategory, matchesToRemove: ChampionshipMatch[]) {
  const tournament = currentTournament
  if (!tournament) return

  const batch = writeBatch(db)
  const affectedPlayerIds = new Set(getRegistrationsForCategory(category).map((registration) => registration.id))

  matchesToRemove.forEach((match) => {
    batch.delete(doc(db, "users", match.playerIds[0], "matches", match.id))
    batch.delete(doc(db, "users", match.playerIds[1], "matches", match.id))
    affectedPlayerIds.add(match.playerIds[0])
    affectedPlayerIds.add(match.playerIds[1])
  })

  const tournamentRecordId = `${tournament.id}_${category}`
  affectedPlayerIds.forEach((playerId) => {
    batch.delete(doc(db, "users", playerId, "tournaments", tournamentRecordId))
  })

  await batch.commit()
}

function canFinalizeCategory(state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!category) return false
  if (state.finished) return false
  if (!areAllGroupMatchesCompleted(state)) return false
  if ((state.activeTables ?? []).some((table) => table.match)) return false
  return getRegistrationsForCategory(category).length >= 4
}

function getFinalStandingsMarkup(state: ChampionshipCategoryState) {
  const finalStandings = state.finalStandings ?? []
  if (!finalStandings.length) {
    return ""
  }

  return `
    <section class="championship-block">
      <div class="championship-block-head">
        <h3>Classificação final</h3>
        <p>Encerramento oficial da categoria com definição do 1º ao 4º lugar.</p>
      </div>
      <div class="championship-final-standings">
        ${finalStandings.slice(0, 4).map((playerId, index) => `
          <div class="championship-final-card ${getFinalPlacementClass(index + 1)}">
            <div class="championship-final-card-head">
              <div class="championship-final-player">
                <strong>${getPlayerDisplayName(playerId)}</strong>
                <span>${getPlayerMeta(playerId)}</span>
              </div>
              <span class="result-pill ${getFinalPlacementClass(index + 1)}">${getFinalPlacementLabel(index + 1)}</span>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `
}

function getMatchLabel(match: ChampionshipMatch) {
  return `${getPlayerDisplayName(match.playerIds[0])} x ${getPlayerDisplayName(match.playerIds[1])}`
}

function getMatchDisplayLabel(match: ChampionshipMatch, completedMatch?: ChampionshipMatch) {
  const leftName = getPlayerDisplayName(match.playerIds[0])
  const rightName = getPlayerDisplayName(match.playerIds[1])

  if (!completedMatch) {
    return `${leftName} x ${rightName}`
  }

  return `${leftName} ${completedMatch.score1 ?? 0}x${completedMatch.score2 ?? 0} ${rightName}`
}

function getBracketMatchStatus(match: KnockoutRoundMatch) {
  if (match.isBye) return "bye"
  if (match.resolvedWinnerId) return "completed"
  if (match.playerIds) return "ready"
  return "waiting"
}

function getBracketMatchStatusLabel(match: KnockoutRoundMatch) {
  const status = getBracketMatchStatus(match)
  if (status === "bye") return "Bye"
  if (status === "completed") return "Concluido"
  if (status === "ready") return "Pronto"
  return "A definir"
}

type GroupStandingEntry = {
  playerId: string
  wins: number
  losses: number
  setsWon: number
  setsLost: number
  setDiff: number
  pointsWon: number
  pointsLost: number
  pointDiff: number
}

type QualifiedEntry = GroupStandingEntry & {
  groupId: string
  groupName: string
  placement: 1 | 2
}

type KnockoutRoundMatch = {
  id: string
  title: string
  labels: [string, string]
  playerIds?: [string, string]
  resolvedWinnerId?: string
  isBye?: boolean
  roundIndex: number
  slot: number
}

type KnockoutRound = {
  title: string
  matches: KnockoutRoundMatch[]
}

function getGroupCompletedMatches(state: ChampionshipCategoryState, groupId: string) {
  return (state.completedMatches ?? []).filter((match) => match.stage === "groups" && match.groupId === groupId)
}

function getCompletedMatchById(state: ChampionshipCategoryState, matchId: string) {
  return (state.completedMatches ?? []).find((match) => match.id === matchId)
}

function getGroupStandingsMarkup(group: ChampionshipGroup, state: ChampionshipCategoryState) {
  const standings = getGroupStandings(group, state)

  if (!standings.length) {
    return '<div class="championship-standings-empty">Sem atletas neste grupo.</div>'
  }

  return `
    <div class="championship-standings-list">
      ${standings.map((entry, index) => `
        <div class="championship-standing-row">
          <span class="championship-standing-place">${index + 1}o</span>
          <div class="championship-standing-player">
            <strong>${getPlayerDisplayName(entry.playerId)}</strong>
            <small>${entry.wins}V · ${entry.setDiff >= 0 ? "+" : ""}${entry.setDiff} sets · ${entry.pointDiff >= 0 ? "+" : ""}${entry.pointDiff} pts</small>
          </div>
        </div>
      `).join("")}
    </div>
  `
}

function getGroupStandings(group: ChampionshipGroup, state: ChampionshipCategoryState) {
  const standings = new Map<string, GroupStandingEntry>()

  group.playerIds.forEach((playerId) => {
    standings.set(playerId, {
      playerId,
      wins: 0,
      losses: 0,
      setsWon: 0,
      setsLost: 0,
      setDiff: 0,
      pointsWon: 0,
      pointsLost: 0,
      pointDiff: 0
    })
  })

  getGroupCompletedMatches(state, group.id).forEach((match) => {
    const [p1Id, p2Id] = match.playerIds
    const score1 = match.score1 ?? 0
    const score2 = match.score2 ?? 0
    const p1 = standings.get(p1Id)
    const p2 = standings.get(p2Id)
    if (!p1 || !p2) return

    p1.setsWon += score1
    p1.setsLost += score2
    p2.setsWon += score2
    p2.setsLost += score1

    p1.pointsWon += score1
    p1.pointsLost += score2
    p2.pointsWon += score2
    p2.pointsLost += score1

    if (match.winnerId === p1Id) {
      p1.wins += 1
      p2.losses += 1
    } else if (match.winnerId === p2Id) {
      p2.wins += 1
      p1.losses += 1
    }
  })

  return [...standings.values()]
    .map((entry) => ({
      ...entry,
      setDiff: entry.setsWon - entry.setsLost,
      pointDiff: entry.pointsWon - entry.pointsLost
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff
      if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon
      if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
      return getPlayerDisplayName(a.playerId).localeCompare(getPlayerDisplayName(b.playerId))
    })
}

function isGroupCompleted(group: ChampionshipGroup, state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!category) return false

  const totalMatches = buildRoundRobinMatchesForGroup(category, group).length
  return getGroupCompletedMatches(state, group.id).length >= totalMatches
}

function getQualifiedPlayersByGroup(groups: ChampionshipGroup[], state: ChampionshipCategoryState) {
  return groups.map((group) => {
    const standings = getGroupStandings(group, state)
    return {
      group,
      first: standings[0]?.playerId,
      second: standings[1]?.playerId,
      finished: isGroupCompleted(group, state)
    }
  })
}

function sortStandingEntries<T extends GroupStandingEntry>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (b.setDiff !== a.setDiff) return b.setDiff - a.setDiff
    if (b.pointsWon !== a.pointsWon) return b.pointsWon - a.pointsWon
    if (b.pointDiff !== a.pointDiff) return b.pointDiff - a.pointDiff
    return getPlayerDisplayName(a.playerId).localeCompare(getPlayerDisplayName(b.playerId))
  })
}

function getQualifiedEntries(groups: ChampionshipGroup[], state: ChampionshipCategoryState) {
  const winners: QualifiedEntry[] = []
  const runnersUp: QualifiedEntry[] = []

  groups.forEach((group) => {
    if (!isGroupCompleted(group, state)) {
      return
    }

    const standings = sortStandingEntries(getGroupStandings(group, state))
    const first = standings[0]
    const second = standings[1]

    if (first) {
      winners.push({
        ...first,
        groupId: group.id,
        groupName: group.name,
        placement: 1
      })
    }

    if (second) {
      runnersUp.push({
        ...second,
        groupId: group.id,
        groupName: group.name,
        placement: 2
      })
    }
  })

  return {
    winners,
    runnersUp
  }
}

function getGroupPriority(groupName?: string, groupId?: string) {
  const source = `${groupName ?? ""} ${groupId ?? ""}`.trim()
  const match = source.match(/(\d+)/)
  if (!match) return Number.MAX_SAFE_INTEGER
  return Number(match[1])
}

function sortQualifiedByGroupPriority(entries: QualifiedEntry[]) {
  return [...entries].sort((a, b) => {
    const priorityDiff = getGroupPriority(a.groupName, a.groupId) - getGroupPriority(b.groupName, b.groupId)
    if (priorityDiff !== 0) return priorityDiff
    return getPlayerDisplayName(a.playerId).localeCompare(getPlayerDisplayName(b.playerId))
  })
}

function getBracketPlayerLabel(playerId?: string, fallback?: string) {
  return playerId ? getPlayerDisplayName(playerId) : (fallback ?? "A definir")
}

function getRoundTitleByMatchCount(matchCount: number) {
  if (matchCount >= 8) return "Oitavas"
  if (matchCount >= 4) return "Quartas"
  if (matchCount >= 2) return "Semifinais"
  return "Final"
}

function getKnockoutCompletedMatches(state: ChampionshipCategoryState) {
  return (state.completedMatches ?? []).filter((match) => match.stage === "knockout")
}

function getKnockoutCompletedMatchMap(state: ChampionshipCategoryState) {
  return new Map(getKnockoutCompletedMatches(state).map((match) => [match.id, match]))
}

function getActiveKnockoutMatchIds(state: ChampionshipCategoryState) {
  return new Set(
    normalizeTables(state.activeTables, state.tableCount ?? 1)
      .filter((table) => table.match?.stage === "knockout")
      .map((table) => table.match?.id)
      .filter(Boolean) as string[]
  )
}

function getNextPowerOfTwo(value: number) {
  let size = 1
  while (size < value) size *= 2
  return size
}

function pairEntries(entries: QualifiedEntry[]) {
  const pool = [...entries]
  const pairs: Array<[QualifiedEntry, QualifiedEntry]> = []

  while (pool.length >= 2) {
    const left = pool.shift()
    if (!left) break

    let rightIndex = pool.findIndex((entry) => entry.groupId !== left.groupId)
    if (rightIndex < 0) rightIndex = 0
    const [right] = pool.splice(rightIndex, 1)
    if (right) {
      pairs.push([left, right])
    }
  }

  return pairs
}

function buildBracketRounds(groups: ChampionshipGroup[], state: ChampionshipCategoryState): KnockoutRound[] {
  if (groups.length < 2) return []

  const { winners, runnersUp } = getQualifiedEntries(groups, state)
  const totalQualified = winners.length + runnersUp.length
  if (totalQualified < 2) return []

  const bracketSize = getNextPowerOfTwo(totalQualified)
  const completedKnockoutMap = getKnockoutCompletedMatchMap(state)
  const rounds: KnockoutRound[] = []
  const byeCount = Math.max(0, bracketSize - totalQualified)
  const prioritizedWinners = sortQualifiedByGroupPriority(winners)
  const prioritizedRunnersUp = sortQualifiedByGroupPriority(runnersUp)
  const byeWinners = prioritizedWinners.slice(0, byeCount)
  const remainingWinners = prioritizedWinners.slice(byeCount)
  const remainingRunners = [...prioritizedRunnersUp]
  const playedMatches: Array<{ labels: [string, string]; playerIds: [string, string] }> = []

  remainingWinners.forEach((winner) => {
    if (!remainingRunners.length) return

    let runnerIndex = remainingRunners.findIndex((runner) => runner.groupId !== winner.groupId)
    if (runnerIndex < 0) runnerIndex = 0
    const [runner] = remainingRunners.splice(runnerIndex, 1)
    if (!runner) return

    playedMatches.push({
      labels: [getPlayerDisplayName(winner.playerId), getPlayerDisplayName(runner.playerId)],
      playerIds: [winner.playerId, runner.playerId]
    })
  })

  pairEntries(remainingRunners).forEach(([left, right]) => {
    playedMatches.push({
      labels: [getPlayerDisplayName(left.playerId), getPlayerDisplayName(right.playerId)],
      playerIds: [left.playerId, right.playerId]
    })
  })

  const openingMatches: KnockoutRoundMatch[] = []
  const totalFirstRoundMatches = bracketSize / 2

  for (let index = 0; index < totalFirstRoundMatches; index++) {
    const byeWinner = byeWinners[index]
    const playedMatch = playedMatches[index]

    if (byeWinner) {
      const slot = openingMatches.length + 1
      openingMatches.push({
        id: `KO_R1_S${slot}`,
        title: `J1-${slot}`,
        labels: [getPlayerDisplayName(byeWinner.playerId), "BYE"],
        resolvedWinnerId: byeWinner.playerId,
        isBye: true,
        roundIndex: 1,
        slot
      })
    }

    if (playedMatch) {
      const slot = openingMatches.length + 1
      openingMatches.push({
        id: `KO_R1_S${slot}`,
        title: `J1-${slot}`,
        labels: playedMatch.labels,
        playerIds: playedMatch.playerIds,
        resolvedWinnerId: completedKnockoutMap.get(`KO_R1_S${slot}`)?.winnerId,
        roundIndex: 1,
        slot
      })
    }
  }

  if (!openingMatches.length) return []

  rounds.push({
    title: getRoundTitleByMatchCount(openingMatches.length),
    matches: openingMatches
  })

  let previousRoundMatches = openingMatches
  let roundIndex = 2

  while (previousRoundMatches.length > 1) {
    const nextRoundMatches: KnockoutRoundMatch[] = []
    for (let index = 0; index < previousRoundMatches.length; index += 2) {
      const current = previousRoundMatches[index]
      const next = previousRoundMatches[index + 1]
      if (!current || !next) continue

      const currentWinner = completedKnockoutMap.get(current.id)?.winnerId
      const nextWinner = completedKnockoutMap.get(next.id)?.winnerId
      const slot = nextRoundMatches.length + 1
      const resolvedCurrentWinner = currentWinner ?? current.resolvedWinnerId
      const resolvedNextWinner = nextWinner ?? next.resolvedWinnerId

      nextRoundMatches.push({
        id: `KO_R${roundIndex}_S${slot}`,
        title: `J${roundIndex}-${slot}`,
        labels: [
          resolvedCurrentWinner ? getPlayerDisplayName(resolvedCurrentWinner) : `Vencedor ${current.title}`,
          resolvedNextWinner ? getPlayerDisplayName(resolvedNextWinner) : `Vencedor ${next.title}`
        ],
        playerIds: resolvedCurrentWinner && resolvedNextWinner ? [resolvedCurrentWinner, resolvedNextWinner] : undefined,
        resolvedWinnerId: completedKnockoutMap.get(`KO_R${roundIndex}_S${slot}`)?.winnerId,
        roundIndex,
        slot
      })
    }

    if (!nextRoundMatches.length) break

    rounds.push({
      title: nextRoundMatches.length === 1 ? "Final" : getRoundTitleByMatchCount(nextRoundMatches.length),
      matches: nextRoundMatches
    })
    previousRoundMatches = nextRoundMatches
    roundIndex += 1
  }

  return rounds
}

function getAllGroupMatches(state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!category) return []
  return (state.groups ?? []).flatMap((group) => buildRoundRobinMatchesForGroup(category, group))
}

function getCompletedGroupMatchIds(state: ChampionshipCategoryState) {
  return new Set(
    (state.completedMatches ?? [])
      .filter((match) => match.stage === "groups")
      .map((match) => match.id)
  )
}

function getActiveGroupMatchIds(state: ChampionshipCategoryState) {
  return new Set(
    normalizeTables(state.activeTables, state.tableCount ?? 1)
      .map((table) => table.match?.id)
      .filter(Boolean) as string[]
  )
}

function getPendingMatchesByGroup(state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!category) {
    return new Map<string, ChampionshipMatch[]>()
  }

  const completedIds = getCompletedGroupMatchIds(state)
  const activeIds = getActiveGroupMatchIds(state)
  const pendingByGroup = new Map<string, ChampionshipMatch[]>()

  for (const group of state.groups ?? []) {
    const pendingMatches = buildRoundRobinMatchesForGroup(category, group)
      .filter((match) => !completedIds.has(match.id))
      .filter((match) => !activeIds.has(match.id))
    pendingByGroup.set(group.id, pendingMatches)
  }

  return pendingByGroup
}

function getPendingKnockoutMatches(state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!state.knockoutStarted || !category) return []

  const bracketRounds = buildBracketRounds(state.groups ?? [], state)
  const allKnockoutMatches = bracketRounds.flatMap((round) =>
    round.matches.map((match) => ({
      id: match.id,
      stage: "knockout" as const,
      category,
      playerIds: match.playerIds,
      roundIndex: match.roundIndex,
      roundTitle: round.title,
      slot: match.slot
    }))
  )

  const completedIds = new Set(getKnockoutCompletedMatches(state).map((match) => match.id))
  const activeIds = getActiveKnockoutMatchIds(state)

  return allKnockoutMatches
    .filter((match) => !!match.playerIds)
    .filter((match) => !completedIds.has(match.id))
    .filter((match) => !activeIds.has(match.id))
    .map((match) => ({
      id: match.id,
      stage: "knockout" as const,
      category: match.category,
      playerIds: match.playerIds as [string, string],
      roundIndex: match.roundIndex,
      roundTitle: match.roundTitle,
      slot: match.slot
    }))
}

function areAllGroupMatchesCompleted(state: ChampionshipCategoryState) {
  const total = getAllGroupMatches(state).length
  const completed = (state.completedMatches ?? []).filter((match) => match.stage === "groups").length
  return total > 0 && completed >= total
}

function canAddPlayersToGroups(state: ChampionshipCategoryState) {
  if (!state.defined || !state.groups?.length) return false
  return !areAllGroupMatchesCompleted(state)
}

function getResettableGroups(state: ChampionshipCategoryState) {
  return (state.groups ?? []).filter((group) => group.playerIds.length >= 2)
}

function getUnassignedRegistrations(state: ChampionshipCategoryState) {
  const category = currentCategory
  if (!category) return []
  const assignedIds = new Set((state.groups ?? []).flatMap((group) => group.playerIds))
  return getRegistrationsForCategory(category).filter((registration) => !assignedIds.has(registration.id))
}

function getTableLabelForGroup(state: ChampionshipCategoryState, groupId: string) {
  const table = normalizeTables(state.activeTables, state.tableCount ?? 1).find((entry) => entry.groupId === groupId)
  return table ? `Mesa ${table.id}` : "Aguardando mesa"
}

function rebalanceGroupAssignments(state: ChampionshipCategoryState) {
  const groups = state.groups ?? []
  const pendingByGroup = getPendingMatchesByGroup(state)
  const pendingKnockoutMatches = getPendingKnockoutMatches(state)
  const activeTables = normalizeTables(state.activeTables, state.tableCount ?? 1).map((table) => ({
    ...table,
    ...(table.match?.groupId ? { groupId: table.match.groupId } : {})
  }))
  const assignedGroupIds = new Set<string>()

  activeTables.forEach((table) => {
    if (table.match?.groupId) {
      assignedGroupIds.add(table.match.groupId)
      return
    }

    if (table.groupId) {
      const pendingMatches = pendingByGroup.get(table.groupId) ?? []
      if (pendingMatches.length > 0) {
        table.match = pendingMatches.shift()
        assignedGroupIds.add(table.groupId)
      } else {
        delete table.groupId
      }
    }
  })

  activeTables.forEach((table) => {
    if (table.match || table.groupId) return

    const nextGroup = groups.find((group) => {
      if (assignedGroupIds.has(group.id)) return false
      return (pendingByGroup.get(group.id)?.length ?? 0) > 0
    })

    if (!nextGroup) return

    const nextMatch = pendingByGroup.get(nextGroup.id)?.shift()
    if (!nextMatch) return

    table.groupId = nextGroup.id
    table.match = nextMatch
    assignedGroupIds.add(nextGroup.id)
  })

  activeTables.forEach((table) => {
    if (table.match) return

    const nextKnockoutMatch = pendingKnockoutMatches.shift()
    if (!nextKnockoutMatch) return

    delete table.groupId
    table.match = nextKnockoutMatch
  })

  const queue = [
    ...groups.flatMap((group) => pendingByGroup.get(group.id) ?? []),
    ...pendingKnockoutMatches
  ]
  return { activeTables, queue }
}

async function saveCategoryState(partial: Partial<ChampionshipCategoryState>) {
  const tournament = currentTournament
  const category = currentCategory
  if (!tournament || !category) return

  const previous = getCategoryState(category)
  const nextTableCount = Math.max(1, partial.tableCount ?? previous.tableCount ?? 1)
  const nextState: ChampionshipCategoryState = {
    ...previous,
    ...partial,
    tableCount: nextTableCount,
    activeTables: normalizeTables(partial.activeTables ?? previous.activeTables, nextTableCount)
  }

  tournament.championshipState = { ...(tournament.championshipState ?? {}), [category]: nextState }
  currentTournament = tournament

  await updateDoc(doc(db, "tournaments", tournament.id), {
    championshipState: tournament.championshipState,
    updatedAt: Date.now()
  })
}

function openResetCategoryMatchesModalInternal() {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  const groups = getResettableGroups(state)
  if (!groups.length && !(state.completedMatches ?? []).length) {
    showToast("Não há grupos ou jogos para resetar nesta categoria.", "warning")
    return
  }

  const select = document.getElementById("resetCategoryTarget") as HTMLSelectElement | null
  if (select) {
    select.innerHTML = [
      '<option value="all">Todos os grupos da categoria</option>',
      ...groups.map((group) => `<option value="${group.id}">${group.name}</option>`)
    ].join("")
  }

  const modal = document.getElementById("resetCategoryMatchesModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "flex"
  }
}

function closeResetCategoryMatchesModalInternal() {
  const modal = document.getElementById("resetCategoryMatchesModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

async function resetCurrentCategoryMatches(target: string) {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (!state.groups?.length && target !== "all") {
    showToast("Não há grupos definidos para resetar.", "warning")
    return
  }

  if (target === "all") {
    await clearCategoryHistoryFromUsers(category, state.completedMatches ?? [])
    await saveCategoryState({
      defined: false,
      started: false,
      knockoutStarted: false,
      finished: false,
      groups: [],
      queue: [],
      completedMatches: [],
      activeTables: normalizeTables([], state.tableCount ?? 1),
      finalStandings: []
    })
    closeResetCategoryMatchesModalInternal()
    renderPage()
    return
  }

  const removedMatches = (state.completedMatches ?? []).filter((match) => {
    if (match.stage === "knockout") return true
    return match.groupId === target
  })
  await clearCategoryHistoryFromUsers(category, removedMatches)

  const remainingCompletedMatches = (state.completedMatches ?? []).filter((match) => {
    if (match.stage === "knockout") return false
    return match.groupId !== target
  })

  const clearedTables = normalizeTables(state.activeTables, state.tableCount ?? 1).map((table) => {
    if (table.match?.stage === "knockout") {
      return { id: table.id, ...(table.groupId ? { groupId: table.groupId } : {}) }
    }
    if (table.match?.groupId === target) {
      return { id: table.id, groupId: target }
    }
    return table
  })

  const clearedQueue = (state.queue ?? []).filter((match) => {
    if (match.stage === "knockout") return false
    return match.groupId !== target
  })

  const rebalanced = rebalanceGroupAssignments({
    ...state,
    knockoutStarted: false,
    finished: false,
    queue: clearedQueue,
    activeTables: clearedTables,
    completedMatches: remainingCompletedMatches,
    finalStandings: []
  })

  await saveCategoryState({
    knockoutStarted: false,
    finished: false,
    queue: rebalanced.queue,
    activeTables: rebalanced.activeTables,
    completedMatches: remainingCompletedMatches,
    finalStandings: []
  })

  closeResetCategoryMatchesModalInternal()
  renderPage()
}

async function loadTournament() {
  if (!tournamentId) {
    window.location.replace("/pages/dashboard.html")
    return
  }
  currentCategory = normalizeChampionshipCategory(categoryParam || undefined)
  if (!currentCategory) {
    window.location.replace(`/pages/championship-manage.html?id=${tournamentId}`)
    return
  }
  const snapshot = await getDoc(doc(db, "tournaments", tournamentId))
  if (!snapshot.exists()) {
    window.location.replace("/pages/dashboard.html")
    return
  }
  currentTournament = { id: snapshot.id, ...snapshot.data() } as UpcomingTournament
  if (getTournamentType(currentTournament) !== "championship") {
    window.location.replace(`/pages/tournament-manage.html?id=${snapshot.id}`)
  }
}

async function loadRegistrations() {
  const tournament = currentTournament
  if (!tournament) return

  const snapshot = await getDocs(collection(db, "tournaments", tournament.id, "registrations"))
  registrations = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
}

function renderPage() {
  const tournament = currentTournament
  const category = currentCategory
  if (!tournament || !category) return

  const state = getCategoryState(category)
  const groups = state.groups ?? []
  const queue = state.queue ?? []
  const activeMatches = state.activeTables?.filter((table) => table.match) ?? []
  const bracketRounds = buildBracketRounds(groups, state)
  const knockoutQueue = queue.filter((match) => match.stage === "knockout")
  const groupQueue = queue.filter((match) => match.stage === "groups")
  const activeKnockoutMatches = activeMatches.filter((table) => table.match?.stage === "knockout")
  const unassignedRegistrations = getUnassignedRegistrations(state)
  const groupsCompleted = areAllGroupMatchesCompleted(state)
  const allowGroupChanges = canAddPlayersToGroups(state)
  const canStartKnockout = bracketRounds.some((round) => round.matches.some((match) => match.playerIds))
  const statusLabel = state.finished ? "Categoria encerrada" : groupsCompleted ? "Grupos concluidos" : state.started ? "Jogos em andamento" : "Categoria aberta"
  const categoryCanFinalize = canFinalizeCategory(state)
  const canResetMatches = groups.length > 0 || (state.completedMatches ?? []).length > 0

  ;(document.getElementById("categoryPageTitle") as HTMLElement).textContent = `${tournament.title}`
  ;(document.getElementById("categoryTitle") as HTMLElement).textContent = `Categoria ${category}`
  ;(document.getElementById("categoryTitle") as HTMLElement).style.textAlign = "left"
  ;(document.getElementById("categoryPageSubtitle") as HTMLElement).textContent =
    `${tournament.location || "Local a definir"} - esta categoria já esta definida. Os grupos jogam em mesas dedicadas e so trocam quando um grupo termina seus confrontos.`

  ;(document.getElementById("categoryPageContent") as HTMLElement).innerHTML = `
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${category}</span>
          <h2>${getRegistrationsForCategory(category).length} atletas aprovados</h2>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card"><span>Status</span><strong>${statusLabel}</strong></div>
        <div class="info-card"><span>Grupos</span><strong>${groups.length}</strong></div>
        <div class="info-card"><span>Mesas</span><strong>${state.tableCount ?? 1}</strong></div>
      </div>

      <div class="championship-layout">
        <section class="championship-block">
          <div class="championship-block-head">
            <h3>Fase de grupos</h3>
            <p>Cada grupo permanece na sua mesa ate concluir todos os jogos. Depois disso, a mesa pode receber o próximo grupo da fila.</p>
          </div>
          ${
            groups.length
              ? `<div class="championship-groups-grid">
                  ${groups.map((group) => {
                    const pendingMatches = queue.filter((match) => match.groupId === group.id)
                    const tableLabel = getTableLabelForGroup(state, group.id)
                    const isGroupFinished =
                      buildRoundRobinMatchesForGroup(category, group).every((match) =>
                        (state.completedMatches ?? []).some((completed) => completed.id === match.id)
                      )

                    return `
                      <article class="championship-group-card">
                        <div class="championship-group-card-head">
                          <strong>${group.name}</strong>
                          <span>${group.playerIds.length} atletas</span>
                        </div>
                        <div class="championship-group-meta">
                          <span>${tableLabel}</span>
                          <span>${isGroupFinished ? "Grupo concluido" : `${pendingMatches.length} jogo(s) na fila`}</span>
                        </div>
                        <div class="championship-group-standings">
                          <div class="championship-group-standings-head">
                            <strong>Classificação do grupo</strong>
                            <span>${group.playerIds.length} atleta(s)</span>
                          </div>
                          ${getGroupStandingsMarkup(group, state)}
                        </div>
                        <div class="championship-match-list">
                          ${buildRoundRobinMatchesForGroup(category, group).map((match) => {
                            const completedMatch = getCompletedMatchById(state, match.id)
                            return `<span>${getMatchDisplayLabel(match, completedMatch)}</span>`
                          }).join("")}
                        </div>
                      </article>
                    `
                  }).join("")}
                </div>`
              : '<div class="empty-state">Volte para a pagina principal do campeonato e sorteie os grupos primeiro.</div>'
          }
        </section>

        <section class="championship-block championship-management-block">
          <div class="championship-management-head">
            <div class="championship-block-head">
              <h3>Gestao dos jogos</h3>
              <p>As mesas ficam dedicadas ao grupo ativo. Se um grupo terminar, a vaga passa para o próximo grupo que ainda tiver jogos pendentes.</p>
            </div>
            <div class="championship-management-toolbar">
              <button class="btn secondary" onclick="changeTables(-1)">- Mesa</button>
              <button class="btn secondary" onclick="changeTables(1)">+ Mesa</button>
              <button class="btn primary" ${groups.length && !state.finished ? "" : "disabled"} onclick="startCategory()">${state.started ? "Atualizar jogos" : "Iniciar jogos"}</button>
              <button class="btn secondary" ${canResetMatches ? "" : "disabled"} onclick="openResetCategoryMatchesModal()">Resetar jogos</button>
              <button class="btn secondary" ${categoryCanFinalize ? "" : "disabled"} onclick="openFinalizeCategoryModal()">Encerrar categoria</button>
            </div>
          </div>
          <div class="group-compare-grid dual">
            <div class="group-column">
              <div class="group-section queue-section">
                <div class="group-section-header queue-section-header compact">
                  <div>
                    <span class="section-label">Próximos jogos</span>
                    <h3>${groupQueue.length ? `${groupQueue.length} confronto(s) aguardando` : "Fila vazia"}</h3>
                  </div>
                </div>
                ${
                  groupQueue.length
                    ? `<div class="queue-grid compact-queue-grid">
                        ${groupQueue.slice(0, 8).map((match, index) => `
                          <div class="queue-card next-match-card compact-next-match-card">
                            <div class="queue-card-top">
                              <span class="queue-order">Proximo ${index + 1}</span>
                              <span class="result-pill neutral">${match.groupId || "Grupo"} - ${getTableLabelForGroup(state, match.groupId || "")}</span>
                            </div>
                            <div class="queue-player-block">
                              <strong>${getPlayerDisplayName(match.playerIds[0])}</strong>
                              <span>${getPlayerMeta(match.playerIds[0])}</span>
                            </div>
                            <div class="queue-versus">vs</div>
                            <div class="queue-player-block">
                              <strong>${getPlayerDisplayName(match.playerIds[1])}</strong>
                              <span>${getPlayerMeta(match.playerIds[1])}</span>
                            </div>
                          </div>
                        `).join("")}
                      </div>`
                    : '<div class="queue-empty rich">Nenhum jogo aguardando agora.</div>'
                }
              </div>

              <div class="group-section queue-section">
                <div class="group-section-header queue-section-header compact">
                  <div>
                    <span class="section-label">Adicionar atleta</span>
                    <h3>${unassignedRegistrations.length} atleta(s) fora dos grupos</h3>
                  </div>
                </div>
                ${
                  allowGroupChanges
                    ? unassignedRegistrations.length
                      ? `<div class="championship-assign-list">
                          ${unassignedRegistrations.map((registration) => `
                            <div class="championship-assign-row">
                              <div class="championship-assign-player">
                                <strong>${registration.name}</strong>
                                <span>${registration.club || "Sem clube"}</span>
                              </div>
                              <select id="assignGroup_${registration.id}">
                                ${groups.map((group) => `<option value="${group.id}">${group.name}</option>`).join("")}
                              </select>
                              <button class="btn secondary" onclick="addPlayerToGroup('${registration.id}')">Adicionar</button>
                            </div>
                          `).join("")}
                        </div>`
                      : '<div class="queue-empty rich">Todos os atletas aprovados desta categoria já estao distribuidos nos grupos.</div>'
                    : '<div class="queue-empty rich">Não é mais possível adicionar atletas: todos os jogos da fase de grupos já foram concluídos.</div>'
                }
              </div>
            </div>

            <div class="group-column">
              <div class="group-section">
                <div class="group-section-header compact">
                  <div>
                    <span class="section-label">Mesas / Partidas</span>
                    <h3>${activeMatches.length} mesa(s) em andamento</h3>
                  </div>
                </div>
                <div class="tables compact-tables">
                  ${(state.activeTables ?? []).map((table, index) => {
                    const match = table.match
                    if (!match) {
                      return `<div class="table-card free enhanced-table-card compact-card">
                        <div class="table-header">Mesa ${table.id}<span class="status free">${table.groupId || "Livre"}</span></div>
                        <div class="table-idle-state compact"><strong>Pronta</strong><span>${table.groupId ? `Reservada para ${table.groupId}` : "Aguardando o próximo grupo."}</span></div>
                      </div>`
                    }
                    return `<div class="table-card busy enhanced-table-card compact-card">
                      <div class="table-header">Mesa ${table.id}<span class="status busy">${match.stage === "knockout" ? (match.roundTitle || "Mata-mata") : (match.groupId || "Grupo")}</span></div>
                      <div class="players enhanced-players compact-players">
                        <div class="table-player"><strong>${getPlayerDisplayName(match.playerIds[0])}</strong><span>${getPlayerMeta(match.playerIds[0])}</span></div>
                        <span class="vs">vs</span>
                        <div class="table-player"><strong>${getPlayerDisplayName(match.playerIds[1])}</strong><span>${getPlayerMeta(match.playerIds[1])}</span></div>
                      </div>
                      <div class="score-box compact-score-box">
                        <input id="score1_${index}" type="number" min="0" step="1" value="${match.score1 ?? 0}">
                        <span>x</span>
                        <input id="score2_${index}" type="number" min="0" step="1" value="${match.score2 ?? 0}">
                      </div>
                      <button class="finish-btn compact-finish-btn" onclick="finishMatch(${index})">Finalizar</button>
                    </div>`
                  }).join("")}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="championship-block">
          <div class="championship-block-head">
            <h3>Mata-mata</h3>
            <p>O mata-mata pode ser iniciado assim que algum confronto já estiver definido, mesmo com outros grupos ainda em andamento.</p>
          </div>
          <div class="championship-knockout-head">
            <div class="info-card compact"><span>Status</span><strong>${state.knockoutStarted ? "Em andamento" : "Aguardando inicio"}</strong></div>
            <div class="info-card compact"><span>Fila</span><strong>${knockoutQueue.length}</strong></div>
            <div class="info-card compact"><span>Mesas</span><strong>${activeKnockoutMatches.length}</strong></div>
            <button class="btn primary" ${canStartKnockout && !state.finished ? "" : "disabled"} onclick="startKnockout()">${state.knockoutStarted ? "Atualizar mata-mata" : "Iniciar mata-mata"}</button>
          </div>
          ${
            bracketRounds.length
              ? `<div class="championship-bracket-frame-wrap">
                  <iframe
                    class="championship-bracket-frame"
                    title="Bracket da categoria ${category}"
                    loading="lazy"
                    src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(category)}"
                  ></iframe>
                </div>`
              : '<div class="empty-state">O chaveamento aparece depois que os grupos forem sorteados.</div>'
          }
          <div class="championship-knockout-panels">
            <div class="group-section queue-section">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">Próximos jogos do mata-mata</span>
                  <h3>${knockoutQueue.length ? `${knockoutQueue.length} confronto(s) liberados` : "Nenhum confronto liberado ainda"}</h3>
                </div>
              </div>
              ${
                knockoutQueue.length
                  ? `<div class="queue-grid compact-queue-grid">
                      ${knockoutQueue.slice(0, 8).map((match, index) => `
                        <div class="queue-card next-match-card compact-next-match-card">
                          <div class="queue-card-top">
                            <span class="queue-order">Mata-mata ${index + 1}</span>
                            <span class="result-pill neutral">${match.roundTitle || "Eliminatoria"}</span>
                          </div>
                          <div class="queue-player-block">
                            <strong>${getPlayerDisplayName(match.playerIds[0])}</strong>
                            <span>${getPlayerMeta(match.playerIds[0])}</span>
                          </div>
                          <div class="queue-versus">vs</div>
                          <div class="queue-player-block">
                            <strong>${getPlayerDisplayName(match.playerIds[1])}</strong>
                            <span>${getPlayerMeta(match.playerIds[1])}</span>
                          </div>
                        </div>
                      `).join("")}
                    </div>`
                  : '<div class="queue-empty rich">Assim que dois classificados estiverem definidos no mesmo confronto, ele aparece aqui.</div>'
              }
            </div>
          </div>
        </section>
        ${getFinalStandingsMarkup(state)}
      </div>
    </article>
  `
}

function fillSelectOptions(selectId: string, playerIds: string[], preferredId?: string) {
  const select = document.getElementById(selectId) as HTMLSelectElement | null
  if (!select) return

  select.innerHTML = playerIds
    .map((playerId) => `<option value="${playerId}" ${preferredId === playerId ? "selected" : ""}>${getPlayerDisplayName(playerId)}</option>`)
    .join("")
}

function syncFinalWinnerOptions() {
  const semifinal1Winner = getSelectValue("semifinal1Winner")
  const semifinal2Winner = getSelectValue("semifinal2Winner")
  const finalists = [semifinal1Winner, semifinal2Winner].filter(Boolean)
  const currentFinalWinner = getSelectValue("finalWinner")
  fillSelectOptions("finalWinner", finalists, finalists.includes(currentFinalWinner) ? currentFinalWinner : finalists[0])
}

function openFinalizeCategoryModalInternal() {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (!canFinalizeCategory(state)) {
    showToast("Finalize a fase de grupos, esvazie as mesas e tenha pelo menos 4 atletas para encerrar a categoria.", "warning")
    return
  }

  if (getKnockoutFinalStandings(state)) {
    finalizeCurrentCategory()
    return
  }

  const playerIds = getRegistrationsForCategory(category).map((registration) => registration.id)
  const [p1, p2, p3, p4] = playerIds

  fillSelectOptions("semifinal1Winner", playerIds, p1)
  fillSelectOptions("semifinal1Loser", playerIds, p2)
  fillSelectOptions("semifinal2Winner", playerIds, p3)
  fillSelectOptions("semifinal2Loser", playerIds, p4)
  fillSelectOptions("finalWinner", [p1, p3].filter(Boolean), p1)

  ;(["semifinal1Winner", "semifinal2Winner"] as const).forEach((selectId) => {
    const select = document.getElementById(selectId) as HTMLSelectElement | null
    if (select) {
      select.onchange = () => {
        syncFinalWinnerOptions()
      }
    }
  })

  const modal = document.getElementById("finalizeCategoryModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "flex"
  }
}

function closeFinalizeCategoryModalInternal() {
  const modal = document.getElementById("finalizeCategoryModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

function getSelectValue(selectId: string) {
  return (document.getElementById(selectId) as HTMLSelectElement | null)?.value?.trim() || ""
}

async function finalizeCurrentCategory() {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (!canFinalizeCategory(state)) {
    showToast("Esta categoria ainda não pode ser encerrada.", "warning")
    return
  }

  const automaticFinalStandings = getKnockoutFinalStandings(state)
  let finalStandings = automaticFinalStandings

  if (!finalStandings) {
    const semifinal1Winner = getSelectValue("semifinal1Winner")
    const semifinal1Loser = getSelectValue("semifinal1Loser")
    const semifinal2Winner = getSelectValue("semifinal2Winner")
    const semifinal2Loser = getSelectValue("semifinal2Loser")
    const finalWinner = getSelectValue("finalWinner")

    const semifinalists = [semifinal1Winner, semifinal1Loser, semifinal2Winner, semifinal2Loser]
    const uniqueSemifinalists = new Set(semifinalists)

    if (semifinalists.some((playerId) => !playerId)) {
      showToast("Preencha todos os jogadores das semifinais.", "warning")
      return
    }

    if (semifinal1Winner === semifinal1Loser || semifinal2Winner === semifinal2Loser) {
      showToast("Cada semifinal precisa ter vencedor e derrotado diferentes.", "warning")
      return
    }

    if (uniqueSemifinalists.size !== 4) {
      showToast("Os quatro semifinalistas precisam ser diferentes.", "warning")
      return
    }

    const finalists = [semifinal1Winner, semifinal2Winner]
    if (!finalists.includes(finalWinner)) {
      showToast("O campeão da final precisa ser um dos vencedores das semifinais.", "warning")
      return
    }

    const runnerUp = finalists.find((playerId) => playerId !== finalWinner)
    if (!runnerUp) {
      showToast("Não foi possível identificar o vice-campeão.", "error")
      return
    }

    const thirdPlace = finalWinner === semifinal1Winner ? semifinal1Loser : semifinal2Loser
    const fourthPlace = runnerUp === semifinal1Winner ? semifinal1Loser : semifinal2Loser
    finalStandings = [finalWinner, runnerUp, thirdPlace, fourthPlace]
  }

  const finalState: Partial<ChampionshipCategoryState> = {
    finished: true,
    started: false,
    knockoutStarted: false,
    queue: [],
    activeTables: normalizeTables([], state.tableCount ?? 1),
    finalStandings
  }

  await saveCategoryState(finalState)
  await writeFinalStandingsToUsers(category, { ...state, ...finalState }, finalStandings)

  closeFinalizeCategoryModalInternal()
  renderPage()
}

;(window as any).changeTables = async (delta: number) => {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (state.finished) {
    showToast("Esta categoria já foi encerrada.", "warning")
    return
  }

  const currentTables = normalizeTables(state.activeTables, state.tableCount ?? 1)
  const occupiedTables = currentTables.filter((table) => table.match).length
  const nextTableCount = Math.max(1, (state.tableCount ?? 1) + delta)

  if (nextTableCount < occupiedTables) {
    showToast("Não é possível remover mesas enquanto existem partidas em andamento nelas.", "warning")
    return
  }

  const nextTables = currentTables.slice(0, nextTableCount)
  const rebalanced = rebalanceGroupAssignments({
    ...state,
    tableCount: nextTableCount,
    activeTables: nextTables
  })

  await saveCategoryState({
    tableCount: nextTableCount,
    activeTables: rebalanced.activeTables,
    queue: rebalanced.queue
  })
  renderPage()
}

;(window as any).startCategory = async () => {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (state.finished) {
    showToast("Esta categoria já foi encerrada.", "warning")
    return
  }

  if (!state.groups?.length) {
    showToast("Sorteie os grupos na pagina principal antes de iniciar a categoria.", "warning")
    return
  }

  const rebalanced = rebalanceGroupAssignments({
    ...state,
    defined: true,
    started: true
  })

  await saveCategoryState({
    defined: true,
    started: true,
    activeTables: rebalanced.activeTables,
    queue: rebalanced.queue
  })
  renderPage()
}

;(window as any).startKnockout = async () => {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (state.finished) {
    showToast("Esta categoria já foi encerrada.", "warning")
    return
  }

  const bracketRounds = buildBracketRounds(state.groups ?? [], state)
  const hasDefinedKnockoutMatch = bracketRounds.some((round) => round.matches.some((match) => match.playerIds))
  if (!hasDefinedKnockoutMatch) {
    showToast("Ainda não ha confrontos definidos para iniciar o mata-mata.", "warning")
    return
  }

  const rebalanced = rebalanceGroupAssignments({
    ...state,
    knockoutStarted: true
  })

  await saveCategoryState({
    knockoutStarted: true,
    activeTables: rebalanced.activeTables,
    queue: rebalanced.queue
  })
  renderPage()
}

;(window as any).addPlayerToGroup = async (playerId: string) => {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (state.finished) {
    showToast("Esta categoria já foi encerrada.", "warning")
    return
  }

  if (!canAddPlayersToGroups(state)) {
    showToast("Não é mais possível adicionar atletas a esta categoria.", "warning")
    return
  }

  const select = document.getElementById(`assignGroup_${playerId}`) as HTMLSelectElement | null
  const groupId = select?.value
  if (!groupId) {
    showToast("Escolha um grupo para adicionar o atleta.", "warning")
    return
  }

  const groups = (state.groups ?? []).map((group) =>
    group.id === groupId
      ? { ...group, playerIds: group.playerIds.includes(playerId) ? group.playerIds : [...group.playerIds, playerId] }
      : group
  )

  const rebalanced = rebalanceGroupAssignments({
    ...state,
    groups
  })

  await saveCategoryState({
    groups,
    activeTables: rebalanced.activeTables,
    queue: rebalanced.queue
  })
  renderPage()
}

;(window as any).finishMatch = async (tableIndex: number) => {
  const category = currentCategory
  if (!category) return

  const state = getCategoryState(category)
  if (state.finished) {
    showToast("Esta categoria já foi encerrada.", "warning")
    return
  }
  const activeTables = normalizeTables(state.activeTables, state.tableCount ?? 1)
  const table = activeTables[tableIndex]
  if (!table?.match) return

  const score1 = Number((document.getElementById(`score1_${tableIndex}`) as HTMLInputElement | null)?.value || 0)
  const score2 = Number((document.getElementById(`score2_${tableIndex}`) as HTMLInputElement | null)?.value || 0)
  if (Number.isNaN(score1) || Number.isNaN(score2) || score1 === score2) {
    showToast("Informe um placar valido e sem empate.", "warning")
    return
  }

  const completedMatch: ChampionshipMatch = {
    ...table.match,
    score1,
    score2,
    winnerId: score1 > score2 ? table.match.playerIds[0] : table.match.playerIds[1],
    playedAt: Date.now()
  }

  activeTables[tableIndex] = { id: table.id, groupId: table.groupId }
  const completedMatches = [...(state.completedMatches ?? []), completedMatch]
  const rebalanced = rebalanceGroupAssignments({
    ...state,
    activeTables,
    completedMatches
  })

  await saveCategoryState({
    activeTables: rebalanced.activeTables,
    queue: rebalanced.queue,
    completedMatches
  })
  await writeMatchHistoryForUsers(category, { ...state, completedMatches }, completedMatch)
  renderPage()
}

;(window as any).openTournamentRegistrations = () => {
  const tournament = currentTournament
  if (!tournament) return
  window.location.href = `/pages/tournament-registrations.html?id=${tournament.id}`
}

;(window as any).goBackToChampionship = () => {
  const tournament = currentTournament
  if (!tournament) return
  window.location.href = `/pages/championship-manage.html?id=${tournament.id}`
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).openFinalizeCategoryModal = () => {
  openFinalizeCategoryModalInternal()
}

;(window as any).closeFinalizeCategoryModal = () => {
  closeFinalizeCategoryModalInternal()
}

;(window as any).openResetCategoryMatchesModal = () => {
  openResetCategoryMatchesModalInternal()
}

;(window as any).closeResetCategoryMatchesModal = () => {
  closeResetCategoryMatchesModalInternal()
}

;(window as any).confirmResetCategoryMatches = async () => {
  try {
    const target = getSelectValue("resetCategoryTarget") || "all"
    await resetCurrentCategoryMatches(target)
  } catch (error: any) {
    showToast("Erro ao resetar jogos: " + error.message, "error")
  }
}

;(window as any).confirmFinalizeCategory = async () => {
  try {
    await finalizeCurrentCategory()
  } catch (error: any) {
    showToast("Erro ao encerrar categoria: " + error.message, "error")
  }
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (checked) return
  checked = true
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }
  const userSnapshot = await getDoc(doc(db, "users", user.uid))
  const userData = redirectByRole(userSnapshot.data() as User | undefined)
  if (!userData) return
  setUserHeader(userData)
  await loadTournament()
  await loadRegistrations()
  if (currentCategory) {
    await syncCategoryHistoryToUsers(currentCategory, getCategoryState(currentCategory))
  }
  renderPage()
})

