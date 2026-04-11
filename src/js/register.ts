import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

;(window as any).register = async () => {
  const name = (document.getElementById("name") as HTMLInputElement).value.trim()
  const email = (document.getElementById("email") as HTMLInputElement).value.trim()
  const password = (document.getElementById("password") as HTMLInputElement).value
  const phone = (document.getElementById("phone") as HTMLInputElement).value.trim()
  const club = (document.getElementById("club") as HTMLInputElement).value.trim()
  const category = (document.getElementById("category") as HTMLInputElement).value.trim()

  if (!name || !email || !password || !category) {
    alert("Preencha nome, e-mail, senha e categoria.")
    return
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(userCred.user, { displayName: name })

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      phone,
      club,
      photoURL: "",
      category,
      role: "user",
      createdAt: Date.now(),
      profileComplete: true,
      playerProfile: {
        wins: 0,
        losses: 0,
        games: 0,
        active: true,
        createdAt: Date.now()
      }
    })

    window.location.replace("/src/pages/profile.html")
  } catch (error: any) {
    alert("Erro ao cadastrar: " + error.message)
  }
}

;(window as any).goToLogin = () => {
  window.location.href = "/src/pages/login.html"
}
