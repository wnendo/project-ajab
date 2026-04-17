import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getDocs, collection, updateDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  ChampionshipCategory,
  ChampionshipCategoryState,
  ChampionshipGroup,
  TournamentRegistration,
  UpcomingTournament,
  User
} from "./types"
import {
  CHAMPIONSHIP_CATEGORIES,
  formatRegistrationCategories,
  getCategoryLimit,
  getCategoryRegistrationCount,
  getTournamentType
} from "./tournament-rules"
import { showToast } from "./toast"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []

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
                <div class="stack-list compact-stack-list">
                  ${state.finalStandings.slice(0, 4).map((playerId, index) => `
                    <div class="stack-item compact-stack-item">
                      <div class="stack-item-header">
                        <div>
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
  await loadRegistrations()
  renderPage()
})


