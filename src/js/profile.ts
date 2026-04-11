import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { UpcomingTournament, User, UserMatchHistory, UserTournament, UserTournamentRegistration } from "./types"

let currentUserProfile: User | null = null
let upcomingTournaments: UpcomingTournament[] = []
let registeredTournamentIds = new Set<string>()
let registrationStatusByTournament = new Map<string, UserTournamentRegistration["paymentStatus"]>()
let pendingTournamentRegistrationId: string | null = null

function formatDate(value?: number) {
  if (!value) return "Nao informado"

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(value)
}

function formatDateRange(startDate: number, endDate?: number) {
  if (!endDate || endDate === startDate) {
    return formatDate(startDate)
  }

  return `${formatDate(startDate)} ate ${formatDate(endDate)}`
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Nao informado"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
}

function formatTournamentCategories(entry: UpcomingTournament | UserTournamentRegistration) {
  if (Array.isArray(entry.categories) && entry.categories.length) {
    return entry.categories.join(", ")
  }

  return entry.category || "Livre"
}

function getAvailableTournamentCategories(entry: UpcomingTournament) {
  if (Array.isArray(entry.categories) && entry.categories.length) {
    return entry.categories
  }

  if (entry.category) {
    return entry.category.split(",").map((item) => item.trim()).filter(Boolean)
  }

  return currentUserProfile?.category ? [currentUserProfile.category] : ["Livre"]
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

function hasPixConfiguration(entry: UpcomingTournament) {
  return Boolean(entry.registrationFee && entry.pixKey && entry.pixHolder)
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

function openRegistrationModal(tournament: UpcomingTournament) {
  const modal = document.getElementById("registrationModal") as HTMLElement | null
  const text = document.getElementById("registrationModalText") as HTMLElement | null
  const options = document.getElementById("registrationCategoryOptions") as HTMLElement | null

  if (!modal || !text || !options) return

  const categories = getAvailableTournamentCategories(tournament)

  text.textContent = `Escolha a categoria para se inscrever em ${tournament.title}.`
  options.innerHTML = categories
    .map(
      (category, index) => `
        <label class="checkbox-option registration-option">
          <input type="radio" name="registrationCategory" value="${category}" ${index === 0 ? "checked" : ""}>
          <span>${category}</span>
        </label>
      `
    )
    .join("")

  pendingTournamentRegistrationId = tournament.id
  modal.style.display = "flex"
}

function getSelectedRegistrationCategory() {
  const selected = document.querySelector<HTMLInputElement>('input[name="registrationCategory"]:checked')
  return selected?.value.trim() || ""
}

function renderProfileInfo(user: User) {
  const container = document.getElementById("profileInfoGrid")
  if (!container) return

  const items = [
    { label: "Nome", value: user.name || "Nao informado" },
    { label: "Email", value: user.email || "Nao informado" },
    { label: "Telefone", value: user.phone || "Nao informado" },
    { label: "Clube", value: user.club || "Nao informado" },
    { label: "Categoria", value: user.category || "Nao informado" },
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

function renderTournamentHistory(entries: UserTournament[]) {
  const container = document.getElementById("tournamentsList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Seu historico de torneios ainda nao foi registrado.</div>`
    return
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>${entry.title}</strong>
              <span>${entry.category || "Categoria nao informada"}</span>
            </div>
            <span class="stack-item-date">${formatDate(entry.playedAt)}</span>
          </div>
          <div class="stack-item-grid">
            <span>Colocacao: ${entry.placement || "Nao informada"}</span>
            <span>Resultado: ${entry.result || "Nao informado"}</span>
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
            <span>Mesa: ${entry.tableLabel || "Nao informada"}</span>
            <span>Data: ${formatDate(entry.playedAt)}</span>
          </div>
        </div>
      `
    )
    .join("")
}

function getTournamentRegistrationStatus(tournamentId: string) {
  return registrationStatusByTournament.get(tournamentId)
}

function renderUpcoming(entries: UpcomingTournament[], user: User, registrations: Set<string>) {
  const container = document.getElementById("upcomingList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Ainda nao ha proximos torneios cadastrados.</div>`
    return
  }

  container.innerHTML = entries
    .map(
      (entry) => {
        const registrationStatus = getTournamentRegistrationStatus(entry.id)

        return `
        <div class="stack-item upcoming-item ${registrationStatus === "pending_payment" ? "pending-payment-item" : ""}">
          <div class="stack-item-header">
            <div>
              <strong>${entry.title}</strong>
              <span>${entry.location || "Local a definir"}</span>
            </div>
            <span class="result-pill ${registrationStatus === "approved" ? "win" : registrationStatus === "pending_payment" ? "neutral" : "neutral"}">${
              registrationStatus === "approved"
                ? "Inscrito"
                : registrationStatus === "pending_payment"
                  ? "Pagamento em analise"
                  : entry.status === "open"
                    ? "Inscricoes abertas"
                    : "Em breve"
            }</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${formatDateRange(entry.startDate, entry.endDate)}</span>
            <span>Categoria: ${formatTournamentCategories(entry)}</span>
            <span>Valor: ${formatCurrency(entry.registrationFee)}</span>
            <span>Inscricoes: ${formatDate(entry.registrationDeadline)}</span>
          </div>
          ${entry.description ? `<p class="item-description">${entry.description}</p>` : ""}
          ${
            user.role !== "admin"
              ? `
                <div class="admin-tournament-actions">
                  <button
                    class="btn primary"
                    onclick="registerForTournament('${entry.id}')"
                    ${registrations.has(entry.id) ? "disabled" : ""}
                    ${registrationStatus === "pending_payment" ? "disabled" : ""}
                    ${!hasPixConfiguration(entry) ? "disabled" : ""}
                    ${isRegistrationClosed(entry) ? "disabled" : ""}
                  >
                    ${
                      registrationStatus === "approved"
                        ? "Inscrito"
                        : registrationStatus === "pending_payment"
                          ? "Pagamento em analise"
                        : !hasPixConfiguration(entry)
                          ? "Pix indisponivel"
                        : entry.status === "finished"
                          ? "Finalizado"
                          : isRegistrationClosed(entry)
                            ? "Inscricoes encerradas"
                            : currentUserProfile?.role === "admin"
                              ? "Inscricoes"
                              : "Pagar com Pix"
                    }
                  </button>
                </div>
              `
              : ""
          }
        </div>
      `
      }
    )
    .join("")
}

function updateHeader(user: User, tournaments: UserTournament[], matches: UserMatchHistory[], upcoming: UpcomingTournament[]) {
  ;(document.getElementById("profileName") as HTMLElement).textContent = user.name || "Atleta AJAB"
  ;(document.getElementById("profileRole") as HTMLElement).textContent = user.role === "admin" ? "Administrador" : "Atleta"
  ;(document.getElementById("profileMeta") as HTMLElement).textContent =
    `${user.club || "Sem clube"} - ${user.category || "Categoria nao informada"} - ${user.email || "Email nao informado"}`

  const wins = matches.filter((entry) => entry.result === "win").length

  ;(document.getElementById("statsTournaments") as HTMLElement).textContent = String(tournaments.length)
  ;(document.getElementById("statsMatches") as HTMLElement).textContent = String(matches.length)
  ;(document.getElementById("statsWins") as HTMLElement).textContent = String(wins)
  ;(document.getElementById("statsUpcoming") as HTMLElement).textContent = String(upcoming.length)

  setAvatar(user.name, user.photoURL || auth.currentUser?.photoURL || undefined)

  const dashboardButton = document.querySelector('[onclick="goToDashboard()"]') as HTMLButtonElement | null
  if (dashboardButton) {
    dashboardButton.style.display = user.role === "admin" ? "inline-flex" : "none"
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

  const tournaments = tournamentsSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as UserTournament
  )
  const matches = matchesSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as UserMatchHistory
  )
  const registrations = registrationsSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as UserTournamentRegistration
  )
  const now = Date.now()
  const upcoming = upcomingSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
    .filter((entry) => (entry.status ? entry.status !== "finished" && entry.status !== "closed" : true))
    .filter((entry) => entry.startDate >= now || entry.endDate === undefined || entry.endDate >= now)
    .slice(0, 6)

  const authoritativeRegistrationSnapshots = await Promise.all(
    upcoming.map(async (entry) => ({
      tournamentId: entry.id,
      snapshot: await getDoc(doc(db, "tournaments", entry.id, "registrations", uid))
    }))
  )
  const authoritativeRegistrationIds = new Set(
    authoritativeRegistrationSnapshots
      .filter((entry) => entry.snapshot.exists())
      .map((entry) => entry.tournamentId)
  )

  currentUserProfile = user
  upcomingTournaments = upcoming
  registrationStatusByTournament = new Map(
    registrations.map((entry) => [entry.tournamentId || entry.id, entry.paymentStatus])
  )
  registeredTournamentIds = new Set(
    registrations
      .map((entry) => entry.tournamentId || entry.id)
      .filter((entryId) => authoritativeRegistrationIds.has(entryId))
      .filter((entryId) => registrationStatusByTournament.get(entryId) === "approved")
  )

  updateHeader(user, tournaments, matches, upcoming)
  renderProfileInfo(user)
  renderTournamentHistory(tournaments)
  renderMatchHistory(matches)
  renderUpcoming(upcoming, user, registeredTournamentIds)
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

;(window as any).registerForTournament = async (tournamentId: string) => {
  const firebaseUser = auth.currentUser

  if (!firebaseUser || !currentUserProfile) {
    window.location.replace("/pages/login.html")
    return
  }

  if (currentUserProfile.role === "admin") {
    alert("Administradores nao participam da inscricao de atletas.")
    return
  }

  if (registeredTournamentIds.has(tournamentId)) {
    alert("Voce ja esta inscrito neste torneio.")
    return
  }

  if (registrationStatusByTournament.get(tournamentId) === "pending_payment") {
    alert("Seu pagamento para este torneio ainda esta em analise.")
    return
  }

  const tournament = upcomingTournaments.find((entry) => entry.id === tournamentId)
  if (!tournament) {
    alert("Torneio nao encontrado.")
    return
  }

  if (isRegistrationClosed(tournament)) {
    alert("As inscricoes para este torneio nao estao disponiveis.")
    return
  }

  if (!hasPixConfiguration(tournament)) {
    alert("A organizacao ainda nao configurou o pagamento Pix para este torneio.")
    return
  }

  openRegistrationModal(tournament)
}

;(window as any).closeRegistrationModal = () => {
  const modal = document.getElementById("registrationModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }

  pendingTournamentRegistrationId = null
}

;(window as any).confirmTournamentRegistration = async () => {
  const firebaseUser = auth.currentUser

  if (!firebaseUser || !currentUserProfile || !pendingTournamentRegistrationId) {
    window.location.replace("/pages/login.html")
    return
  }

  if (registeredTournamentIds.has(pendingTournamentRegistrationId)) {
    alert("Voce ja esta inscrito neste torneio.")
    ;(window as any).closeRegistrationModal()
    return
  }

  const tournament = upcomingTournaments.find((entry) => entry.id === pendingTournamentRegistrationId)
  if (!tournament) {
    alert("Torneio nao encontrado.")
    ;(window as any).closeRegistrationModal()
    return
  }

  const selectedCategory = getSelectedRegistrationCategory()
  if (!selectedCategory) {
    alert("Escolha uma categoria para concluir a inscricao.")
    return
  }

  ;(window as any).closeRegistrationModal()
  window.location.href = `/pages/payment-pix.html?tournamentId=${encodeURIComponent(tournament.id)}&category=${encodeURIComponent(selectedCategory)}`
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

    if (tournamentsList) {
      tournamentsList.innerHTML = `<div class="empty-state">Nao foi possivel carregar o perfil agora.</div>`
    }

    if (matchesList) {
      matchesList.innerHTML = `<div class="empty-state">Tente novamente em instantes.</div>`
    }

    if (upcomingList) {
      upcomingList.innerHTML = `<div class="empty-state">Os proximos torneios nao puderam ser consultados.</div>`
    }
  }
})
