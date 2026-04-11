import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { buildQueue } from "./queue"
import { matches, officialQueue, players, tables, getNextTableId } from "./store"
import { Match, Player, TournamentRegistration, UpcomingTournament, User, UserMatchHistory, UserTournament } from "./types"
import { render } from "./tournament-manage-ui"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let registeredAthleteIds = new Set<string>()
let registrations: TournamentRegistration[] = []
let registrationsRefreshInterval: number | null = null

function getDefaultPlayerProfile() {
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

  return {
    id: userData.id,
    name: userData.name,
    wins: playerProfile.wins ?? 0,
    losses: playerProfile.losses ?? 0,
    games: playerProfile.games ?? 0,
    active: playerProfile.active ?? true,
    createdAt: playerProfile.createdAt ?? userData.createdAt,
    lastPlayed: playerProfile.lastPlayed
  }
}

export function hasActiveTournament() {
  return Boolean(currentTournament && currentTournament.status !== "finished")
}

function resetTables() {
  tables.length = 0
  tables.push({ id: 1 })
}

function clearQueue() {
  officialQueue.length = 0
}

function removeTournamentRegistration(batch: ReturnType<typeof writeBatch>, playerId: string) {
  if (!currentTournament) {
    return
  }

  batch.delete(doc(db, "tournaments", currentTournament.id, "registrations", playerId))
  batch.delete(doc(db, "users", playerId, "registrations", currentTournament.id))
}

function saveTableCount() {
  localStorage.setItem(`tableCount:${tournamentId ?? "default"}`, String(tables.length))
}

function loadSavedTableCount() {
  const savedTableCount = Number(localStorage.getItem(`tableCount:${tournamentId ?? "default"}`) ?? "1")

  if (!Number.isInteger(savedTableCount) || savedTableCount < 1) {
    return
  }

  resetTables()

  for (let i = 1; i < savedTableCount; i++) {
    tables.push({ id: getNextTableId() })
  }
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
  updateTournamentSummary()
}

async function loadPlayers() {
  if (!currentTournament) {
    players.length = 0
    registeredAthleteIds = new Set<string>()
    return
  }

  const [usersSnapshot, registrationsSnapshot] = await Promise.all([
    getDocs(query(collection(db, "users"), where("role", "==", "user"))),
    getDocs(collection(db, "tournaments", currentTournament.id, "registrations"))
  ])

  registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
  registeredAthleteIds = new Set(
    registrations.filter((entry) => entry.paymentStatus === "approved").map((entry) => entry.id)
  )

  players.length = 0
  players.push(
    ...usersSnapshot.docs
      .map((entry) => ({ id: entry.id, ...entry.data() }) as User)
      .filter((user) => user.profileComplete && registeredAthleteIds.has(user.id))
      .map((user) => mapUserToPlayer(user))
      .sort((a, b) => a.name.localeCompare(b.name))
  )
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

function getTournamentParticipants() {
  return players.filter((player) => player.games > 0 || player.active)
}

export function getTournamentRegistrations() {
  return registrations.sort((a, b) => a.name.localeCompare(b.name))
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
  saveTableCount()
}

async function ensureTournamentActive() {
  if (!currentTournament || currentTournament.isActive) {
    return
  }

  const snapshot = await getDocs(query(collection(db, "tournaments"), where("isActive", "==", true)))
  const batch = writeBatch(db)

  snapshot.forEach((entry) => {
    if (entry.id !== currentTournament?.id) {
      batch.update(entry.ref, { isActive: false, updatedAt: Date.now() })
    }
  })

  batch.update(doc(db, "tournaments", currentTournament.id), {
    isActive: true,
    status: "open",
    updatedAt: Date.now()
  })

  await batch.commit()
  currentTournament = { ...currentTournament, isActive: true, status: "open", updatedAt: Date.now() }
  updateTournamentSummary()
}

async function writeMatchHistoryForUsers(match: Match, winnerId: string, loserId: string) {
  if (!currentTournament) {
    return
  }

  const winner = players.find((entry) => entry.id === winnerId)
  const loser = players.find((entry) => entry.id === loserId)
  if (!winner || !loser) return

  const winnerMatch: UserMatchHistory = {
    id: match.id,
    tournamentId: currentTournament.id,
    tournamentTitle: currentTournament.title,
    opponentName: loser.name,
    scoreLabel: `${match.score1} x ${match.score2}`,
    tableLabel: match.tableLabel,
    result: "win",
    playedAt: match.createdAt
  }

  const loserMatch: UserMatchHistory = {
    id: match.id,
    tournamentId: currentTournament.id,
    tournamentTitle: currentTournament.title,
    opponentName: winner.name,
    scoreLabel: `${match.score2} x ${match.score1}`,
    tableLabel: match.tableLabel,
    result: "loss",
    playedAt: match.createdAt
  }

  const batch = writeBatch(db)
  batch.set(doc(db, "users", winner.id, "matches", match.id), winnerMatch)
  batch.set(doc(db, "users", loser.id, "matches", match.id), loserMatch)
  batch.set(
    doc(db, "users", winner.id, "tournaments", currentTournament.id),
    {
      tournamentId: currentTournament.id,
      title: currentTournament.title,
      category: currentTournament.category || "Livre",
      result: "Em andamento",
      matchCount: increment(1),
      wins: increment(1),
      losses: increment(0),
      playedAt: match.createdAt
    } as Partial<UserTournament>,
    { merge: true }
  )
  batch.set(
    doc(db, "users", loser.id, "tournaments", currentTournament.id),
    {
      tournamentId: currentTournament.id,
      title: currentTournament.title,
      category: currentTournament.category || "Livre",
      result: "Em andamento",
      matchCount: increment(1),
      wins: increment(0),
      losses: increment(1),
      playedAt: match.createdAt
    } as Partial<UserTournament>,
    { merge: true }
  )

  await batch.commit()
}

function fillOpenTables() {
  for (let i = 0; i < tables.length; i++) {
    if (!tables[i].p1 && officialQueue.length) {
      const nextMatch = officialQueue.shift()!
      tables[i] = { id: tables[i].id, p1: nextMatch[0], p2: nextMatch[1] }
    }
  }
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

;(window as any).addPlayer = async () => {
  const input = document.getElementById("name") as HTMLInputElement
  const name = input.value.trim()
  if (!name) return

  await loadPlayers()

  if (players.some((player) => player.name.toLowerCase() === name.toLowerCase() && player.active)) {
    alert("Atleta ja esta ativo neste torneio.")
    return
  }

  try {
    const inactiveUser = players.find(
      (entry) => entry.name.trim().toLowerCase() === name.toLowerCase() && !entry.active
    )

    if (!inactiveUser) {
      const hasRegistrationByName = players.some((entry) => entry.name.trim().toLowerCase() === name.toLowerCase())
      alert(
        hasRegistrationByName
          ? "Esse atleta ja esta ativo neste torneio ou nao pode ser ativado agora."
          : "Esse atleta nao esta inscrito neste torneio. Oriente-o a se inscrever pela agenda."
      )
      return
    }

    const playerProfile = {
      ...getDefaultPlayerProfile(),
      active: true
    }

    await updateDoc(doc(db, "users", inactiveUser.id), {
      "playerProfile.active": true,
      updatedAt: Date.now()
    })

    inactiveUser.active = true

    players.sort((a, b) => a.name.localeCompare(b.name))
    input.value = ""
    render()
  } catch (error: any) {
    alert("Erro ao ativar atleta: " + error.message)
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

  if (!confirm(`Remover a inscricao de ${registration.name}?`)) return

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
    alert("Erro ao remover inscricao: " + error.message)
  }
}

;(window as any).start = async () => {
  if (!currentTournament) {
    alert("Torneio nao encontrado.")
    return
  }

  await ensureTournamentActive()
  buildQueue()
  fillOpenTables()
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
    saveTableCount()
    render()
  } catch (error: any) {
    alert("Erro ao resetar campeonato: " + error.message)
  }
}

;(window as any).finishTournament = async () => {
  if (!currentTournament) return

  const ranking = getTournamentRanking()
  if (!ranking.length) {
    alert("Adicione atletas e finalize partidas antes de encerrar o torneio.")
    return
  }

  if (!confirm(`Encerrar o torneio "${currentTournament.title}"?`)) return

  try {
    const batch = writeBatch(db)
    const now = Date.now()

    ranking.forEach((player, index) => {
      const position = index + 1
      batch.set(
        doc(db, "users", player.id, "tournaments", currentTournament!.id),
        {
          tournamentId: currentTournament!.id,
          title: currentTournament!.title,
          category: currentTournament!.category || "Livre",
          placement: `${position}o lugar`,
          result: getPlacementLabel(position),
          matchCount: player.games,
          wins: player.wins,
          losses: player.losses,
          playedAt: now
        } as UserTournament,
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

    batch.update(doc(db, "tournaments", currentTournament.id), {
      isActive: false,
      status: "finished",
      updatedAt: now,
      completedAt: now
    })

    await batch.commit()
    currentTournament = { ...currentTournament, isActive: false, status: "finished", updatedAt: now }
    updateTournamentSummary()
    resetLocalChampionshipState()
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
    tables.forEach((table) => {
      if (table.p1?.id === id || table.p2?.id === id) {
        table.p1 = undefined
        table.p2 = undefined
      }
    })

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
    render()
  } catch (error) {
    console.error("Erro ao limpar campeonato:", error)
  }
}

;(window as any).finish = async (index: number) => {
  const table = tables[index]
  if (!table.p1 || !table.p2 || !currentTournament) return

  const s1 = parseInt((document.getElementById(`s1_${index}`) as HTMLInputElement).value, 10)
  const s2 = parseInt((document.getElementById(`s2_${index}`) as HTMLInputElement).value, 10)

  if (isNaN(s1) || isNaN(s2)) {
    alert("Preencha o placar corretamente.")
    return
  }

  if (s1 < 0 || s2 < 0) {
    alert("O placar nao pode ser negativo.")
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
    const matchPayload = {
      p1: table.p1.id,
      p2: table.p2.id,
      score1: s1,
      score2: s2,
      winner: winner.id,
      createdAt: now,
      tournamentId: currentTournament.id,
      tournamentTitle: currentTournament.title,
      tableLabel: `Mesa ${index + 1}`
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

    const savedMatch = { id: matchRef.id, ...matchPayload }
    await writeMatchHistoryForUsers(savedMatch, winner.id, loser.id)

    matches.push(savedMatch)
    tables[index] = { id: tables[index].id }
    clearQueue()
    buildQueue()
    fillOpenTables()
    render()
  } catch (error: any) {
    alert("Erro ao finalizar partida: " + error.message)
  }
}

;(window as any).changeTables = (delta: number) => {
  if (delta > 0) {
    for (let i = 0; i < delta; i++) {
      tables.push({ id: getNextTableId() })
    }
  } else {
    const emptyIndex = tables.findIndex((table) => !table.p1)

    if (emptyIndex === -1) {
      alert("Finalize algum jogo antes de remover mesas.")
      return
    }

    tables.splice(emptyIndex, 1)
  }

  saveTableCount()
  render()
}
