import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "../services/firebase"

const loadingOverlay = document.getElementById("registerLoading")
const registerButton = document.getElementById("registerButton") as HTMLButtonElement | null
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
      reject(new Error("Nao foi possivel processar a imagem selecionada."))
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
    throw new Error("Nao foi possivel preparar a foto para envio.")
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

function setRegisterLoading(isLoading: boolean) {
  loadingOverlay?.classList.toggle("visible", isLoading)
  loadingOverlay?.setAttribute("aria-hidden", String(!isLoading))

  if (registerButton) {
    registerButton.disabled = isLoading
    registerButton.textContent = isLoading ? "Cadastrando..." : "Cadastrar"
  }
}

;(window as any).register = async () => {
  const name = (document.getElementById("name") as HTMLInputElement).value.trim()
  const email = (document.getElementById("email") as HTMLInputElement).value.trim()
  const password = (document.getElementById("password") as HTMLInputElement).value
  const phone = (document.getElementById("phone") as HTMLInputElement).value.trim()
  const club = (document.getElementById("club") as HTMLInputElement).value.trim()
  const category = (document.getElementById("category") as HTMLSelectElement).value.trim()

  if (!name || !email || !password || !category) {
    alert("Preencha nome, e-mail, senha e categoria.")
    return
  }

  try {
    setRegisterLoading(true)

    const userCred = await createUserWithEmailAndPassword(auth, email, password)

    await updateProfile(userCred.user, { displayName: name })

    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      email,
      phone,
      club,
      photoURL: selectedPhotoDataUrl,
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

    window.location.replace("/pages/profile.html")
  } catch (error: any) {
    setRegisterLoading(false)
    alert("Erro ao cadastrar: " + error.message)
  }
}

;(window as any).goToLogin = () => {
  window.location.href = "/pages/login.html"
}

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
  ;(window as any).register()
})
