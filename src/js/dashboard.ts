import { onAuthStateChanged, signOut } from "firebase/auth"
import { collection, doc, getDoc, getDocs, orderBy, query, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { UpcomingTournament, User } from "./types"
import { getTournamentType } from "./tournament-rules"
import { showToast } from "./toast"

let checked = false
let tournaments: UpcomingTournament[] = []
let athletes: User[] = []

function setUserHeader(userData: User) {
  const header = document.getElementById("userSummary")
  if (!header) return

  header.innerHTML = `
    <strong>${userData.name}</strong>
    <span>${userData.club || "Sem clube"}</span>
    <span>${userData.category}</span>
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

function formatDate(value?: number) {
  if (!value) return "Não informado"
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(value)
}

function getStatusLabel(status?: UpcomingTournament["status"]) {
  switch (status) {
    case "open":
      return "Em andamento"
    case "closed":
      return "Inscrições encerradas"
    case "finished":
      return "Finalizado"
    default:
      return "Cadastrado"
  }
}

function renderTournamentCard(tournament: UpcomingTournament, mode: "registered" | "ongoing" | "finished") {
  const actions: string[] = []

  if (mode === "registered") {
    actions.push(`<button class="btn primary" onclick="startTournament('${tournament.id}')">Iniciar</button>`)
    actions.push(`<button class="btn secondary" onclick="manageTournament('${tournament.id}')">Gerenciar</button>`)
    actions.push(`<button class="btn secondary" onclick="editTournament('${tournament.id}')">Editar</button>`)
  }

  if (mode === "ongoing") {
    actions.push(`<button class="btn primary" onclick="manageTournament('${tournament.id}')">Entrar no gerenciamento</button>`)
    actions.push(`<button class="btn secondary" onclick="resetTournamentStatus('${tournament.id}')">Voltar para não iniciado</button>`)
    actions.push(`<button class="btn secondary" onclick="editTournament('${tournament.id}')">Editar</button>`)
  }

  if (mode === "finished") {
    actions.push(`<button class="btn secondary" onclick="manageTournament('${tournament.id}')">Abrir gerenciamento</button>`)
  }

  return `
    <article class="admin-tournament-card ${tournament.isActive ? "active" : ""}">
      <div class="admin-tournament-head">
        <div>
          <h4>${tournament.title}</h4>
          <span>${tournament.location || "Local a definir"}</span>
        </div>
        <div>
          <span class="tournament-status-pill ${tournament.status || "upcoming"}">${getStatusLabel(tournament.status)}</span>
          ${tournament.isActive ? '<span class="active-tournament-badge">Ativo</span>' : ""}
        </div>
      </div>
      <div class="admin-tournament-meta">
        <span>Categoria: ${tournament.category || "Livre"}</span>
        <span>Início: ${formatDate(tournament.startDate)}</span>
        <span>Fim: ${formatDate(tournament.endDate)}</span>
      </div>
      ${tournament.description ? `<p class="admin-tournament-description">${tournament.description}</p>` : ""}
      <div class="admin-tournament-actions">
        ${actions.join("")}
      </div>
    </article>
  `
}

function getManagePagePath(tournament?: UpcomingTournament) {
  return getTournamentType(tournament) === "championship" ? "/pages/championship-manage.html" : "/pages/tournament-manage.html"
}

function renderTournaments() {
  const registeredEl = document.getElementById("registeredTournaments")
  const ongoingEl = document.getElementById("ongoingTournaments")
  const finishedEl = document.getElementById("finishedTournaments")

  const scheduled = tournaments.filter((entry) => !entry.isActive && entry.status !== "open" && entry.status !== "finished")
  const ongoing = tournaments.filter((entry) => entry.isActive || entry.status === "open")
  const finished = tournaments.filter((entry) => entry.status === "finished")

  if (registeredEl) {
    registeredEl.innerHTML = scheduled.length
      ? scheduled.map((entry) => renderTournamentCard(entry, "registered")).join("")
      : '<div class="empty-state">Nenhum próximo torneio cadastrado no momento.</div>'
  }

  if (ongoingEl) {
    ongoingEl.innerHTML = ongoing.length
      ? ongoing.map((entry) => renderTournamentCard(entry, "ongoing")).join("")
      : '<div class="empty-state">Nenhum torneio em andamento no momento.</div>'
  }

  if (finishedEl) {
    finishedEl.innerHTML = finished.length
      ? finished.map((entry) => renderTournamentCard(entry, "finished")).join("")
      : '<div class="empty-state">Nenhum torneio finalizado ainda.</div>'
  }
}

function renderAthletes(filter = "") {
  const container = document.getElementById("athleteSearchResults")
  if (!container) return

  const normalized = filter.trim().toLowerCase()
  const filtered = athletes.filter((athlete) => {
    if (!normalized) return true
    return [athlete.name, athlete.email, athlete.club, athlete.category].some((value) =>
      (value || "").toLowerCase().includes(normalized)
    )
  })

  container.innerHTML = filtered.length
    ? filtered
        .map(
          (athlete) => `
            <div class="admin-athlete-card">
              <div class="user-admin-head">
                <div>
                  <strong>${athlete.name}</strong>
                  <span>${athlete.email}</span>
                </div>
                <span class="result-pill ${athlete.role === "admin" ? "neutral" : "win"}">${athlete.role === "admin" ? "Admin" : "Usuario"}</span>
              </div>
              <span>${athlete.club || "Sem clube"} - ${athlete.category || "Sem categoria"}</span>
              <div class="admin-athlete-actions">
                <button class="btn secondary" onclick="openUserManager('${athlete.id}')">Gerenciar</button>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state">Nenhum atleta encontrado.</div>'
}

async function loadHubData() {
  const [tournamentSnapshot, athleteSnapshot] = await Promise.all([
    getDocs(query(collection(db, "tournaments"), orderBy("startDate", "asc"))),
    getDocs(collection(db, "users"))
  ])

  tournaments = tournamentSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as UpcomingTournament)
  athletes = athleteSnapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as User)
    .filter((entry) => entry.profileComplete)
    .sort((a, b) => a.name.localeCompare(b.name))

  renderTournaments()
  renderAthletes()
}

;(window as any).filterAthletes = () => {
  const value = (document.getElementById("athleteSearch") as HTMLInputElement).value
  renderAthletes(value)
}

;(window as any).goToTournamentForm = () => {
  window.location.href = "/pages/tournament-form.html"
}

;(window as any).goToAthleteRegistration = () => {
  window.location.href = "/pages/register.html"
}

;(window as any).goToUsersAdmin = () => {
  window.location.href = "/pages/users-admin.html"
}

;(window as any).openUserManager = (id: string) => {
  window.location.href = `/pages/users-admin.html?id=${id}`
}

;(window as any).editTournament = (id: string) => {
  window.location.href = `/pages/tournament-form.html?id=${id}`
}

;(window as any).manageTournament = (id: string) => {
  const tournament = tournaments.find((entry) => entry.id === id)
  window.location.href = `${getManagePagePath(tournament)}?id=${id}`
}

;(window as any).startTournament = async (id: string) => {
  try {
    const batch = writeBatch(db)
    tournaments.forEach((entry) => {
      const shouldResetToUpcoming =
        entry.id !== id &&
        entry.status !== "finished" &&
        (entry.isActive || entry.status === "open")

      batch.update(doc(db, "tournaments", entry.id), {
        isActive: entry.id === id,
        status: entry.id === id ? "open" : shouldResetToUpcoming ? "upcoming" : entry.status,
        updatedAt: Date.now()
      })
    })

    await batch.commit()
    const tournament = tournaments.find((entry) => entry.id === id)
    window.location.href = `${getManagePagePath(tournament)}?id=${id}`
  } catch (error: any) {
    showToast("Erro ao iniciar torneio: " + error.message, "error")
  }
}

;(window as any).resetTournamentStatus = async (id: string) => {
  try {
    await updateDoc(doc(db, "tournaments", id), {
      isActive: false,
      status: "upcoming",
      updatedAt: Date.now()
    })

    tournaments = tournaments.map((entry) =>
      entry.id === id
        ? { ...entry, isActive: false, status: "upcoming", updatedAt: Date.now() }
        : entry
    )

    renderTournaments()
    showToast("Torneio voltou para o estado de não iniciado.", "success")
  } catch (error: any) {
    showToast("Erro ao voltar torneio para não iniciado: " + error.message, "error")
  }
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

  const snapshot = await getDoc(doc(db, "users", user.uid))
  const data = redirectByRole(snapshot.data() as User | undefined)
  if (!data) return

  setUserHeader(data)
  await loadHubData()
})
