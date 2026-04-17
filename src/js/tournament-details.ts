import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentFinalStanding, TournamentRegistration, UpcomingTournament, User, UserTournamentRegistration } from "./types"
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
let rankingSearchTerm = ""
let athleteProfiles = new Map<string, User>()

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
  return `${formatDate(startDate)} até ${formatDate(endDate)}`
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Não informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function escapeHtml(value?: string) {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function getApprovedRegistrations() {
  return [...registrations]
    .filter((entry) => entry.paymentStatus === "approved")
    .sort((a, b) => a.name.localeCompare(b.name))
}

function getFilteredApprovedRegistrations() {
  const approved = getApprovedRegistrations()
  if (!rankingSearchTerm) {
    return approved
  }

  return approved.filter((entry) =>
    [entry.name, entry.club, entry.category, ...(entry.categories ?? [])]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(rankingSearchTerm))
  )
}

function getFinalStandingsByGroup(standings: TournamentFinalStanding[]) {
  const groups = Array.from(new Set(standings.map((entry) => entry.group)))
  return groups.map((group) => ({
    group,
    entries: standings.filter((entry) => entry.group === group)
  }))
}

function getFinalStandingsShowcase(entries: TournamentFinalStanding[]) {
  const podium = entries.slice(0, 3)

  return `
    <div class="ranking-showcase">
      <div class="ranking-showcase-podium">
        ${podium
          .map(
            (entry, index) => `
              <article class="ranking-showcase-podium-card place-${index + 1}">
                <span class="ranking-showcase-place">${escapeHtml(entry.placement)}</span>
                <strong>${escapeHtml(entry.name)}</strong>
                <small>${escapeHtml(entry.category)}</small>
                <div class="ranking-showcase-score">${entry.wins}V - ${entry.losses}D - ${entry.games} jogos</div>
              </article>
            `
          )
          .join("")}
      </div>
      <div class="ranking-showcase-table">
        ${entries
          .map(
            (entry) => `
              <div class="ranking-showcase-row">
                <span>${escapeHtml(entry.placement)}</span>
                <strong>${escapeHtml(entry.name)}</strong>
                <small>${escapeHtml(entry.result)}</small>
                <span>${entry.wins}V / ${entry.losses}D</span>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `
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
  if (entry.status === "finished" || entry.status === "closed") return true
  if (entry.status === "open") return false
  if (entry.registrationDeadline && entry.registrationDeadline < Date.now()) return true
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
    showToast("Sua categoria atual não permite inscrição neste torneio.", "warning")
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

function renderRankingRegistrations() {
  const rankingList = document.getElementById("rankingRegistrationsList")
  const rankingCount = document.getElementById("rankingRegistrationsCount")
  if (!rankingList || !rankingCount) return

  const filteredRegistrations = getFilteredApprovedRegistrations()
  const totalApproved = getApprovedRegistrations().length
  rankingCount.textContent = `${filteredRegistrations.length} de ${totalApproved} atletas`

  rankingList.innerHTML = filteredRegistrations.length
    ? filteredRegistrations
        .map(
          (entry) => `
            <div class="stack-item compact-stack-item ranking-registration-item">
              <div class="stack-item-header">
                <div>
                  <strong>${escapeHtml(entry.name)}</strong>
                  <span>${escapeHtml(entry.club || "Sem clube")}</span>
                </div>
                <span class="result-pill neutral">${escapeHtml(entry.category || "Categoria")}</span>
              </div>
              <div class="admin-tournament-actions">
                <button class="btn secondary" onclick="openRegisteredAthleteProfile('${entry.id}')">Ver perfil</button>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state">Nenhum atleta encontrado nesta busca.</div>'
}

function renderFinalStandingsCard() {
  const resultsCard = document.getElementById("tournamentResultsCard")
  const resultsList = document.getElementById("tournamentResultsList")
  if (!resultsCard || !resultsList || !currentTournament?.finalStandings?.length) {
    if (resultsCard) resultsCard.style.display = "none"
    return
  }

  resultsCard.style.display = "block"
  resultsList.innerHTML = getFinalStandingsByGroup(currentTournament.finalStandings)
    .map(
      ({ group, entries }) => `
        <div class="tournament-results-group">
          <div class="section-header compact-section-header">
            <div>
              <span class="section-label">${group === "general" ? "Ranking geral" : `Categoria ${group}`}</span>
              <h3>${entries[0]?.result || "Classificação final"}</h3>
            </div>
          </div>
          ${getFinalStandingsShowcase(entries)}
        </div>
      `
    )
    .join("")
}

function renderFinalStandingsModal() {
  const modalList = document.getElementById("tournamentResultsModalList")
  if (!modalList || !currentTournament?.finalStandings?.length) return

  modalList.innerHTML = getFinalStandingsByGroup(currentTournament.finalStandings)
    .map(
      ({ group, entries }) => `
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${group === "general" ? "Ranking geral" : `Categoria ${group}`}</span>
            <strong>${entries.length} atleta${entries.length === 1 ? "" : "s"}</strong>
          </div>
          ${getFinalStandingsShowcase(entries)}
        </section>
      `
    )
    .join("")
}

function renderAthleteProfileModal(userId: string) {
  const modal = document.getElementById("registeredAthleteProfileModal") as HTMLElement | null
  const content = document.getElementById("registeredAthleteProfileContent") as HTMLElement | null
  const athlete = athleteProfiles.get(userId)
  const registration = registrations.find((entry) => entry.id === userId || entry.uid === userId)
  if (!modal || !content || !athlete) {
    showToast("Nao foi possivel carregar o perfil deste atleta.", "warning")
    return
  }

  const avatar = athlete.photoURL
    ? `<img class="profile-avatar" src="${escapeHtml(athlete.photoURL)}" alt="Foto de ${escapeHtml(athlete.name)}">`
    : `<div class="profile-avatar profile-avatar-fallback">${escapeHtml(getInitials(athlete.name))}</div>`

  content.innerHTML = `
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${avatar}</div>
        <div class="athlete-profile-copy">
          <h3>${escapeHtml(athlete.name)}</h3>
          <p>${escapeHtml(athlete.club || "Sem clube")} - ${escapeHtml(athlete.category || "Sem categoria")}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${escapeHtml(registration?.category || "Categoria")}</span>
            <span class="result-pill win">Inscricao confirmada</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${escapeHtml(athlete.email || "Nao informado")}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${escapeHtml(athlete.phone || "Nao informado")}</strong></div>
        <div class="info-card"><span>Clube</span><strong>${escapeHtml(athlete.club || "Nao informado")}</strong></div>
        <div class="info-card"><span>Categoria base</span><strong>${escapeHtml(athlete.category || "Nao informada")}</strong></div>
        <div class="info-card"><span>Categoria no torneio</span><strong>${escapeHtml(registration?.category || "Nao informada")}</strong></div>
        <div class="info-card"><span>Cadastro</span><strong>${formatDate(athlete.createdAt)}</strong></div>
      </div>
    </div>
  `

  modal.style.display = "flex"
}

function renderTournamentInfo() {
  const titleEl = document.getElementById("tournamentDetailsTitle")
  const subtitleEl = document.getElementById("tournamentDetailsSubtitle")
  const infoEl = document.getElementById("tournamentDetailsInfo")
  const descriptionEl = document.getElementById("tournamentDetailsDescription")
  const rankingCard = document.getElementById("rankingRegistrationsCard")
  const registrationEl = document.getElementById("tournamentDetailsRegistration")
  const tournament = currentTournament

  if (!titleEl || !subtitleEl || !infoEl || !descriptionEl || !rankingCard || !registrationEl || !tournament) {
    return
  }

  titleEl.textContent = tournament.title
  subtitleEl.textContent = `${tournament.location || "Local a definir"} - confira as informações antes de seguir para a inscrição.`

  infoEl.innerHTML = `
    <div class="info-card"><span>Tipo</span><strong>${getTournamentType(tournament) === "ranking" ? "Ranking" : "Campeonato"}</strong></div>
    <div class="info-card"><span>Data</span><strong>${formatDateRange(tournament.startDate, tournament.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${tournament.location || "Local a definir"}</strong></div>
    <div class="info-card"><span>Status</span><strong>${tournament.status === "finished" ? "Finalizado" : isRegistrationClosed(tournament) ? "Inscrições encerradas" : "Inscrições abertas"}</strong></div>
  `

  descriptionEl.innerHTML = `<p>${tournament.description || "Texto do torneio ainda não definido. Depois você pode editar essa apresentação no cadastro do torneio."}</p>`

  if (isRankingTournament(tournament)) {
    rankingCard.style.display = "block"
    renderRankingRegistrations()
    renderFinalStandingsCard()
    renderFinalStandingsModal()
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
          : "Pagamento em análise"
        : !hasAvailableCategory
          ? "Categoria lotada"
          : "Inscreva-se"

  const pixAvailable = Boolean(tournament.pixKey && tournament.pixHolder)

  registrationEl.innerHTML = `
    <div class="stack-item tournament-registration-panel">
      <div class="stack-item-header">
        <div>
          <strong>${buttonLabel}</strong>
          <span>${isRankingTournament(tournament) ? "Inscrição do ranking com categoria, prazo, pagamento e status atual." : "Confira as regras da inscrição antes de concluir sua vaga."}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Valor: ${getTournamentFeeLabel(tournament)}</span>
        <span>Inscrições até: ${formatDate(tournament.registrationDeadline)}</span>
        <span>Pix: ${pixAvailable ? "Disponível" : "Ainda não configurado"}</span>
        <span>Favorecido: ${tournament.pixHolder || "Não informado"}</span>
        <span>Chave Pix: ${tournament.pixKey || "Não informada"}</span>
        <span>Pagamento no dia: disponível</span>
        <span>Status da inscrição: ${currentRegistrationStatus === "pending_payment" ? "pendente de aprovação" : currentRegistrationStatus === "approved" ? "aprovada" : "não enviada"}</span>
      </div>
      <div class="schema-note registration-note">
        <p>${isRankingTournament(tournament) ? "Cada atleta joga contra todos da mesma categoria e não há repetição de confronto. Se entrar um novo inscrito depois, apenas os duelos inéditos voltam para a fila." : "Selecione as categorias permitidas para o seu perfil e conclua a inscrição pelo método desejado."}</p>
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

  const approvedEntries = registrations.filter((entry) => entry.paymentStatus === "approved")
  const approvedProfiles = await Promise.all(
    approvedEntries.map(async (entry) => {
      const snapshot = await getDoc(doc(db, "users", entry.id))
      return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as User) : null
    })
  )
  athleteProfiles = new Map(approvedProfiles.filter(Boolean).map((entry) => [entry!.id, entry!]))

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

;(window as any).openRegisteredAthleteProfile = (userId: string) => {
  renderAthleteProfileModal(userId)
}

;(window as any).closeRegisteredAthleteProfileModal = () => {
  const modal = document.getElementById("registeredAthleteProfileModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

;(window as any).filterRankingRegistrations = () => {
  const input = document.getElementById("rankingRegistrationsSearch") as HTMLInputElement | null
  rankingSearchTerm = input?.value.trim().toLowerCase() ?? ""
  renderRankingRegistrations()
}

;(window as any).openTournamentResultsModal = () => {
  renderFinalStandingsModal()
  const modal = document.getElementById("tournamentResultsModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "flex"
  }
}

;(window as any).closeTournamentResultsModal = () => {
  const modal = document.getElementById("tournamentResultsModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
}

;(window as any).startRegistrationFlow = () => {
  if (!currentTournament || currentRegistrationStatus) return
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
    showToast("Uma das categorias selecionadas já atingiu o limite de inscritos.", "warning")
    return
  }

  if (paymentMethod === "pix") {
    if (!tournament.pixKey || !tournament.pixHolder) {
      showToast("Este torneio ainda não está configurado para pagamento Pix.", "warning")
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
    redirectWithToast("/pages/profile.html", "Não foi possível carregar os detalhes do torneio agora.", "error")
    window.location.replace("/pages/profile.html")
  }
})
