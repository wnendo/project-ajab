import { onAuthStateChanged, signOut } from "firebase/auth"
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { UpcomingTournament, User } from "./types"

const tournamentId = new URLSearchParams(window.location.search).get("id")
let currentTournament: UpcomingTournament | null = null
let checked = false

function shouldSubmitOnEnter(target: EventTarget | null) {
  return !(target instanceof HTMLTextAreaElement)
}

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

function toDateInputValue(value?: number) {
  if (!value) return ""
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function fromDateInputValue(value: string) {
  if (!value) return undefined
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return undefined
  return new Date(year, month - 1, day).getTime()
}

function parseCurrencyInput(value: string) {
  if (!value.trim()) return undefined
  const normalized = Number(value.replace(",", "."))
  if (Number.isNaN(normalized) || normalized < 0) return undefined
  return Number(normalized.toFixed(2))
}

function getField<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(id: string) {
  return document.getElementById(id) as T
}

function toTimeInputValue(value?: string) {
  if (!value) return ""
  return value.slice(0, 5)
}

function getSelectedCategories() {
  return Array.from(document.querySelectorAll<HTMLInputElement>('input[name="tournamentCategory"]:checked')).map(
    (input) => input.value
  )
}

function setSelectedCategories(categories: string[]) {
  const selected = new Set(categories)

  document.querySelectorAll<HTMLInputElement>('input[name="tournamentCategory"]').forEach((input) => {
    input.checked = selected.has(input.value)
  })
}

function normalizeCategories(tournament: UpcomingTournament) {
  if (Array.isArray(tournament.categories)) {
    return tournament.categories
  }

  if (typeof tournament.category === "string" && tournament.category.trim()) {
    return tournament.category.split(",").map((entry) => entry.trim()).filter(Boolean)
  }

  return []
}

async function loadTournamentIfNeeded() {
  if (!tournamentId) return

  const snapshot = await getDoc(doc(db, "tournaments", tournamentId))
  if (!snapshot.exists()) {
    window.location.replace("/pages/dashboard.html")
    return
  }

  currentTournament = { id: snapshot.id, ...snapshot.data() } as UpcomingTournament
  ;(document.getElementById("tournamentFormTitle") as HTMLElement).textContent = "Editar torneio"
  getField<HTMLInputElement>("tournamentTitle").value = currentTournament.title ?? ""
  getField<HTMLInputElement>("tournamentLocation").value = currentTournament.location ?? ""
  setSelectedCategories(normalizeCategories(currentTournament))
  getField<HTMLInputElement>("tournamentStartDate").value = toDateInputValue(currentTournament.startDate)
  getField<HTMLInputElement>("tournamentStartTime").value = toTimeInputValue(currentTournament.startTime)
  getField<HTMLInputElement>("tournamentEndDate").value = toDateInputValue(currentTournament.endDate)
  getField<HTMLInputElement>("tournamentRegistrationDeadline").value = toDateInputValue(currentTournament.registrationDeadline)
  getField<HTMLInputElement>("tournamentRegistrationFee").value = currentTournament.registrationFee?.toFixed(2) ?? ""
  getField<HTMLInputElement>("tournamentPixKey").value = currentTournament.pixKey ?? ""
  getField<HTMLInputElement>("tournamentPixHolder").value = currentTournament.pixHolder ?? ""
  getField<HTMLSelectElement>("tournamentStatus").value = currentTournament.status ?? "upcoming"
  getField<HTMLTextAreaElement>("tournamentDescription").value = currentTournament.description ?? ""
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).saveTournamentForm = async () => {
  const title = getField<HTMLInputElement>("tournamentTitle").value.trim()
  const location = getField<HTMLInputElement>("tournamentLocation").value.trim()
  const categories = getSelectedCategories()
  const startDate = fromDateInputValue(getField<HTMLInputElement>("tournamentStartDate").value)
  const startTime = getField<HTMLInputElement>("tournamentStartTime").value
  const endDate = fromDateInputValue(getField<HTMLInputElement>("tournamentEndDate").value)
  const registrationDeadline = fromDateInputValue(getField<HTMLInputElement>("tournamentRegistrationDeadline").value)
  const registrationFee = parseCurrencyInput(getField<HTMLInputElement>("tournamentRegistrationFee").value)
  const pixKey = getField<HTMLInputElement>("tournamentPixKey").value.trim()
  const pixHolder = getField<HTMLInputElement>("tournamentPixHolder").value.trim()
  const status = getField<HTMLSelectElement>("tournamentStatus").value as UpcomingTournament["status"]
  const description = getField<HTMLTextAreaElement>("tournamentDescription").value.trim()

  if (!title || !startDate) {
    alert("Informe pelo menos o nome do torneio e a data de inicio.")
    return
  }

  if (endDate && endDate < startDate) {
    alert("A data final nao pode ser antes da data inicial.")
    return
  }

  if (!registrationFee || !pixKey || !pixHolder) {
    alert("Informe valor da inscricao, chave Pix e favorecido para cadastrar o torneio.")
    return
  }

  const payload = {
    title,
    ...(location ? { location } : {}),
    ...(categories.length ? { categories, category: categories.join(", ") } : {}),
    startDate,
    ...(startTime ? { startTime } : {}),
    ...(endDate ? { endDate } : {}),
    ...(registrationDeadline ? { registrationDeadline } : {}),
    ...(registrationFee !== undefined ? { registrationFee } : {}),
    ...(pixKey ? { pixKey } : {}),
    ...(pixHolder ? { pixHolder } : {}),
    status,
    ...(description ? { description } : {}),
    isActive: currentTournament?.isActive ?? false,
    updatedAt: Date.now()
  }

  try {
    if (currentTournament) {
      await updateDoc(doc(db, "tournaments", currentTournament.id), payload)
    } else {
      await addDoc(collection(db, "tournaments"), {
        ...payload,
        createdAt: Date.now(),
        createdBy: auth.currentUser?.uid ?? null
      })
    }

    window.location.href = "/pages/dashboard.html"
  } catch (error: any) {
    alert("Erro ao salvar torneio: " + error.message)
  }
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
  await loadTournamentIfNeeded()
})

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !shouldSubmitOnEnter(event.target)) {
    return
  }

  event.preventDefault()
  ;(window as any).saveTournamentForm()
})
