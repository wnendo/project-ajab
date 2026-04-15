import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentRegistration, UpcomingTournament, User, UserTournamentRegistration } from "./types"
import {
  formatRegistrationCategories,
  getAllowedRegistrationCategories,
  getCategoryLimit,
  getCategoryRegistrationCount,
  getRegistrationFeeForSelection,
  getTournamentType,
  isCategoryFull,
  isRankingTournament,
  isValidChampionshipSelection
} from "./tournament-rules"
import { redirectWithToast, showToast } from "./toast"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let currentUserProfile: User | null = null
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []
let currentRegistrationStatus: UserTournamentRegistration["paymentStatus"] | null = null
let currentRegistrationMethod: UserTournamentRegistration["paymentMethod"] | null = null

function getSelectedRegistrationCategories() {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[name="registrationCategory"]:checked'))
    .map((input) => input.value.trim())
    .filter(Boolean)
}

function formatDate(value?: number) {
  if (!value) return "Nao informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value)
}

function formatDateRange(startDate?: number, endDate?: number) {
  if (!startDate) return "Nao informado"
  if (!endDate || endDate === startDate) return formatDate(startDate)
  return `${formatDate(startDate)} ate ${formatDate(endDate)}`
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Nao informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getTournamentFeeLabel(entry: UpcomingTournament) {
  if (isRankingTournament(entry)) {
    return formatCurrency(entry.registrationFee)
  }

  if (entry.doubleRegistrationFee !== undefined) {
    return `${formatCurrency(entry.registrationFee)} (1 cat.) / ${formatCurrency(entry.doubleRegistrationFee)} (2 cats.)`
  }

  return formatCurrency(entry.registrationFee)
}

function isRegistrationClosed(entry: UpcomingTournament) {
  if (entry.status === "finished" || entry.status === "closed") {
    return true
  }

  if (entry.status === "open") {
    return false
  }

  if (entry.registrationDeadline && entry.registrationDeadline < Date.now()) {
    return true
  }

  return false
}

function openRegistrationModal() {
  const modal = document.getElementById("registrationModal") as HTMLElement | null
  const text = document.getElementById("registrationModalText") as HTMLElement | null
  const options = document.getElementById("registrationCategoryOptions") as HTMLElement | null
  const tournament = currentTournament

  if (!modal || !text || !options || !tournament) return

  const categories = getAllowedRegistrationCategories(tournament, currentUserProfile?.category)
  if (!categories.length) {
    showToast("Sua categoria atual nao permite inscrição neste torneio.", "warning")
    return
  }

  text.textContent = isRankingTournament(tournament)
    ? `Escolha a categoria do ranking para se inscrever em ${tournament.title}.`
    : `Escolha uma ou duas categorias para se inscrever em ${tournament.title}.`

  options.innerHTML = categories
    .map((category, index) => {
      const full = isCategoryFull(tournament, registrations, category)
      const count = getCategoryRegistrationCount(registrations, category)
      const limit = getCategoryLimit(tournament, category)
      return `
        <label class="checkbox-option registration-option">
          <input type="${isRankingTournament(tournament) ? "radio" : "checkbox"}" name="registrationCategory" value="${category}" ${index === 0 && !full ? "checked" : ""} ${full ? "disabled" : ""}>
          <span>${category}${limit ? ` (${count}/${limit})` : ""}${full ? " - lotada" : ""}</span>
        </label>
      `
    })
    .join("")

  modal.style.display = "flex"
}

function renderTournamentInfo() {
  const titleEl = document.getElementById("tournamentDetailsTitle")
  const subtitleEl = document.getElementById("tournamentDetailsSubtitle")
  const infoEl = document.getElementById("tournamentDetailsInfo")
  const descriptionEl = document.getElementById("tournamentDetailsDescription")
  const rankingCard = document.getElementById("rankingRegistrationsCard")
  const rankingList = document.getElementById("rankingRegistrationsList")
  const registrationEl = document.getElementById("tournamentDetailsRegistration")
  const tournament = currentTournament

  if (!titleEl || !subtitleEl || !infoEl || !descriptionEl || !rankingCard || !rankingList || !registrationEl || !tournament) {
    return
  }

  titleEl.textContent = tournament.title
  subtitleEl.textContent = `${tournament.location || "Local a definir"} - confira as informacoes antes de seguir para a inscrição.`

  infoEl.innerHTML = `
    <div class="info-card"><span>Tipo</span><strong>${getTournamentType(tournament) === "ranking" ? "Ranking" : "Campeonato"}</strong></div>
    <div class="info-card"><span>Data</span><strong>${formatDateRange(tournament.startDate, tournament.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${tournament.location || "Local a definir"}</strong></div>
    <div class="info-card"><span>Inscricoes ate</span><strong>${formatDate(tournament.registrationDeadline)}</strong></div>
    <div class="info-card"><span>Valor</span><strong>${getTournamentFeeLabel(tournament)}</strong></div>
    <div class="info-card"><span>Status</span><strong>${isRegistrationClosed(tournament) ? "Inscricoes encerradas" : "Inscricoes abertas"}</strong></div>
  `

  descriptionEl.innerHTML = `<p>${tournament.description || "Texto do torneio ainda nao definido. Depois voce pode editar essa apresentação no cadastro do torneio."}</p>`

  if (isRankingTournament(tournament)) {
    rankingCard.style.display = "block"
    rankingList.innerHTML = registrations.length
      ? [...registrations]
          .filter((entry) => entry.paymentStatus === "approved")
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(
            (entry) => `
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${entry.name}</strong>
                    <span>${entry.club || "Sem clube"}</span>
                  </div>
                  <span class="result-pill win">${entry.category || "Categoria"}</span>
                </div>
              </div>
            `
          )
          .join("")
      : '<div class="empty-state">Ainda nao ha inscritos confirmados neste ranking.</div>'
  } else {
    rankingCard.style.display = "none"
  }

  const allowedCategories = getAllowedRegistrationCategories(tournament, currentUserProfile?.category)
  const hasAvailableCategory = allowedCategories.some((category) => !isCategoryFull(tournament, registrations, category))

  const buttonLabel =
    currentRegistrationStatus === "approved"
      ? "Inscrito"
      : currentRegistrationStatus === "pending_payment"
        ? currentRegistrationMethod === "pay_on_day"
          ? "Pagar no dia - pendente"
          : "Pagamento em analise"
        : !hasAvailableCategory
          ? "Categoria lotada"
          : "Inscreva-se"

  const pixAvailable = Boolean(tournament.pixKey && tournament.pixHolder)

  registrationEl.innerHTML = `
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${buttonLabel}</strong>
          <span>${isRankingTournament(tournament) ? "Ranking com visao completa dos inscritos e das informacoes do evento." : "Campeonato com informacoes gerais antes de seguir para a inscrição."}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Valor: ${getTournamentFeeLabel(tournament)}</span>
        <span>Pix: ${pixAvailable ? "Disponivel" : "Ainda nao configurado"}</span>
        <span>Favorecido: ${tournament.pixHolder || "Nao informado"}</span>
        <span>Pagamento no dia: disponivel</span>
        <span>Status da inscrição: ${currentRegistrationStatus === "pending_payment" ? "pendente de aprovação" : currentRegistrationStatus === "approved" ? "aprovada" : "nao enviada"}</span>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${currentRegistrationStatus ? "disabled" : ""}
          ${isRegistrationClosed(tournament) || !hasAvailableCategory ? "disabled" : ""}
        >
          ${buttonLabel}
        </button>
      </div>
    </div>
  `
}

async function loadPageData(uid: string) {
  if (!tournamentId) {
    window.location.replace("/pages/profile.html")
    return
  }

  const [userSnapshot, tournamentSnapshot, registrationSnapshot, userRegistrationSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "tournaments", tournamentId)),
    getDocs(collection(db, "tournaments", tournamentId, "registrations")),
    getDoc(doc(db, "users", uid, "registrations", tournamentId))
  ])

  if (!userSnapshot.exists() || !tournamentSnapshot.exists()) {
    window.location.replace("/pages/profile.html")
    return
  }

  currentUserProfile = { id: userSnapshot.id, ...userSnapshot.data() } as User
  currentTournament = { id: tournamentSnapshot.id, ...tournamentSnapshot.data() } as UpcomingTournament
  registrations = registrationSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
  currentRegistrationStatus = userRegistrationSnapshot.exists()
    ? (userRegistrationSnapshot.data() as UserTournamentRegistration).paymentStatus
    : null
  currentRegistrationMethod = userRegistrationSnapshot.exists()
    ? (userRegistrationSnapshot.data() as UserTournamentRegistration).paymentMethod ?? null
    : null

  renderTournamentInfo()
}

;(window as any).goBackToProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).closeRegistrationModal = () => {
  const modal = document.getElementById("registrationModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

;(window as any).startRegistrationFlow = () => {
  if (!currentTournament) return

  if (currentRegistrationStatus) {
    return
  }

  openRegistrationModal()
}

async function createPendingRegistration(paymentMethod: "pix" | "pay_on_day", selectedCategories: string[]) {
  const tournament = currentTournament
  const userProfile = currentUserProfile

  if (!tournament || !userProfile) return

  if (selectedCategories.some((category) => isCategoryFull(tournament, registrations, category))) {
    throw new Error("Uma das categorias selecionadas atingiu o limite de inscritos.")
  }

  const registrationCategoryLabel = formatRegistrationCategories(selectedCategories)
  const registrationFee = getRegistrationFeeForSelection(tournament, selectedCategories)
  const now = Date.now()

  const registrationPayload: TournamentRegistration = {
    id: userProfile.id,
    uid: userProfile.id,
    name: userProfile.name,
    email: userProfile.email,
    club: userProfile.club,
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod,
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: tournament.id,
    tournamentId: tournament.id,
    title: tournament.title,
    location: tournament.location ?? "",
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    registrationDeadline: tournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  const batch = writeBatch(db)
  batch.set(doc(db, "tournaments", tournament.id, "registrations", userProfile.id), registrationPayload)
  batch.set(doc(db, "users", userProfile.id, "registrations", tournament.id), userRegistrationPayload)
  await batch.commit()
}

;(window as any).confirmTournamentRegistration = async (paymentMethod: "pix" | "pay_on_day") => {
  const tournament = currentTournament
  const userProfile = currentUserProfile

  if (!tournament || !userProfile) return

  const selectedCategories = getSelectedRegistrationCategories()
  if (!selectedCategories.length) {
    showToast("Escolha pelo menos uma categoria para concluir a inscrição.", "warning")
    return
  }

  if (!isRankingTournament(tournament) && !isValidChampionshipSelection(userProfile.category, selectedCategories)) {
    showToast("Sua seleção de categorias não é válida para o Campeonato.", "warning")
    return
  }

  if (selectedCategories.some((category) => isCategoryFull(tournament, registrations, category))) {
    showToast("Uma das categorias selecionadas ja atingiu o limite de inscritos.", "warning")
    return
  }

  if (paymentMethod === "pix") {
    if (!tournament.pixKey || !tournament.pixHolder) {
      showToast("Este torneio ainda nao esta configurado para pagamento Pix.", "warning")
      return
    }

    ;(window as any).closeRegistrationModal()
    const categoriesParam = encodeURIComponent(selectedCategories.join(","))
    window.location.href = `/pages/payment-pix.html?tournamentId=${encodeURIComponent(tournament.id)}&categories=${categoriesParam}`
    return
  }

  try {
    await createPendingRegistration("pay_on_day", selectedCategories)
    ;(window as any).closeRegistrationModal()
    redirectWithToast("/pages/profile.html", "Inscrição registrada com pagamento no dia. Ela ficará pendente de aprovação pela organização.", "success")
    window.location.replace("/pages/profile.html")
  } catch (error: any) {
    showToast("Erro ao registrar inscrição: " + error.message, "error")
  }
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadPageData(user.uid)
  } catch (error) {
    console.error("Erro ao carregar detalhes do torneio:", error)
    redirectWithToast("/pages/profile.html", "Nao foi possivel carregar os detalhes do torneio agora.", "error")
    window.location.replace("/pages/profile.html")
  }
})
