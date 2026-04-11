import { Player, Match, Table } from "./types"

export const players: Player[] = []
export const matches: Match[] = []
export const officialQueue: [Player, Player][] = []
export const lastPositions: Record<string, number> = {}
export const tables: Table[] = [
  { id: 1 }
]

let tableIdCounter = 2
export function getNextTableId(){
  return tableIdCounter++
}