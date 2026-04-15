import { onAuthStateChanged, sendPasswordResetEmail, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import {
  UpcomingTournament,
  User,
  UserMatchHistory,
  UserTournament,
  UserTournamentRegistration
} from "./types"
import { getTournamentType } from "./tournament-rules"

let currentUserProfile: User | null = null
let upcomingTournaments: UpcomingTournament[] = []
let registrationStatusByTournament = new Map<string, UserTournamentRegistration["paymentStatus"]>()
let registrationMethodByTournament = new Map<string, UserTournamentRegistration["paymentMethod"] | undefined>()

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

  return `${formatDate(startDate)} ate ${formatDate(endDate)}`
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Não informado"

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value)
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

function renderTournamentHistory(entries: UserTournament[]) {
  const container = document.getElementById("tournamentsList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Seu historico de torneios ainda não foi registrado.</div>`
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
            <span>Colocacao: ${entry.placement || "Não informada"}</span>
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

function getRegisteredChampionshipCategories(registration: UserTournamentRegistration) {
  if (Array.isArray(registration.categories) && registration.categories.length) {
    return registration.categories
  }

  return registration.category ? registration.category.split(",").map((entry) => entry.trim()).filter(Boolean) : []
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
        categories: getRegisteredChampionshipCategories(entry)
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
              : "Pagamento em analise"
            : entry.status === "open"
              ? "Inscricoes abertas"
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
            <span>Inscricoes: ${formatDate(entry.registrationDeadline)}</span>
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
  const upcoming = upcomingSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
    .filter((entry) => (entry.status ? entry.status !== "finished" && entry.status !== "closed" : true))
    .filter((entry) => entry.startDate >= now || entry.endDate === undefined || entry.endDate >= now)
    .slice(0, 6)

  currentUserProfile = user
  upcomingTournaments = upcoming
  registrationStatusByTournament = new Map(registrations.map((entry) => [entry.tournamentId || entry.id, entry.paymentStatus]))
  registrationMethodByTournament = new Map(registrations.map((entry) => [entry.tournamentId || entry.id, entry.paymentMethod]))

  updateHeader(user, tournaments, matches, upcoming)
  renderProfileInfo(user)
  renderTournamentHistory(tournaments)
  renderMatchHistory(matches)
  renderMyChampionshipsCard(upcoming, registrations)
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

;(window as any).openMyChampionships = () => {
  window.location.href = "/pages/my-championships.html"
}

;(window as any).requestPasswordReset = async () => {
  const email = currentUserProfile?.email || auth.currentUser?.email
  if (!email) {
    alert("Seu perfil não possui email cadastrado para redefinicao de senha.")
    return
  }

  try {
    await sendPasswordResetEmail(auth, email)
    alert("Enviamos um link de redefinicao de senha para o seu email.")
  } catch (error: any) {
    alert("Erro ao enviar redefinicao de senha: " + error.message)
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
    alert("Torneio não encontrado.")
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
      upcomingList.innerHTML = `<div class="empty-state">Os proximos torneios não puderam ser consultados.</div>`
    }

    if (championshipsCard) {
      championshipsCard.innerHTML = `<div class="empty-state">Seus campeonatos não puderam ser carregados agora.</div>`
    }
  }
})
