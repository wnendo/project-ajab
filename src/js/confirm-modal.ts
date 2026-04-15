type ConfirmActionOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: "default" | "danger"
}

function closeModal(
  overlay: HTMLDivElement,
  resolve: (value: boolean) => void,
  value: boolean,
  onKeyDown: (event: KeyboardEvent) => void
) {
  overlay.classList.remove("visible")
  window.setTimeout(() => overlay.remove(), 180)
  document.removeEventListener("keydown", onKeyDown)
  resolve(value)
}

export function confirmAction({
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default"
}: ConfirmActionOptions) {
  return new Promise<boolean>((resolve) => {
    const overlay = document.createElement("div")
    overlay.className = "confirm-modal-overlay"

    const card = document.createElement("div")
    card.className = "confirm-modal-card"
    card.setAttribute("role", "dialog")
    card.setAttribute("aria-modal", "true")
    card.innerHTML = `
      <div class="confirm-modal-copy">
        <span class="section-label">Confirmação</span>
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
      <div class="confirm-modal-actions">
        <button type="button" class="btn secondary confirm-modal-cancel">${cancelLabel}</button>
        <button type="button" class="btn ${tone === "danger" ? "danger" : "primary"} confirm-modal-confirm">${confirmLabel}</button>
      </div>
    `

    const cancelButton = card.querySelector(".confirm-modal-cancel") as HTMLButtonElement | null
    const confirmButton = card.querySelector(".confirm-modal-confirm") as HTMLButtonElement | null

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal(overlay, resolve, false, onKeyDown)
      }
    }

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeModal(overlay, resolve, false, onKeyDown)
      }
    })

    cancelButton?.addEventListener("click", () => closeModal(overlay, resolve, false, onKeyDown))
    confirmButton?.addEventListener("click", () => closeModal(overlay, resolve, true, onKeyDown))

    overlay.appendChild(card)
    document.body.appendChild(overlay)
    document.addEventListener("keydown", onKeyDown)

    requestAnimationFrame(() => {
      overlay.classList.add("visible")
      confirmButton?.focus()
    })
  })
}
