import { GoogleAuthProvider, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

const provider = new GoogleAuthProvider()
let authChecked = false

async function resolveUserRoute(uid: string) {
  const userRef = doc(db, "users", uid)
  const snapshot = await getDoc(userRef)

  if (!snapshot.exists()) {
    return "/src/pages/complete-profile.html"
  }

  const data = snapshot.data()
  if (!data.profileComplete) {
    return "/src/pages/complete-profile.html"
  }

  return data.role === "admin" ? "/src/pages/dashboard.html" : "/src/pages/profile.html"
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
    const credential = await signInWithEmailAndPassword(auth, email, password)
    const nextRoute = await resolveUserRoute(credential.user.uid)
    window.location.replace(nextRoute)
  } catch (error: any) {
    alert("Erro ao entrar: " + error.message)
  }
}

;(window as any).loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider)
    await ensureGoogleUserDocument()

    const nextRoute = await resolveUserRoute(auth.currentUser!.uid)
    window.location.replace(nextRoute)
  } catch (error: any) {
    alert("Erro no login com Google: " + error.message)
  }
}

;(window as any).goToRegister = () => {
  window.location.href = "/src/pages/register.html"
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
