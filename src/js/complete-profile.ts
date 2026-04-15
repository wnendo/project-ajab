import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

function getField<T extends HTMLInputElement | HTMLSelectElement>(id: string) {
  return document.getElementById(id) as T
}

const photoFileInput = document.getElementById("photoFile") as HTMLInputElement | null
const photoPreview = document.getElementById("photoPreview") as HTMLImageElement | null
const photoPreviewFallback = document.getElementById("photoPreviewFallback") as HTMLDivElement | null

let selectedPhotoDataUrl = ""
const MAX_INPUT_FILE_SIZE = 3 * 1024 * 1024
const MAX_OUTPUT_SIZE = 380 * 1024
const MAX_DIMENSION = 1200

function shouldSubmitOnEnter(target: EventTarget | null) {
  return !(target instanceof HTMLTextAreaElement)
}

function updatePhotoPreview(photoURL: string) {
  if (photoPreview) {
    photoPreview.src = photoURL
    photoPreview.style.display = photoURL ? "block" : "none"
  }

  if (photoPreviewFallback) {
    photoPreviewFallback.style.display = photoURL ? "none" : "flex"
  }
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("Não foi possivel processar a imagem selecionada."))
    }

    image.src = objectUrl
  })
}

function dataUrlSizeInBytes(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? ""
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0

  return Math.floor((base64.length * 3) / 4) - padding
}

async function compressImageToDataUrl(file: File) {
  const image = await loadImage(file)
  const canvas = document.createElement("canvas")
  const context = canvas.getContext("2d")

  if (!context) {
    throw new Error("Não foi possivel preparar a foto para envio.")
  }

  let width = image.width
  let height = image.height

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  canvas.width = width
  canvas.height = height
  context.drawImage(image, 0, 0, width, height)

  let quality = 0.88
  let output = canvas.toDataURL("image/jpeg", quality)

  while (dataUrlSizeInBytes(output) > MAX_OUTPUT_SIZE && quality > 0.42) {
    quality -= 0.08
    output = canvas.toDataURL("image/jpeg", quality)
  }

  if (dataUrlSizeInBytes(output) > MAX_OUTPUT_SIZE) {
    throw new Error("A foto ainda ficou muito grande. Tente usar uma imagem mais simples ou recortada.")
  }

  return output
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
  selectedPhotoDataUrl = data.photoURL ?? auth.currentUser?.photoURL ?? ""
  updatePhotoPreview(selectedPhotoDataUrl)
  getField<HTMLSelectElement>("category").value = data.category ?? ""
}

;(window as any).saveProfile = async () => {
  const user = auth.currentUser

  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  const name = getField<HTMLInputElement>("name").value.trim()
  const phone = getField<HTMLInputElement>("phone").value.trim()
  const club = getField<HTMLInputElement>("club").value.trim()
  const photoURL = selectedPhotoDataUrl.trim()
  const category = getField<HTMLSelectElement>("category").value.trim()

  if (!name || !category) {
    alert("Nome e categoria são obrigatorios.")
    return
  }

  try {
    const userRef = doc(db, "users", user.uid)
    const existingSnapshot = await getDoc(userRef)
    const existingData = existingSnapshot.data()

    await updateProfile(user, { displayName: name })

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

    const nextRoute = existingData?.role === "admin" ? "/pages/dashboard.html" : "/pages/profile.html"
    window.location.replace(nextRoute)
  } catch (error: any) {
    alert("Erro ao salvar perfil: " + error.message)
  }
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/login.html")
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  try {
    await loadCurrentProfile(user.uid)
  } catch (error) {
    console.error("Falha ao carregar perfil:", error)
  }
})

photoFileInput?.addEventListener("change", async () => {
  const file = photoFileInput.files?.[0]

  if (!file) {
    selectedPhotoDataUrl = ""
    updatePhotoPreview("")
    return
  }

  if (!file.type.startsWith("image/")) {
    alert("Selecione um arquivo de imagem valido.")
    photoFileInput.value = ""
    return
  }

  if (file.size > MAX_INPUT_FILE_SIZE) {
    alert("A foto precisa ter no maximo 3 MB.")
    photoFileInput.value = ""
    return
  }

  try {
    selectedPhotoDataUrl = await compressImageToDataUrl(file)
    updatePhotoPreview(selectedPhotoDataUrl)
  } catch (error: any) {
    selectedPhotoDataUrl = ""
    updatePhotoPreview("")
    photoFileInput.value = ""
    alert(error.message)
  }
})

document.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || !shouldSubmitOnEnter(event.target)) {
    return
  }

  event.preventDefault()
  ;(window as any).saveProfile()
})
