import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentRegistration, UpcomingTournament, User, UserTournamentRegistration } from "./types"
import {
  formatRegistrationCategories,
  getAllowedRegistrationCategories,
  getTournamentType,
  getRegistrationFeeForSelection,
  isRankingTournament,
  isValidChampionshipSelection
} from "./tournament-rules"

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
  if (!value) return "Não informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value)
}

function formatDateRange(startDate?: number, endDate?: number) {
  if (!startDate) return "Não informado"
  if (!endDate || endDate === startDate) return formatDate(startDate)
  return `${formatDate(startDate)} ate ${formatDate(endDate)}`
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Não informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
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

  if (!modal || !text || !options || !currentTournament) return

  const categories = getAllowedRegistrationCategories(currentTournament, currentUserProfile?.category)
  if (!categories.length) {
    alert("Sua categoria atual não permite inscrição neste torneio.")
    return
  }

  text.textContent = isRankingTournament(currentTournament)
    ? `Escolha a categoria do ranking para se inscrever em ${currentTournament.title}.`
    : `Escolha uma ou duas categorias para se inscrever em ${currentTournament.title}.`

  options.innerHTML = categories
    .map(
      (category, index) => `
        <label class="checkbox-option registration-option">
          <input type="${isRankingTournament(currentTournament) ? "radio" : "checkbox"}" name="registrationCategory" value="${category}" ${index === 0 ? "checked" : ""}>
          <span>${category}</span>
        </label>
      `
    )
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

  if (!titleEl || !subtitleEl || !infoEl || !descriptionEl || !rankingCard || !rankingList || !registrationEl || !currentTournament) {
    return
  }

  titleEl.textContent = currentTournament.title
  subtitleEl.textContent = `${currentTournament.location || "Local a definir"} - confira as informacoes antes de seguir para a inscrição.`

  infoEl.innerHTML = `
    <div class="info-card"><span>Tipo</span><strong>${getTournamentType(currentTournament) === "ranking" ? "Ranking" : "Campeonato"}</strong></div>
    <div class="info-card"><span>Data</span><strong>${formatDateRange(currentTournament.startDate, currentTournament.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${currentTournament.location || "Local a definir"}</strong></div>
    <div class="info-card"><span>Inscricoes ate</span><strong>${formatDate(currentTournament.registrationDeadline)}</strong></div>
    <div class="info-card"><span>Valor</span><strong>${formatCurrency(currentTournament.registrationFee)}</strong></div>
    <div class="info-card"><span>Status</span><strong>${isRegistrationClosed(currentTournament) ? "Inscricoes encerradas" : "Inscricoes abertas"}</strong></div>
  `

  descriptionEl.innerHTML = `<p>${currentTournament.description || "Texto do torneio ainda não definido. Depois você pode editar essa apresentacao no cadastro do torneio."}</p>`

  if (isRankingTournament(currentTournament)) {
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
      : '<div class="empty-state">Ainda não há inscritos confirmados neste ranking.</div>'
  } else {
    rankingCard.style.display = "none"
  }

  const buttonLabel =
    currentRegistrationStatus === "approved"
      ? "Inscrito"
      : currentRegistrationStatus === "pending_payment"
        ? currentRegistrationMethod === "pay_on_day"
          ? "Pagar no dia - pendente"
          : "Pagamento em analise"
        : "Inscreva-se"

  const pixAvailable = Boolean(currentTournament.pixKey && currentTournament.pixHolder)

  registrationEl.innerHTML = `
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${buttonLabel}</strong>
          <span>${isRankingTournament(currentTournament) ? "Ranking com visao completa dos inscritos e das informacoes do evento." : "Campeonato com informacoes gerais antes de seguir para a inscrição."}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Pix: ${pixAvailable ? "Disponivel" : "Ainda não configurado"}</span>
        <span>Favorecido: ${currentTournament.pixHolder || "Não informado"}</span>
        <span>Pagamento no dia: disponivel</span>
        <span>Status da inscrição: ${currentRegistrationStatus === "pending_payment" ? "pendente de aprovacao" : currentRegistrationStatus === "approved" ? "aprovada" : "não enviada"}</span>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${currentRegistrationStatus ? "disabled" : ""}
          ${isRegistrationClosed(currentTournament) ? "disabled" : ""}
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
  if (!currentTournament || !currentUserProfile) return

  const registrationCategoryLabel = formatRegistrationCategories(selectedCategories)
  const registrationFee = getRegistrationFeeForSelection(currentTournament, selectedCategories)
  const now = Date.now()

  const registrationPayload: TournamentRegistration = {
    id: currentUserProfile.id,
    uid: currentUserProfile.id,
    name: currentUserProfile.name,
    email: currentUserProfile.email,
    club: currentUserProfile.club,
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod,
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: currentTournament.id,
    tournamentId: currentTournament.id,
    title: currentTournament.title,
    location: currentTournament.location ?? "",
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod,
    startDate: currentTournament.startDate,
    endDate: currentTournament.endDate,
    registrationDeadline: currentTournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  const batch = writeBatch(db)
  batch.set(doc(db, "tournaments", currentTournament.id, "registrations", currentUserProfile.id), registrationPayload)
  batch.set(doc(db, "users", currentUserProfile.id, "registrations", currentTournament.id), userRegistrationPayload)
  await batch.commit()
}

;(window as any).confirmTournamentRegistration = async (paymentMethod: "pix" | "pay_on_day") => {
  if (!currentTournament || !currentUserProfile) return

  const selectedCategories = getSelectedRegistrationCategories()
  if (!selectedCategories.length) {
    alert("Escolha pelo menos uma categoria para concluir a inscrição.")
    return
  }

  if (!isRankingTournament(currentTournament) && !isValidChampionshipSelection(currentUserProfile.category, selectedCategories)) {
    alert("Sua selecao de categorias não e válida para o Campeonato.")
    return
  }

  if (paymentMethod === "pix") {
    if (!currentTournament.pixKey || !currentTournament.pixHolder) {
      alert("Este torneio ainda não esta configurado para pagamento Pix.")
      return
    }

    ;(window as any).closeRegistrationModal()
    const categoriesParam = encodeURIComponent(selectedCategories.join(","))
    window.location.href = `/pages/payment-pix.html?tournamentId=${encodeURIComponent(currentTournament.id)}&categories=${categoriesParam}`
    return
  }

  try {
    await createPendingRegistration("pay_on_day", selectedCategories)
    ;(window as any).closeRegistrationModal()
    alert("Inscricao registrada com pagamento no dia. Ela ficara pendente de aprovacao pela organizacao.")
    window.location.href = "/pages/profile.html"
  } catch (error: any) {
    alert("Erro ao registrar inscrição: " + error.message)
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
    alert("Não foi possível carregar os detalhes do torneio agora.")
    window.location.replace("/pages/profile.html")
  }
})
