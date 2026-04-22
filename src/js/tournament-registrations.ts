import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getDocs, collection, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { ChampionshipCategory, ChampionshipCategoryState, ChampionshipTable, TournamentRegistration, UpcomingTournament, User } from "./types"
import { CHAMPIONSHIP_CATEGORIES, getTournamentType } from "./tournament-rules"
import { confirmAction } from "./confirm-modal"
import { showToast } from "./toast"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []
let refreshInterval: number | null = null
let pendingApprovalUserId: string | null = null

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

async function requireAdminUserData(firebaseUserId: string) {
  const snapshot = await getDoc(doc(db, "users", firebaseUserId))
  const userData = snapshot.data() as User | undefined
  return redirectByRole(userData)
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Não informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function formatRegistrationCategories(registration: TournamentRegistration) {
  if (Array.isArray(registration.categories) && registration.categories.length) {
    return registration.categories.join(", ")
  }

  return registration.category || "Não informada"
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

function getAdminAvailableChampionshipCategories() {
  if (!currentTournament?.categories?.length) {
    return CHAMPIONSHIP_CATEGORIES
  }

  const normalized = currentTournament.categories
    .map((entry) => normalizeChampionshipCategory(entry))
    .filter(Boolean) as ChampionshipCategory[]

  return normalized.length ? normalized : CHAMPIONSHIP_CATEGORIES
}

function normalizeChampionshipTables(tables: ChampionshipTable[] | undefined, tableCount: number) {
  return Array.from({ length: Math.max(1, tableCount) }, (_, index) => {
    const previous = tables?.[index]
    return {
      id: previous?.id ?? index + 1,
      ...(previous?.groupId ? { groupId: previous.groupId } : {})
    }
  })
}

function getHasPlayedMatches(state: ChampionshipCategoryState, groupId?: string) {
  return (state.completedMatches ?? []).some((match) => {
    if (!groupId) return true
    return match.groupId === groupId
  })
}

function removePlayerFromChampionshipState(
  tournament: UpcomingTournament,
  registration: TournamentRegistration
) {
  const nextState = { ...(tournament.championshipState ?? {}) }

  parseRegistrationCategories(registration).forEach((category) => {
    const previous = nextState[category]
    if (!previous) return

    const cleanedGroups = (previous.groups ?? [])
      .map((group) => ({
        ...group,
        playerIds: group.playerIds.filter((playerId) => playerId !== registration.id)
      }))
      .filter((group) => group.playerIds.length > 0)

    const removedGroupIds = new Set(
      (previous.groups ?? [])
        .filter((group) => group.playerIds.includes(registration.id))
        .map((group) => group.id)
    )

    const cleanedCompletedMatches = (previous.completedMatches ?? []).filter(
      (match) => !match.playerIds.includes(registration.id)
    )
    const cleanedQueue = (previous.queue ?? []).filter((match) => !match.playerIds.includes(registration.id))
    const cleanedTables = normalizeChampionshipTables(
      (previous.activeTables ?? []).map((table) =>
        table.match?.playerIds.includes(registration.id)
          ? { id: table.id, ...(table.groupId ? { groupId: table.groupId } : {}) }
          : table
      ),
      previous.tableCount ?? 1
    )
    const cleanedFinalStandings = (previous.finalStandings ?? []).filter((playerId) => playerId !== registration.id)

    const canRedrawGroups =
      removedGroupIds.size > 0 &&
      [...removedGroupIds].every((groupId) => !getHasPlayedMatches(previous, groupId))

    nextState[category] = canRedrawGroups
      ? {
          ...previous,
          defined: false,
          started: false,
          knockoutStarted: false,
          finished: false,
          groups: [],
          queue: [],
          activeTables: normalizeChampionshipTables([], previous.tableCount ?? 1),
          completedMatches: [],
          finalStandings: []
        }
      : {
          ...previous,
          groups: cleanedGroups,
          queue: cleanedQueue,
          activeTables: cleanedTables,
          completedMatches: cleanedCompletedMatches,
          finalStandings: cleanedFinalStandings,
          knockoutStarted: false,
          finished: false
        }
  })

  return nextState
}

function getPaymentMethodLabel(registration: TournamentRegistration) {
  return "Pix"
}

function getPaymentStatusLabel(registration: TournamentRegistration) {
  if (registration.paymentStatus === "approved") {
    return "Pagamento aprovado"
  }

  return "Aguardando análise"
}

function getApprovalModalSelectedCategories() {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[name="approveRegistrationCategory"]:checked'))
    .map((input) => normalizeChampionshipCategory(input.value))
    .filter(Boolean) as ChampionshipCategory[]
}

function openApproveRegistrationModal(userId: string) {
  const registration = registrations.find((entry) => entry.id === userId)
  const modal = document.getElementById("approveRegistrationModal") as HTMLElement | null
  const text = document.getElementById("approveRegistrationText") as HTMLElement | null
  const options = document.getElementById("approveRegistrationCategoryOptions") as HTMLElement | null
  if (!registration || !modal || !text || !options) return

  pendingApprovalUserId = userId
  const selectedCategories = parseRegistrationCategories(registration)
  const availableCategories = getAdminAvailableChampionshipCategories()
  const selectedLabel = selectedCategories.length ? selectedCategories.join(", ") : "Nenhuma categoria selecionada"

  text.textContent = `Confirme o pagamento de ${registration.name} e revise as categorias da inscrição.`
  text.innerHTML = `
    <strong>${registration.name}</strong><br>
    Categorias escolhidas na inscrição: ${selectedLabel}
  `
  options.innerHTML = availableCategories
    .map(
      (category) => `
        <label class="checkbox-option registration-option">
          <input
            type="checkbox"
            name="approveRegistrationCategory"
            value="${category}"
            ${selectedCategories.includes(category) ? "checked" : ""}
          >
          <span>Categoria ${category === "Iniciante" ? "Iniciante" : category}</span>
        </label>
      `
    )
    .join("")

  modal.style.display = "flex"
}

function closeApproveRegistrationModal() {
  const modal = document.getElementById("approveRegistrationModal") as HTMLElement | null
  if (!modal) return

  pendingApprovalUserId = null
  modal.style.display = "none"
}

async function approveRegistrationWithCategories(userId: string, selectedCategories?: ChampionshipCategory[]) {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  const normalizedCategories =
    getTournamentType(currentTournament) === "championship"
      ? selectedCategories && selectedCategories.length
        ? selectedCategories
        : parseRegistrationCategories(registration)
      : []

  const categoryLabel = normalizedCategories.length ? normalizedCategories.join(", ") : registration.category || ""

  const batch = writeBatch(db)
  batch.update(doc(db, "tournaments", currentTournament.id, "registrations", userId), {
    paymentStatus: "approved",
    ...(normalizedCategories.length
      ? {
          category: categoryLabel,
          categories: normalizedCategories,
          paymentMethod: "pix"
        }
      : {})
  })
  batch.update(doc(db, "users", userId, "registrations", currentTournament.id), {
    paymentStatus: "approved",
    ...(normalizedCategories.length
      ? {
          category: categoryLabel,
          categories: normalizedCategories,
          paymentMethod: "pix"
        }
      : {})
  })
  await batch.commit()
}

function getFilteredRegistrations() {
  const input = document.getElementById("registrationSearch") as HTMLInputElement | null
  const categoryFilter = document.getElementById("registrationCategoryFilter") as HTMLSelectElement | null
  const search = (input?.value ?? "").trim().toLowerCase()
  const selectedCategory = (categoryFilter?.value ?? "all").trim()
  const isChampionship = currentTournament ? getTournamentType(currentTournament) === "championship" : false

  return [...registrations]
    .filter((entry) => {
      if (!isChampionship || selectedCategory === "all") return true
      return parseRegistrationCategories(entry).includes(selectedCategory as ChampionshipCategory)
    })
    .filter((entry) => {
      if (!search) return true
      return [entry.name, entry.email, entry.club, entry.category].some((value) =>
        (value ?? "").toLowerCase().includes(search)
      )
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

function renderPage() {
  const titleEl = document.getElementById("registrationTournamentTitle") as HTMLElement | null
  const subtitleEl = document.getElementById("registrationTournamentSubtitle") as HTMLElement | null
  const totalEl = document.getElementById("registrationTotalCount") as HTMLElement | null
  const pendingEl = document.getElementById("registrationPendingCount") as HTMLElement | null
  const listEl = document.getElementById("registrationList") as HTMLElement | null
  const categoryFilter = document.getElementById("registrationCategoryFilter") as HTMLSelectElement | null
  if (!titleEl || !subtitleEl || !totalEl || !pendingEl || !listEl || !categoryFilter) return

  titleEl.textContent = currentTournament?.title || "Inscricoes"
  subtitleEl.textContent = currentTournament
    ? `${currentTournament.location || "Local a definir"} - acompanhe os pagamentos Pix e confirme as inscricoes.`
    : "Não foi possível carregar o torneio."

  const isChampionship = currentTournament ? getTournamentType(currentTournament) === "championship" : false
  categoryFilter.style.display = isChampionship ? "block" : "none"
  if (!isChampionship) {
    categoryFilter.value = "all"
  }

  totalEl.textContent = String(registrations.length)
  pendingEl.textContent = String(registrations.filter((entry) => entry.paymentStatus !== "approved").length)

  const filtered = getFilteredRegistrations()
  listEl.innerHTML = filtered.length
    ? filtered
        .map(
          (registration) => `
            <div class="stack-item ${registration.paymentStatus !== "approved" ? "pending-payment-item" : ""}">
              <div class="stack-item-header">
                <div>
                  <strong>${registration.name}</strong>
                  <span>${registration.email || "Email não informado"}</span>
                </div>
                <span class="result-pill ${registration.paymentStatus === "approved" ? "win" : "neutral"}">
                  ${getPaymentStatusLabel(registration)}
                </span>
              </div>
              <div class="stack-item-grid">
                <span>Clube: ${registration.club || "Não informado"}</span>
                <span>Categoria: ${formatRegistrationCategories(registration)}</span>
                <span>Valor: ${formatCurrency(registration.registrationFee)}</span>
                <span>Metodo: ${getPaymentMethodLabel(registration)}</span>
              </div>
              <div class="admin-tournament-actions">
                ${
                  registration.paymentStatus !== "approved"
                    ? `<button class="btn primary" onclick="approveRegistration('${registration.id}')">Aprovar pagamento</button>`
                    : `<button class="btn secondary" disabled>Pagamento aprovado</button>`
                }
                <button class="btn danger" onclick="removeRegistration('${registration.id}')">Remover inscrição</button>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state">Nenhuma inscrição encontrada para esse filtro.</div>'
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
}

async function loadRegistrations() {
  if (!currentTournament) {
    registrations = []
    return
  }

  const snapshot = await getDocs(collection(db, "tournaments", currentTournament.id, "registrations"))
  registrations = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
}

async function loadPageData() {
  await loadTournament()
  await loadRegistrations()
  renderPage()
}

;(window as any).filterRegistrations = () => {
  renderPage()
}

;(window as any).approveRegistration = async (userId: string) => {
  if (getTournamentType(currentTournament) !== "championship") {
    try {
      await approveRegistrationWithCategories(userId)
      await loadRegistrations()
      renderPage()
      showToast("Pagamento aprovado com sucesso.", "success")
    } catch (error: any) {
      showToast("Erro ao aprovar pagamento: " + error.message, "error")
    }
    return
  }

  openApproveRegistrationModal(userId)
}

;(window as any).closeApproveRegistrationModal = () => {
  closeApproveRegistrationModal()
}

;(window as any).confirmApproveRegistration = async () => {
  if (!currentTournament || !pendingApprovalUserId) return

  const registration = registrations.find((entry) => entry.id === pendingApprovalUserId)
  if (!registration) return

  const selectedCategories = getApprovalModalSelectedCategories()
  if (!selectedCategories.length) {
    showToast("Selecione pelo menos uma categoria para aprovar a inscrição.", "warning")
    return
  }

  if (!selectedCategories.every((category) => getAdminAvailableChampionshipCategories().includes(category))) {
    showToast("Selecione apenas categorias disponíveis neste campeonato.", "warning")
    return
  }

  try {
    await approveRegistrationWithCategories(pendingApprovalUserId, selectedCategories)
    closeApproveRegistrationModal()
    await loadRegistrations()
    renderPage()
    showToast("Pagamento aprovado e categorias atualizadas com sucesso.", "success")
  } catch (error: any) {
    showToast("Erro ao aprovar pagamento: " + error.message, "error")
  }
}

;(window as any).removeRegistration = async (userId: string) => {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  const confirmed = await confirmAction({
    title: "Remover inscrição",
    message: `Remover a inscrição de ${registration.name}?`,
    confirmLabel: "Remover",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    const batch = writeBatch(db)
    batch.delete(doc(db, "tournaments", currentTournament.id, "registrations", userId))
    batch.delete(doc(db, "users", userId, "registrations", currentTournament.id))
    if (getTournamentType(currentTournament) === "championship") {
      const nextChampionshipState = removePlayerFromChampionshipState(currentTournament, registration)
      batch.update(doc(db, "tournaments", currentTournament.id), {
        championshipState: nextChampionshipState,
        updatedAt: Date.now()
      })
      currentTournament = {
        ...currentTournament,
        championshipState: nextChampionshipState
      }
    }
    batch.update(doc(db, "users", userId), {
      "playerProfile.active": false,
      "playerProfile.games": 0,
      "playerProfile.wins": 0,
      "playerProfile.losses": 0,
      "playerProfile.lastPlayed": null
    })
    await batch.commit()
    await loadRegistrations()
    renderPage()
  } catch (error: any) {
    showToast("Erro ao remover inscrição: " + error.message, "error")
  }
}

;(window as any).goBackToTournament = () => {
  if (!currentTournament) {
    window.location.href = "/pages/dashboard.html"
    return
  }

  const managePage = getTournamentType(currentTournament) === "championship" ? "championship-manage" : "tournament-manage"
  window.location.href = `/pages/${managePage}.html?id=${currentTournament.id}`
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

  const data = await requireAdminUserData(user.uid)
  if (!data) return

  setUserHeader(data)
  await loadPageData()

  refreshInterval = window.setInterval(async () => {
    await loadRegistrations()
    renderPage()
  }, 15000)
})

window.addEventListener("beforeunload", () => {
  if (refreshInterval !== null) {
    window.clearInterval(refreshInterval)
    refreshInterval = null
  }
})
