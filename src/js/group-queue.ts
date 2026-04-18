import { matches, officialQueues, tablesByGroup } from "./store"
import { CompetitionGroup, Player, RankingSchedulerState } from "./types"

function getBusy(group: CompetitionGroup): Set<string> {
  const set = new Set<string>()
  tablesByGroup[group].forEach((table) => {
    if (table.p1) set.add(table.p1.id)
    if (table.p2) set.add(table.p2.id)
  })
  return set
}

function alreadyPlayed(a: string, b: string, group: CompetitionGroup) {
  return matches.some(
    (match) =>
      (match.group ?? "general") === group &&
      ((match.p1 === a && match.p2 === b) || (match.p1 === b && match.p2 === a))
  )
}

function hasUnplayedOpponent(player: Player, availablePlayers: Player[], group: CompetitionGroup) {
  return availablePlayers.some((opponent) => opponent.id !== player.id && !alreadyPlayed(player.id, opponent.id, group))
}

function createEmptySchedulerState(): RankingSchedulerState {
  return {
    winnerPoolIds: [],
    loserPoolIds: []
  }
}

function getAverageGames(players: Player[]) {
  if (!players.length) return 0
  return players.reduce((sum, player) => sum + player.games, 0) / players.length
}

function getLatestMatchForPlayer(playerId: string, group: CompetitionGroup) {
  return [...matches]
    .filter((match) => (match.group ?? "general") === group && (match.p1 === playerId || match.p2 === playerId))
    .sort((a, b) => b.createdAt - a.createdAt)[0]
}

function getPriorityScore(player: Player, allPlayers: Player[]) {
  const averageGames = getAverageGames(allPlayers)
  const gameDeficit = Math.max(0, averageGames - player.games)
  const waitTime = player.lastPlayed ? Date.now() - player.lastPlayed : 999999999
  return gameDeficit * 100000 + (999999999 - waitTime)
}

function matchScore(a: Player, b: Player, group: CompetitionGroup, allPlayers: Player[]) {
  if (alreadyPlayed(a.id, b.id, group)) {
    return Number.POSITIVE_INFINITY
  }

  const averageGames = getAverageGames(allPlayers)
  const aUnderplayed = a.games < averageGames
  const bUnderplayed = b.games < averageGames

  const gameDiff = Math.abs(a.games - b.games)
  const winDiff = Math.abs(a.wins - b.wins)
  const lossDiff = Math.abs(a.losses - b.losses)

  let score = winDiff * 1000 + lossDiff * 300 + gameDiff * 120

  if (aUnderplayed || bUnderplayed) {
    score = gameDiff * 600 + lossDiff * 200 - (a.wins + b.wins) * 40
  }

  const latestA = getLatestMatchForPlayer(a.id, group)
  const latestB = getLatestMatchForPlayer(b.id, group)
  if (latestA && latestB && latestA.id === latestB.id) {
    const aWonLatest = latestA.winner === a.id
    const bWonLatest = latestB.winner === b.id

    if (aUnderplayed || bUnderplayed) {
      if (aWonLatest !== bWonLatest) {
        score -= aWonLatest || bWonLatest ? 250 : 0
      }
    } else if (aWonLatest !== bWonLatest) {
      score += 350
    }
  }

  return score
}

function normalizeExistingQueue(group: CompetitionGroup, availablePlayers: Player[]) {
  const availableIds = new Set(availablePlayers.map((player) => player.id))

  return officialQueues[group].filter(
    ([left, right]) =>
      availableIds.has(left.id) &&
      availableIds.has(right.id) &&
      left.id !== right.id &&
      !alreadyPlayed(left.id, right.id, group)
  )
}

function getRemainingPlayers(players: Player[], used: Set<string>) {
  return players.filter((player) => !used.has(player.id))
}

function pairPriorityWaitingPlayers(
  underplayedPlayers: Player[],
  used: Set<string>,
  activePlayers: Player[],
  group: CompetitionGroup,
  queue: [Player, Player][]
) {
  const availableWaiting = underplayedPlayers.filter((player) => !used.has(player.id))
  if (availableWaiting.length < 2) return

  const sortedWaiting = [...availableWaiting].sort((a, b) => getPriorityScore(b, activePlayers) - getPriorityScore(a, activePlayers))
  const left = sortedWaiting[0]

  let bestOpponent: Player | null = null
  let bestScore = Number.POSITIVE_INFINITY

  for (let index = 1; index < sortedWaiting.length; index++) {
    const candidate = sortedWaiting[index]
    const score = matchScore(left, candidate, group, activePlayers)
    if (score < bestScore) {
      bestScore = score
      bestOpponent = candidate
    }
  }

  if (!bestOpponent || !Number.isFinite(bestScore)) return

  queue.push([left, bestOpponent])
  used.add(left.id)
  used.add(bestOpponent.id)
}

function pairFromPool(
  poolIds: string[],
  used: Set<string>,
  availablePlayers: Player[],
  allPlayers: Player[],
  group: CompetitionGroup,
  queue: [Player, Player][]
) {
  const playerMap = new Map(availablePlayers.map((player) => [player.id, player]))
  const remainingPool = poolIds.filter((playerId) => playerMap.has(playerId) && !used.has(playerId))

  while (remainingPool.length >= 2) {
    const leftId = remainingPool.shift()!
    const left = playerMap.get(leftId)
    if (!left || used.has(left.id)) continue

    let bestIndex = -1
    let bestScore = Number.POSITIVE_INFINITY

    remainingPool.forEach((candidateId, index) => {
      const right = playerMap.get(candidateId)
      if (!right || used.has(right.id)) return

      const score = matchScore(left, right, group, allPlayers)
      if (score < bestScore) {
        bestScore = score
        bestIndex = index
      }
    })

    if (bestIndex === -1 || !Number.isFinite(bestScore)) continue

    const [rightId] = remainingPool.splice(bestIndex, 1)
    const right = playerMap.get(rightId)
    if (!right) continue

    queue.push([left, right])
    used.add(left.id)
    used.add(right.id)
  }

  return remainingPool
}

function pairUnderplayedPlayers(
  underplayedPlayers: Player[],
  schedulerState: RankingSchedulerState,
  used: Set<string>,
  availablePlayers: Player[],
  allPlayers: Player[],
  group: CompetitionGroup,
  queue: [Player, Player][]
) {
  const availableIds = new Set(availablePlayers.map((player) => player.id))
  const winnerPool = (schedulerState.winnerPoolIds ?? []).filter((playerId) => availableIds.has(playerId) && !used.has(playerId))
  const loserPool = (schedulerState.loserPoolIds ?? []).filter((playerId) => availableIds.has(playerId) && !used.has(playerId))
  const playerMap = new Map(availablePlayers.map((player) => [player.id, player]))

  underplayedPlayers.forEach((player) => {
    if (used.has(player.id)) return

    const candidateIds = [...winnerPool, ...loserPool]
    let bestOpponent: Player | null = null
    let bestScore = Number.POSITIVE_INFINITY

    candidateIds.forEach((candidateId) => {
      if (candidateId === player.id || used.has(candidateId)) return
      const opponent = playerMap.get(candidateId)
      if (!opponent) return

      let score = matchScore(player, opponent, group, allPlayers)
      if (winnerPool.includes(candidateId)) score -= 180
      if (player.games === 0 && winnerPool.includes(candidateId)) score -= 120

      if (score < bestScore) {
        bestScore = score
        bestOpponent = opponent
      }
    })

    if (!bestOpponent || !Number.isFinite(bestScore)) return

    queue.push([player, bestOpponent])
    used.add(player.id)
    used.add(bestOpponent.id)
  })

  schedulerState.winnerPoolIds = winnerPool.filter((playerId) => !used.has(playerId))
  schedulerState.loserPoolIds = loserPool.filter((playerId) => !used.has(playerId))
}

export function registerFinishedMatchForGroup(
  group: CompetitionGroup,
  winner: Player,
  loser: Player,
  activePlayers: Player[],
  schedulerState: RankingSchedulerState = createEmptySchedulerState()
) {
  const nextState: RankingSchedulerState = {
    winnerPoolIds: [...(schedulerState.winnerPoolIds ?? [])].filter((playerId) => playerId !== winner.id && playerId !== loser.id),
    loserPoolIds: [...(schedulerState.loserPoolIds ?? [])].filter((playerId) => playerId !== winner.id && playerId !== loser.id)
  }

  if (hasUnplayedOpponent(winner, activePlayers, group)) {
    nextState.winnerPoolIds!.push(winner.id)
  }

  if (hasUnplayedOpponent(loser, activePlayers, group)) {
    nextState.loserPoolIds!.push(loser.id)
  }

  return nextState
}

export function buildQueueForGroup(
  group: CompetitionGroup,
  activePlayers: Player[],
  schedulerState: RankingSchedulerState = createEmptySchedulerState()
) {
  const busy = getBusy(group)
  const availablePlayers = activePlayers.filter((player) => !busy.has(player.id))
  const eligiblePlayers = availablePlayers.filter((player) => hasUnplayedOpponent(player, availablePlayers, group))
  const averageGames = getAverageGames(activePlayers)
  const sorted = [...eligiblePlayers].sort((a, b) => getPriorityScore(b, activePlayers) - getPriorityScore(a, activePlayers))
  const used = new Set<string>()
  const queue: [Player, Player][] = normalizeExistingQueue(group, availablePlayers)

  queue.forEach(([left, right]) => {
    used.add(left.id)
    used.add(right.id)
  })

  const nextState: RankingSchedulerState = {
    winnerPoolIds: [...(schedulerState.winnerPoolIds ?? [])],
    loserPoolIds: [...(schedulerState.loserPoolIds ?? [])]
  }

  const underplayedPlayers = sorted.filter(
    (player) => !used.has(player.id) && (player.games < averageGames || player.games === 0)
  )

  pairPriorityWaitingPlayers(underplayedPlayers, used, activePlayers, group, queue)
  pairUnderplayedPlayers(underplayedPlayers, nextState, used, availablePlayers, activePlayers, group, queue)

  nextState.winnerPoolIds = pairFromPool(
    nextState.winnerPoolIds ?? [],
    used,
    availablePlayers,
    activePlayers,
    group,
    queue
  )

  nextState.loserPoolIds = pairFromPool(
    nextState.loserPoolIds ?? [],
    used,
    availablePlayers,
    activePlayers,
    group,
    queue
  )

  const remainingPlayers = getRemainingPlayers(sorted, used)
  for (let i = 0; i < remainingPlayers.length; i++) {
    const p1 = remainingPlayers[i]
    if (used.has(p1.id)) continue

    let bestMatch: Player | null = null
    let bestScore = Infinity

    for (let j = i + 1; j < remainingPlayers.length; j++) {
      const p2 = remainingPlayers[j]
      if (used.has(p2.id)) continue

      const score = matchScore(p1, p2, group, activePlayers)
      if (score < bestScore) {
        bestScore = score
        bestMatch = p2
      }
    }

    if (bestMatch) {
      queue.push([p1, bestMatch])
      used.add(p1.id)
      used.add(bestMatch.id)
    }
  }

  officialQueues[group].length = 0
  queue.forEach((match) => officialQueues[group].push(match))
  return nextState
}
