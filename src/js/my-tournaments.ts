import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  ChampionshipMatch,
  Match,
  RankingLiveGroupState,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserTournamentRegistration
} from "./types"
import { getGroupLabel, getPlayerCompetitionGroup, isRankingTournament } from "./tournament-rules"

let currentUser: User | null = null
let approvedRegistrations: UserTournamentRegistration[] = []
let tournaments: UpcomingTournament[] = []
let tournamentRegistrations = new Map<string, TournamentRegistration[]>()
let tournamentMatches = new Map<string, Match[]>()
let pendingCategoryTournamentId: string | null = null
let openViewerTournamentId: string | null = null
let openViewerCategory: ChampionshipCategory | null = null
let championshipCompletedGroupFilter = "all"
let rankingCompletedSearch = ""

function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatDate(value?: number) {
  if (!value) return "Nao informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value)
}

function formatDateTime(value?: number) {
  if (!value) return "Nao informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(value)
}

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = (value ?? "").trim().toUpperCase()
  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function getTournamentById(tournamentId: string) {
  return tournaments.find((entry) => entry.id === tournamentId) ?? null
}

function getUserRegistration(tournamentId: string) {
  return approvedRegistrations.find((entry) => (entry.tournamentId || entry.id) === tournamentId) ?? null
}

function getRegisteredCategories(registration: UserTournamentRegistration) {
  if (Array.isArray(registration.categories) && registration.categories.length) {
    return registration.categories
  }

  return registration.category ? registration.category.split(",").map((entry) => entry.trim()).filter(Boolean) : []
}

function getTournamentPlayerMap(tournamentId: string) {
  return new Map((tournamentRegistrations.get(tournamentId) ?? []).map((entry) => [entry.id, entry.name]))
}

function matchesPlayerSearch(left: string, right: string, search: string) {
  if (!search) return true
  const normalized = search.toLowerCase()
  return left.toLowerCase().includes(normalized) || right.toLowerCase().includes(normalized)
}

function getRankingStats(tournamentId: string, group: string) {
  const stats = new Map<string, { wins: number; losses: number; games: number }>()

  ;(tournamentRegistrations.get(tournamentId) ?? [])
    .filter((entry) => entry.paymentStatus === "approved")
    .forEach((entry) => {
      stats.set(entry.id, { wins: 0, losses: 0, games: 0 })
    })

  ;(tournamentMatches.get(tournamentId) ?? [])
    .filter((entry) => (entry.group ?? "general") === group)
    .forEach((entry) => {
      const p1 = stats.get(entry.p1)
      const p2 = stats.get(entry.p2)
      if (p1) p1.games += 1
      if (p2) p2.games += 1
      if (entry.winner === entry.p1) {
        if (p1) p1.wins += 1
        if (p2) p2.losses += 1
      } else {
        if (p2) p2.wins += 1
        if (p1) p1.losses += 1
      }
    })

  return stats
}

function getRoundRobinMatchesForGroup(category: ChampionshipCategory, group: ChampionshipGroup): ChampionshipMatch[] {
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

function getChampionshipGroupStandings(group: ChampionshipGroup, state: ChampionshipCategoryState, nameMap: Map<string, string>) {
  const standings = new Map<string, { wins: number; losses: number; scored: number; conceded: number }>()

  group.playerIds.forEach((playerId) => {
    standings.set(playerId, { wins: 0, losses: 0, scored: 0, conceded: 0 })
  })

  ;(state.completedMatches ?? [])
    .filter((match) => match.stage === "groups" && match.groupId === group.id)
    .forEach((match) => {
      const [p1Id, p2Id] = match.playerIds
      const p1 = standings.get(p1Id)
      const p2 = standings.get(p2Id)
      if (!p1 || !p2) return

      const score1 = match.score1 ?? 0
      const score2 = match.score2 ?? 0
      p1.scored += score1
      p1.conceded += score2
      p2.scored += score2
      p2.conceded += score1

      if (match.winnerId === p1Id) {
        p1.wins += 1
        p2.losses += 1
      } else if (match.winnerId === p2Id) {
        p2.wins += 1
        p1.losses += 1
      }
    })

  return [...standings.entries()]
    .map(([playerId, stats]) => ({ playerId, ...stats }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      const diffA = a.scored - a.conceded
      const diffB = b.scored - b.conceded
      if (diffB !== diffA) return diffB - diffA
      return (nameMap.get(a.playerId) || "Atleta").localeCompare(nameMap.get(b.playerId) || "Atleta")
    })
}

function getCompletedChampionshipMatchesByGroup(state: ChampionshipCategoryState) {
  const map = new Map<string, ChampionshipMatch[]>()
  ;(state.completedMatches ?? [])
    .filter((match) => match.stage === "groups")
    .forEach((match) => {
      const key = match.groupId || "Sem grupo"
      map.set(key, [...(map.get(key) ?? []), match])
    })
  return map
}

function renderMatchCards(
  title: string,
  badge: string,
  items: Array<{ left: string; right: string; meta: string; detail?: string }>,
  emptyText: string,
  extraClass = ""
) {
  return `
    <section class="group-section queue-section ${extraClass}">
      ${
        title
          ? `<div class="group-section-header queue-section-header compact">
              <div>
                <span class="section-label">${title}</span>
                <h3>${items.length ? `${items.length} confronto(s)` : "Sem confrontos"}</h3>
              </div>
            </div>`
          : ""
      }
      ${
        items.length
          ? `<div class="queue-grid compact-queue-grid tournament-mini-grid">
              ${items
                .map(
                  (item, index) => `
                    <div class="queue-card next-match-card compact-next-match-card tournament-mini-card">
                      <div class="queue-card-top">
                        <span class="queue-order">${badge} ${index + 1}</span>
                      </div>
                      <div class="queue-player-block">
                        <strong>${escapeHtml(item.left)}</strong>
                        <span>${escapeHtml(item.meta)}</span>
                      </div>
                      <div class="queue-versus">vs</div>
                      <div class="queue-player-block">
                        <strong>${escapeHtml(item.right)}</strong>
                        <span>${escapeHtml(item.detail || "")}</span>
                      </div>
                    </div>
                  `
                )
                .join("")}
            </div>`
          : `<div class="queue-empty rich">${emptyText}</div>`
      }
    </section>
  `
}

function renderRankingViewer(tournament: UpcomingTournament, registration: UserTournamentRegistration) {
  const viewerTitle = document.getElementById("tournamentViewerTitle")
  const viewerContent = document.getElementById("tournamentViewerContent")
  const modal = document.getElementById("tournamentViewerModal") as HTMLElement | null
  const player = currentUser
  if (!viewerTitle || !viewerContent || !modal || !player) return

  const categoryLabel = getRegisteredCategories(registration)[0] || registration.category || "A"
  const group = getPlayerCompetitionGroup(tournament, categoryLabel)
  const liveState = tournament.rankingLiveState?.[group] as RankingLiveGroupState | undefined
  const nameMap = getTournamentPlayerMap(tournament.id)
  const stats = getRankingStats(tournament.id, group)
  const rankingRows = (tournamentRegistrations.get(tournament.id) ?? [])
    .filter((entry) => entry.paymentStatus === "approved")
    .filter((entry) => getPlayerCompetitionGroup(tournament, entry.category || entry.categories?.[0]) === group)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      category: entry.category || "Categoria",
      ...(stats.get(entry.id) ?? { wins: 0, losses: 0, games: 0 })
    }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      if (a.losses !== b.losses) return a.losses - b.losses
      if (b.games !== a.games) return b.games - a.games
      return a.name.localeCompare(b.name)
    })
  const activeMatches = (liveState?.activeTables ?? [])
    .filter((table) => table.playerIds?.length === 2)
    .map((table) => ({
      left: nameMap.get(table.playerIds![0]) || "Atleta",
      right: nameMap.get(table.playerIds![1]) || "Atleta",
      meta: `Mesa ${table.id}`,
      detail: getGroupLabel(group)
    }))

  const nextMatches = (liveState?.queue ?? []).map((item) => ({
    left: nameMap.get(item.playerIds[0]) || "Atleta",
    right: nameMap.get(item.playerIds[1]) || "Atleta",
    meta: getGroupLabel(group),
    detail: "Na fila"
  }))

  const completedMatches = (tournamentMatches.get(tournament.id) ?? [])
    .filter((entry) => (entry.group ?? "general") === group)
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((entry) => ({
      left: nameMap.get(entry.p1) || "Atleta",
      right: nameMap.get(entry.p2) || "Atleta",
      meta: `${entry.score1} x ${entry.score2}`,
      detail: formatDateTime(entry.createdAt)
    }))
    .filter((entry) => matchesPlayerSearch(entry.left, entry.right, rankingCompletedSearch))
    .slice(0, 12)
  const rankingHistorySection = `
    <section class="group-section queue-section tournament-feed-card ranking-history-card">
      <div class="group-section-header queue-section-header compact">
        <div>
          <span class="section-label">Jogos realizados</span>
          <h3>${completedMatches.length ? `${completedMatches.length} confronto(s)` : "Sem jogos exibidos"}</h3>
        </div>
        <div class="championship-history-filter ranking-history-filter">
          <label for="rankingCompletedSearch">Buscar atleta</label>
          <input
            id="rankingCompletedSearch"
            type="search"
            placeholder="Nome do jogador"
            value="${escapeHtml(rankingCompletedSearch)}"
            oninput="setRankingCompletedSearch(this.value)"
          />
        </div>
      </div>
      ${
        completedMatches.length
          ? `
            <div class="ranking-completed-grid">
              ${completedMatches
                .map(
                  (entry) => `
                    <article class="ranking-completed-card">
                      <strong>${escapeHtml(entry.left)} ${escapeHtml(entry.meta)} ${escapeHtml(entry.right)}</strong>
                      <span>${escapeHtml(entry.detail)}</span>
                    </article>
                  `
                )
                .join("")}
            </div>
          `
          : '<div class="empty-state">Ainda nao houve partidas registradas.</div>'
      }
    </section>
  `

  viewerTitle.textContent = `${tournament.title} - ${getGroupLabel(group)}`
  viewerContent.innerHTML = `
    <div class="tournament-viewer-shell">
      <section class="ranking-showcase">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Ranking</span>
            <h3>Sua categoria em disputa</h3>
          </div>
        </div>
        <div class="ranking-athlete-grid">
          ${rankingRows
            .map(
              (entry, index) => `
                <article class="ranking-athlete-card ${entry.id === player.id ? "highlight" : ""} ${index === 0 ? "podium-gold" : index === 1 ? "podium-silver" : index === 2 ? "podium-bronze" : ""}">
                  <span>${index + 1}°</span>
                  <strong>${escapeHtml(entry.name)}</strong>
                  <small>${escapeHtml(entry.category)}</small>
                  <span>${entry.wins}V / ${entry.losses}D / ${entry.games}J</span>
                </article>
              `
            )
            .join("")}
        </div>
      </section>
      ${renderMatchCards("Jogos em andamento", "Ao vivo", activeMatches, "Nenhum jogo em andamento agora.", "tournament-feed-card")}
      ${renderMatchCards("Proximos jogos", "Fila", nextMatches, "Nenhum jogo aguardando nesta categoria.", "tournament-feed-card")}
      ${rankingHistorySection}
    </div>
  `.replace(/Â°/g, "o")
  modal.style.display = "flex"
}

function renderChampionshipViewer(tournament: UpcomingTournament, category: ChampionshipCategory) {
  const viewerTitle = document.getElementById("tournamentViewerTitle")
  const viewerContent = document.getElementById("tournamentViewerContent")
  const modal = document.getElementById("tournamentViewerModal") as HTMLElement | null
  const player = currentUser
  if (!viewerTitle || !viewerContent || !modal || !player) return

  const state = tournament.championshipState?.[category] as ChampionshipCategoryState | undefined
  const nameMap = getTournamentPlayerMap(tournament.id)
  const groups = state?.groups ?? []
  const completedByGroup = getCompletedChampionshipMatchesByGroup(state ?? {})
  const selectedCompletedMatches = (championshipCompletedGroupFilter === "all"
    ? [...completedByGroup.values()].flat()
    : completedByGroup.get(championshipCompletedGroupFilter) ?? [])
    .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))
    .slice(0, 3)
    .map((match) => ({
      left: nameMap.get(match.playerIds[0]) || "Atleta",
      right: nameMap.get(match.playerIds[1]) || "Atleta",
      meta: `${match.score1 ?? 0} x ${match.score2 ?? 0}`,
      detail: match.groupId || match.roundTitle || "Jogo"
    }))

  const activeMatches = (state?.activeTables ?? [])
    .filter((table) => table.match)
    .map((table) => ({
      left: nameMap.get(table.match!.playerIds[0]) || "Atleta",
      right: nameMap.get(table.match!.playerIds[1]) || "Atleta",
      meta: `Mesa ${table.id}`,
      detail: table.match?.roundTitle || table.match?.groupId || "Ao vivo"
    }))

  const nextMatches = (state?.queue ?? [])
    .slice(0, 10)
    .map((match) => ({
      left: nameMap.get(match.playerIds[0]) || "Atleta",
      right: nameMap.get(match.playerIds[1]) || "Atleta",
      meta: match.roundTitle || match.groupId || "Fila",
      detail: match.stage === "knockout" ? "Mata-mata" : "Grupos"
    }))

  const groupOptions = groups.map((group) => ({ id: group.id, name: group.name }))

  viewerTitle.textContent = `${tournament.title} - Categoria ${category}`
  viewerContent.innerHTML = `
    <div class="tournament-viewer-shell">
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Grupos</span>
            <h3>Acompanhamento da fase inicial</h3>
          </div>
        </div>
        <div class="championship-result-groups">
          ${groups.length
            ? groups
                .map((group) => {
                  const standings = getChampionshipGroupStandings(group, state ?? {}, nameMap).slice(0, 4)
                  const totalMatches = getRoundRobinMatchesForGroup(category, group).length
                  const doneMatches = (state?.completedMatches ?? []).filter(
                    (match) => match.stage === "groups" && match.groupId === group.id
                  ).length

                  return `
                    <div class="championship-result-group-card ${group.playerIds.includes(player.id) ? "highlight" : ""}">
                      <strong>${escapeHtml(group.name)}</strong>
                      <span>${doneMatches}/${totalMatches} jogos</span>
                      <div class="championship-result-group-mini">
                        ${standings
                          .map(
                            (entry, index) => `
                              <small>${index + 1}° ${escapeHtml(nameMap.get(entry.playerId) || "Atleta")} - ${entry.wins}V</small>
                            `
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                })
                .join("")
            : '<div class="empty-state">Os grupos ainda nao foram definidos.</div>'}
        </div>
      </section>
      ${renderMatchCards("Jogos em andamento", "Ao vivo", activeMatches, "Nenhum jogo em andamento nesta categoria.", "tournament-feed-card championship-live-card")}
      ${renderMatchCards("Proximos jogos", "Fila", nextMatches, "Nenhum proximo jogo liberado ainda.", "tournament-feed-card championship-live-card")}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Jogos disputados</span>
            <h3>${selectedCompletedMatches.length ? `${selectedCompletedMatches.length} jogo(s)` : "Sem jogos exibidos"}</h3>
          </div>
          <div class="championship-history-filter">
            <label for="championshipCompletedFilter">Grupo</label>
            <select id="championshipCompletedFilter" onchange="setChampionshipCompletedFilter(this.value)">
              <option value="all" ${championshipCompletedGroupFilter === "all" ? "selected" : ""}>Todos</option>
              ${groupOptions
                .map((group) => `<option value="${group.id}" ${championshipCompletedGroupFilter === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        ${renderMatchCards("", "Finalizado", selectedCompletedMatches, "Nenhuma partida concluida ainda.", "championship-history-inner")}
      </section>
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Mata-mata</span>
            <h3>Painel eliminatorio</h3>
          </div>
        </div>
        <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
          <iframe
            class="championship-bracket-frame championship-result-bracket"
            title="Mata-mata ${escapeHtml(category)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(category)}&highlight=${encodeURIComponent(player.id)}"
          ></iframe>
        </div>
      </section>
    </div>
  `
  modal.style.display = "flex"
}

function openCategoryChoiceModal(tournamentId: string, categories: ChampionshipCategory[]) {
  const text = document.getElementById("tournamentCategoryChoiceText")
  const options = document.getElementById("tournamentCategoryChoiceOptions")
  const tournament = getTournamentById(tournamentId)
  const modal = document.getElementById("tournamentCategoryChoiceModal") as HTMLElement | null
  if (!text || !options || !modal || !tournament) return

  pendingCategoryTournamentId = tournamentId
  text.textContent = `Selecione qual categoria voce deseja acompanhar em ${tournament.title}.`
  options.innerHTML = categories
    .map((category) => `<button class="btn primary" onclick="confirmTournamentCategoryChoice('${category}')">Categoria ${category}</button>`)
    .join("")

  modal.style.display = "flex"
}

function renderTournamentCards() {
  const container = document.getElementById("myChampionshipsList")
  if (!container) return

  const cards = approvedRegistrations
    .map((registration) => {
      const tournamentId = registration.tournamentId || registration.id
      const tournament = getTournamentById(tournamentId)
      if (!tournament) return ""

      const categories = getRegisteredCategories(registration)
      const typeLabel = isRankingTournament(tournament) ? "Ranking" : "Campeonato"
      const statusLabel =
        tournament.status === "finished"
          ? "Finalizado"
          : tournament.status === "open"
            ? "Em andamento"
            : tournament.status === "closed"
              ? "Inscricoes encerradas"
              : "Aguardando"

      return `
        <article class="card profile-card tournament-tracker-card">
          <div class="section-header">
            <div>
              <span class="section-label">${typeLabel}</span>
              <h3>${escapeHtml(tournament.title)}</h3>
            </div>
            <span class="result-pill ${tournament.status === "finished" ? "neutral" : "win"}">${statusLabel}</span>
          </div>
          <div class="stack-item-grid">
            <span>Data: ${formatDate(tournament.startDate)}</span>
            <span>Local: ${escapeHtml(tournament.location || "A definir")}</span>
            <span>Minhas categorias: ${escapeHtml(categories.join(", ") || registration.category || "Livre")}</span>
            <span>Tipo: ${typeLabel}</span>
          </div>
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="openTournamentViewer('${tournament.id}')">Acompanhar torneio</button>
          </div>
        </article>
      `
    })
    .filter(Boolean)

  container.innerHTML = cards.length
    ? cards.join("")
    : '<div class="empty-state">Voce ainda nao possui torneios aprovados para acompanhar aqui.</div>'
}

async function loadPage(uid: string) {
  const [userSnapshot, registrationsSnapshot, tournamentsSnapshot, matchesSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDocs(query(collection(db, "users", uid, "registrations"), orderBy("registeredAt", "desc"))),
    getDocs(query(collection(db, "tournaments"), orderBy("startDate", "asc"))),
    getDocs(collection(db, "matches"))
  ])

  if (!userSnapshot.exists()) {
    window.location.replace("/pages/profile.html")
    return
  }

  currentUser = { id: userSnapshot.id, ...userSnapshot.data() } as User
  tournaments = tournamentsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
  approvedRegistrations = registrationsSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UserTournamentRegistration)
    .filter((entry) => entry.paymentStatus === "approved")
    .filter((entry) => tournaments.some((tournament) => tournament.id === (entry.tournamentId || entry.id)))

  const approvedTournamentIds = [...new Set(approvedRegistrations.map((entry) => entry.tournamentId || entry.id))]
  const registrationEntries = await Promise.all(
    approvedTournamentIds.map(async (tournamentId) => {
      const snapshot = await getDocs(collection(db, "tournaments", tournamentId, "registrations"))
      return [
        tournamentId,
        snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
      ] as const
    })
  )

  tournamentRegistrations = new Map(registrationEntries)
  tournamentMatches = new Map(
    approvedTournamentIds.map((tournamentId) => [
      tournamentId,
      matchesSnapshot.docs
        .map((entry) => ({ id: entry.id, ...entry.data() }) as Match)
        .filter((entry) => entry.tournamentId === tournamentId)
    ])
  )

  renderTournamentCards()
}

;(window as any).goBackToProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

;(window as any).closeTournamentViewerModal = () => {
  const modal = document.getElementById("tournamentViewerModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
  openViewerTournamentId = null
  openViewerCategory = null
  rankingCompletedSearch = ""
  championshipCompletedGroupFilter = "all"
}

;(window as any).closeTournamentCategoryChoiceModal = () => {
  const modal = document.getElementById("tournamentCategoryChoiceModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
  pendingCategoryTournamentId = null
}

;(window as any).confirmTournamentCategoryChoice = (category: ChampionshipCategory) => {
  const tournamentId = pendingCategoryTournamentId
  if (!tournamentId) return

  const tournament = getTournamentById(tournamentId)
  if (!tournament) return

  ;(window as any).closeTournamentCategoryChoiceModal()
  openViewerTournamentId = tournamentId
  openViewerCategory = category
  championshipCompletedGroupFilter = "all"
  renderChampionshipViewer(tournament, category)
}

;(window as any).setChampionshipCompletedFilter = (value: string) => {
  championshipCompletedGroupFilter = value || "all"
  if (!openViewerTournamentId || !openViewerCategory) return
  const tournament = getTournamentById(openViewerTournamentId)
  if (!tournament) return
  renderChampionshipViewer(tournament, openViewerCategory)
}

;(window as any).setRankingCompletedSearch = (value: string) => {
  rankingCompletedSearch = value || ""
  if (!openViewerTournamentId) return
  const tournament = getTournamentById(openViewerTournamentId)
  const registration = getUserRegistration(openViewerTournamentId)
  if (!tournament || !registration || !isRankingTournament(tournament)) return
  renderRankingViewer(tournament, registration)
}

;(window as any).openTournamentViewer = (tournamentId: string) => {
  const tournament = getTournamentById(tournamentId)
  const registration = getUserRegistration(tournamentId)
  if (!tournament || !registration) return

  if (isRankingTournament(tournament)) {
    openViewerTournamentId = tournamentId
    openViewerCategory = null
    renderRankingViewer(tournament, registration)
    return
  }

  const categories = getRegisteredCategories(registration)
    .map((entry) => normalizeChampionshipCategory(entry))
    .filter(Boolean) as ChampionshipCategory[]

  if (!categories.length) {
    openViewerTournamentId = tournamentId
    openViewerCategory = "A"
    championshipCompletedGroupFilter = "all"
    renderChampionshipViewer(tournament, "A")
    return
  }

  if (categories.length === 1) {
    openViewerTournamentId = tournamentId
    openViewerCategory = categories[0]
    championshipCompletedGroupFilter = "all"
    renderChampionshipViewer(tournament, categories[0])
    return
  }

  openCategoryChoiceModal(tournamentId, categories)
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadPage(user.uid)
  } catch (error) {
    console.error("Erro ao carregar meus torneios:", error)
    const container = document.getElementById("myChampionshipsList")
    if (container) {
      container.innerHTML = '<div class="empty-state">Nao foi possivel carregar seus torneios agora.</div>'
    }
  }
})
