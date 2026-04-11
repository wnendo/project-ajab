import { onAuthStateChanged, signOut } from "firebase/auth"
import { addDoc, collection, doc, getDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { UpcomingTournament, User } from "./types"

const tournamentId = new URLSearchParams(window.location.search).get("id")
let currentTournament: UpcomingTournament | null = null
let checked = false

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
    window.location.replace("/src/pages/login.html")
    return null
  }

  if (!userData.profileComplete) {
    window.location.replace("/src/pages/complete-profile.html")
    return null
  }

  if (userData.role !== "admin") {
    window.location.replace("/src/pages/profile.html")
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

function getField<T extends HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(id: string) {
  return document.getElementById(id) as T
}

async function loadTournamentIfNeeded() {
  if (!tournamentId) return

  const snapshot = await getDoc(doc(db, "tournaments", tournamentId))
  if (!snapshot.exists()) {
    window.location.replace("/src/pages/dashboard.html")
    return
  }

  currentTournament = { id: snapshot.id, ...snapshot.data() } as UpcomingTournament
  ;(document.getElementById("tournamentFormTitle") as HTMLElement).textContent = "Editar torneio"
  getField<HTMLInputElement>("tournamentTitle").value = currentTournament.title ?? ""
  getField<HTMLInputElement>("tournamentLocation").value = currentTournament.location ?? ""
  getField<HTMLInputElement>("tournamentCategory").value = currentTournament.category ?? ""
  getField<HTMLInputElement>("tournamentStartDate").value = toDateInputValue(currentTournament.startDate)
  getField<HTMLInputElement>("tournamentEndDate").value = toDateInputValue(currentTournament.endDate)
  getField<HTMLInputElement>("tournamentRegistrationDeadline").value = toDateInputValue(currentTournament.registrationDeadline)
  getField<HTMLSelectElement>("tournamentStatus").value = currentTournament.status ?? "upcoming"
  getField<HTMLTextAreaElement>("tournamentDescription").value = currentTournament.description ?? ""
}

;(window as any).goToDashboard = () => {
  window.location.href = "/src/pages/dashboard.html"
}

;(window as any).saveTournamentForm = async () => {
  const title = getField<HTMLInputElement>("tournamentTitle").value.trim()
  const location = getField<HTMLInputElement>("tournamentLocation").value.trim()
  const category = getField<HTMLInputElement>("tournamentCategory").value.trim()
  const startDate = fromDateInputValue(getField<HTMLInputElement>("tournamentStartDate").value)
  const endDate = fromDateInputValue(getField<HTMLInputElement>("tournamentEndDate").value)
  const registrationDeadline = fromDateInputValue(getField<HTMLInputElement>("tournamentRegistrationDeadline").value)
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

  const payload = {
    title,
    ...(location ? { location } : {}),
    ...(category ? { category } : {}),
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(registrationDeadline ? { registrationDeadline } : {}),
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

    window.location.href = "/src/pages/dashboard.html"
  } catch (error: any) {
    alert("Erro ao salvar torneio: " + error.message)
  }
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/src/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (checked) return
  checked = true

  if (!user) {
    window.location.replace("/src/pages/login.html")
    return
  }

  const snapshot = await getDoc(doc(db, "users", user.uid))
  const data = redirectByRole(snapshot.data() as User | undefined)
  if (!data) return

  setUserHeader(data)
  await loadTournamentIfNeeded()
})
