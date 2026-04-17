import { matches, officialQueues, tablesByGroup } from "./store"
import { CompetitionGroup, Player } from "./types"

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

function getPriorityScore(player: Player) {
  const waitTime = player.lastPlayed ? Date.now() - player.lastPlayed : 999999999
  return -player.games * 1000 + waitTime / 1000
}

function matchScore(a: Player, b: Player, group: CompetitionGroup) {
  const winDiff = Math.abs(a.wins - b.wins)
  return winDiff * 1000
}

export function buildQueueForGroup(group: CompetitionGroup, activePlayers: Player[]) {
  if (getBusy(group).size > 0 || officialQueues[group].length > 0) {
    return
  }

  const eligiblePlayers = activePlayers.filter((player) => hasUnplayedOpponent(player, activePlayers, group))
  const sorted = [...eligiblePlayers].sort((a, b) => getPriorityScore(a) - getPriorityScore(b))
  const used = new Set<string>()
  const queue: [Player, Player][] = []

  for (let i = 0; i < sorted.length; i++) {
    const p1 = sorted[i]
    if (used.has(p1.id)) continue

    let bestMatch: Player | null = null
    let bestScore = Infinity

    for (let j = i + 1; j < sorted.length; j++) {
      const p2 = sorted[j]
      if (used.has(p2.id)) continue
      if (alreadyPlayed(p1.id, p2.id, group)) continue

      const score = matchScore(p1, p2, group)
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

  queue.forEach((match) => officialQueues[group].push(match))
}
