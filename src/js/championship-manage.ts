import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getDocs, collection, setDoc, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  ChampionshipMatch,
  TournamentRegistration,
  UpcomingTournament,
  User,
  UserTournamentRegistration
} from "./types"
import {
  CHAMPIONSHIP_CATEGORIES,
  formatRegistrationCategories,
  getCategoryLimit,
  getCategoryRegistrationCount,
  getRegistrationFeeForSelection,
  getTournamentType
} from "./tournament-rules"
import { showToast } from "./toast"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []
let allUsers: User[] = []
let selectedChampionshipAthleteId: string | null = null
let openResultsCategory: ChampionshipCategory | null = null
let openResultsGroupId: string | null = null
const CHAMPIONSHIP_CATEGORY_ORDER: ChampionshipCategory[] = ["A", "B", "C", "D", "Iniciante"]

function setUserHeader(userData: User) {
  const header = document.getElementById("userSummary")
  if (!header) return

  header.innerHTML = `
    <strong>${userData.name}</strong>
    <span>${userData.club || "Sem clube"}</span>
    <span>${userData.category || "Sem categoria"}</span>
  `
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

function normalizeChampionshipCategory(value?: string): ChampionshipCategory | null {
  const normalized = (value ?? "").trim().toUpperCase()

  if (normalized === "A") return "A"
  if (normalized === "B") return "B"
  if (normalized === "C") return "C"
  if (normalized === "D") return "D"
  if (normalized === "INICIANTE" || normalized === "INICIANTES") return "Iniciante"
  return null
}

function parseRegistrationCategories(registration: TournamentRegistration) {
  const source = Array.isArray(registration.categories)
    ? registration.categories
    : (registration.category ?? "").split(",")

  return [...new Set(source.map((entry) => normalizeChampionshipCategory(entry)).filter(Boolean))] as ChampionshipCategory[]
}

function getTournamentCategories() {
  if (!currentTournament?.categories?.length) {
    return CHAMPIONSHIP_CATEGORIES
  }

  const normalized = currentTournament.categories
    .map((entry) => normalizeChampionshipCategory(entry))
    .filter(Boolean) as ChampionshipCategory[]

  return normalized.length ? normalized : CHAMPIONSHIP_CATEGORIES
}

function getApprovedRegistrations() {
  return registrations.filter((registration) => registration.paymentStatus === "approved")
}

function normalizeText(value?: string) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatDateTime(value?: number) {
  if (!value) return "Nao informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(value)
}

function getTournamentRegistrationByUserId(userId: string) {
  return registrations.find((entry) => entry.id === userId || entry.uid === userId) ?? null
}

function getChampionshipAdminCategories() {
  return getTournamentCategories()
}

function isChampionshipCategoryFull(category: ChampionshipCategory) {
  if (!currentTournament) return false
  const limit = getCategoryLimit(currentTournament, category)
  if (!limit) return false
  return getCategoryRegistrationCount(registrations, category) >= limit
}

function getChampionshipAthleteCandidates(search = "") {
  const normalized = normalizeText(search)

  return allUsers
    .filter((user) => user.profileComplete && (user.role === "user" || user.role === "admin"))
    .filter((user) => {
      if (!normalized) return true
      return [user.name, user.email, user.club, user.category].some((value) => normalizeText(value).includes(normalized))
    })
    .map((user) => ({
      user,
      registration: getTournamentRegistrationByUserId(user.id)
    }))
    .sort((a, b) => a.user.name.localeCompare(b.user.name))
}

function renderChampionshipAthleteCategoryOptions(selectedCategory?: string) {
  const select = document.getElementById("championshipManualCategory") as HTMLSelectElement | null
  if (!select || !currentTournament) return

  select.innerHTML = getChampionshipAdminCategories()
    .map((category) => {
      const count = getCategoryRegistrationCount(registrations, category)
      const limit = getCategoryLimit(currentTournament, category)
      const full = Boolean(limit && count >= limit)
      const isSelected = (selectedCategory || "") === category
      return `<option value="${category}" ${isSelected ? "selected" : ""} ${full && !isSelected ? "disabled" : ""}>${escapeHtml(category)}${limit ? ` (${count}/${limit})` : ""}${full && !isSelected ? " - lotada" : ""}</option>`
    })
    .join("")
}

function renderSelectedChampionshipAthleteSummary() {
  const summary = document.getElementById("selectedChampionshipAthleteSummary")
  if (!summary) return

  const selected = selectedChampionshipAthleteId
    ? getChampionshipAthleteCandidates().find((entry) => entry.user.id === selectedChampionshipAthleteId)
    : null

  if (!selected) {
    summary.className = "add-athlete-summary empty"
    summary.textContent = "Nenhum atleta selecionado ainda."
    renderChampionshipAthleteCategoryOptions()
    return
  }

  summary.className = "add-athlete-summary"
  summary.innerHTML = `
    <strong>${escapeHtml(selected.user.name)}</strong>
    <span>${escapeHtml(selected.user.club || "Sem clube")} - ${escapeHtml(selected.user.category || "Sem categoria")}</span>
    <small>${selected.registration ? `Status atual: ${selected.registration.paymentStatus === "approved" ? "inscricao aprovada" : "pagamento pendente"}` : "Sem inscricao neste campeonato"}</small>
  `
  renderChampionshipAthleteCategoryOptions(selected.registration?.category)
}

function renderChampionshipAthleteSearchResults(search = "") {
  const results = document.getElementById("championshipAthleteSearchResults")
  const message = document.getElementById("championshipAthleteSearchMessage")
  if (!results || !message) return

  const trimmed = search.trim()
  const candidates = getChampionshipAthleteCandidates(trimmed)

  if (!trimmed) {
    message.textContent = "Digite para localizar um atleta ja cadastrado."
  } else if (!candidates.length) {
    message.textContent = "Nenhum atleta encontrado com esse filtro."
  } else {
    message.textContent = `${candidates.length} atleta(s) encontrado(s).`
  }

  results.innerHTML = candidates.length
    ? candidates
        .map((candidate) => {
          const status = candidate.registration
            ? candidate.registration.paymentStatus === "approved"
              ? "Inscrito"
              : "Pendente"
            : "Disponivel"

          return `
            <button type="button" class="athlete-search-item ${selectedChampionshipAthleteId === candidate.user.id ? "active" : ""}" onclick="selectChampionshipAthleteCandidate('${candidate.user.id}')">
              <div class="athlete-search-copy">
                <strong>${escapeHtml(candidate.user.name)}</strong>
                <span>${escapeHtml(candidate.user.club || "Sem clube")} - ${escapeHtml(candidate.user.category || "Sem categoria")}</span>
              </div>
              <span class="result-pill ${candidate.registration?.paymentStatus === "approved" ? "win" : "neutral"}">${status}</span>
            </button>
          `
        })
        .join("")
    : '<div class="empty-state">Nenhum atleta encontrado.</div>'
}

function getRegistrationsForCategory(category: ChampionshipCategory) {
  return getApprovedRegistrations()
    .filter((registration) => parseRegistrationCategories(registration).includes(category))
    .sort((a, b) => a.name.localeCompare(b.name))
}

function getCategoryVacancySummary(category: ChampionshipCategory) {
  if (!currentTournament) {
    return {
      count: 0,
      limit: undefined as number | undefined,
      remaining: undefined as number | undefined,
      label: "Sem limite"
    }
  }

  const count = getCategoryRegistrationCount(registrations, category)
  const limit = getCategoryLimit(currentTournament, category)
  const remaining = typeof limit === "number" ? Math.max(0, limit - count) : undefined

  return {
    count,
    limit,
    remaining,
    label: typeof limit === "number" ? `${count}/${limit}` : `${count} inscritos`
  }
}

function normalizeTables(
  tables: ChampionshipCategoryState["activeTables"] | undefined,
  tableCount: number
) {
  return Array.from({ length: Math.max(1, tableCount) }, (_, index) => {
    const previous = tables?.[index]

    return {
      id: previous?.id ?? index + 1,
      ...(previous?.groupId ? { groupId: previous.groupId } : {}),
      ...(previous?.match ? { match: previous.match } : {})
    }
  })
}

function getCategoryState(category: ChampionshipCategory): ChampionshipCategoryState {
  const state = currentTournament?.championshipState?.[category]
  const tableCount = Math.max(1, state?.tableCount ?? 1)

  return {
    groupSize: Math.max(2, state?.groupSize ?? 3),
    groups: state?.groups ?? [],
    defined: state?.defined ?? false,
    started: state?.started ?? false,
    finished: state?.finished ?? false,
    tableCount,
    queue: state?.queue ?? [],
    activeTables: normalizeTables(state?.activeTables, tableCount),
    completedMatches: state?.completedMatches ?? [],
    finalStandings: state?.finalStandings ?? []
  }
}

function getPlayerNameById(category: ChampionshipCategory, playerId: string) {
  return getRegistrationsForCategory(category).find((registration) => registration.id === playerId)?.name || "Atleta"
}

function getRoundRobinMatchesForGroup(category: ChampionshipCategory, group: ChampionshipGroup) {
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

function getChampionshipGroupStandings(group: ChampionshipGroup, state: ChampionshipCategoryState) {
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
      return getPlayerNameById(group.id.split("-")[0] as ChampionshipCategory, a.playerId).localeCompare(
        getPlayerNameById(group.id.split("-")[0] as ChampionshipCategory, b.playerId)
      )
    })
}

function getManageResultCategories(tournament: UpcomingTournament) {
  const configuredCategories = getTournamentCategories()
  const stateCategories = Object.keys(tournament.championshipState ?? {})
    .map((category) => normalizeChampionshipCategory(category))
    .filter(Boolean) as ChampionshipCategory[]

  return [...new Set([...configuredCategories, ...stateCategories])]
    .sort((left, right) => CHAMPIONSHIP_CATEGORY_ORDER.indexOf(left) - CHAMPIONSHIP_CATEGORY_ORDER.indexOf(right))
}

function renderManageResultCategory(category: ChampionshipCategory, state: ChampionshipCategoryState) {
  const groups = state.groups ?? []
  if (!groups.length) {
    return `
      <section class="championship-result-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Categoria ${escapeHtml(category)}</span>
            <h3>Categoria nao iniciada</h3>
          </div>
        </div>
        <div class="empty-state">Categoria nao iniciada.</div>
      </section>
    `
  }

  const selectedGroupId = groups.some((group) => group.id === openResultsGroupId) ? openResultsGroupId : groups[0]?.id
  const selectedMatches = (state.completedMatches ?? [])
    .filter((match) => match.stage === "groups" && match.groupId === selectedGroupId)
    .sort((a, b) => (b.playedAt ?? 0) - (a.playedAt ?? 0))

  return `
    <section class="championship-result-section">
      <div class="section-header compact-section-header">
        <div>
          <span class="section-label">Categoria ${escapeHtml(category)}</span>
          <h3>${state.finished ? "Resultado final" : "Andamento do campeonato"}</h3>
        </div>
      </div>
      <div class="championship-result-groups">
        ${groups
          .map((group) => {
            const totalMatches = getRoundRobinMatchesForGroup(category, group).length
            const playedMatches = (state.completedMatches ?? []).filter((match) => match.stage === "groups" && match.groupId === group.id).length
            const standings = getChampionshipGroupStandings(group, state)

            return `
              <button class="championship-result-group-card ${selectedGroupId === group.id ? "active" : ""}" onclick="setChampionshipResultsGroup('${group.id}')" type="button">
                <strong>${escapeHtml(group.name)}</strong>
                <span>${playedMatches}/${totalMatches} jogos</span>
                <div class="championship-result-group-mini">
                  ${standings.length
                    ? standings.map((entry, index) => `<small>${index + 1}o ${escapeHtml(getPlayerNameById(category, entry.playerId))} - ${entry.wins}V</small>`).join("")
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
            <span class="section-label">Historico do grupo</span>
            <h3>${selectedGroupId ? escapeHtml(groups.find((group) => group.id === selectedGroupId)?.name || "Grupo") : "Grupo"}</h3>
          </div>
        </div>
        ${
          selectedMatches.length
            ? `
              <div class="championship-history-compact-grid">
                ${selectedMatches
                  .map((match) => `
                    <article class="championship-history-compact-card">
                      <strong>${escapeHtml(getPlayerNameById(category, match.playerIds[0]))} ${match.score1 ?? 0} x ${match.score2 ?? 0} ${escapeHtml(getPlayerNameById(category, match.playerIds[1]))}</strong>
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
          src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(currentTournament?.id || "")}&category=${encodeURIComponent(category)}"
        ></iframe>
      </div>
    </section>
  `
}

function renderChampionshipResultsModalContent(category?: ChampionshipCategory) {
  const tournament = currentTournament
  if (!tournament) return

  const title = document.getElementById("championshipResultsModalTitle")
  const content = document.getElementById("championshipResultsModalContent")
  const finalizeButton = document.getElementById("championshipFinalizeButton") as HTMLButtonElement | null
  if (!title || !content) return

  const categories = getManageResultCategories(tournament)
  if (!categories.length) {
    title.textContent = `Resultado - ${tournament.title}`
    content.innerHTML = '<div class="empty-state">Este campeonato ainda nao possui categorias configuradas.</div>'
    if (finalizeButton) {
      finalizeButton.disabled = false
      finalizeButton.textContent = tournament.status === "finished" ? "Torneio finalizado" : "Finalizar torneio"
    }
    return
  }

  const activeCategory = categories.includes(category as ChampionshipCategory) ? (category as ChampionshipCategory) : categories[0]
  const state = (tournament.championshipState?.[activeCategory] as ChampionshipCategoryState | undefined) ?? {}

  title.textContent = `Resultado - ${tournament.title}`
  content.innerHTML = `
    <div class="form-group championship-result-selector">
      <span>Categoria</span>
      <select onchange="setChampionshipResultsCategory(this.value)">
        ${categories.map((entry) => `<option value="${entry}" ${entry === activeCategory ? "selected" : ""}>Categoria ${escapeHtml(entry)}</option>`).join("")}
      </select>
    </div>
    ${renderManageResultCategory(activeCategory, state)}
  `

  if (finalizeButton) {
    finalizeButton.disabled = tournament.status === "finished"
    finalizeButton.textContent = tournament.status === "finished" ? "Torneio finalizado" : "Finalizar torneio"
  }
}

async function finalizeChampionshipTournament() {
  const tournament = currentTournament
  if (!tournament) return

  const categoryState = tournament.championshipState ?? {}
  const nextChampionshipState = getTournamentCategories().reduce((accumulator, category) => {
    const previous = getCategoryState(category)
    const nextTableCount = Math.max(1, previous.tableCount ?? 1)

    accumulator[category] = {
      ...previous,
      defined: previous.groups?.length ? true : previous.defined ?? false,
      started: false,
      knockoutStarted: false,
      finished: true,
      queue: [],
      activeTables: normalizeTables([], nextTableCount),
      tableCount: nextTableCount
    }

    return accumulator
  }, { ...categoryState } as NonNullable<UpcomingTournament["championshipState"]>)

  currentTournament = {
    ...tournament,
    status: "finished",
    isActive: false,
    championshipState: nextChampionshipState,
    updatedAt: Date.now()
  }

  await updateDoc(doc(db, "tournaments", tournament.id), {
    status: "finished",
    isActive: false,
    championshipState: nextChampionshipState,
    updatedAt: currentTournament.updatedAt
  })
}

function getPlacementLabel(index: number) {
  if (index === 0) return "1° lugar"
  if (index === 1) return "2° lugar"
  if (index === 2) return "3° lugar"
  return "4° lugar"
}

function getPlacementClass(index: number) {
  if (index === 0) return "podium-gold"
  if (index === 1) return "podium-silver"
  return "podium-bronze"
}

function getGroupSize(category: ChampionshipCategory) {
  return Math.max(2, getCategoryState(category).groupSize ?? 3)
}

function shuffle<T>(items: T[]) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }

  return copy
}

function buildGroupSizes(totalPlayers: number, preferredSize: number) {
  if (totalPlayers <= 0) return []

  const groupCount = Math.max(1, Math.ceil(totalPlayers / preferredSize))
  const baseSize = Math.floor(totalPlayers / groupCount)
  const remainder = totalPlayers % groupCount

  return Array.from({ length: groupCount }, (_, index) => baseSize + (index < remainder ? 1 : 0)).filter((size) => size > 0)
}

function getGroupPlayers(group: ChampionshipGroup, category: ChampionshipCategory) {
  const registrationMap = new Map(getRegistrationsForCategory(category).map((registration) => [registration.id, registration]))
  return group.playerIds
    .map((playerId) => registrationMap.get(playerId))
    .filter(Boolean) as TournamentRegistration[]
}

async function saveChampionshipCategoryState(category: ChampionshipCategory, partial: Partial<ChampionshipCategoryState>) {
  if (!currentTournament) return

  const previous = getCategoryState(category)
  const nextTableCount = Math.max(1, partial.tableCount ?? previous.tableCount ?? 1)
  const nextState: ChampionshipCategoryState = {
    ...previous,
    ...partial,
    tableCount: nextTableCount,
    activeTables: normalizeTables(partial.activeTables ?? previous.activeTables, nextTableCount)
  }

  currentTournament.championshipState = {
    ...currentTournament.championshipState,
    [category]: nextState
  }

  await updateDoc(doc(db, "tournaments", currentTournament.id), {
    championshipState: currentTournament.championshipState,
    updatedAt: Date.now()
  })
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

  if (getTournamentType(currentTournament) !== "championship") {
    window.location.replace(`/pages/tournament-manage.html?id=${snapshot.id}`)
    return
  }
}

async function loadRegistrations() {
  if (!currentTournament) {
    registrations = []
    return
  }

  const snapshot = await getDocs(collection(db, "tournaments", currentTournament.id, "registrations"))
  registrations = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
}

async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"))
  allUsers = snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as User)
    .sort((a, b) => a.name.localeCompare(b.name))
}

function renderSummary() {
  ;(document.getElementById("championshipTitle") as HTMLElement).textContent = currentTournament?.title || "Campeonato"
  ;(document.getElementById("championshipSubtitle") as HTMLElement).textContent =
    `${currentTournament?.location || "Local a definir"} - faca o sorteio por categoria e entre na pagina da categoria para operar jogos, mesas e mata-mata.`
  ;(document.getElementById("championshipStatus") as HTMLElement).textContent =
    currentTournament?.status === "finished"
      ? "Finalizado"
      : currentTournament?.status === "open"
        ? "Em andamento"
        : "Preparação"
  ;(document.getElementById("championshipCategories") as HTMLElement).textContent = formatRegistrationCategories(getTournamentCategories())
  ;(document.getElementById("championshipApprovedCount") as HTMLElement).textContent = String(getApprovedRegistrations().length)
}

function renderCategoryCard(category: ChampionshipCategory) {
  const registrationsForCategory = getRegistrationsForCategory(category)
  const state = getCategoryState(category)
  const vacancy = getCategoryVacancySummary(category)
  const groups = state.groups ?? []
  const groupPreviewCount = buildGroupSizes(registrationsForCategory.length, getGroupSize(category)).length
  const statusLabel = state.finished ? "Encerrada" : state.defined ? "Em andamento" : groups.length ? "Grupos prontos" : "Aguardando sorteio"

  return `
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${category}</span>
          <h2>${registrationsForCategory.length} atleta${registrationsForCategory.length === 1 ? "" : "s"} aprovados</h2>
        </div>
        <div class="championship-category-actions">
          <label class="championship-group-size">
            <span>Jogadores por grupo</span>
            <input id="groupSize_${category}" type="number" min="2" max="6" value="${getGroupSize(category)}" ${state.defined ? "disabled" : ""}>
          </label>
          <button class="btn primary" ${state.defined ? "disabled" : ""} onclick="drawCategoryGroups('${category}')">Sortear grupos</button>
          <button class="btn primary" ${groups.length ? "" : "disabled"} onclick="openCategoryPage('${category}')">${state.defined ? "Abrir categoria" : "Abrir pagina da categoria"}</button>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card">
          <span>Grupos previstos</span>
          <strong>${groups.length || groupPreviewCount || 0}</strong>
        </div>
        <div class="info-card">
          <span>Classificados</span>
          <strong>${groups.length ? groups.length * 2 : Math.max(0, groupPreviewCount * 2)}</strong>
        </div>
        <div class="info-card">
          <span>Status</span>
          <strong>${statusLabel}</strong>
        </div>
        <div class="info-card">
          <span>Vagas</span>
          <strong>${vacancy.limit ? `${vacancy.remaining} restantes` : "Sem limite"}</strong>
          <small>${vacancy.label}</small>
        </div>
      </div>

      <details class="championship-block championship-collapse" ${groups.length ? "open" : ""}>
        <summary class="championship-collapse-summary">
          <div class="championship-block-head">
            <h3>Grupos sorteados</h3>
            <p>${groups.length ? state.defined ? "A categoria ja foi iniciada. A configuração desta pagina ficou travada e a operação segue dentro da pagina da categoria." : "Ao abrir a pagina da categoria, esta configuração fica travada e a operação segue por la." : "Defina o tamanho dos grupos e sorteie a categoria para montar os confrontos."}</p>
          </div>
        </summary>
        <div class="championship-collapse-content">
          ${
            groups.length
              ? `
                <div class="championship-groups-grid">
                  ${groups
                    .map((group) => {
                      const players = getGroupPlayers(group, category)

                      return `
                        <article class="championship-group-card">
                          <div class="championship-group-card-head">
                            <strong>${group.name}</strong>
                            <span>${players.length} atleta${players.length === 1 ? "" : "s"}</span>
                          </div>
                          <div class="championship-player-list">
                            ${players
                              .map(
                                (player, index) => `
                                  <div class="championship-player-row">
                                    <span>${index + 1}.</span>
                                    <strong>${player.name}</strong>
                                    <small>${player.club || "Sem clube"}</small>
                                  </div>
                                `
                              )
                              .join("")}
                          </div>
                        </article>
                      `
                    })
                    .join("")}
                </div>
              `
              : '<div class="empty-state">Nenhum grupo sorteado ainda para esta categoria.</div>'
          }
        </div>
      </details>
      ${
        state.finalStandings?.length
          ? `
            <details class="championship-block championship-manage-finals championship-collapse" open>
              <summary class="championship-collapse-summary">
                <div class="championship-block-head">
                  <h3>Classificação final</h3>
                  <p>Resumo final da categoria.</p>
                </div>
              </summary>
              <div class="championship-collapse-content">
                <div class="championship-final-standings">
                  ${state.finalStandings.slice(0, 4).map((playerId, index) => `
                    <div class="championship-final-card ${getPlacementClass(index)}">
                      <div class="championship-final-card-head">
                        <div class="championship-final-player">
                          <strong>${getPlayerNameById(category, playerId)}</strong>
                        </div>
                        <span class="result-pill ${getPlacementClass(index)}">${getPlacementLabel(index)}</span>
                      </div>
                    </div>
                  `).join("")}
                </div>
              </div>
            </details>
          `
          : ""
      }
    </article>
  `
}
function renderPage() {
  renderSummary()

  const categoriesGrid = document.getElementById("championshipCategoriesGrid") as HTMLElement | null
  if (!categoriesGrid) return

  categoriesGrid.innerHTML = getTournamentCategories().map((category) => renderCategoryCard(category)).join("")
}

function openAddChampionshipAthleteModal() {
  const modal = document.getElementById("addChampionshipAthleteModal") as HTMLElement | null
  const searchInput = document.getElementById("championshipAthleteSearch") as HTMLInputElement | null
  if (!modal) return

  selectedChampionshipAthleteId = null
  if (searchInput) {
    searchInput.value = ""
  }
  ;(["newChampionshipAthleteName", "newChampionshipAthleteEmail", "newChampionshipAthletePhone", "newChampionshipAthleteClub"] as const).forEach((id) => {
    const field = document.getElementById(id) as HTMLInputElement | null
    if (field) field.value = ""
  })
  const paymentSelect = document.getElementById("championshipManualPayment") as HTMLSelectElement | null
  const baseCategorySelect = document.getElementById("newChampionshipAthleteBaseCategory") as HTMLSelectElement | null
  if (paymentSelect) paymentSelect.value = "approved"
  if (baseCategorySelect) baseCategorySelect.value = "A"
  renderChampionshipAthleteCategoryOptions()
  renderSelectedChampionshipAthleteSummary()
  renderChampionshipAthleteSearchResults()
  modal.style.display = "flex"
}

function closeAddChampionshipAthleteModal() {
  const modal = document.getElementById("addChampionshipAthleteModal") as HTMLElement | null
  if (!modal) return

  selectedChampionshipAthleteId = null
  modal.style.display = "none"
}

function getChampionshipAddPaymentStatus() {
  const value = (document.getElementById("championshipManualPayment") as HTMLSelectElement | null)?.value
  return value === "pending_payment" ? "pending_payment" : "approved"
}

function getChampionshipAddCategory() {
  return (document.getElementById("championshipManualCategory") as HTMLSelectElement | null)?.value as ChampionshipCategory | ""
}

function buildChampionshipRegistrationPayload(
  user: User,
  category: ChampionshipCategory,
  paymentStatus: TournamentRegistration["paymentStatus"]
) {
  const tournament = currentTournament
  if (!tournament) {
    throw new Error("Campeonato nao carregado.")
  }

  const now = Date.now()
  const registrationFee = getRegistrationFeeForSelection(tournament, [category])
  const paymentMethod = paymentStatus === "approved" ? "pix" : "pay_on_day"

  const registrationPayload: TournamentRegistration = {
    id: user.id,
    uid: user.id,
    name: user.name,
    email: user.email,
    club: user.club,
    category,
    categories: [category],
    registrationFee,
    paymentStatus,
    paymentMethod,
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: tournament.id,
    tournamentId: tournament.id,
    title: tournament.title,
    location: tournament.location ?? "",
    category,
    categories: [category],
    registrationFee,
    paymentStatus,
    paymentMethod,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    registrationDeadline: tournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  return { registrationPayload, userRegistrationPayload }
}

async function saveChampionshipRegistration(
  user: User,
  category: ChampionshipCategory,
  paymentStatus: TournamentRegistration["paymentStatus"]
) {
  if (!currentTournament) return

  const batch = writeBatch(db)
  const { registrationPayload, userRegistrationPayload } = buildChampionshipRegistrationPayload(user, category, paymentStatus)

  batch.set(doc(db, "tournaments", currentTournament.id, "registrations", user.id), registrationPayload)
  batch.set(doc(db, "users", user.id, "registrations", currentTournament.id), userRegistrationPayload)

  await batch.commit()
}

async function createLooseChampionshipUser() {
  const name = (document.getElementById("newChampionshipAthleteName") as HTMLInputElement | null)?.value.trim() || ""
  const email = (document.getElementById("newChampionshipAthleteEmail") as HTMLInputElement | null)?.value.trim() || ""
  const phone = (document.getElementById("newChampionshipAthletePhone") as HTMLInputElement | null)?.value.trim() || ""
  const club = (document.getElementById("newChampionshipAthleteClub") as HTMLInputElement | null)?.value.trim() || ""
  const baseCategory =
    ((document.getElementById("newChampionshipAthleteBaseCategory") as HTMLSelectElement | null)?.value as ChampionshipCategory | "") || ""

  if (!name || !baseCategory) {
    throw new Error("Informe pelo menos nome e categoria base para cadastrar o atleta.")
  }

  const userRef = doc(collection(db, "users"))
  const now = Date.now()
  const newUser: User = {
    id: userRef.id,
    name,
    email,
    phone,
    club,
    category: baseCategory,
    role: "user",
    createdAt: now,
    updatedAt: now,
    profileComplete: true,
    playerProfile: {
      wins: 0,
      losses: 0,
      games: 0,
      active: false,
      createdAt: now
    }
  }

  await setDoc(userRef, newUser)
  allUsers = [...allUsers, newUser].sort((a, b) => a.name.localeCompare(b.name))
  return newUser
}

;(window as any).drawCategoryGroups = async (category: ChampionshipCategory) => {
  const state = getCategoryState(category)
  if (state.defined) {
    showToast("Esta categoria ja foi iniciada e nao pode mais sortear grupos nesta pagina.", "warning")
    return
  }

  const registrationsForCategory = getRegistrationsForCategory(category)
  const groupSize = Math.max(2, Number((document.getElementById(`groupSize_${category}`) as HTMLInputElement | null)?.value || getGroupSize(category)))

  if (!registrationsForCategory.length) {
    showToast("Nao ha atletas aprovados nesta categoria para montar grupos.", "warning")
    return
  }

  const shuffled = shuffle(registrationsForCategory)
  const sizes = buildGroupSizes(shuffled.length, groupSize)
  const groups: ChampionshipGroup[] = []
  let cursor = 0

  sizes.forEach((size, index) => {
    groups.push({
      id: `${category}-${index + 1}`,
      name: `Grupo ${index + 1}`,
      playerIds: shuffled.slice(cursor, cursor + size).map((registration) => registration.id)
    })
    cursor += size
  })

  try {
    await saveChampionshipCategoryState(category, {
      groupSize,
      groups,
      defined: false,
      started: false,
      queue: [],
      completedMatches: [],
      activeTables: normalizeTables([], getCategoryState(category).tableCount ?? 1)
    })
    renderPage()
  } catch (error: any) {
    showToast("Erro ao sortear grupos: " + error.message, "error")
  }
}

;(window as any).openCategoryPage = async (category: ChampionshipCategory) => {
  if (!currentTournament) return

  const state = getCategoryState(category)
  if (!state.groups?.length) {
    showToast("Sorteie os grupos antes de abrir a categoria.", "warning")
    return
  }

  try {
    if (!state.defined) {
      await saveChampionshipCategoryState(category, {
        defined: true
      })
    }

    window.location.href = `/pages/championship-category.html?id=${currentTournament.id}&category=${encodeURIComponent(category)}`
  } catch (error: any) {
    showToast("Erro ao iniciar categoria: " + error.message, "error")
  }
}

;(window as any).openAddChampionshipAthleteModal = () => {
  openAddChampionshipAthleteModal()
}

;(window as any).closeAddChampionshipAthleteModal = () => {
  closeAddChampionshipAthleteModal()
}

;(window as any).openChampionshipResultsModal = () => {
  const modal = document.getElementById("championshipResultsModal") as HTMLElement | null
  if (!modal || !currentTournament) return
  openResultsCategory = getManageResultCategories(currentTournament)[0] ?? null
  openResultsGroupId = null
  renderChampionshipResultsModalContent(openResultsCategory ?? undefined)
  modal.style.display = "flex"
}

;(window as any).closeChampionshipResultsModal = () => {
  const modal = document.getElementById("championshipResultsModal") as HTMLElement | null
  if (modal) modal.style.display = "none"
  openResultsCategory = null
  openResultsGroupId = null
}

;(window as any).setChampionshipResultsCategory = (value: string) => {
  const normalizedCategory = normalizeChampionshipCategory(value)
  if (!normalizedCategory) return
  openResultsCategory = normalizedCategory
  openResultsGroupId = null
  renderChampionshipResultsModalContent(normalizedCategory)
}

;(window as any).setChampionshipResultsGroup = (groupId: string) => {
  openResultsGroupId = groupId || null
  renderChampionshipResultsModalContent(openResultsCategory ?? undefined)
}

;(window as any).confirmFinalizeChampionshipTournament = async () => {
  if (!currentTournament) return
  if (currentTournament.status === "finished") {
    showToast("Este campeonato ja esta finalizado.", "warning")
    return
  }

  const finalizeButton = document.getElementById("championshipFinalizeButton") as HTMLButtonElement | null

  try {
    if (finalizeButton) {
      finalizeButton.disabled = true
      finalizeButton.textContent = "Finalizando..."
    }

    await finalizeChampionshipTournament()
    renderPage()
    renderChampionshipResultsModalContent(openResultsCategory ?? undefined)
    showToast("Campeonato finalizado com sucesso.", "success")
  } catch (error: any) {
    if (finalizeButton) {
      finalizeButton.disabled = false
      finalizeButton.textContent = "Finalizar torneio"
    }
    showToast("Erro ao finalizar campeonato: " + error.message, "error")
  }
}

;(window as any).filterChampionshipAthletes = () => {
  const search = (document.getElementById("championshipAthleteSearch") as HTMLInputElement | null)?.value ?? ""
  renderChampionshipAthleteSearchResults(search)
}

;(window as any).selectChampionshipAthleteCandidate = (userId: string) => {
  selectedChampionshipAthleteId = userId
  renderSelectedChampionshipAthleteSummary()
  const search = (document.getElementById("championshipAthleteSearch") as HTMLInputElement | null)?.value ?? ""
  renderChampionshipAthleteSearchResults(search)
}

;(window as any).submitExistingChampionshipAthlete = async () => {
  if (!selectedChampionshipAthleteId) {
    showToast("Selecione um atleta existente antes de adicionar.", "warning")
    return
  }

  const selected = allUsers.find((entry) => entry.id === selectedChampionshipAthleteId)
  const category = getChampionshipAddCategory()
  const paymentStatus = getChampionshipAddPaymentStatus()

  if (!selected || !category) {
    showToast("Selecione o atleta e a categoria do campeonato.", "warning")
    return
  }

  if (getTournamentRegistrationByUserId(selected.id)) {
    showToast("Esse atleta ja possui inscricao neste campeonato.", "warning")
    return
  }

  if (isChampionshipCategoryFull(category)) {
    showToast("Essa categoria ja atingiu o limite de inscritos.", "warning")
    return
  }

  try {
    await saveChampionshipRegistration(selected, category, paymentStatus)
    await loadRegistrations()
    renderPage()
    closeAddChampionshipAthleteModal()
    const redrawNote = getCategoryState(category).groups?.length
      ? " Refaça a distribuicao da categoria se os grupos ja estavam sorteados."
      : ""
    showToast(
      `${paymentStatus === "approved" ? "Atleta inscrito com sucesso." : "Atleta adicionado com pagamento pendente."}${redrawNote}`,
      "success"
    )
  } catch (error: any) {
    showToast("Erro ao adicionar atleta: " + error.message, "error")
  }
}

;(window as any).createAndAddChampionshipAthlete = async () => {
  const category = getChampionshipAddCategory()
  const paymentStatus = getChampionshipAddPaymentStatus()

  if (!category) {
    showToast("Selecione a categoria do campeonato antes de cadastrar.", "warning")
    return
  }

  if (isChampionshipCategoryFull(category)) {
    showToast("Essa categoria ja atingiu o limite de inscritos.", "warning")
    return
  }

  try {
    const user = await createLooseChampionshipUser()
    await saveChampionshipRegistration(user, category, paymentStatus)
    await loadUsers()
    await loadRegistrations()
    renderPage()
    closeAddChampionshipAthleteModal()
    const redrawNote = getCategoryState(category).groups?.length
      ? " Refaça a distribuicao da categoria se os grupos ja estavam sorteados."
      : ""
    showToast(
      `${paymentStatus === "approved" ? "Novo atleta cadastrado e inscrito." : "Novo atleta cadastrado com pagamento pendente."}${redrawNote}`,
      "success"
    )
  } catch (error: any) {
    showToast("Erro ao cadastrar atleta: " + error.message, "error")
  }
}

;(window as any).openTournamentRegistrations = () => {
  if (!currentTournament) return
  window.location.href = `/pages/tournament-registrations.html?id=${currentTournament.id}`
}

;(window as any).editCurrentTournament = () => {
  if (!currentTournament) return
  window.location.href = `/pages/tournament-form.html?id=${currentTournament.id}`
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).openProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (checked) return
  checked = true

  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  const userSnapshot = await getDoc(doc(db, "users", user.uid))
  const userData = redirectByRole(userSnapshot.data() as User | undefined)
  if (!userData) return

  setUserHeader(userData)
  await loadTournament()
  await loadUsers()
  await loadRegistrations()
  renderPage()
})
