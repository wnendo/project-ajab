import { matches, officialQueues, tablesByGroup } from "./store"
import { CompetitionGroup, Player } from "./types"

export { buildQueueForGroup as buildQueue } from "./group-queue"

/*

// ================= HELPERS =================
function getBusy(): Set<string>{
  const set = new Set<string>()
  tables.forEach(t=>{
    if(t.p1) set.add(t.p1.id)
    if(t.p2) set.add(t.p2.id)
  })
  return set
}

export function fillTables(): Table[]{

  const newTables: Table[] = []

  for(let i=0;i<tables.length;i++){

    if(officialQueue.length){

      const m = officialQueue.shift()!

      newTables.push({
        id: tables[i].id, // 🔥 mantém ID da mesa
        p1: m[0],
        p2: m[1]
      })

    } else {

      newTables.push({
        id: tables[i].id // 🔥 mantém mesa vazia com ID
      })
    }
  }

  return newTables
}
function alreadyPlayed(a:string,b:string){
  return matches.some(m =>
    (m.p1===a && m.p2===b) ||
    (m.p1===b && m.p2===a)
  )
}

// 🔥 SCORE DE PRIORIDADE
function getPriorityScore(p: Player){

  const waitTime = p.lastPlayed ? Date.now() - p.lastPlayed : 999999999
  const gamesFactor = -p.games // menos jogos = maior prioridade

  return (
    gamesFactor * 1000 +   // PRIORIDADE 1
    waitTime / 1000        // PRIORIDADE 2
  )
}

// 🎯 DISTÂNCIA ENTRE JOGADORES
function matchScore(a: Player, b: Player){

 const winDiff = Math.abs(a.wins - b.wins)

  const repeatPenalty = alreadyPlayed(a.id,b.id) ? 1000000 : 0

  return (
    winDiff * 1000 +     // PRIORIDADE 0 (balanceamento)
    repeatPenalty        // PRIORIDADE 3 (evitar repetição)
  )
}

// ================= BUILD =================
export function buildQueue(){

  if(getBusy().size > 0) return

  const active = players.filter(p=>p.active)

  // 🔥 ordenar por prioridade individual
  const sorted = [...active].sort((a,b)=>
    getPriorityScore(a) - getPriorityScore(b)
  )

  const used = new Set<string>()
  const queue: [Player,Player][] = []

  for(let i=0;i<sorted.length;i++){

    const p1 = sorted[i]
    if(used.has(p1.id)) continue

    let bestMatch: Player | null = null
    let bestScore = Infinity

    for(let j=i+1;j<sorted.length;j++){

      const p2 = sorted[j]
      if(used.has(p2.id)) continue

      const score = matchScore(p1,p2)

      if(score < bestScore){
        bestScore = score
        bestMatch = p2
      }
    }

    if(bestMatch){
      queue.push([p1,bestMatch])
      used.add(p1.id)
      used.add(bestMatch.id)
    }
  }

  if(officialQueue.length > 0) return
  queue.forEach(m=>officialQueue.push(m))
}
*/
