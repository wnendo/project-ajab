import {
  getGroupHeading,
  getPlayerStats,
  getPlayersForGroup,
  getQueueForGroup,
  getStartedGroupsCount,
  getTablesForGroup,
  getTournamentTypeLabel,
  getVisibleGroups,
  groupCanStart,
  isGroupAlreadyStarted,
  hasActiveTournament
} from "./tournament-manage"
import { players } from "./store"
import { isRankingModeEnabled } from "./tournament-manage"
import type { CompetitionGroup, Player } from "./types"

let showAllRanking = false
let rankingSearch = ""

function getTournamentPlayers() {
  return players
}

function abbreviatePlayerName(name: string) {
  const trimmed = name.trim()
  if (trimmed.length <= 20) {
    return trimmed
  }

  const parts = trimmed.split(/\s+/).filter(Boolean)
  if (parts.length <= 2) {
    return trimmed
  }

  const first = parts[0]
  const last = parts[parts.length - 1]
  const middle = parts
    .slice(1, -1)
    .find((part) => part.length > 2)

  if (!middle) {
    return `${first} ${last}`
  }

  return `${first} ${middle.charAt(0)}. ${last}`
}

function sortRankingPlayers(list: Player[]) {
  return [...list].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins
    if (a.losses !== b.losses) return a.losses - b.losses
    return a.name.localeCompare(b.name)
  })
}

function renderRankingRow(player: Player, index: number, faded = false) {
  let medalClass = ""
  if (!faded) {
    if (index === 0) medalClass = "gold"
    if (index === 1) medalClass = "silver"
    if (index === 2) medalClass = "bronze"
  }

  const stats = getPlayerStats(player.id)

  return `
    <div class="player-row ${medalClass} ${faded ? "faded" : ""}">
      <div class="player-row-main">
        <span>${index + 1} -</span>
        <span class="player-name" title="${player.name}" onclick="showHistory('${player.id}')">${abbreviatePlayerName(player.name)}</span>
      </div>
      <div class="player-row-stats">
        W:${stats.wins} L:${stats.losses} J:${stats.games}
      </div>
      <div class="player-actions">
        <button onclick="editPlayer('${player.id}')">✏️</button>
        <button onclick="togglePlayer('${player.id}')">${player.active ? "✅" : "⛔"}</button>
        <button onclick="deletePlayer('${player.id}')">❌</button>
      </div>
    </div>
  `
}

function renderRankingSection(title: string, tournamentPlayers: Player[], group?: CompetitionGroup) {
  const filteredPlayers = tournamentPlayers.filter((player) => {
    if (!rankingSearch) return true
    return player.name.toLowerCase().includes(rankingSearch)
  })

  const sortedPlayers = sortRankingPlayers(filteredPlayers)
  const visiblePlayers = sortedPlayers.slice(0, 5)
  const hiddenPlayers = sortedPlayers.slice(5)
  const toggleId = group ? `ranking-hidden-${group}` : "ranking-hidden-general"

  return `
    <div class="group-section ranking-group-card">
      <div class="group-section-header compact">
        <div>
          <span class="section-label">${title}</span>
          <h3>${sortedPlayers.length ? `${sortedPlayers.length} atleta${sortedPlayers.length === 1 ? "" : "s"} no ranking` : "Nenhum atleta encontrado"}</h3>
        </div>
      </div>
      ${
        sortedPlayers.length
          ? `
            <div class="ranking-list">
              ${visiblePlayers.map((player, index) => renderRankingRow(player, index)).join("")}
              ${
                hiddenPlayers.length > 0
                  ? `
                    <div id="${toggleId}" class="ranking-hidden ${showAllRanking ? "open" : ""}">
                      ${hiddenPlayers.map((player, index) => renderRankingRow(player, index + 5, true)).join("")}
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
          : `<div class="empty-state">Nenhum jogador encontrado na pesquisa.</div>`
      }
    </div>
  `
}

function renderCompactPlayerName(player: Player) {
  return `<strong title="${player.name}">${abbreviatePlayerName(player.name)}</strong>`
}

function updateInfo() {
  const playing = new Set<string>()

  getVisibleGroups().forEach((group) => {
    getTablesForGroup(group).forEach((table) => {
      if (table.p1) playing.add(table.p1.id)
      if (table.p2) playing.add(table.p2.id)
    })
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

;(window as any).setRankingSearch = () => {
  const input = document.getElementById("rankingSearch") as HTMLInputElement | null
  rankingSearch = input?.value.trim().toLowerCase() ?? ""
  render()
}

export function render() {
  const ranking = document.getElementById("ranking") as HTMLElement
  const tablesEl = document.getElementById("tables") as HTMLElement
  const queueEl = document.getElementById("queue") as HTMLElement
  const tableCountEl = document.getElementById("tableCount") as HTMLElement
  const startBtn = document.getElementById("startBtn") as HTMLButtonElement | null
  const modeLabel = document.getElementById("tournamentModeLabel") as HTMLElement | null
  const rankingModeAction = document.getElementById("rankingModeAction") as HTMLButtonElement | null
  const visibleGroups = getVisibleGroups()

  if (modeLabel) {
    modeLabel.innerText = getTournamentTypeLabel()
  }

  if (startBtn) {
    if (!hasActiveTournament()) {
      startBtn.disabled = true
      startBtn.innerText = "Ative um torneio"
    } else if (getStartedGroupsCount() === visibleGroups.length) {
      startBtn.disabled = true
      startBtn.innerText = "Categorias iniciadas"
    } else {
      startBtn.disabled = false
      startBtn.innerText = "Use os paineis abaixo"
    }
  }

  if (rankingModeAction) {
    rankingModeAction.style.display = isRankingModeEnabled() ? "flow" : "none"
    rankingModeAction.innerText = visibleGroups.length === 1 ? "Separar A e B" : "Juntar categorias"
  }

  if (tableCountEl) {
    tableCountEl.innerText = visibleGroups.map((group) => `${getGroupHeading(group)}: ${getTablesForGroup(group).length}`).join(" | ")
  }

  ranking.innerHTML = `
    <div class="group-compare-grid ${isRankingModeEnabled() && visibleGroups.length > 1 ? "dual" : "single"}">
      ${
        isRankingModeEnabled() && visibleGroups.length > 1
          ? visibleGroups
              .map(
                (group) => `
                  <div class="group-column">
                    ${renderRankingSection(getGroupHeading(group), getPlayersForGroup(group), group)}
                  </div>
                `
              )
              .join("")
          : `<div class="group-column">${renderRankingSection("Ranking geral", getTournamentPlayers())}</div>`
      }
    </div>
  `

  tablesEl.innerHTML = `
    <div class="group-compare-grid ${visibleGroups.length > 1 ? "dual" : "single"}">
      ${visibleGroups
        .map((group) => {
          const tables = getTablesForGroup(group)
          const canStart = groupCanStart(group)

          return `
            <div class="group-section group-column">
              <div class="group-section-header compact">
                <div>
                  <span class="section-label">${getGroupHeading(group)}</span>
                  <h3>${getPlayersForGroup(group).length} atletas ativos</h3>
                </div>
                <div class="admin-tournament-actions compact">
                  <button class="btn primary" ${canStart ? "" : "disabled"} onclick="startGroup('${group}')">${isGroupAlreadyStarted(group) ? "Atualizar jogos" : `Iniciar ${getGroupHeading(group)}`}</button>
                  <button class="btn secondary" onclick="changeTables('${group}', 1)">+ Mesa</button>
                  <button class="btn secondary" onclick="changeTables('${group}', -1)">- Mesa</button>
                </div>
              </div>
              <div class="tables compact-tables">
                ${tables
                  .map((table, index) => {
                    const isBusy = table.p1 && table.p2
                    if (!isBusy) {
                      return `
                        <div class="table-card free enhanced-table-card compact-card">
                          <div class="table-header">
                            Mesa ${index + 1}
                            <span class="status free">Livre</span>
                          </div>
                          <div class="table-idle-state compact">
                            <strong>Pronta</strong>
                            <span>Aguardando a proxima partida.</span>
                          </div>
                        </div>
                      `
                    }

                    return `
                      <div class="table-card busy enhanced-table-card compact-card">
                        <div class="table-header">
                          Mesa ${index + 1}
                          <span class="status busy">Em jogo</span>
                        </div>
                          <div class="players enhanced-players compact-players">
                          <div class="table-player">
                            <strong title="${table.p1?.name || ""}">${table.p1 ? abbreviatePlayerName(table.p1.name) : ""}</strong>
                          </div>
                          <span class="vs">vs</span>
                          <div class="table-player">
                            <strong title="${table.p2?.name || ""}">${table.p2 ? abbreviatePlayerName(table.p2.name) : ""}</strong>
                          </div>
                        </div>
                        <div class="score-box compact-score-box">
                          <input id="s1_${group}_${index}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish('${group}', ${index})">
                          <span>x</span>
                          <input id="s2_${group}_${index}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish('${group}', ${index})">
                        </div>
                        <button class="finish-btn compact-finish-btn" onclick="finish('${group}', ${index})">Finalizar</button>
                      </div>
                    `
                  })
                  .join("")}
              </div>
            </div>
          `
        })
        .join("")}
    </div>
  `

  const busy = new Set<string>()
  visibleGroups.forEach((group) => {
    getTablesForGroup(group).forEach((table) => {
      if (table.p1) busy.add(table.p1.id)
      if (table.p2) busy.add(table.p2.id)
    })
  })

  queueEl.innerHTML = `
    <div class="group-compare-grid ${visibleGroups.length > 1 ? "dual" : "single"}">
      ${visibleGroups
        .map((group) => {
          const nextMatches = getQueueForGroup(group).filter(([p1, p2]) => !busy.has(p1.id) && !busy.has(p2.id))

          return `
            <div class="group-section queue-section group-column">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">${getGroupHeading(group)}</span>
                  <h3>${nextMatches.length ? `${nextMatches.length} confronto(s) na fila` : "Fila de partidas"}</h3>
                </div>
              </div>
              ${
                nextMatches.length === 0
                  ? `<div class="queue-empty rich">Nenhum jogo aguardando agora. Assim que uma mesa liberar, a proxima disputa aparece aqui.</div>`
                  : `<div class="queue-grid compact-queue-grid">
                      ${nextMatches
                        .map((match, index) => {
                          const p1Stats = getPlayerStats(match[0].id)
                          const p2Stats = getPlayerStats(match[1].id)

                          return `
                              <div class="queue-card next-match-card compact-next-match-card">
                              <div class="queue-card-top">
                                <span class="queue-order">Proximo ${index + 1}</span>
                                <span class="result-pill neutral">${getGroupHeading(group)}</span>
                              </div>
                              <div class="queue-player-block">
                                ${renderCompactPlayerName(match[0])}
                                <span>${p1Stats.wins}V | ${p1Stats.losses}D</span>
                              </div>
                              <div class="queue-versus">vs</div>
                              <div class="queue-player-block">
                                ${renderCompactPlayerName(match[1])}
                                <span>${p2Stats.wins}V | ${p2Stats.losses}D</span>
                              </div>
                            </div>
                          `
                        })
                        .join("")}
                    </div>`
              }
            </div>
          `
        })
        .join("")}
    </div>
  `

  updateInfo()
}
