import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, getDocs, collection } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  ChampionshipMatch,
  TournamentRegistration,
  UpcomingTournament,
  User
} from "./types"

const params = new URLSearchParams(window.location.search)
const tournamentId = params.get("id")
const categoryParam = params.get("category")
const highlightPlayerId = params.get("highlight")

let currentTournament: UpcomingTournament | null = null
let currentCategory: ChampionshipCategory | null = null
let registrations: TournamentRegistration[] = []

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
  score1?: number
  score2?: number
  roundIndex: number
  slot: number
}

type KnockoutRound = {
  title: string
  matches: KnockoutRoundMatch[]
}

const BRACKET_MATCH_HEIGHT = 106
const BRACKET_BASE_GAP = 14
const BRACKET_CELL = BRACKET_MATCH_HEIGHT + BRACKET_BASE_GAP

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = (value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function getCategoryState(category: ChampionshipCategory): ChampionshipCategoryState {
  const state = currentTournament?.championshipState?.[category]
  return {
    groups: state?.groups ?? [],
    completedMatches: state?.completedMatches ?? [],
    finished: state?.finished ?? false,
    finalStandings: state?.finalStandings ?? []
  }
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

function getPlayerDisplayName(playerId: string) {
  return currentCategory ? getRegistrationById(currentCategory, playerId)?.name || "A definir" : "A definir"
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

function getGroupCompletedMatches(state: ChampionshipCategoryState, groupId: string) {
  return (state.completedMatches ?? []).filter((match) => match.stage === "groups" && match.groupId === groupId)
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

  return [...standings.values()].sort((a, b) => {
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
    const standings = getGroupStandings(group, state)
    const first = standings[0]
    const second = standings[1]
    if (first) winners.push({ ...first, groupId: group.id, groupName: group.name, placement: 1 })
    if (second) runnersUp.push({ ...second, groupId: group.id, groupName: group.name, placement: 2 })
  })

  return { winners, runnersUp }
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

function getKnockoutCompletedMatches(state: ChampionshipCategoryState) {
  return (state.completedMatches ?? []).filter((match) => match.stage === "knockout")
}

function getKnockoutCompletedMatchMap(state: ChampionshipCategoryState) {
  return new Map(getKnockoutCompletedMatches(state).map((match) => [match.id, match]))
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
    if (right) pairs.push([left, right])
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
        score1: undefined,
        score2: undefined,
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
        score1: completedKnockoutMap.get(`KO_R1_S${slot}`)?.score1,
        score2: completedKnockoutMap.get(`KO_R1_S${slot}`)?.score2,
        roundIndex: 1,
        slot
      })
    }
  }

  if (!openingMatches.length) return []

  const rounds: KnockoutRound[] = [{
    title: openingMatches.length >= 8 ? "Oitavas" : openingMatches.length >= 4 ? "Quartas" : openingMatches.length >= 2 ? "Semifinais" : "Final",
    matches: openingMatches
  }]

  let previousRoundMatches = openingMatches
  let roundIndex = 2

  while (previousRoundMatches.length > 1) {
    const nextRoundMatches: KnockoutRoundMatch[] = []
    for (let index = 0; index < previousRoundMatches.length; index += 2) {
      const current = previousRoundMatches[index]
      const next = previousRoundMatches[index + 1]
      if (!current || !next) continue
      const currentWinner = completedKnockoutMap.get(current.id)?.winnerId ?? current.resolvedWinnerId
      const nextWinner = completedKnockoutMap.get(next.id)?.winnerId ?? next.resolvedWinnerId
      const slot = nextRoundMatches.length + 1
      nextRoundMatches.push({
        id: `KO_R${roundIndex}_S${slot}`,
        title: `J${roundIndex}-${slot}`,
        labels: [
          currentWinner ? getPlayerDisplayName(currentWinner) : `Vencedor ${current.title}`,
          nextWinner ? getPlayerDisplayName(nextWinner) : `Vencedor ${next.title}`
        ],
        playerIds: currentWinner && nextWinner ? [currentWinner, nextWinner] : undefined,
        resolvedWinnerId: completedKnockoutMap.get(`KO_R${roundIndex}_S${slot}`)?.winnerId,
        score1: completedKnockoutMap.get(`KO_R${roundIndex}_S${slot}`)?.score1,
        score2: completedKnockoutMap.get(`KO_R${roundIndex}_S${slot}`)?.score2,
        roundIndex,
        slot
      })
    }
    if (!nextRoundMatches.length) break
    rounds.push({
      title: nextRoundMatches.length === 1 ? "Final" : nextRoundMatches.length === 2 ? "Semifinais" : "Fase seguinte",
      matches: nextRoundMatches
    })
    previousRoundMatches = nextRoundMatches
    roundIndex += 1
  }

  return rounds
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

function getPlayerScoreForSide(match: KnockoutRoundMatch, side: 0 | 1) {
  if (match.isBye) return side === 0 ? "-" : ""
  const score = side === 0 ? match.score1 : match.score2
  return typeof score === "number" ? String(score) : ""
}

function getPodiumClass(state: ChampionshipCategoryState, playerId?: string) {
  if (!state.finished || !playerId) return ""
  const position = (state.finalStandings ?? []).findIndex((entry) => entry === playerId)
  if (position === 0) return "podium-gold"
  if (position === 1) return "podium-silver"
  if (position === 2 || position === 3) return "podium-bronze"
  return ""
}

function getBracketColumnMetrics(roundIndex: number) {
  const multiplier = Math.max(1, 2 ** (roundIndex - 1))
  const offset = ((multiplier - 1) * BRACKET_CELL) / 2
  const gap = (multiplier * BRACKET_CELL) - BRACKET_MATCH_HEIGHT
  return { offset, gap }
}

function renderBracket() {
  const container = document.getElementById("bracketFrameContent")
  const category = currentCategory
  const tournament = currentTournament
  if (!container || !category || !tournament) return

  const state = getCategoryState(category)
  const rounds = buildBracketRounds(state.groups ?? [], state)

  container.innerHTML = rounds.length
    ? `
      <div class="championship-bracket-frame-board">
        ${rounds.map((round, roundIndex) => `
          <section class="championship-frame-column">
            <header class="championship-frame-column-head">
              <span>${round.title}</span>
              <strong>${round.matches.length} jogo(s)</strong>
            </header>
            <div
              class="championship-frame-column-body championship-frame-column-body-${round.matches.length}"
              style="--bracket-offset:${getBracketColumnMetrics(roundIndex + 1).offset}px; --bracket-gap:${getBracketColumnMetrics(roundIndex + 1).gap}px;"
            >
              ${round.matches.map((match) => `
                <article class="championship-frame-match ${getBracketMatchStatus(match)}">
                  <div class="championship-frame-match-top">
                    <strong>${match.title}</strong>
                    <span class="championship-frame-badge ${getBracketMatchStatus(match)}">${getBracketMatchStatusLabel(match)}</span>
                  </div>
                  <div class="championship-frame-entry ${match.resolvedWinnerId === match.playerIds?.[0] ? "winner" : ""} ${highlightPlayerId && match.playerIds?.[0] === highlightPlayerId ? "focus" : ""} ${getPodiumClass(state, match.playerIds?.[0])}">
                    <div class="championship-frame-name-line">
                      <span class="championship-frame-name">${match.labels[0]}</span>
                      <span class="championship-frame-score">${getPlayerScoreForSide(match, 0)}</span>
                    </div>
                  </div>
                  <div class="championship-frame-divider"></div>
                  <div class="championship-frame-entry ${match.resolvedWinnerId === match.playerIds?.[1] ? "winner" : ""} ${highlightPlayerId && match.playerIds?.[1] === highlightPlayerId ? "focus" : ""} ${getPodiumClass(state, match.playerIds?.[1])}">
                    <div class="championship-frame-name-line">
                      <span class="championship-frame-name">${match.labels[1]}</span>
                      <span class="championship-frame-score">${getPlayerScoreForSide(match, 1)}</span>
                    </div>
                  </div>
                </article>
              `).join("")}
            </div>
          </section>
        `).join("")}
      </div>
    `
    : '<div class="empty-state">O mata-mata aparece aqui quando existirem classificados suficientes.</div>'
}

async function loadPage(user: User) {
  if (!user.profileComplete) {
    window.location.replace("/pages/complete-profile.html")
    return
  }
  if (!tournamentId) return

  currentCategory = normalizeChampionshipCategory(categoryParam || undefined)
  if (!currentCategory) return

  const tournamentSnapshot = await getDoc(doc(db, "tournaments", tournamentId))
  if (!tournamentSnapshot.exists()) return
  currentTournament = { id: tournamentSnapshot.id, ...tournamentSnapshot.data() } as UpcomingTournament

  const registrationsSnapshot = await getDocs(collection(db, "tournaments", tournamentId, "registrations"))
  registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
  renderBracket()
}

onAuthStateChanged(auth, async (user) => {
  if (!user) return
  const userSnapshot = await getDoc(doc(db, "users", user.uid))
  if (!userSnapshot.exists()) return
  await loadPage({ id: userSnapshot.id, ...userSnapshot.data() } as User)
})
