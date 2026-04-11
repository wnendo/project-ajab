import { getPlayerStats, getTournamentRegistrations, hasActiveTournament } from "./tournament-manage"
import { officialQueue, players, tables } from "./store"

let showAllRanking = false

function getTournamentPlayers() {
  return players
}

function updateInfo() {
  const playing = new Set<string>()

  tables.forEach((table) => {
    if (table.p1) playing.add(table.p1.id)
    if (table.p2) playing.add(table.p2.id)
  })

  ;(document.getElementById("playersPlaying") as HTMLElement).innerText = String(playing.size)
  ;(document.getElementById("playersWaiting") as HTMLElement).innerText = String(
    getTournamentPlayers().filter((player) => player.active && !playing.has(player.id)).length
  )
  ;(document.getElementById("playersTotal") as HTMLElement).innerText = String(getTournamentPlayers().length)
}

;(window as any).toggleRankingView = () => {
  showAllRanking = !showAllRanking
  render()
}

export function render() {
  const ranking = document.getElementById("ranking") as HTMLElement
  const registrationsEl = document.getElementById("registrations") as HTMLElement | null
  const tablesEl = document.getElementById("tables") as HTMLElement
  const queueEl = document.getElementById("queue") as HTMLElement
  const tableCountEl = document.getElementById("tableCount") as HTMLElement
  const startBtn = document.getElementById("startBtn") as HTMLButtonElement
  const isSingleTable = tables.length === 1

  if (startBtn) {
    const activePlayers = players.filter((player) => player.active)

    if (!hasActiveTournament()) {
      startBtn.disabled = true
      startBtn.innerText = "Ative um torneio"
    } else if (activePlayers.length < 2) {
      startBtn.disabled = true
      startBtn.innerText = "Ative Atletas"
    } else {
      startBtn.disabled = false
      startBtn.innerText = "Iniciar"
    }
  }

  if (tableCountEl) {
    tableCountEl.innerText = String(tables.length)
  }

  const sorted = [...getTournamentPlayers()].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (a.losses !== b.losses) return a.losses - b.losses
    return a.name.localeCompare(b.name)
  })

  const visiblePlayers = sorted.slice(0, 5)
  const hiddenPlayers = sorted.slice(5)

  ranking.innerHTML = `
    <div class="ranking-list">
      ${visiblePlayers
        .map((player, index) => {
          let medalClass = ""
          if (index === 0) medalClass = "gold"
          if (index === 1) medalClass = "silver"
          if (index === 2) medalClass = "bronze"

          const stats = getPlayerStats(player.id)

          return `
            <div class="player-row ${medalClass}">
              <div style="width:70%; display:flex; gap:4px;">
                <span>${index + 1} -</span>
                <span class="player-name" onclick="showHistory('${player.id}')">${player.name}</span>
              </div>
              <div style="width:10%;">
                W:${stats.wins} L:${stats.losses} J:${stats.games}
              </div>
              <div class="player-actions">
                <button onclick="editPlayer('${player.id}')">Editar</button>
                <button onclick="togglePlayer('${player.id}')">${player.active ? "Ativo" : "Pausado"}</button>
                <button onclick="deletePlayer('${player.id}')">Remover</button>
              </div>
            </div>
          `
        })
        .join("")}

      ${
        hiddenPlayers.length > 0
          ? `
            <div class="ranking-hidden ${showAllRanking ? "open" : ""}">
              ${hiddenPlayers
                .map((player, index) => {
                  const position = index + 6
                  const stats = getPlayerStats(player.id)

                  return `
                    <div class="player-row faded">
                      <div style="width:70%; display:flex; gap:4px;">
                        <span>${position} -</span>
                        <span class="player-name" onclick="showHistory('${player.id}')">${player.name}</span>
                      </div>
                      <div style="width:10%;">
                        W:${stats.wins} L:${stats.losses} J:${stats.games}
                      </div>
                      <div class="player-actions">
                        <button onclick="editPlayer('${player.id}')">Editar</button>
                        <button onclick="togglePlayer('${player.id}')">${player.active ? "Ativo" : "Pausado"}</button>
                        <button onclick="deletePlayer('${player.id}')">Remover</button>
                      </div>
                    </div>
                  `
                })
                .join("")}
              ${!showAllRanking ? `<div class="fade-overlay"></div>` : ""}
            </div>
            <div class="ranking-toggle" onclick="toggleRankingView()">
              ${showAllRanking ? "Mostrar menos" : "Mostrar mais"}
            </div>
          `
          : ""
      }
    </div>
  `

  if (registrationsEl) {
    const registrations = getTournamentRegistrations()
    registrationsEl.innerHTML = registrations.length
      ? registrations
          .map(
            (registration) => `
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${registration.name}</strong>
                    <span>${registration.email || "Email nao informado"}</span>
                  </div>
                  <span class="result-pill ${registration.paymentStatus === "approved" ? "win" : "neutral"}">
                    ${registration.paymentStatus === "approved" ? "Pago aprovado" : "Pagamento em analise"}
                  </span>
                </div>
                <div class="stack-item-grid">
                  <span>Categoria: ${registration.category || "Nao informada"}</span>
                  <span>Valor: ${
                    registration.registrationFee !== undefined
                      ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(registration.registrationFee)
                      : "Nao informado"
                  }</span>
                </div>
                <div class="admin-tournament-actions">
                  ${
                    registration.paymentStatus !== "approved"
                      ? `<button class="btn primary" onclick="approveRegistration('${registration.id}')">Aprovar pagamento</button>`
                      : `<button class="btn secondary" disabled>Pagamento aprovado</button>`
                  }
                  <button class="btn danger" onclick="removeRegistration('${registration.id}')">Remover inscricao</button>
                </div>
              </div>
            `
          )
          .join("")
      : `<div class="empty-state">Nenhuma inscricao recebida ainda.</div>`
  }

  tablesEl.innerHTML = tables
    .map((table, index) => {
      const isBusy = table.p1 && table.p2
      const sizeClass = isSingleTable ? "single" : ""

      if (!isBusy) {
        return `
          <div class="table-card free ${sizeClass}">
            <div class="table-header">
              Mesa ${index + 1}
              <span class="status free">Livre</span>
            </div>
          </div>
        `
      }

      return `
        <div class="table-card busy ${sizeClass}">
          <div class="table-header">
            Mesa ${index + 1}
            <span class="status busy">Em jogo</span>
          </div>

          <div class="players">
            <span>${table.p1?.name}</span>
            <span class="vs">vs</span>
            <span>${table.p2?.name}</span>
          </div>

          <div class="score-box">
            <input id="s1_${index}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish(${index})">
            <span>x</span>
            <input id="s2_${index}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish(${index})">
          </div>

          <button class="finish-btn" onclick="finish(${index})">Finalizar</button>
        </div>
      `
    })
    .join("")

  const busy = new Set<string>()
  tables.forEach((table) => {
    if (table.p1) busy.add(table.p1.id)
    if (table.p2) busy.add(table.p2.id)
  })

  const validQueue = officialQueue.filter(([p1, p2]) => !busy.has(p1.id) && !busy.has(p2.id))
  const nextMatches = validQueue.slice(0, tables.length)

  if (nextMatches.length === 0) {
    queueEl.innerHTML = `<div class="queue-empty">Aguardando partidas</div>`
  } else {
    queueEl.innerHTML = nextMatches
      .map(
        (match) => `
          <div class="queue-card">
            ${match[0].name} vs ${match[1].name}
          </div>
        `
      )
      .join("")
  }

  updateInfo()
}
