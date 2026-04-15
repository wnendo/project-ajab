import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, getDocs, collection, updateDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentRegistration, UpcomingTournament, User } from "./types"
import { getTournamentType } from "./tournament-rules"

const tournamentId = new URLSearchParams(window.location.search).get("id")

let checked = false
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []
let refreshInterval: number | null = null

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

function getPaymentMethodLabel(registration: TournamentRegistration) {
  return registration.paymentMethod === "pay_on_day" ? "Pagar no dia" : "Pix"
}

function getPaymentStatusLabel(registration: TournamentRegistration) {
  if (registration.paymentStatus === "approved") {
    return "Pagamento aprovado"
  }

  return registration.paymentMethod === "pay_on_day"
    ? "Pagar no dia - pendente de aprovacao"
    : "Aguardando analise"
}

function getFilteredRegistrations() {
  const input = document.getElementById("registrationSearch") as HTMLInputElement | null
  const search = (input?.value ?? "").trim().toLowerCase()

  return [...registrations]
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
  if (!titleEl || !subtitleEl || !totalEl || !pendingEl || !listEl) return

  titleEl.textContent = currentTournament?.title || "Inscricoes"
  subtitleEl.textContent = currentTournament
    ? `${currentTournament.location || "Local a definir"} - acompanhe os pagamentos Pix e confirme as inscricoes.`
    : "Não foi possivel carregar o torneio."

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
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  try {
    const batch = writeBatch(db)
    batch.update(doc(db, "tournaments", currentTournament.id, "registrations", userId), {
      paymentStatus: "approved"
    })
    batch.update(doc(db, "users", userId, "registrations", currentTournament.id), {
      paymentStatus: "approved"
    })
    await batch.commit()
    await loadRegistrations()
    renderPage()
  } catch (error: any) {
    alert("Erro ao aprovar pagamento: " + error.message)
  }
}

;(window as any).removeRegistration = async (userId: string) => {
  if (!currentTournament) return

  const registration = registrations.find((entry) => entry.id === userId)
  if (!registration) return

  if (!confirm(`Remover a inscrição de ${registration.name}?`)) return

  try {
    const batch = writeBatch(db)
    batch.delete(doc(db, "tournaments", currentTournament.id, "registrations", userId))
    batch.delete(doc(db, "users", userId, "registrations", currentTournament.id))
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
    alert("Erro ao remover inscrição: " + error.message)
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
