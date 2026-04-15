type ToastType = "success" | "error" | "warning" | "info"

type ToastOptions = {
  duration?: number
}

type PendingToast = {
  message: string
  type: ToastType
  duration?: number
}

const TOAST_CONTAINER_ID = "toastContainer"
const PENDING_TOAST_KEY = "ajab:pending-toast"

function ensureToastContainer() {
  let container = document.getElementById(TOAST_CONTAINER_ID)
  if (container) return container

  container = document.createElement("div")
  container.id = TOAST_CONTAINER_ID
  container.className = "toast-container"
  document.body.appendChild(container)
  return container
}

export function showToast(message: string, type: ToastType = "info", options: ToastOptions = {}) {
  const container = ensureToastContainer()
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.setAttribute("role", type === "error" ? "alert" : "status")
  toast.textContent = message

  container.appendChild(toast)

  requestAnimationFrame(() => {
    toast.classList.add("visible")
  })

  const duration = options.duration ?? (type === "error" ? 4200 : 3200)

  window.setTimeout(() => {
    toast.classList.remove("visible")
    window.setTimeout(() => toast.remove(), 220)
  }, duration)
}

export function redirectWithToast(url: string, message: string, type: ToastType = "info", options: ToastOptions = {}) {
  const payload: PendingToast = {
    message,
    type,
    duration: options.duration
  }
  sessionStorage.setItem(PENDING_TOAST_KEY, JSON.stringify(payload))
  window.location.href = url
}

function consumePendingToast() {
  const raw = sessionStorage.getItem(PENDING_TOAST_KEY)
  if (!raw) return

  sessionStorage.removeItem(PENDING_TOAST_KEY)

  try {
    const pending = JSON.parse(raw) as PendingToast
    showToast(pending.message, pending.type, { duration: pending.duration })
  } catch {
    // ignore malformed pending toast payloads
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", consumePendingToast, { once: true })
} else {
  consumePendingToast()
}
