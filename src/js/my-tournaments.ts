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
import { sortRankingRows } from "./ranking-standings"

let currentUser: User | null = null
let approvedRegistrations: UserTournamentRegistration[] = []
let tournaments: UpcomingTournament[] = []
let tournamentRegistrations = new Map<string, TournamentRegistration[]>()
let tournamentMatches = new Map<string, Match[]>()
let pendingCategoryTournamentId: string | null = null
let openViewerTournamentId: string | null = null
let openViewerCategory: ChampionshipCategory | null = null
let openViewerGroupId: string | null = null
let rankingCompletedSearch = ""
const CHAMPIONSHIP_CATEGORY_ORDER: ChampionshipCategory[] = ["A", "B", "C", "D", "Iniciante"]
function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatDate(value?: number) {
  if (!value) return "Não informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value)
}

function formatDateTime(value?: number) {
  if (!value) return "Não informado"
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

function getResolvedChampionshipRegistrationCategories(
  tournament: UpcomingTournament,
  registration: UserTournamentRegistration
) {
  const configuredCategories = (Array.isArray(tournament.categories) ? tournament.categories : [])
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]
  const rawCategories = getRegisteredCategories(registration)
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  const filteredByTournament = configuredCategories.length
    ? rawCategories.filter((category) => configuredCategories.includes(category))
    : rawCategories

  if (filteredByTournament.length) {
    return [...new Set(filteredByTournament)]
  }

  return [...new Set(configuredCategories)]
}

function getRankingRegistrationCategory(
  registration: Pick<UserTournamentRegistration, "category" | "categories">
) {
  const directCategory = registration.category?.trim()

  if (directCategory) {
    return directCategory
  }

  if (Array.isArray(registration.categories)) {
    const selectedCategory = registration.categories.map((entry) => entry.trim()).find(Boolean)
    if (selectedCategory) {
      return selectedCategory
    }
  }

  return "A"
}

function getRankingLiveParticipantIds(liveState?: RankingLiveGroupState) {
  const ids = new Set<string>()

  ;(liveState?.queue ?? []).forEach((entry) => {
    entry.playerIds?.forEach((playerId) => {
      if (playerId) ids.add(playerId)
    })
  })

  ;(liveState?.activeTables ?? []).forEach((table) => {
    table.playerIds?.forEach((playerId) => {
      if (playerId) ids.add(playerId)
    })
  })

  return ids
}

function getTournamentRegisteredCategories(tournament: UpcomingTournament, registration: UserTournamentRegistration) {
  const registrationCategories = getResolvedChampionshipRegistrationCategories(tournament, registration)
  const tournamentCategories = Array.isArray(tournament.categories) && tournament.categories.length
    ? tournament.categories
    : registrationCategories

  return registrationCategories.filter((category) => tournamentCategories.includes(category))
}

function getAvailableChampionshipCategories(tournament: UpcomingTournament) {
  const stateCategories = Object.entries(tournament.championshipState ?? {})
    .filter(([, state]) => (state?.groups?.length ?? 0) > 0)
    .map(([category]) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  const configuredCategories = (Array.isArray(tournament.categories) ? tournament.categories : [])
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  return [...new Set([...stateCategories, ...configuredCategories])]
    .sort((left, right) => CHAMPIONSHIP_CATEGORY_ORDER.indexOf(left) - CHAMPIONSHIP_CATEGORY_ORDER.indexOf(right))
}

function getChampionshipRegistrationStatusLabel(
  tournament: UpcomingTournament,
  categories: string[]
) {
  const selectedCategories = categories
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  if (!selectedCategories.length) {
    return {
      label: tournament.status === "finished" ? "Finalizado" : "Em andamento",
      tone: tournament.status === "finished" ? "neutral" : "win"
    } as const
  }

  const states = selectedCategories.map((category) => tournament.championshipState?.[category] as ChampionshipCategoryState | undefined)
  const finishedCount = states.filter((state) => state?.finished).length

  if (finishedCount === selectedCategories.length) {
    return { label: "Finalizado", tone: "neutral" } as const
  }

  if (finishedCount > 0) {
    return { label: "Parcial", tone: "neutral" } as const
  }

  return {
    label:
      tournament.status === "closed"
        ? "Inscrições encerradas"
        : tournament.status === "open"
          ? "Em andamento"
          : "Aguardando",
    tone: "win"
  } as const
}

function isTournamentStillTrackable(
  tournament: UpcomingTournament,
  registration: UserTournamentRegistration
) {
  if (isRankingTournament(tournament)) {
    return tournament.status !== "finished"
  }

  const categories = getAvailableChampionshipCategories(tournament)
  if (!categories.length) {
    return tournament.status !== "finished"
  }

  return categories.some((category) => !(tournament.championshipState?.[category] as ChampionshipCategoryState | undefined)?.finished)
}

function getTournamentPlayerMap(tournamentId: string) {
  return new Map(getApprovedTournamentRegistrations(tournamentId).map((entry) => [entry.id, entry.name]))
}

function getApprovedTournamentRegistrations(tournamentId: string) {
  return (tournamentRegistrations.get(tournamentId) ?? []).filter((entry) => entry.paymentStatus === "approved")
}

function matchesPlayerSearch(left: string, right: string, search: string) {
  if (!search) return true
  const normalized = search.toLowerCase()
  return left.toLowerCase().includes(normalized) || right.toLowerCase().includes(normalized)
}

function abbreviateName(name: string, maxLength = 13) {
  const trimmed = name.trim()
  if (trimmed.length <= maxLength) return trimmed

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    const first = parts[0]
    const last = parts[parts.length - 1]
    const middleParts = parts.slice(1, -1).filter((part) => !["de", "da", "do", "dos", "das", "e"].includes(part.toLowerCase()))

    if (middleParts.length) {
      const withMiddleInitial = `${first} ${middleParts[0][0]}. ${last}`
      if (withMiddleInitial.length <= maxLength + 6) return withMiddleInitial

      const withInitials = `${first} ${middleParts.map((part) => `${part[0]}.`).join(" ")} ${last}`.replace(/\s+/g, " ").trim()
      if (withInitials.length <= maxLength + 8) return withInitials
    }

    const shortLast = `${first} ${last}`
    if (shortLast.length <= maxLength + 4) return shortLast
  }

  return `${trimmed.slice(0, Math.max(1, maxLength - 3)).trimEnd()}...`
}

function applyRankingCompletedMatchesFilter() {
  const modal = document.getElementById("tournamentViewerModal")
  if (!modal) return

  const cards = Array.from(modal.querySelectorAll<HTMLElement>(".ranking-completed-card"))
  const emptyState = modal.querySelector<HTMLElement>(".ranking-filter-empty")
  const title = modal.querySelector<HTMLElement>(".ranking-history-count")
  let visibleCount = 0

  cards.forEach((card) => {
    const searchValue = (card.dataset.search || "").toLowerCase()
    const visible = !rankingCompletedSearch || searchValue.includes(rankingCompletedSearch.toLowerCase())
    card.style.display = visible ? "" : "none"
    if (visible) visibleCount += 1
  })

  if (title) {
    title.textContent = visibleCount ? `${visibleCount} confronto(s)` : "Sem jogos exibidos"
  }

  if (emptyState) {
    emptyState.style.display = visibleCount ? "none" : "block"
  }
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

  const categoryLabel = getRankingRegistrationCategory(registration)
  const group = getPlayerCompetitionGroup(tournament, categoryLabel)
  const liveState = tournament.rankingLiveState?.[group] as RankingLiveGroupState | undefined
  const nameMap = getTournamentPlayerMap(tournament.id)
  const stats = getRankingStats(tournament.id, group)
  const liveParticipantIds = getRankingLiveParticipantIds(liveState)
  const groupMatches = (tournamentMatches.get(tournament.id) ?? []).filter((entry) => (entry.group ?? "general") === group)
  const hasRankingProgress = liveParticipantIds.size > 0 || groupMatches.length > 0
  const approvedRegistrations = getApprovedTournamentRegistrations(tournament.id)
  const approvedRegistrationMap = new Map(approvedRegistrations.map((entry) => [entry.id, entry]))
  const rankingRows = hasRankingProgress
    ? [...new Set([...liveParticipantIds, ...groupMatches.flatMap((entry) => [entry.p1, entry.p2])])]
        .map((playerId) => {
          const registrationEntry = approvedRegistrationMap.get(playerId)
          return {
            id: playerId,
            name: registrationEntry?.name || nameMap.get(playerId) || "Atleta",
            category: registrationEntry ? getRankingRegistrationCategory(registrationEntry) : getGroupLabel(group),
            ...(stats.get(playerId) ?? { wins: 0, losses: 0, games: 0 })
          }
        })
    : approvedRegistrations
        .filter((entry) => getPlayerCompetitionGroup(tournament, getRankingRegistrationCategory(entry)) === group)
        .map((entry) => ({
          id: entry.id,
          name: entry.name,
          category: getRankingRegistrationCategory(entry),
          ...(stats.get(entry.id) ?? { wins: 0, losses: 0, games: 0 })
        }))
  const sortedRankingRows = sortRankingRows(rankingRows, groupMatches)
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

  const completedMatches = groupMatches
    .sort((a, b) => b.createdAt - a.createdAt)
    .map((entry) => ({
      left: nameMap.get(entry.p1) || "Atleta",
      right: nameMap.get(entry.p2) || "Atleta",
      meta: `${entry.score1} x ${entry.score2}`,
      detail: formatDateTime(entry.createdAt)
    }))
    .slice(0, 12)
  const rankingHistorySection = `
    <section class="group-section queue-section tournament-feed-card ranking-history-card">
      <div class="group-section-header queue-section-header compact">
        <div>
          <span class="section-label">Jogos realizados</span>
          <h3 class="ranking-history-count">${completedMatches.length ? `${completedMatches.length} confronto(s)` : "Sem jogos exibidos"}</h3>
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
                    <article class="ranking-completed-card" data-search="${escapeHtml(`${entry.left} ${entry.right}`.toLowerCase())}">
                      <strong>${escapeHtml(abbreviateName(entry.left))} ${escapeHtml(entry.meta)} ${escapeHtml(abbreviateName(entry.right))}</strong>
                      <span>${escapeHtml(entry.detail)}</span>
                    </article>
                  `
                )
                .join("")}
            </div>
            <div class="queue-empty rich ranking-filter-empty" style="display:none">Nenhum jogo encontrado para essa busca.</div>
          `
          : '<div class="empty-state">Ainda não houve partidas registradas.</div>'
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
            ${sortedRankingRows
              .map(
                (entry, index) => `
                  <article class="ranking-athlete-card ${entry.id === player.id ? "highlight" : ""} ${index === 0 ? "podium-gold" : index === 1 ? "podium-silver" : index === 2 ? "podium-bronze" : ""}">
                  <span>${index + 1}º</span>
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
      ${renderMatchCards("Próximos jogos", "Fila", nextMatches, "Nenhum jogo aguardando nesta categoria.", "tournament-feed-card")}
      ${rankingHistorySection}
    </div>
  `.replace(/Ã‚º/g, "º")
  applyRankingCompletedMatchesFilter()
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
    .map((match) => ({
      match,
      left: nameMap.get(match.playerIds[0]) || "Atleta",
      right: nameMap.get(match.playerIds[1]) || "Atleta"
    }))
    .sort((a, b) => {
      const playerA =
        a.left === player.name || a.right === player.name
          ? 1
          : 0
      const playerB =
        b.left === player.name || b.right === player.name
          ? 1
          : 0
      if (playerB !== playerA) return playerB - playerA
      return (b.match.playedAt ?? 0) - (a.match.playedAt ?? 0)
    })
    .slice(0, 9)
    .map((match) => ({
      left: match.left,
      right: match.right,
      meta: `${match.match.score1 ?? 0} x ${match.match.score2 ?? 0}`,
      detail: match.match.groupId || match.match.roundTitle || "Jogo",
      playedAt: match.match.playedAt
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
                              <small>${index + 1}º ${escapeHtml(nameMap.get(entry.playerId) || "Atleta")} - ${entry.wins}V</small>
                            `
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                })
                .join("")
            : '<div class="empty-state">Os grupos ainda não foram definidos.</div>'}
        </div>
      </section>
      ${renderMatchCards("Jogos em andamento", "Ao vivo", activeMatches, "Nenhum jogo em andamento nesta categoria.", "tournament-feed-card championship-live-card")}
      ${renderMatchCards("Próximos jogos", "Fila", nextMatches, "Nenhum próximo jogo liberado ainda.", "tournament-feed-card championship-live-card")}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Jogos disputados</span>
            <h3>${selectedCompletedMatches.length ? `${selectedCompletedMatches.length} jogo(s)` : "Sem jogos exibidos"}</h3>
          </div>
          <div class="championship-history-filter championship-history-toolbar">
            <label for="championshipCompletedFilter">Grupo</label>
            <select id="championshipCompletedFilter" onchange="setChampionshipCompletedFilter(this.value)">
              <option value="all" ${championshipCompletedGroupFilter === "all" ? "selected" : ""}>Todos</option>
              ${groupOptions
                .map((group) => `<option value="${group.id}" ${championshipCompletedGroupFilter === group.id ? "selected" : ""}>${escapeHtml(group.name)}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        ${
          selectedCompletedMatches.length
            ? `
              <div class="championship-history-compact-grid">
                ${selectedCompletedMatches
                  .map(
                    (match) => `
                      <article class="championship-history-compact-card ${match.left === player.name || match.right === player.name ? "highlight" : ""}">
                        <strong>${escapeHtml(abbreviateName(match.left))} ${escapeHtml(match.meta)} ${escapeHtml(abbreviateName(match.right))}</strong>
                        <span>${escapeHtml(match.detail || "Jogo")} • ${escapeHtml(formatDateTime(match.playedAt))}</span>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : '<div class="queue-empty rich">Nenhuma partida concluida ainda.</div>'
        }
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

function renderChampionshipViewerV2(tournament: UpcomingTournament, category: ChampionshipCategory) {
  const viewerTitle = document.getElementById("tournamentViewerTitle")
  const viewerContent = document.getElementById("tournamentViewerContent")
  const modal = document.getElementById("tournamentViewerModal") as HTMLElement | null
  const player = currentUser
  if (!viewerTitle || !viewerContent || !modal || !player) return

  const availableCategories = getAvailableChampionshipCategories(tournament)
  const activeCategory = availableCategories.includes(category) ? category : (availableCategories[0] ?? category)
  const state = tournament.championshipState?.[activeCategory] as ChampionshipCategoryState | undefined
  const nameMap = getTournamentPlayerMap(tournament.id)
  const groups = state?.groups ?? []
  const isCategoryStarted = groups.length > 0
  const isCategoryFinished = Boolean(state?.finished)
  const selectedGroupId = groups.some((group) => group.id === openViewerGroupId) ? openViewerGroupId : groups[0]?.id
  const selectedCompletedMatches = (state?.completedMatches ?? [])
    .filter((match) => match.stage === "groups" && match.groupId === selectedGroupId)
    .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))

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

  viewerTitle.textContent = `${tournament.title} - Categoria ${activeCategory}`
  if (!isCategoryStarted) {
    viewerContent.innerHTML = `
      <div class="tournament-viewer-shell">
        <div class="form-group championship-result-selector">
          <span>Categoria</span>
          <select onchange="setChampionshipViewerCategory(this.value)">
            ${availableCategories
              .map(
                (entry) => `<option value="${entry}" ${entry === activeCategory ? "selected" : ""}>Categoria ${escapeHtml(entry)}</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="empty-state">Categoria não iniciada.</div>
      </div>
    `
    modal.style.display = "flex"
    return
  }

  viewerContent.innerHTML = `
    <div class="tournament-viewer-shell">
      <div class="form-group championship-result-selector">
        <span>Categoria</span>
        <select onchange="setChampionshipViewerCategory(this.value)">
          ${availableCategories
            .map(
              (entry) => `<option value="${entry}" ${entry === activeCategory ? "selected" : ""}>Categoria ${escapeHtml(entry)}</option>`
            )
            .join("")}
        </select>
      </div>
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
                  const totalMatches = getRoundRobinMatchesForGroup(activeCategory, group).length
                  const doneMatches = (state?.completedMatches ?? []).filter(
                    (match) => match.stage === "groups" && match.groupId === group.id
                  ).length

                  return `
                    <button type="button" class="championship-result-group-card ${group.playerIds.includes(player.id) ? "highlight" : ""} ${selectedGroupId === group.id ? "active" : ""}" onclick="setChampionshipViewerGroup('${group.id}')">
                      <strong>${escapeHtml(group.name)}</strong>
                      <span>${doneMatches}/${totalMatches} jogos</span>
                      <div class="championship-result-group-mini">
                        ${standings
                          .map(
                            (entry, index) => `
                              <small>${index + 1}º ${escapeHtml(nameMap.get(entry.playerId) || "Atleta")} - ${entry.wins}V</small>
                            `
                          )
                          .join("")}
                      </div>
                    </button>
                  `
                })
                .join("")
            : '<div class="empty-state">Os grupos ainda não foram definidos.</div>'}
        </div>
      </section>
      ${!isCategoryFinished ? renderMatchCards("Jogos em andamento", "Ao vivo", activeMatches, "Nenhum jogo em andamento nesta categoria.", "tournament-feed-card championship-live-card") : ""}
      ${!isCategoryFinished ? renderMatchCards("Próximos jogos", "Fila", nextMatches, "Nenhum próximo jogo liberado ainda.", "tournament-feed-card championship-live-card") : ""}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Histórico do grupo</span>
            <h3>${selectedGroupId ? escapeHtml(groups.find((group) => group.id === selectedGroupId)?.name || "Grupo") : "Grupo"}</h3>
          </div>
        </div>
        ${
          selectedCompletedMatches.length
            ? `
              <div class="championship-history-compact-grid">
                ${selectedCompletedMatches
                  .map(
                    (match) => `
                      <article class="championship-history-compact-card ${match.playerIds.includes(player.id) ? "highlight" : ""}">
                        <strong>${escapeHtml(nameMap.get(match.playerIds[0]) || "Atleta")} ${match.score1 ?? 0} x ${match.score2 ?? 0} ${escapeHtml(nameMap.get(match.playerIds[1]) || "Atleta")}</strong>
                        <span>${escapeHtml(match.groupId || "Grupo")} • ${escapeHtml(formatDateTime(match.playedAt))}</span>
                      </article>
                    `
                  )
                  .join("")}
              </div>
            `
            : '<div class="queue-empty rich">Nenhuma partida concluida ainda.</div>'
        }
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
            title="Mata-mata ${escapeHtml(activeCategory)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(activeCategory)}&highlight=${encodeURIComponent(player.id)}"
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
  text.textContent = `Selecione qual categoria você desejá ver em ${tournament.title}.`
  options.innerHTML = categories
    .map((category) => `<button class="btn primary" onclick="confirmTournamentCategoryChoice('${category}')">Categoria ${category}</button>`)
    .join("")

  modal.style.display = "flex"
}

function renderTournamentCards() {
  const container = document.getElementById("myChampionshipsList")
  if (!container) return

  const cards = approvedRegistrations
    .filter((registration) => {
      const tournamentId = registration.tournamentId || registration.id
      const tournament = getTournamentById(tournamentId)
      return tournament ? isTournamentStillTrackable(tournament, registration) : false
    })
    .map((registration) => {
      const tournamentId = registration.tournamentId || registration.id
      const tournament = getTournamentById(tournamentId)
      if (!tournament) return ""

      const categories = getTournamentRegisteredCategories(tournament, registration)
      const typeLabel = isRankingTournament(tournament) ? "Ranking" : "Campeonato"
      const status = isRankingTournament(tournament)
        ? {
            label:
              tournament.status === "finished"
                ? "Finalizado"
                : tournament.status === "open"
                  ? "Em andamento"
                  : tournament.status === "closed"
                    ? "Inscrições encerradas"
                    : "Aguardando",
            tone: tournament.status === "finished" ? "neutral" : "win"
          }
        : getChampionshipRegistrationStatusLabel(tournament, categories)

      return `
        <article class="card profile-card tournament-tracker-card">
          <div class="section-header">
            <div>
              <span class="section-label">${typeLabel}</span>
              <h3>${escapeHtml(tournament.title)}</h3>
            </div>
            <span class="result-pill ${status.tone}">${status.label}</span>
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
    : '<div class="empty-state">Você ainda não possui torneios aprovados para acompanhar aqui.</div>'
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
  openViewerGroupId = null
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
  openViewerGroupId = null
  renderChampionshipViewerV2(tournament, category)
}

;(window as any).setChampionshipViewerCategory = (value: string) => {
  if (!openViewerTournamentId || !openViewerCategory) return
  const tournament = getTournamentById(openViewerTournamentId)
  if (!tournament) return
  const normalizedCategory = normalizeChampionshipCategory(value)
  if (!normalizedCategory) return
  openViewerCategory = normalizedCategory
  openViewerGroupId = null
  renderChampionshipViewerV2(tournament, normalizedCategory)
}

;(window as any).setChampionshipViewerGroup = (groupId: string) => {
  openViewerGroupId = groupId || null
  if (!openViewerTournamentId || !openViewerCategory) return
  const tournament = getTournamentById(openViewerTournamentId)
  if (!tournament) return
  renderChampionshipViewerV2(tournament, openViewerCategory)
}

;(window as any).setRankingCompletedSearch = (value: string) => {
  rankingCompletedSearch = value || ""
  applyRankingCompletedMatchesFilter()
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

  const categories = getAvailableChampionshipCategories(tournament)

  if (!categories.length) {
    openViewerTournamentId = tournamentId
    openViewerCategory = "A"
    openViewerGroupId = null
    renderChampionshipViewerV2(tournament, "A")
    return
  }

  if (categories.length === 1) {
    openViewerTournamentId = tournamentId
    openViewerCategory = categories[0]
    openViewerGroupId = null
    renderChampionshipViewerV2(tournament, categories[0])
    return
  }

  openViewerTournamentId = tournamentId
  openViewerCategory = categories[0]
  openViewerGroupId = null
  renderChampionshipViewerV2(tournament, categories[0])
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
      container.innerHTML = '<div class="empty-state">Não foi possível carregar seus torneios agora.</div>'
    }
  }
})

