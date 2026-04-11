import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

function getField<T extends HTMLInputElement | HTMLSelectElement>(id: string) {
  return document.getElementById(id) as T
}

async function loadCurrentProfile(uid: string) {
  const snapshot = await getDoc(doc(db, "users", uid))

  if (!snapshot.exists()) {
    return
  }

  const data = snapshot.data()

  getField<HTMLInputElement>("name").value = data.name ?? auth.currentUser?.displayName ?? ""
  getField<HTMLInputElement>("phone").value = data.phone ?? ""
  getField<HTMLInputElement>("club").value = data.club ?? ""
  getField<HTMLInputElement>("photoURL").value = data.photoURL ?? auth.currentUser?.photoURL ?? ""
  getField<HTMLSelectElement>("category").value = data.category ?? ""
}

;(window as any).saveProfile = async () => {
  const user = auth.currentUser

  if (!user) {
    window.location.replace("/src/pages/login.html")
    return
  }

  const name = getField<HTMLInputElement>("name").value.trim()
  const phone = getField<HTMLInputElement>("phone").value.trim()
  const club = getField<HTMLInputElement>("club").value.trim()
  const photoURL = getField<HTMLInputElement>("photoURL").value.trim()
  const category = getField<HTMLSelectElement>("category").value.trim()

  if (!name || !category) {
    alert("Nome e categoria sao obrigatorios.")
    return
  }

  try {
    const userRef = doc(db, "users", user.uid)
    const existingSnapshot = await getDoc(userRef)
    const existingData = existingSnapshot.data()

    await updateProfile(user, { displayName: name, photoURL: photoURL || null })

    await setDoc(
      userRef,
      {
        name,
        email: user.email ?? "",
        phone,
        club,
        photoURL,
        category,
        role: existingData?.role ?? "user",
        createdAt: existingData?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
        profileComplete: true,
        playerProfile: existingData?.playerProfile ?? {
          wins: 0,
          losses: 0,
          games: 0,
          active: true,
          createdAt: Date.now()
        }
      },
      { merge: true }
    )

    const nextRoute = existingData?.role === "admin" ? "/src/pages/dashboard.html" : "/src/pages/profile.html"
    window.location.replace(nextRoute)
  } catch (error: any) {
    alert("Erro ao salvar perfil: " + error.message)
  }
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/src/pages/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/src/pages/login.html")
    return
  }

  try {
    await loadCurrentProfile(user.uid)
  } catch (error) {
    console.error("Falha ao carregar perfil:", error)
  }
})
