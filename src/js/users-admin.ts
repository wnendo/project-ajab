import { onAuthStateChanged, signOut } from "firebase/auth"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch
} from "firebase/firestore"
import { auth, db } from "../services/firebase"
import { confirmAction } from "./confirm-modal"
import { showToast } from "./toast"
import { User } from "./types"

let checked = false
let users: User[] = []
let selectedUserId: string | null = null

function getPlayerProfileSummary(user?: User | null) {
  const profile = user?.playerProfile
  return {
    games: profile?.games ?? 0,
    wins: profile?.wins ?? 0,
    losses: profile?.losses ?? 0,
    active: profile?.active ?? false
  }
}

function setUserHeader(userData: User) {
  const header = document.getElementById("userSummary")
  if (!header) return

  header.innerHTML = `
    <strong>${userData.name}</strong>
    <span>${userData.club || "Sem clube"}</span>
    <span>${userData.category || "Sem categoria"}</span>
  `
}

function redirectByRole(userData?: User | null) {
  if (!userData) {
    window.location.replace("/pages/login.html")
    return null
  }

  if (!userData.profileComplete) {
    window.location.replace("/pages/complete-profile.html")
    return null
  }

  if (userData.role !== "admin") {
    window.location.replace("/pages/profile.html")
    return null
  }

  return userData
}

function getField<T extends HTMLInputElement | HTMLSelectElement>(id: string) {
  return document.getElementById(id) as T
}

function getTextField(id: string) {
  return document.getElementById(id) as HTMLElement
}

async function getUserTournamentCount(userId: string) {
  const snapshot = await getDocs(collection(db, "users", userId, "tournaments"))
  return snapshot.size
}

function renderUsers(filter = "") {
  const container = document.getElementById("usersAdminResults")
  if (!container) return

  const normalized = filter.trim().toLowerCase()
  const filtered = users.filter((user) => {
    if (!normalized) return true
    return [user.name, user.email, user.club, user.category].some((value) =>
      (value || "").toLowerCase().includes(normalized)
    )
  })

  container.innerHTML = filtered.length
    ? filtered
        .map(
          (user) => `
            <div class="admin-athlete-card user-admin-card">
              <div class="user-admin-head">
                <div>
                  <strong>${user.name}</strong>
                  <span>${user.email || "Email nao informado"}</span>
                </div>
                <span class="result-pill ${user.role === "admin" ? "neutral" : "win"}">
                  ${user.role === "admin" ? "Admin" : "Usuario"}
                </span>
              </div>
              <span>${user.club || "Sem clube"} - ${user.category || "Sem categoria"}</span>
              <div class="admin-athlete-actions">
                <button class="btn secondary" onclick="openUserEditModal('${user.id}')">Editar</button>
                <button class="btn danger" onclick="deleteUserFromSystem('${user.id}')">Excluir</button>
              </div>
            </div>
          `
        )
        .join("")
    : '<div class="empty-state">Nenhum usuario encontrado.</div>'
}

async function loadUsers() {
  const snapshot = await getDocs(collection(db, "users"))
  users = snapshot.docs
    .map((entry) => ({ id: entry.id, ...entry.data() }) as User)
    .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
}

async function fillEditForm(user: User) {
  getField<HTMLInputElement>("editUserName").value = user.name ?? ""
  getField<HTMLInputElement>("editUserEmail").value = user.email ?? ""
  getField<HTMLInputElement>("editUserPhone").value = user.phone ?? ""
  getField<HTMLInputElement>("editUserClub").value = user.club ?? ""
  getField<HTMLSelectElement>("editUserCategory").value = user.category ?? ""
  getField<HTMLSelectElement>("editUserRole").value = user.role ?? "user"
  const stats = getPlayerProfileSummary(user)
  getTextField("editUserGames").textContent = String(stats.games)
  getTextField("editUserWins").textContent = String(stats.wins)
  getTextField("editUserLosses").textContent = String(stats.losses)
  getTextField("editUserTournaments").textContent = "..."

  const tournamentCount = await getUserTournamentCount(user.id)
  if (selectedUserId === user.id) {
    getTextField("editUserTournaments").textContent = String(tournamentCount)
  }
}

async function openUserEditModalById(userId: string) {
  const user = users.find((entry) => entry.id === userId)
  const modal = document.getElementById("userEditModal") as HTMLElement | null

  if (!user || !modal) return

  selectedUserId = userId
  await fillEditForm(user)
  modal.style.display = "flex"
}

async function deleteMatchesForUser(userId: string) {
  const [p1Snapshot, p2Snapshot] = await Promise.all([
    getDocs(query(collection(db, "matches"), where("p1", "==", userId))),
    getDocs(query(collection(db, "matches"), where("p2", "==", userId)))
  ])

  const matchDocs = new Map<string, { id: string; p1: string; p2: string }>()

  ;[...p1Snapshot.docs, ...p2Snapshot.docs].forEach((entry) => {
    const data = entry.data() as { p1: string; p2: string }
    matchDocs.set(entry.id, { id: entry.id, p1: data.p1, p2: data.p2 })
  })

  const refs = Array.from(matchDocs.values())
  for (let index = 0; index < refs.length; index += 150) {
    const batch = writeBatch(db)
    refs.slice(index, index + 150).forEach((match) => {
      batch.delete(doc(db, "matches", match.id))
      batch.delete(doc(db, "users", match.p1, "matches", match.id))
      batch.delete(doc(db, "users", match.p2, "matches", match.id))
    })
    await batch.commit()
  }
}

async function deleteUserData(userId: string) {
  const [userRegistrations, userTournaments, userMatches] = await Promise.all([
    getDocs(collection(db, "users", userId, "registrations")),
    getDocs(collection(db, "users", userId, "tournaments")),
    getDocs(collection(db, "users", userId, "matches"))
  ])

  await deleteMatchesForUser(userId)

  const refs = [
    ...userRegistrations.docs.map((entry) => entry.ref),
    ...userRegistrations.docs.map((entry) => {
      const tournamentId = String(entry.data().tournamentId || entry.id)
      return doc(db, "tournaments", tournamentId, "registrations", userId)
    }),
    ...userTournaments.docs.map((entry) => entry.ref),
    ...userMatches.docs.map((entry) => entry.ref),
    doc(db, "users", userId)
  ]

  for (let index = 0; index < refs.length; index += 400) {
    const batch = writeBatch(db)
    refs.slice(index, index + 400).forEach((ref) => batch.delete(ref))
    await batch.commit()
  }
}

;(window as any).filterUsers = () => {
  const value = (document.getElementById("userSearch") as HTMLInputElement).value
  renderUsers(value)
}

;(window as any).goToDashboard = () => {
  window.location.href = "/pages/dashboard.html"
}

;(window as any).openProfile = () => {
  window.location.href = "/pages/profile.html"
}

;(window as any).logout = async () => {
  await signOut(auth)
  window.location.replace("/pages/login.html")
}

;(window as any).openUserEditModal = (userId: string) => {
  void openUserEditModalById(userId)
}

;(window as any).closeUserEditModal = () => {
  const modal = document.getElementById("userEditModal") as HTMLElement | null
  if (modal) {
    modal.style.display = "none"
  }
  selectedUserId = null
}

;(window as any).saveUserEdits = async () => {
  if (!selectedUserId) return

  const payload = {
    name: getField<HTMLInputElement>("editUserName").value.trim(),
    email: getField<HTMLInputElement>("editUserEmail").value.trim(),
    phone: getField<HTMLInputElement>("editUserPhone").value.trim(),
    club: getField<HTMLInputElement>("editUserClub").value.trim(),
    category: getField<HTMLSelectElement>("editUserCategory").value.trim(),
    role: getField<HTMLSelectElement>("editUserRole").value as User["role"],
    updatedAt: Date.now()
  }

  if (!payload.name || !payload.email) {
    showToast("Nome e email sao obrigatorios.", "warning")
    return
  }

  try {
    await updateDoc(doc(db, "users", selectedUserId), payload)
    const index = users.findIndex((entry) => entry.id === selectedUserId)
    if (index >= 0) {
      users[index] = { ...users[index], ...payload }
    }
    users.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    ;(window as any).closeUserEditModal()
    renderUsers((document.getElementById("userSearch") as HTMLInputElement)?.value ?? "")
    showToast("Usuario atualizado com sucesso.", "success")
  } catch (error: any) {
    showToast("Erro ao salvar usuario: " + error.message, "error")
  }
}

;(window as any).resetUserStats = async () => {
  if (!selectedUserId) return

  const user = users.find((entry) => entry.id === selectedUserId)
  if (!user) return

  const confirmed = await confirmAction({
    title: "Resetar estatisticas",
    message: `Resetar jogos, vitorias e derrotas de ${user.name}?`,
    confirmLabel: "Resetar",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    await updateDoc(doc(db, "users", selectedUserId), {
      "playerProfile.games": 0,
      "playerProfile.wins": 0,
      "playerProfile.losses": 0,
      "playerProfile.lastPlayed": null,
      updatedAt: Date.now()
    })

    const index = users.findIndex((entry) => entry.id === selectedUserId)
    if (index >= 0) {
      users[index] = {
        ...users[index],
        updatedAt: Date.now(),
        playerProfile: {
          ...(users[index].playerProfile ?? { active: false, createdAt: Date.now() }),
          games: 0,
          wins: 0,
          losses: 0,
          lastPlayed: undefined
        }
      }
      fillEditForm(users[index])
    }

    renderUsers((document.getElementById("userSearch") as HTMLInputElement)?.value ?? "")
    showToast("Estatisticas do atleta resetadas com sucesso.", "success")
  } catch (error: any) {
    showToast("Erro ao resetar estatisticas: " + error.message, "error")
  }
}

;(window as any).deleteUserFromSystem = async (userId: string) => {
  const user = users.find((entry) => entry.id === userId)
  if (!user) return

  if (auth.currentUser?.uid === userId) {
    showToast("Nao e permitido excluir o usuario admin que esta atualmente logado.", "warning")
    return
  }

  const confirmed = await confirmAction({
    title: "Excluir usuario",
    message: `Excluir ${user.name} do sistema de dados da AJAB?\n\nIsso remove cadastro, inscricoes, historico e partidas vinculadas na base de dados.`,
    confirmLabel: "Excluir",
    tone: "danger"
  })
  if (!confirmed) return

  try {
    await deleteUserData(userId)
    users = users.filter((entry) => entry.id !== userId)
    renderUsers((document.getElementById("userSearch") as HTMLInputElement)?.value ?? "")
    showToast("Usuario removido dos dados do sistema. A conta de autenticação do Firebase pode continuar existindo.", "success")
  } catch (error: any) {
    showToast("Erro ao excluir usuario: " + error.message, "error")
  }
}

onAuthStateChanged(auth, async (user) => {
  if (checked) return
  checked = true

  if (!user) {
    window.location.replace("/pages/login.html")
    return
  }

  const snapshot = await getDoc(doc(db, "users", user.uid))
  const data = redirectByRole(snapshot.data() as User | undefined)
  if (!data) return

  setUserHeader(data)
  await loadUsers()
  renderUsers()

  const initialUserId = new URLSearchParams(window.location.search).get("id")
  if (initialUserId) {
    void openUserEditModalById(initialUserId)
  }
})
