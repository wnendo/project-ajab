import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { UpcomingTournament, User, UserMatchHistory, UserTournament } from "./types"

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

function renderUpcoming(entries: UpcomingTournament[]) {
  const container = document.getElementById("upcomingList")
  if (!container) return

  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">Ainda nao ha proximos torneios cadastrados.</div>`
    return
  }

  container.innerHTML = entries
    .map(
      (entry) => `
        <div class="stack-item upcoming-item">
          <div class="stack-item-header">
            <div>
              <strong>${entry.title}</strong>
              <span>${entry.location || "Local a definir"}</span>
            </div>
            <span class="result-pill neutral">${entry.status === "open" ? "Inscricoes abertas" : "Em breve"}</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${formatDateRange(entry.startDate, entry.endDate)}</span>
            <span>Categoria: ${entry.category || "Livre"}</span>
            <span>Inscricoes: ${formatDate(entry.registrationDeadline)}</span>
          </div>
          ${entry.description ? `<p class="item-description">${entry.description}</p>` : ""}
        </div>
      `
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
  const upcomingRef = query(collection(db, "tournaments"), orderBy("startDate", "asc"))

  const [userSnapshot, tournamentsSnapshot, matchesSnapshot, upcomingSnapshot] = await Promise.all([
    getDoc(userRef),
    getDocs(tournamentsRef),
    getDocs(matchesRef),
    getDocs(upcomingRef)
  ])

  if (!userSnapshot.exists()) {
    window.location.replace("/src/pages/complete-profile.html")
    return
  }

  const user = { id: userSnapshot.id, ...userSnapshot.data() } as User

  if (!user.profileComplete) {
    window.location.replace("/src/pages/complete-profile.html")
    return
  }

  const tournaments = tournamentsSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as UserTournament
  )
  const matches = matchesSnapshot.docs.map(
    (entry) => ({ id: entry.id, ...entry.data() }) as UserMatchHistory
  )
  const now = Date.now()
  const upcoming = upcomingSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
    .filter((entry) => (entry.status ? entry.status !== "finished" && entry.status !== "closed" : true))
    .filter((entry) => entry.startDate >= now || entry.endDate === undefined || entry.endDate >= now)
    .slice(0, 6)

  updateHeader(user, tournaments, matches, upcoming)
  renderProfileInfo(user)
  renderTournamentHistory(tournaments)
  renderMatchHistory(matches)
  renderUpcoming(upcoming)
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/src/pages/login.html")
}

;(window as any).editProfile = () => {
  window.location.href = "/src/pages/complete-profile.html"
}

;(window as any).goToDashboard = () => {
  window.location.href = "/src/pages/dashboard.html"
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/src/pages/login.html")
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
