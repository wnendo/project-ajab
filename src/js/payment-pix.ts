import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDoc, getDocs, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentRegistration, UpcomingTournament, User, UserTournamentRegistration } from "./types"
import {
  formatRegistrationCategories,
  getAllowedRegistrationCategories,
  getRegistrationFeeForSelection,
  isCategoryFull,
  isRankingTournament
} from "./tournament-rules"
import { redirectWithToast, showToast } from "./toast"

const params = new URLSearchParams(window.location.search)
const tournamentId = params.get("tournamentId")
const selectedCategories = (params.get("categories") ?? params.get("category") ?? "")
  .split(",")
  .map((entry) => entry.trim())
  .filter(Boolean)

let currentUserProfile: User | null = null
let currentTournament: UpcomingTournament | null = null
let registrations: TournamentRegistration[] = []

const loadingOverlay = document.getElementById("paymentLoading")
const confirmButton = document.getElementById("confirmPaymentButton") as HTMLButtonElement | null

function setPaymentLoading(isLoading: boolean) {
  loadingOverlay?.classList.toggle("visible", isLoading)
  loadingOverlay?.setAttribute("aria-hidden", String(!isLoading))

  if (confirmButton) {
    confirmButton.disabled = isLoading
    confirmButton.textContent = isLoading ? "Enviando..." : "Ja realizei o pagamento"
  }
}

function goToProfile() {
  window.location.replace("/pages/profile.html")
}

function goToProfileWithToast(message: string, type: "success" | "error" | "warning" | "info") {
  redirectWithToast("/pages/profile.html", message, type)
  goToProfile()
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Nao informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function getSelectedRegistrationFee() {
  const tournament = currentTournament
  if (!tournament) return undefined
  return getRegistrationFeeForSelection(tournament, selectedCategories)
}

function renderPaymentPage() {
  const tournament = currentTournament
  if (!tournament) return

  ;(document.getElementById("paymentTournamentTitle") as HTMLElement).textContent = tournament.title
  ;(document.getElementById("paymentSubtitle") as HTMLElement).textContent =
    `${tournament.location || "Local a definir"} - finalize o Pix antes de enviar sua inscricao.`
  ;(document.getElementById("paymentCategory") as HTMLElement).textContent =
    selectedCategories.length ? formatRegistrationCategories(selectedCategories) : "Nao informada"
  ;(document.getElementById("paymentAmount") as HTMLElement).textContent = formatCurrency(getSelectedRegistrationFee())
  ;(document.getElementById("paymentPixKey") as HTMLElement).textContent = tournament.pixKey || "-"
  ;(document.getElementById("paymentPixHolder") as HTMLElement).textContent =
    tournament.pixHolder ? `Favorecido: ${tournament.pixHolder}` : "Favorecido nao informado."
}

async function loadPageData(uid: string) {
  if (!tournamentId || !selectedCategories.length) {
    goToProfileWithToast("Pagamento invalido. Escolha o torneio novamente.", "warning")
    return
  }

  const [userSnapshot, tournamentSnapshot, registrationsSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "tournaments", tournamentId)),
    getDocs(collection(db, "tournaments", tournamentId, "registrations"))
  ])

  if (!userSnapshot.exists() || !tournamentSnapshot.exists()) {
    goToProfileWithToast("Nao foi possivel carregar os dados do pagamento.", "error")
    return
  }

  currentUserProfile = { id: userSnapshot.id, ...userSnapshot.data() } as User
  currentTournament = { id: tournamentSnapshot.id, ...tournamentSnapshot.data() } as UpcomingTournament
  registrations = registrationsSnapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }) as TournamentRegistration)
  const tournament = currentTournament

  const allowedCategories = getAllowedRegistrationCategories(tournament, currentUserProfile.category)
  if (!selectedCategories.every((category) => allowedCategories.includes(category))) {
    goToProfileWithToast("Sua categoria atual nao permite essa inscricao.", "warning")
    return
  }

  if (isRankingTournament(tournament) && selectedCategories.length !== 1) {
    goToProfileWithToast("O ranking permite apenas uma categoria por inscricao.", "warning")
    return
  }

  if (selectedCategories.some((category) => isCategoryFull(tournament, registrations, category))) {
    goToProfileWithToast("Uma das categorias selecionadas ja atingiu o limite de inscritos.", "warning")
    return
  }

  if (!getSelectedRegistrationFee() || !tournament.pixKey || !tournament.pixHolder) {
    goToProfileWithToast("Este torneio ainda nao esta configurado para pagamento Pix.", "warning")
    return
  }

  const existingRegistration = await getDoc(doc(db, "tournaments", tournamentId, "registrations", uid))
  if (existingRegistration.exists()) {
    goToProfileWithToast("Voce ja possui uma inscricao vinculada a este torneio.", "warning")
    return
  }

  renderPaymentPage()
}

;(window as any).copyPixKey = async () => {
  if (!currentTournament?.pixKey) return

  try {
    await navigator.clipboard.writeText(currentTournament.pixKey)
    showToast("Chave Pix copiada.", "success")
  } catch {
    showToast("Nao foi possivel copiar automaticamente. Copie manualmente a chave exibida.", "warning")
  }
}

;(window as any).goBackToProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).confirmPixPayment = async () => {
  const firebaseUser = auth.currentUser

  const userProfile = currentUserProfile
  const tournament = currentTournament

  if (!firebaseUser || !userProfile || !tournament || !tournamentId || !selectedCategories.length) {
    goToProfile()
    return
  }

  if (selectedCategories.some((category) => isCategoryFull(tournament, registrations, category))) {
    goToProfileWithToast("Uma das categorias selecionadas ja atingiu o limite de inscritos.", "warning")
    return
  }

  const now = Date.now()
  const registrationCategoryLabel = formatRegistrationCategories(selectedCategories)
  const registrationFee = getSelectedRegistrationFee()

  const registrationPayload: TournamentRegistration = {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: userProfile.name,
    email: userProfile.email,
    club: userProfile.club,
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod: "pix",
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: tournamentId,
    tournamentId,
    title: tournament.title,
    location: tournament.location ?? "",
    category: registrationCategoryLabel,
    categories: selectedCategories,
    registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod: "pix",
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    registrationDeadline: tournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  try {
    setPaymentLoading(true)

    const batch = writeBatch(db)
    batch.set(doc(db, "tournaments", tournamentId, "registrations", firebaseUser.uid), registrationPayload)
    batch.set(doc(db, "users", firebaseUser.uid, "registrations", tournamentId), userRegistrationPayload)
    await batch.commit()

    goToProfileWithToast("Pagamento enviado para analise. Aguarde a confirmacao da organizacao.", "success")
  } catch (error: any) {
    setPaymentLoading(false)
    showToast("Erro ao enviar pagamento: " + error.message, "error")
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadPageData(user.uid)
  } catch (error) {
    console.error("Erro ao carregar pagamento Pix:", error)
    goToProfileWithToast("Nao foi possivel abrir a pagina de pagamento agora.", "error")
  }
})
