import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  ChampionshipMatch,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserMatchHistory,
  UserTournament,
  UserTournamentRegistration
} from "./types"
import { getPlayerCompetitionGroup, getTournamentType, isRankingTournament } from "./tournament-rules"
import { showToast } from "./toast"

let currentUserProfile: User | null = null
let upcomingTournaments: UpcomingTournament[] = []
let allTournaments: UpcomingTournament[] = []
let registrationStatusByTournament = new Map<string, UserTournamentRegistration["paymentStatus"]>()
let registrationMethodByTournament = new Map<string, UserTournamentRegistration["paymentMethod"] | undefined>()
let openProfileResultTournamentId: string | null = null
let openProfileResultGroupId: string | null = null
let profileTournamentResultExpanded = false
const CHAMPIONSHIP_CATEGORY_ORDER: ChampionshipCategory[] = ["A", "B", "C", "D", "Iniciante"]

function formatDate(value?: number) {
  if (!value) return "Não informado"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(value)
}

function formatDateRange(startDate: number, endDate?: number) {
  if (!endDate || endDate === startDate) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} até ${formatDate(endDate)}`
}

function formatDateTime(value?: number) {
  if (!value) return "Não informado"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value)
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Não informado"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}

function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
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

function formatTournamentFee(entry: UpcomingTournament) {
  if (getTournamentType(entry) === "championship" && entry.doubleRegistrationFee !== undefined) {
    return `${formatCurrency(entry.registrationFee)} (1 cat.) / ${formatCurrency(entry.doubleRegistrationFee)} (2 cats.)`
  }

  return formatCurrency(entry.registrationFee)
}

function formatTournamentCategories(entry: UpcomingTournament | UserTournamentRegistration) {
  if (Array.isArray(entry.categories) && entry.categories.length) {
    return entry.categories.join(", ")
  }

  return entry.category || "Livre"
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function setAvatar(name: string, photoURL?: string) {
  const image = document.getElementById("profilePhoto") as HTMLImageElement | null
  const fallback = document.getElementById("profilePhotoFallback") as HTMLDivElement | null

  if (!image || !fallback) return

  fallback.textContent = getInitials(name || "Atleta")

  if (photoURL) {
    image.src = photoURL
    image.style.display = "block"
    fallback.style.display = "none"
    image.onerror = () => {
      image.style.display = "none"
      fallback.style.display = "flex"
    }
    return
  }

  image.style.display = "none"
  fallback.style.display = "flex"
}

function renderProfileInfo(user: User) {
  const container = document.getElementById("profileInfoGrid")
  if (!container) return

  const items = [
    { label: "Nome", value: user.name || "Não informado" },
    { label: "Email", value: user.email || "Não informado" },
    { label: "Telefone", value: user.phone || "Não informado" },
    { label: "Clube", value: user.club || "Não informado" },
    { label: "Categoria", value: user.category || "Não informado" },
    { label: "Cadastro", value: formatDate(user.createdAt) }
  ]

  container.innerHTML = items
    .map(
      (item) => `
        <div class="info-card">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </div>
      `
    )
    .join("")
}

function getTournamentById(tournamentId: string) {
  return allTournaments.find((entry) => entry.id === tournamentId) ?? null
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

function getChampionshipGroupStandings(
  group: ChampionshipGroup,
  state: ChampionshipCategoryState,
  nameMap: Map<string, string>
) {
  const standings = new Map<string, { wins: number; losses: number; pointsWon: number; pointsLost: number }>()

  group.playerIds.forEach((playerId) => {
    standings.set(playerId, { wins: 0, losses: 0, pointsWon: 0, pointsLost: 0 })
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

  return [...standings.entries()]
    .map(([playerId, stats]) => ({ playerId, ...stats }))
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins
      const diffA = a.pointsWon - a.pointsLost
      const diffB = b.pointsWon - b.pointsLost
      if (diffB !== diffA) return diffB - diffA
      return (nameMap.get(a.playerId) || "Atleta").localeCompare(nameMap.get(b.playerId) || "Atleta")
    })
}

function getRankingResultShowcase(tournament: UpcomingTournament) {
  const standings = tournament.finalStandings ?? []
  if (!standings.length) {
    return '<div class="empty-state">O resultado final deste ranking ainda não foi publicado.</div>'
  }

  return `
    <section class="final-results-section">
      <div class="final-results-head">
        <span class="section-label">Classificação geral</span>
        <strong>${standings.length} atleta${standings.length === 1 ? "" : "s"}</strong>
      </div>
      <div class="final-results-ranking-list">
        ${standings
          .map((entry, index) => {
            const podiumClass = index === 0 ? "podium-gold" : index === 1 ? "podium-silver" : index === 2 ? "podium-bronze" : ""
            return `
              <article class="ranking-athlete-card final-results-ranking-card ${podiumClass}">
                <span>${escapeHtml(entry.placement)}</span>
                <div class="final-results-ranking-copy">
                  <strong>${escapeHtml(entry.name)}</strong>
                  <small>${escapeHtml(entry.result)}</small>
                </div>
                <span class="ranking-athlete-stats">${entry.wins}V / ${entry.losses}D / ${entry.games}J</span>
              </article>
            `
          })
          .join("")}
      </div>
    </section>
  `
}

async function getTournamentRegistrationNameMap(tournamentId: string) {
  const snapshot = await getDocs(collection(db, "tournaments", tournamentId, "registrations"))
  const nameMap = new Map<string, string>()

  snapshot.docs.forEach((entry) => {
    const registration = { id: entry.id, ...entry.data() } as TournamentRegistration
    nameMap.set(registration.id, registration.name)
  })

  return nameMap
}

function getChampionshipResultCategories(tournament: UpcomingTournament) {
  const configuredCategories = (Array.isArray(tournament.categories) ? tournament.categories : [])
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  const stateCategories = Object.keys(tournament.championshipState ?? {})
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  return [...new Set([...configuredCategories, ...stateCategories])]
    .sort((left, right) => CHAMPIONSHIP_CATEGORY_ORDER.indexOf(left) - CHAMPIONSHIP_CATEGORY_ORDER.indexOf(right))
}

function renderChampionshipResultCategoryShowcase(
  tournament: UpcomingTournament,
  category: ChampionshipCategory,
  typedState: ChampionshipCategoryState,
  nameMap: Map<string, string>
) {
  if (!(typedState.groups ?? []).length) {
    return `
      <section class="championship-result-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Categoria ${escapeHtml(category)}</span>
            <h3>Categoria não iniciada</h3>
          </div>
        </div>
        <div class="empty-state">Categoria não iniciada.</div>
      </section>
    `
  }

  const groups = typedState.groups ?? []
  const selectedGroupId = groups.some((group) => group.id === openProfileResultGroupId)
    ? openProfileResultGroupId
    : groups[0]?.id
  const selectedGroupMatches = (typedState.completedMatches ?? [])
    .filter((match) => match.stage === "groups" && match.groupId === selectedGroupId)
    .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))

  return `
    <section class="championship-result-section">
      <div class="section-header compact-section-header">
        <div>
          <span class="section-label">Categoria ${escapeHtml(category)}</span>
          <h3>${typedState.finished ? "Resultado final" : "Andamento do campeonato"}</h3>
        </div>
      </div>
      <div class="championship-result-groups">
        ${groups
          .map((group) => {
            const totalMatches = getRoundRobinMatchesForGroup(category, group).length
            const playedMatches = (typedState.completedMatches ?? []).filter(
              (match) => match.stage === "groups" && match.groupId === group.id
            ).length
            const standings = getChampionshipGroupStandings(group, typedState, nameMap)

            return `
              <button class="championship-result-group-card ${selectedGroupId === group.id ? "active" : ""}" onclick="setProfileTournamentResultGroup('${group.id}')" type="button">
                <strong>${escapeHtml(group.name)}</strong>
                <span>${playedMatches}/${totalMatches} jogos</span>
                <div class="championship-result-group-mini">
                  ${standings.length
                    ? standings
                        .map(
                          (entry, index) => `
                            <small>${index + 1}o ${escapeHtml(nameMap.get(entry.playerId) || "Atleta")} - ${entry.wins}V</small>
                          `
                        )
                        .join("")
                    : "<small>Aguardando jogos</small>"}
                </div>
              </button>
            `
          })
          .join("")}
      </div>
      <section class="group-section championship-history-inner">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Histórico do grupo</span>
            <h3>${selectedGroupId ? escapeHtml(groups.find((group) => group.id === selectedGroupId)?.name || "Grupo") : "Grupo"}</h3>
          </div>
        </div>
        ${
          selectedGroupMatches.length
            ? `
              <div class="championship-history-compact-grid">
                ${selectedGroupMatches
                  .map((match) => `
                    <article class="championship-history-compact-card">
                      <strong>${escapeHtml(nameMap.get(match.playerIds[0]) || "Atleta")} ${match.score1 ?? 0} x ${match.score2 ?? 0} ${escapeHtml(nameMap.get(match.playerIds[1]) || "Atleta")}</strong>
                      <span>${escapeHtml(match.groupId || "Grupo")} • ${escapeHtml(formatDateTime(match.playedAt))}</span>
                    </article>
                  `)
                  .join("")}
              </div>
            `
            : '<div class="empty-state">Nenhuma partida registrada neste grupo ainda.</div>'
        }
      </section>
      <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
        <iframe
          class="championship-bracket-frame championship-result-bracket"
          title="Mata-mata ${escapeHtml(category)}"
          loading="lazy"
          src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(category)}"
        ></iframe>
      </div>
    </section>
  `
}

async function getChampionshipResultShowcase(tournament: UpcomingTournament, selectedCategory?: ChampionshipCategory) {
  const nameMap = await getTournamentRegistrationNameMap(tournament.id)
  const categoryStates = getChampionshipResultCategories(tournament)

  if (!categoryStates.length) {
    return '<div class="empty-state">Este campeonato ainda não possui grupos ou mata-mata definidos.</div>'
  }

  const activeCategory = categoryStates.includes(selectedCategory as ChampionshipCategory)
    ? (selectedCategory as ChampionshipCategory)
    : categoryStates[0]
  const typedState = (tournament.championshipState?.[activeCategory] as ChampionshipCategoryState | undefined) ?? {}

  return `
    <div class="form-group championship-result-selector">
      <span>Categoria</span>
      <select onchange="setProfileTournamentResultCategory(this.value)">
        ${categoryStates
          .map(
            (category) => `<option value="${category}" ${category === activeCategory ? "selected" : ""}>Categoria ${escapeHtml(category)}</option>`
          )
          .join("")}
      </select>
    </div>
    ${renderChampionshipResultCategoryShowcase(tournament, activeCategory, typedState, nameMap)}
  `
}

function renderTournamentHistory(entries: UserTournament[]) {
  const container = document.getElementById("tournamentsList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Seu histórico de torneios ainda não foi registrado.</div>`
    return
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>${entry.title}</strong>
              <span>${entry.category || "Categoria não informada"}</span>
            </div>
            <span class="stack-item-date">${formatDate(entry.playedAt)}</span>
          </div>
          <div class="stack-item-grid">
            <span>Colocação: ${entry.placement || "Não informada"}</span>
            <span>Resultado: ${entry.result || "Não informado"}</span>
            <span>Partidas: ${entry.matchCount ?? 0}</span>
            <span>Campanha: ${entry.wins ?? 0}V / ${entry.losses ?? 0}D</span>
          </div>
        </div>
      `
    )
    .join("")
}

function renderMatchHistory(entries: UserMatchHistory[]) {
  const container = document.getElementById("matchesList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Nenhuma partida vinculada ao seu perfil ainda.</div>`
    return
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>vs ${entry.opponentName}</strong>
              <span>${entry.tournamentTitle || "Torneio sem nome"}${entry.stage ? ` - ${entry.stage}` : ""}</span>
            </div>
            <span class="result-pill ${entry.result}">${entry.result === "win" ? "Vitoria" : "Derrota"}</span>
          </div>
          <div class="stack-item-grid">
            <span>Placar: ${entry.scoreLabel}</span>
            <span>Mesa: ${entry.tableLabel || "Não informada"}</span>
            <span>Data: ${formatDate(entry.playedAt)}</span>
          </div>
        </div>
      `
    )
    .join("")
}

function decorateTournamentHistory(entries: UserTournament[]) {
  const container = document.getElementById("tournamentsList")
  if (!container) return

  Array.from(container.children).forEach((child, index) => {
    const element = child as HTMLElement
    const entry = entries[index]
    if (!element || !entry || element.querySelector(".history-result-action")) return

    const tournamentId = entry.tournamentId || entry.id
    const tournament = getTournamentById(tournamentId)
    const actions = document.createElement("div")
    actions.className = "admin-tournament-actions history-result-action"
    actions.innerHTML = `<button class="btn secondary" ${tournament ? "" : "disabled"} onclick="openProfileTournamentResult('${tournamentId}')">Ver resultado</button>`
    element.appendChild(actions)
  })
}

function getRegisteredChampionshipCategories(registration: UserTournamentRegistration) {
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
  const rawCategories = getRegisteredChampionshipCategories(registration)
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

function isProfileTournamentStillTrackable(
  tournament: UpcomingTournament,
  registration: UserTournamentRegistration
) {
  if (getTournamentType(tournament) === "ranking") {
    return tournament.status !== "finished"
  }

  const categories = getResolvedChampionshipRegistrationCategories(tournament, registration)

  if (!categories.length) {
    return tournament.status !== "finished"
  }

  return categories.some((category) => !(tournament.championshipState?.[category] as ChampionshipCategoryState | undefined)?.finished)
}

function getVisibleTournamentHistory(
  entries: UserTournament[],
  tournaments: UpcomingTournament[],
  registrations: UserTournamentRegistration[]
) {
  return entries.filter((entry) => {
    const tournamentId = entry.tournamentId || entry.id
    const tournament = tournaments.find((item) => item.id === tournamentId)
    const registration = registrations.find((item) => (item.tournamentId || item.id) === tournamentId && item.paymentStatus === "approved")

    if (!tournament || !registration) {
      return true
    }

    return !isProfileTournamentStillTrackable(tournament, registration)
  })
}

function renderMyTournamentsCard(entries: UpcomingTournament[], registrations: UserTournamentRegistration[]) {
  const container = document.getElementById("myChampionshipsCard")
  if (!container) return

  const approvedTournaments = registrations
    .filter((entry) => entry.paymentStatus === "approved")
    .map((entry) => {
      const tournamentId = entry.tournamentId || entry.id
      const tournament = entries.find((item) => item.id === tournamentId)
      if (!tournament) return null
      if (!isProfileTournamentStillTrackable(tournament, entry)) return null

      return {
        id: tournament.id,
        title: tournament.title,
        type: getTournamentType(tournament),
        categories:
          getTournamentType(tournament) === "championship"
            ? getResolvedChampionshipRegistrationCategories(tournament, entry)
            : Array.isArray(entry.categories) && entry.categories.length
              ? entry.categories
              : entry.category
                ? entry.category.split(",").map((item) => item.trim()).filter(Boolean)
                : []
      }
    })
    .filter(Boolean) as Array<{ id: string; title: string; type: string; categories: string[] }>

  if (!approvedTournaments.length) {
    container.innerHTML = `
      <div class="empty-state">Você ainda não possui torneios aprovados para acompanhar.</div>
      <button class="btn secondary" onclick="openMyTournaments()">Abrir meus torneios</button>
    `
    return
  }

  const rankingCount = approvedTournaments.filter((entry) => entry.type === "ranking").length
  const championshipCount = approvedTournaments.filter((entry) => entry.type === "championship").length
  const highlight = approvedTournaments[0]

  container.innerHTML = `
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${approvedTournaments.length} Torneio${approvedTournaments.length === 1 ? "" : "s"} em andamento</strong>
          <span>${rankingCount} Ranking${rankingCount === 1 ? "" : "s"} e ${championshipCount} Campeonato${championshipCount === 1 ? "" : "s"}</span>
        </div>
        <span class="result-pill neutral">Ao vivo</span>
      </div>
      <div class="stack-item-grid">
        <span>Destaque: ${highlight.title}</span>
        <span>Categoria(s): ${highlight.categories.join(", ") || "A definir"}</span>
      </div>
    </div>
    <button class="btn primary" onclick="openMyTournaments()">Abrir meus torneios</button>
  `
}

function renderMyChampionshipsCard(entries: UpcomingTournament[], registrations: UserTournamentRegistration[]) {
  const container = document.getElementById("myChampionshipsCard")
  if (!container) return

  const approvedChampionships = registrations
    .filter((entry) => entry.paymentStatus === "approved")
    .map((entry) => {
      const tournamentId = entry.tournamentId || entry.id
      const tournament = entries.find((item) => item.id === tournamentId && getTournamentType(item) === "championship")
      if (!tournament) {
        return null
      }

      return {
        id: tournament.id,
        title: tournament.title,
        categories: getResolvedChampionshipRegistrationCategories(tournament, entry)
      }
    })
    .filter(Boolean) as Array<{ id: string; title: string; categories: string[] }>

  if (!approvedChampionships.length) {
    container.innerHTML = `
      <div class="empty-state">Você ainda não esta participando de nenhum campeonato aprovado.</div>
      <button class="btn secondary" onclick="openMyChampionships()">Abrir meus campeonatos</button>
    `
    return
  }

  const uniqueTournamentCount = new Set(approvedChampionships.map((entry) => entry.id)).size
  const categoryCount = approvedChampionships.reduce((total, entry) => total + entry.categories.length, 0)
  const highlight = approvedChampionships[0]

  container.innerHTML = `
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${uniqueTournamentCount} campeonato${uniqueTournamentCount > 1 ? "s" : ""} em andamento</strong>
          <span>${categoryCount} categoria${categoryCount > 1 ? "s" : ""} acompanhada${categoryCount > 1 ? "s" : ""}</span>
        </div>
        <span class="result-pill neutral">Ativo</span>
      </div>
      <div class="stack-item-grid">
        <span>Destaque: ${highlight.title}</span>
        <span>Categorias: ${highlight.categories.join(", ") || "A definir"}</span>
      </div>
    </div>
    <button class="btn primary" onclick="openMyChampionships()">Abrir meus campeonatos</button>
  `
}

function getTournamentRegistrationStatus(tournamentId: string) {
  return registrationStatusByTournament.get(tournamentId)
}

function getTournamentRegistrationMethod(tournamentId: string) {
  return registrationMethodByTournament.get(tournamentId)
}

function renderUpcoming(entries: UpcomingTournament[]) {
  const container = document.getElementById("upcomingList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Ainda não há próximos torneios cadastrados.</div>`
    return
  }

  container.innerHTML = entries
    .map((entry) => {
      const registrationStatus = getTournamentRegistrationStatus(entry.id)
      const registrationMethod = getTournamentRegistrationMethod(entry.id)
      const statusLabel =
        registrationStatus === "approved"
          ? "Inscrito"
          : registrationStatus === "pending_payment"
            ? registrationMethod === "pay_on_day"
              ? "Pagar no dia - pendente"
              : "Pagamento em análise"
            : entry.status === "open"
              ? "Inscrições abertas"
              : "Em breve"

      return `
        <div class="stack-item upcoming-item ${registrationStatus === "pending_payment" ? "pending-payment-item" : ""}">
          <div class="stack-item-header">
            <div>
              <strong>${entry.title}</strong>
              <span>${entry.location || "Local a definir"}</span>
            </div>
            <span class="result-pill ${registrationStatus === "approved" ? "win" : "neutral"}">${statusLabel}</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${formatDateRange(entry.startDate, entry.endDate)}</span>
            <span>Categoria: ${formatTournamentCategories(entry)}</span>
            <span>Valor: ${formatTournamentFee(entry)}</span>
            <span>Inscrições: ${formatDate(entry.registrationDeadline)}</span>
          </div>
          ${entry.description ? `<p class="item-description">${entry.description}</p>` : ""}
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="registerForTournament('${entry.id}')">
              ${registrationStatus ? "Ver detalhes" : "Inscreva-se"}
            </button>
          </div>
        </div>
      `
    })
    .join("")
}

function updateHeader(user: User, tournaments: UserTournament[], matches: UserMatchHistory[], upcoming: UpcomingTournament[]) {
  ;(document.getElementById("profileName") as HTMLElement).textContent = user.name || "Atleta AJAB"
  ;(document.getElementById("profileRole") as HTMLElement).textContent = user.role === "admin" ? "Administrador" : "Atleta"
  ;(document.getElementById("profileMeta") as HTMLElement).textContent =
    `${user.club || "Sem clube"} - ${user.category || "Categoria não informada"} - ${user.email || "Email não informado"}`

  const wins = matches.filter((entry) => entry.result === "win").length

  ;(document.getElementById("statsTournaments") as HTMLElement).textContent = String(tournaments.length)
  ;(document.getElementById("statsMatches") as HTMLElement).textContent = String(matches.length)
  ;(document.getElementById("statsWins") as HTMLElement).textContent = String(wins)
  ;(document.getElementById("statsUpcoming") as HTMLElement).textContent = String(upcoming.length)

  setAvatar(user.name, user.photoURL || auth.currentUser?.photoURL || undefined)

  const dashboardButton = document.querySelector('[onclick="goToDashboard()"]') as HTMLButtonElement | null
  if (dashboardButton) {
    dashboardButton.style.display = user.role === "admin" ? "flow" : "none"
  }
}

async function loadUserProfile(uid: string) {
  const userRef = doc(db, "users", uid)
  const tournamentsRef = query(collection(db, "users", uid, "tournaments"), orderBy("playedAt", "desc"))
  const matchesRef = query(collection(db, "users", uid, "matches"), orderBy("playedAt", "desc"))
  const registrationsRef = query(collection(db, "users", uid, "registrations"), orderBy("registeredAt", "desc"))
  const upcomingRef = query(collection(db, "tournaments"), orderBy("startDate", "asc"))

  const [userSnapshot, tournamentsSnapshot, matchesSnapshot, registrationsSnapshot, upcomingSnapshot] = await Promise.all([
    getDoc(userRef),
    getDocs(tournamentsRef),
    getDocs(matchesRef),
    getDocs(registrationsRef),
    getDocs(upcomingRef)
  ])

  if (!userSnapshot.exists()) {
    window.location.replace("/pages/complete-profile.html")
    return
  }

  const user = { id: userSnapshot.id, ...userSnapshot.data() } as User

  if (!user.profileComplete) {
    window.location.replace("/pages/complete-profile.html")
    return
  }

  const tournaments = tournamentsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UserTournament)
  const matches = matchesSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UserMatchHistory)
  const registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UserTournamentRegistration)
  const now = Date.now()
  const resolvedTournaments = upcomingSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
  const upcoming = resolvedTournaments
    .filter((entry) => (entry.status ? entry.status !== "finished" && entry.status !== "closed" : true))
    .filter((entry) => entry.startDate >= now || entry.endDate === undefined || entry.endDate >= now)
    .slice(0, 6)

  currentUserProfile = user
  upcomingTournaments = upcoming
  allTournaments = resolvedTournaments
  registrationStatusByTournament = new Map(registrations.map((entry) => [entry.tournamentId || entry.id, entry.paymentStatus]))
  registrationMethodByTournament = new Map(registrations.map((entry) => [entry.tournamentId || entry.id, entry.paymentMethod]))

  const visibleTournamentHistory = getVisibleTournamentHistory(tournaments, resolvedTournaments, registrations)

  updateHeader(user, tournaments, matches, upcoming)
  renderProfileInfo(user)
  renderTournamentHistory(visibleTournamentHistory)
  decorateTournamentHistory(visibleTournamentHistory)
  renderMatchHistory(matches)
  renderMyTournamentsCard(resolvedTournaments, registrations)
  renderUpcoming(upcoming)
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

;(window as any).editProfile = () => {
  window.location.href = "/pages/complete-profile.html"
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).openMyTournaments = () => {
  window.location.href = "/pages/my-championships.html"
}

;(window as any).openMyChampionships = () => {
  window.location.href = "/pages/my-championships.html"
}

;(window as any).closeProfileTournamentResultModal = () => {
  const modal = document.getElementById("profileTournamentResultModal") as HTMLElement | null
  const modalCard = document.querySelector("#profileTournamentResultModal .profile-tournament-result-modal-card") as HTMLElement | null
  const expandButton = document.getElementById("profileTournamentResultExpandButton") as HTMLButtonElement | null
  if (modal) {
    modal.style.display = "none"
  }
  profileTournamentResultExpanded = false
  if (modalCard) {
    modalCard.classList.remove("expanded")
  }
  if (expandButton) {
    expandButton.textContent = "Expandir resultados"
  }
  openProfileResultTournamentId = null
  openProfileResultGroupId = null
}

;(window as any).toggleProfileTournamentResultExpand = () => {
  const modalCard = document.querySelector("#profileTournamentResultModal .profile-tournament-result-modal-card") as HTMLElement | null
  const expandButton = document.getElementById("profileTournamentResultExpandButton") as HTMLButtonElement | null
  if (!modalCard || !expandButton) return

  profileTournamentResultExpanded = !profileTournamentResultExpanded
  modalCard.classList.toggle("expanded", profileTournamentResultExpanded)
  expandButton.textContent = profileTournamentResultExpanded ? "Recolher resultados" : "Expandir resultados"
}

;(window as any).openProfileTournamentResult = async (tournamentId: string) => {
  const tournament = getTournamentById(tournamentId)
  const title = document.getElementById("profileTournamentResultTitle")
  const content = document.getElementById("profileTournamentResultContent")
  const modal = document.getElementById("profileTournamentResultModal") as HTMLElement | null
  const modalCard = document.querySelector("#profileTournamentResultModal .profile-tournament-result-modal-card") as HTMLElement | null
  const expandButton = document.getElementById("profileTournamentResultExpandButton") as HTMLButtonElement | null

  if (!tournament || !title || !content || !modal) {
    showToast("Não foi possível abrir o resultado deste torneio.", "warning")
    return
  }

  title.textContent = `Resultado - ${tournament.title}`
  content.innerHTML = '<div class="empty-state">Carregando resultado...</div>'
  modal.style.display = "flex"
  profileTournamentResultExpanded = false
  if (modalCard) {
    modalCard.classList.remove("expanded")
  }
  if (expandButton) {
    expandButton.textContent = "Expandir resultados"
  }
  openProfileResultTournamentId = tournamentId
  openProfileResultGroupId = null

  try {
    content.innerHTML = isRankingTournament(tournament)
      ? getRankingResultShowcase(tournament)
      : await getChampionshipResultShowcase(tournament)
  } catch (error: any) {
    content.innerHTML = `<div class="empty-state">Não foi possível carregar o resultado agora.</div>`
    showToast("Erro ao carregar resultado: " + error.message, "error")
  }
}

;(window as any).setProfileTournamentResultCategory = async (category: string) => {
  const tournamentId = openProfileResultTournamentId
  const content = document.getElementById("profileTournamentResultContent")
  if (!tournamentId || !content) return

  const tournament = getTournamentById(tournamentId)
  const normalizedCategory = normalizeChampionshipCategory(category)
  if (!tournament || !normalizedCategory) return

  content.innerHTML = '<div class="empty-state">Carregando resultado...</div>'
  openProfileResultGroupId = null

  try {
    content.innerHTML = await getChampionshipResultShowcase(tournament, normalizedCategory)
  } catch (error: any) {
    content.innerHTML = `<div class="empty-state">Não foi possível carregar o resultado agora.</div>`
    showToast("Erro ao carregar categoria: " + error.message, "error")
  }
}

;(window as any).setProfileTournamentResultGroup = async (groupId: string) => {
  const tournamentId = openProfileResultTournamentId
  const content = document.getElementById("profileTournamentResultContent")
  if (!tournamentId || !content) return

  const tournament = getTournamentById(tournamentId)
  if (!tournament) return

  const selector = content.querySelector("select")
  const normalizedCategory = normalizeChampionshipCategory((selector as HTMLSelectElement | null)?.value)
  if (!normalizedCategory) return

  openProfileResultGroupId = groupId
  content.innerHTML = '<div class="empty-state">Carregando resultado...</div>'

  try {
    content.innerHTML = await getChampionshipResultShowcase(tournament, normalizedCategory)
  } catch (error: any) {
    content.innerHTML = `<div class="empty-state">Não foi possível carregar o resultado agora.</div>`
    showToast("Erro ao carregar grupo: " + error.message, "error")
  }
}

;(window as any).requestPasswordReset = async () => {
  const email = currentUserProfile?.email || auth.currentUser?.email
  if (!email) {
    showToast("Seu perfil não possui email cadastrado para redefinição de senha.", "warning")
    return
  }

  try {
    await sendPasswordResetEmail(auth, email)
    showToast("Enviamos um link de redefinição de senha para o seu email.", "success")
  } catch (error: any) {
    showToast("Erro ao enviar redefinição de senha: " + error.message, "error")
  }
}

;(window as any).registerForTournament = async (tournamentId: string) => {
  const firebaseUser = auth.currentUser

  if (!firebaseUser || !currentUserProfile) {
    window.location.replace("/pages/login.html")
    return
  }

  const tournament = upcomingTournaments.find((entry) => entry.id === tournamentId)
  if (!tournament) {
    showToast("Torneio não encontrado.", "error")
    return
  }

  window.location.href = `/pages/tournament-details.html?id=${encodeURIComponent(tournament.id)}`
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadUserProfile(user.uid)
  } catch (error) {
    console.error("Erro ao carregar perfil:", error)

    const tournamentsList = document.getElementById("tournamentsList")
    const matchesList = document.getElementById("matchesList")
    const upcomingList = document.getElementById("upcomingList")
    const championshipsCard = document.getElementById("myChampionshipsCard")

    if (tournamentsList) {
      tournamentsList.innerHTML = `<div class="empty-state">Não foi possível carregar o perfil agora.</div>`
    }

    if (matchesList) {
      matchesList.innerHTML = `<div class="empty-state">Tente novamente em instantes.</div>`
    }

    if (upcomingList) {
      upcomingList.innerHTML = `<div class="empty-state">Os próximos torneios não puderam ser consultados.</div>`
    }

    if (championshipsCard) {
      championshipsCard.innerHTML = `<div class="empty-state">Seus campeonatos não puderam ser carregados agora.</div>`
    }
  }
})

