import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, setDoc, writeBatch } from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { TournamentRegistration, UpcomingTournament, User, UserTournamentRegistration } from "./types"

const params = new URLSearchParams(window.location.search)
const tournamentId = params.get("tournamentId")
const selectedCategory = params.get("category") ?? ""

let currentUserProfile: User | null = null
let currentTournament: UpcomingTournament | null = null

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

function redirectToProfile() {
  window.location.replace("/pages/profile.html")
}

function formatCurrency(value?: number) {
  if (value === undefined) return "Nao informado"
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
}

function renderPaymentPage() {
  if (!currentTournament) return

  ;(document.getElementById("paymentTournamentTitle") as HTMLElement).textContent = currentTournament.title
  ;(document.getElementById("paymentSubtitle") as HTMLElement).textContent =
    `${currentTournament.location || "Local a definir"} - finalize o Pix antes de enviar sua inscricao.`
  ;(document.getElementById("paymentCategory") as HTMLElement).textContent = selectedCategory || "Nao informada"
  ;(document.getElementById("paymentAmount") as HTMLElement).textContent = formatCurrency(currentTournament.registrationFee)
  ;(document.getElementById("paymentPixKey") as HTMLElement).textContent = currentTournament.pixKey || "-"
  ;(document.getElementById("paymentPixHolder") as HTMLElement).textContent =
    currentTournament.pixHolder ? `Favorecido: ${currentTournament.pixHolder}` : "Favorecido nao informado."
}

async function loadPageData(uid: string) {
  if (!tournamentId || !selectedCategory) {
    alert("Pagamento invalido. Escolha o torneio novamente.")
    redirectToProfile()
    return
  }

  const [userSnapshot, tournamentSnapshot] = await Promise.all([
    getDoc(doc(db, "users", uid)),
    getDoc(doc(db, "tournaments", tournamentId))
  ])

  if (!userSnapshot.exists() || !tournamentSnapshot.exists()) {
    alert("Nao foi possivel carregar os dados do pagamento.")
    redirectToProfile()
    return
  }

  currentUserProfile = { id: userSnapshot.id, ...userSnapshot.data() } as User
  currentTournament = { id: tournamentSnapshot.id, ...tournamentSnapshot.data() } as UpcomingTournament

  if (!currentTournament.registrationFee || !currentTournament.pixKey || !currentTournament.pixHolder) {
    alert("Este torneio ainda nao esta configurado para pagamento Pix.")
    redirectToProfile()
    return
  }

  const existingRegistration = await getDoc(doc(db, "tournaments", tournamentId, "registrations", uid))
  if (existingRegistration.exists()) {
    alert("Voce ja possui uma inscricao vinculada a este torneio.")
    redirectToProfile()
    return
  }

  renderPaymentPage()
}

;(window as any).copyPixKey = async () => {
  if (!currentTournament?.pixKey) return

  try {
    await navigator.clipboard.writeText(currentTournament.pixKey)
    alert("Chave Pix copiada.")
  } catch (error) {
    alert("Nao foi possivel copiar automaticamente. Copie manualmente a chave exibida.")
  }
}

;(window as any).goBackToProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).confirmPixPayment = async () => {
  const firebaseUser = auth.currentUser

  if (!firebaseUser || !currentUserProfile || !currentTournament || !tournamentId || !selectedCategory) {
    redirectToProfile()
    return
  }

  const now = Date.now()
  const registrationPayload: TournamentRegistration = {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    name: currentUserProfile.name,
    email: currentUserProfile.email,
    club: currentUserProfile.club,
    category: selectedCategory,
    registrationFee: currentTournament.registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod: "pix",
    registeredAt: now,
    status: "registered"
  }

  const userRegistrationPayload: UserTournamentRegistration = {
    id: tournamentId,
    tournamentId,
    title: currentTournament.title,
    location: currentTournament.location ?? "",
    category: selectedCategory,
    categories: currentTournament.categories ?? [],
    registrationFee: currentTournament.registrationFee,
    paymentStatus: "pending_payment",
    paymentMethod: "pix",
    startDate: currentTournament.startDate,
    endDate: currentTournament.endDate,
    registrationDeadline: currentTournament.registrationDeadline,
    registeredAt: now,
    status: "registered"
  }

  try {
    setPaymentLoading(true)

    const batch = writeBatch(db)
    batch.set(doc(db, "tournaments", tournamentId, "registrations", firebaseUser.uid), registrationPayload)
    batch.set(doc(db, "users", firebaseUser.uid, "registrations", tournamentId), userRegistrationPayload)
    await batch.commit()

    alert("Pagamento enviado para analise. Aguarde a confirmacao da organizacao.")
    redirectToProfile()
  } catch (error: any) {
    setPaymentLoading(false)
    alert("Erro ao enviar pagamento: " + error.message)
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
    alert("Nao foi possivel abrir a pagina de pagamento agora.")
    redirectToProfile()
  }
})
