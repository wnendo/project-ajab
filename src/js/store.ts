import { CompetitionGroup, Match, Player, Table } from "./types"

export const players: Player[] = []
export const matches: Match[] = []
export const lastPositions: Record<string, number> = {}

export const officialQueues: Record<CompetitionGroup, [Player, Player][]> = {
  general: [],
  A: [],
  B: []
}

export const tablesByGroup: Record<CompetitionGroup, Table[]> = {
  general: [{ id: 1, group: "general" }],
  A: [{ id: 2, group: "A" }],
  B: [{ id: 3, group: "B" }]
}

let tableIdCounter = 4

export function getNextTableId() {
  return tableIdCounter++
}

export function resetTablesForGroup(group: CompetitionGroup, count = 1) {
  tablesByGroup[group].length = 0

  for (let index = 0; index < count; index++) {
    tablesByGroup[group].push({
      id: index === 0 ? getDefaultTableId(group) : getNextTableId(),
      group
    })
  }
}

export function clearQueueForGroup(group: CompetitionGroup) {
  officialQueues[group].length = 0
}

function getDefaultTableId(group: CompetitionGroup) {
  if (group === "general") return 1
  if (group === "A") return 2
  return 3
}
