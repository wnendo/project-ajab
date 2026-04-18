import type { Match } from "./types"

type RankingRowBase = {
  id: string
  name: string
}

type RankingStats = {
  wins: number
  losses: number
  games: number
  setDiff: number
}

type HeadToHeadRecord = {
  played: number
  wins: number
}

function getDefaultStats(): RankingStats {
  return {
    wins: 0,
    losses: 0,
    games: 0,
    setDiff: 0
  }
}

export function buildRankingStats(playerIds: string[], matches: Match[]) {
  const relevantPlayers = new Set(playerIds)
  const stats = new Map<string, RankingStats>(playerIds.map((playerId) => [playerId, getDefaultStats()]))
  const headToHead = new Map<string, HeadToHeadRecord>()

  matches.forEach((match) => {
    if (!relevantPlayers.has(match.p1) || !relevantPlayers.has(match.p2)) return

    const p1 = stats.get(match.p1) ?? getDefaultStats()
    const p2 = stats.get(match.p2) ?? getDefaultStats()

    p1.games += 1
    p2.games += 1
    p1.setDiff += match.score1 - match.score2
    p2.setDiff += match.score2 - match.score1

    if (match.winner === match.p1) {
      p1.wins += 1
      p2.losses += 1
    } else {
      p2.wins += 1
      p1.losses += 1
    }

    stats.set(match.p1, p1)
    stats.set(match.p2, p2)

    const directKey = `${match.p1}::${match.p2}`
    const reverseKey = `${match.p2}::${match.p1}`

    headToHead.set(directKey, {
      played: (headToHead.get(directKey)?.played ?? 0) + 1,
      wins: (headToHead.get(directKey)?.wins ?? 0) + (match.winner === match.p1 ? 1 : 0)
    })
    headToHead.set(reverseKey, {
      played: (headToHead.get(reverseKey)?.played ?? 0) + 1,
      wins: (headToHead.get(reverseKey)?.wins ?? 0) + (match.winner === match.p2 ? 1 : 0)
    })
  })

  return { stats, headToHead }
}

function sortByFallback<T extends RankingRowBase>(rows: T[], stats: Map<string, RankingStats>) {
  return [...rows].sort((a, b) => {
    const statsA = stats.get(a.id) ?? getDefaultStats()
    const statsB = stats.get(b.id) ?? getDefaultStats()

    if (statsB.setDiff !== statsA.setDiff) return statsB.setDiff - statsA.setDiff
    if (statsB.games !== statsA.games) return statsB.games - statsA.games
    return a.name.localeCompare(b.name)
  })
}

export function sortRankingRows<T extends RankingRowBase>(rows: T[], matches: Match[]) {
  const { stats, headToHead } = buildRankingStats(
    rows.map((row) => row.id),
    matches
  )

  const groupedRows = new Map<string, T[]>()
  rows.forEach((row) => {
    const entryStats = stats.get(row.id) ?? getDefaultStats()
    const groupKey = `${entryStats.wins}:${entryStats.losses}`
    const items = groupedRows.get(groupKey) ?? []
    items.push(row)
    groupedRows.set(groupKey, items)
  })

  const orderedGroups = [...groupedRows.entries()].sort((left, right) => {
    const [leftWins, leftLosses] = left[0].split(":").map(Number)
    const [rightWins, rightLosses] = right[0].split(":").map(Number)

    if (rightWins !== leftWins) return rightWins - leftWins
    if (leftLosses !== rightLosses) return leftLosses - rightLosses
    return 0
  })

  return orderedGroups.flatMap(([, groupRows]) => {
    if (groupRows.length === 2) {
      const [first, second] = groupRows
      const directFirst = headToHead.get(`${first.id}::${second.id}`)
      const directSecond = headToHead.get(`${second.id}::${first.id}`)
      const directPlayed = (directFirst?.played ?? 0) > 0 || (directSecond?.played ?? 0) > 0

      if (directPlayed && (directFirst?.wins ?? 0) !== (directSecond?.wins ?? 0)) {
        return (directFirst?.wins ?? 0) > (directSecond?.wins ?? 0) ? [first, second] : [second, first]
      }
    }

    return sortByFallback(groupRows, stats)
  })
}
