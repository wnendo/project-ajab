import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

const provider = new GoogleAuthProvider()
let authChecked = false
const loginLoading = document.getElementById("loginLoading")
const loginButton = document.getElementById("loginButton") as HTMLButtonElement | null
const googleLoginButton = document.getElementById("googleLoginButton") as HTMLButtonElement | null

function shouldSubmitOnEnter(target: EventTarget | null) {
  return !(target instanceof HTMLTextAreaElement)
}

function setLoginLoading(isLoading: boolean) {
  loginLoading?.classList.toggle("visible", isLoading)
  loginLoading?.setAttribute("aria-hidden", String(!isLoading))

  if (loginButton) {
    loginButton.disabled = isLoading
    loginButton.textContent = isLoading ? "Entrando..." : "Entrar"
  }

  if (googleLoginButton) {
    googleLoginButton.disabled = isLoading
  }
}

async function resolveUserRoute(uid: string) {
  const userRef = doc(db, "users", uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    return "/pages/complete-profile.html"
  }

  const data = snapshot.data()
  if (!data.profileComplete) {
    return "/pages/complete-profile.html"
  }

  return data.role === "admin" ? "/pages/dashboard.html" : "/pages/profile.html"
}

async function ensureGoogleUserDocument() {
  const user = auth.currentUser

  if (!user) {
    throw new Error("Usuario nao autenticado.")
  }

  const userRef = doc(db, "users", user.uid)
  const snapshot = await getDoc(userRef)

  if (snapshot.exists()) {
    return
  }

  await setDoc(userRef, {
    name: user.displayName ?? "",
    email: user.email ?? "",
    phone: "",
    club: "",
    photoURL: user.photoURL ?? "",
    category: "",
    role: "user",
    createdAt: Date.now(),
    profileComplete: false,
    playerProfile: {
      wins: 0,
      losses: 0,
      games: 0,
      active: true,
      createdAt: Date.now()
    }
  })
}

;(window as any).login = async () => {
  const email = (document.getElementById("email") as HTMLInputElement).value.trim()
  const password = (document.getElementById("password") as HTMLInputElement).value

  if (!email || !password) {
    alert("Informe e-mail e senha.")
    return
  }

  try {
    setLoginLoading(true)
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const nextRoute = await resolveUserRoute(credential.user.uid)
    window.location.replace(nextRoute)
  } catch (error: any) {
    setLoginLoading(false)
    alert("Erro ao entrar: " + error.message)
  }
}

;(window as any).loginWithGoogle = async () => {
  try {
    setLoginLoading(true)
    await signInWithPopup(auth, provider)
    await ensureGoogleUserDocument()

    const nextRoute = await resolveUserRoute(auth.currentUser!.uid)
    window.location.replace(nextRoute)
  } catch (error: any) {
    setLoginLoading(false)
    alert("Erro no login com Google: " + error.message)
  }
}

;(window as any).goToRegister = () => {
  window.location.href = "/pages/register.html"
}

onAuthStateChanged(auth, async (user) => {
  if (!user || authChecked) {
    return
  }

  authChecked = true

  try {
    const nextRoute = await resolveUserRoute(user.uid)
    window.location.replace(nextRoute)
  } catch (error) {
    console.error("Falha ao validar sessao:", error)
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !shouldSubmitOnEnter(event.target)) {
    return
  }

  event.preventDefault()
  ;(window as any).login()
})
