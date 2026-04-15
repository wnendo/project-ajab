import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,n as o,p as s,t as c,x as l}from"./firebase-VBRKn9At.js";import{n as u}from"./toast-kV3jSCF7.js";/* empty css               */import{u as d}from"./tournament-rules-D9Tq3W95.js";var f=new URLSearchParams(window.location.search),p=f.get(`id`),m=f.get(`category`),h=!1,g=null,_=null,v=[];function y(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function ee(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`<strong>${e.name}</strong><span>${e.club||`Sem clube`}</span><span>${e.category||`Sem categoria`}</span>`)}function b(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function te(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>y(e)).filter(Boolean))]}function x(e){return v.filter(e=>e.paymentStatus===`approved`).filter(t=>te(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function S(e,t){return x(e).find(e=>e.id===t)}function C(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function w(e){let t=g?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,knockoutStarted:t?.knockoutStarted??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:C(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function T(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function E(e){return _&&S(_,e)?.name||`Atleta`}function D(e){return _&&S(_,e)?.club||`Sem clube`}function ne(e){return e===1?`1o lugar`:e===2?`2o lugar`:e===3?`3o lugar`:`4o lugar`}function re(e){return e===1?`podium-gold`:e===2?`podium-silver`:`podium-bronze`}function O(e){let t=H(e.groups??[],e);if(t.length<2)return null;let n=t[t.length-1],r=t[t.length-2],i=n.matches[0];if(!i?.playerIds||!i.resolvedWinnerId)return null;let a=i.resolvedWinnerId,o=i.playerIds.find(e=>e!==a);if(!o)return null;let s=r.matches.filter(e=>e.playerIds&&e.resolvedWinnerId);if(s.length<2)return null;let c=s.find(e=>e.playerIds?.includes(a)),l=s.find(e=>e.playerIds?.includes(o));if(!c||!l)return null;let u=c.playerIds?.find(e=>e!==a),d=l.playerIds?.find(e=>e!==o);return!u||!d?null:[a,o,u,d]}function k(e){return e===1?`Campeao`:e===2?`Vice-campeao`:e===3?`3o lugar`:e===4?`4o lugar`:`${e}o lugar`}function A(e,t){return(e.completedMatches??[]).reduce((e,n)=>n.playerIds.includes(t)?(e.matchCount+=1,n.winnerId===t?e.wins+=1:e.losses+=1,e):e,{matchCount:0,wins:0,losses:0})}async function ie(e,t,r){let i=g;if(!i||!r.length)return;let a=n(o),c=Date.now();r.forEach((n,r)=>{let l=r+1,u=A(t,n),d={id:i.id,tournamentId:i.id,title:i.title,category:e,placement:`${l}o lugar`,result:k(l),matchCount:u.matchCount,wins:u.wins,losses:u.losses,playedAt:c};a.set(s(o,`users`,n,`tournaments`,i.id),d,{merge:!0})}),await a.commit()}function j(e){let t=_;return!t||e.finished||!U(e)||(e.activeTables??[]).some(e=>e.match)?!1:x(t).length>=4}function ae(e){let t=e.finalStandings??[];return t.length?`
    <section class="championship-block">
      <div class="championship-block-head">
        <h3>Classificação final</h3>
        <p>Encerramento oficial da categoria com definição do 1° ao 4° lugar.</p>
      </div>
      <div class="stack-list">
        ${t.slice(0,4).map((e,t)=>`
          <div class="stack-item">
            <div class="stack-item-header">
              <div>
                <strong>${E(e)}</strong>
                <span>${D(e)}</span>
              </div>
              <span class="result-pill ${re(t+1)}">${ne(t+1)}</span>
            </div>
          </div>
        `).join(``)}
      </div>
    </section>
  `:``}function oe(e,t){let n=E(e.playerIds[0]),r=E(e.playerIds[1]);return t?`${n} ${t.score1??0}x${t.score2??0} ${r}`:`${n} x ${r}`}function M(e,t){return(e.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===t)}function se(e,t){return(e.completedMatches??[]).find(e=>e.id===t)}function ce(e,t){let n=N(e,t);return n.length?`
    <div class="championship-standings-list">
      ${n.map((e,t)=>`
        <div class="championship-standing-row">
          <span class="championship-standing-place">${t+1}o</span>
          <div class="championship-standing-player">
            <strong>${E(e.playerId)}</strong>
            <small>${e.wins}V · ${e.setDiff>=0?`+`:``}${e.setDiff} sets · ${e.pointDiff>=0?`+`:``}${e.pointDiff} pts</small>
          </div>
        </div>
      `).join(``)}
    </div>
  `:`<div class="championship-standings-empty">Sem atletas neste grupo.</div>`}function N(e,t){let n=new Map;return e.playerIds.forEach(e=>{n.set(e,{playerId:e,wins:0,losses:0,setsWon:0,setsLost:0,setDiff:0,pointsWon:0,pointsLost:0,pointDiff:0})}),M(t,e.id).forEach(e=>{let[t,r]=e.playerIds,i=e.score1??0,a=e.score2??0,o=n.get(t),s=n.get(r);!o||!s||(o.setsWon+=i,o.setsLost+=a,s.setsWon+=a,s.setsLost+=i,o.pointsWon+=i,o.pointsLost+=a,s.pointsWon+=a,s.pointsLost+=i,e.winnerId===t?(o.wins+=1,s.losses+=1):e.winnerId===r&&(s.wins+=1,o.losses+=1))}),[...n.values()].map(e=>({...e,setDiff:e.setsWon-e.setsLost,pointDiff:e.pointsWon-e.pointsLost})).sort((e,t)=>t.wins===e.wins?t.setDiff===e.setDiff?t.pointsWon===e.pointsWon?t.pointDiff===e.pointDiff?E(e.playerId).localeCompare(E(t.playerId)):t.pointDiff-e.pointDiff:t.pointsWon-e.pointsWon:t.setDiff-e.setDiff:t.wins-e.wins)}function le(e,t){let n=_;if(!n)return!1;let r=T(n,e).length;return M(t,e.id).length>=r}function ue(e){return[...e].sort((e,t)=>t.wins===e.wins?t.setDiff===e.setDiff?t.pointsWon===e.pointsWon?t.pointDiff===e.pointDiff?E(e.playerId).localeCompare(E(t.playerId)):t.pointDiff-e.pointDiff:t.pointsWon-e.pointsWon:t.setDiff-e.setDiff:t.wins-e.wins)}function de(e,t){let n=[],r=[];return e.forEach(e=>{if(!le(e,t))return;let i=ue(N(e,t)),a=i[0],o=i[1];a&&n.push({...a,groupId:e.id,groupName:e.name,placement:1}),o&&r.push({...o,groupId:e.id,groupName:e.name,placement:2})}),{winners:n,runnersUp:r}}function P(e,t){let n=`${e??``} ${t??``}`.trim().match(/(\d+)/);return n?Number(n[1]):2**53-1}function F(e){return[...e].sort((e,t)=>{let n=P(e.groupName,e.groupId)-P(t.groupName,t.groupId);return n===0?E(e.playerId).localeCompare(E(t.playerId)):n})}function I(e){return e>=8?`Oitavas`:e>=4?`Quartas`:e>=2?`Semifinais`:`Final`}function L(e){return(e.completedMatches??[]).filter(e=>e.stage===`knockout`)}function R(e){return new Map(L(e).map(e=>[e.id,e]))}function z(e){return new Set(C(e.activeTables,e.tableCount??1).filter(e=>e.match?.stage===`knockout`).map(e=>e.match?.id).filter(Boolean))}function B(e){let t=1;for(;t<e;)t*=2;return t}function V(e){let t=[...e],n=[];for(;t.length>=2;){let e=t.shift();if(!e)break;let r=t.findIndex(t=>t.groupId!==e.groupId);r<0&&(r=0);let[i]=t.splice(r,1);i&&n.push([e,i])}return n}function H(e,t){if(e.length<2)return[];let{winners:n,runnersUp:r}=de(e,t),i=n.length+r.length;if(i<2)return[];let a=B(i),o=R(t),s=[],c=Math.max(0,a-i),l=F(n),u=F(r),d=l.slice(0,c),f=l.slice(c),p=[...u],m=[];f.forEach(e=>{if(!p.length)return;let t=p.findIndex(t=>t.groupId!==e.groupId);t<0&&(t=0);let[n]=p.splice(t,1);n&&m.push({labels:[E(e.playerId),E(n.playerId)],playerIds:[e.playerId,n.playerId]})}),V(p).forEach(([e,t])=>{m.push({labels:[E(e.playerId),E(t.playerId)],playerIds:[e.playerId,t.playerId]})});let h=[],g=a/2;for(let e=0;e<g;e++){let t=d[e],n=m[e];if(t){let e=h.length+1;h.push({id:`KO_R1_S${e}`,title:`J1-${e}`,labels:[E(t.playerId),`BYE`],resolvedWinnerId:t.playerId,isBye:!0,roundIndex:1,slot:e})}if(n){let e=h.length+1;h.push({id:`KO_R1_S${e}`,title:`J1-${e}`,labels:n.labels,playerIds:n.playerIds,resolvedWinnerId:o.get(`KO_R1_S${e}`)?.winnerId,roundIndex:1,slot:e})}}if(!h.length)return[];s.push({title:I(h.length),matches:h});let _=h,v=2;for(;_.length>1;){let e=[];for(let t=0;t<_.length;t+=2){let n=_[t],r=_[t+1];if(!n||!r)continue;let i=o.get(n.id)?.winnerId,a=o.get(r.id)?.winnerId,s=e.length+1,c=i??n.resolvedWinnerId,l=a??r.resolvedWinnerId;e.push({id:`KO_R${v}_S${s}`,title:`J${v}-${s}`,labels:[c?E(c):`Vencedor ${n.title}`,l?E(l):`Vencedor ${r.title}`],playerIds:c&&l?[c,l]:void 0,resolvedWinnerId:o.get(`KO_R${v}_S${s}`)?.winnerId,roundIndex:v,slot:s})}if(!e.length)break;s.push({title:e.length===1?`Final`:I(e.length),matches:e}),_=e,v+=1}return s}function fe(e){let t=_;return t?(e.groups??[]).flatMap(e=>T(t,e)):[]}function pe(e){return new Set((e.completedMatches??[]).filter(e=>e.stage===`groups`).map(e=>e.id))}function me(e){return new Set(C(e.activeTables,e.tableCount??1).map(e=>e.match?.id).filter(Boolean))}function he(e){let t=_;if(!t)return new Map;let n=pe(e),r=me(e),i=new Map;for(let a of e.groups??[]){let e=T(t,a).filter(e=>!n.has(e.id)).filter(e=>!r.has(e.id));i.set(a.id,e)}return i}function ge(e){let t=_;if(!e.knockoutStarted||!t)return[];let n=H(e.groups??[],e).flatMap(e=>e.matches.map(n=>({id:n.id,stage:`knockout`,category:t,playerIds:n.playerIds,roundIndex:n.roundIndex,roundTitle:e.title,slot:n.slot}))),r=new Set(L(e).map(e=>e.id)),i=z(e);return n.filter(e=>!!e.playerIds).filter(e=>!r.has(e.id)).filter(e=>!i.has(e.id)).map(e=>({id:e.id,stage:`knockout`,category:e.category,playerIds:e.playerIds,roundIndex:e.roundIndex,roundTitle:e.roundTitle,slot:e.slot}))}function U(e){let t=fe(e).length,n=(e.completedMatches??[]).filter(e=>e.stage===`groups`).length;return t>0&&n>=t}function W(e){return!e.defined||!e.groups?.length?!1:!U(e)}function _e(e){let t=_;if(!t)return[];let n=new Set((e.groups??[]).flatMap(e=>e.playerIds));return x(t).filter(e=>!n.has(e.id))}function G(e,t){let n=C(e.activeTables,e.tableCount??1).find(e=>e.groupId===t);return n?`Mesa ${n.id}`:`Aguardando mesa`}function K(e){let t=e.groups??[],n=he(e),r=ge(e),i=C(e.activeTables,e.tableCount??1).map(e=>({...e,...e.match?.groupId?{groupId:e.match.groupId}:{}})),a=new Set;return i.forEach(e=>{if(e.match?.groupId){a.add(e.match.groupId);return}if(e.groupId){let t=n.get(e.groupId)??[];t.length>0?(e.match=t.shift(),a.add(e.groupId)):delete e.groupId}}),i.forEach(e=>{if(e.match||e.groupId)return;let r=t.find(e=>a.has(e.id)?!1:(n.get(e.id)?.length??0)>0);if(!r)return;let i=n.get(r.id)?.shift();i&&(e.groupId=r.id,e.match=i,a.add(r.id))}),i.forEach(e=>{if(e.match)return;let t=r.shift();t&&(delete e.groupId,e.match=t)}),{activeTables:i,queue:[...t.flatMap(e=>n.get(e.id)??[]),...r]}}async function q(e){let t=g,n=_;if(!t||!n)return;let r=w(n),i=Math.max(1,e.tableCount??r.tableCount??1),c={...r,...e,tableCount:i,activeTables:C(e.activeTables??r.activeTables,i)};t.championshipState={...t.championshipState??{},[n]:c},g=t,await a(s(o,`tournaments`,t.id),{championshipState:t.championshipState,updatedAt:Date.now()})}async function ve(){if(!p){window.location.replace(`/pages/dashboard.html`);return}if(_=y(m||void 0),!_){window.location.replace(`/pages/championship-manage.html?id=${p}`);return}let e=await i(s(o,`tournaments`,p));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}g={id:e.id,...e.data()},d(g)!==`championship`&&window.location.replace(`/pages/tournament-manage.html?id=${e.id}`)}async function ye(){let e=g;e&&(v=(await t(r(o,`tournaments`,e.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()})))}function J(){let e=g,t=_;if(!e||!t)return;let n=w(t),r=n.groups??[],i=n.queue??[],a=n.activeTables?.filter(e=>e.match)??[],o=H(r,n),s=i.filter(e=>e.stage===`knockout`),c=i.filter(e=>e.stage===`groups`),l=a.filter(e=>e.match?.stage===`knockout`),u=_e(n),d=U(n),f=W(n),p=o.some(e=>e.matches.some(e=>e.playerIds)),m=n.finished?`Categoria encerrada`:d?`Grupos concluidos`:n.started?`Jogos em andamento`:`Categoria aberta`,h=j(n);document.getElementById(`categoryPageTitle`).textContent=`${e.title}`,document.getElementById(`categoryTitle`).textContent=`Categoria ${t}`,document.getElementById(`categoryTitle`).style.textAlign=`left`,document.getElementById(`categoryPageSubtitle`).textContent=`${e.location||`Local a definir`} - esta categoria ja esta definida. Os grupos jogam em mesas dedicadas e so trocam quando um grupo termina seus confrontos.`,document.getElementById(`categoryPageContent`).innerHTML=`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${t}</span>
          <h2>${x(t).length} atletas aprovados</h2>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card"><span>Status</span><strong>${m}</strong></div>
        <div class="info-card"><span>Grupos</span><strong>${r.length}</strong></div>
        <div class="info-card"><span>Mesas</span><strong>${n.tableCount??1}</strong></div>
      </div>

      <div class="championship-layout">
        <section class="championship-block">
          <div class="championship-block-head">
            <h3>Fase de grupos</h3>
            <p>Cada grupo permanece na sua mesa ate concluir todos os jogos. Depois disso, a mesa pode receber o proximo grupo da fila.</p>
          </div>
          ${r.length?`<div class="championship-groups-grid">
                  ${r.map(e=>{let r=i.filter(t=>t.groupId===e.id),a=G(n,e.id),o=T(t,e).every(e=>(n.completedMatches??[]).some(t=>t.id===e.id));return`
                      <article class="championship-group-card">
                        <div class="championship-group-card-head">
                          <strong>${e.name}</strong>
                          <span>${e.playerIds.length} atletas</span>
                        </div>
                        <div class="championship-group-meta">
                          <span>${a}</span>
                          <span>${o?`Grupo concluido`:`${r.length} jogo(s) na fila`}</span>
                        </div>
                        <div class="championship-group-standings">
                          <div class="championship-group-standings-head">
                            <strong>Classificação do grupo</strong>
                            <span>${e.playerIds.length} atleta(s)</span>
                          </div>
                          ${ce(e,n)}
                        </div>
                        <div class="championship-match-list">
                          ${T(t,e).map(e=>`<span>${oe(e,se(n,e.id))}</span>`).join(``)}
                        </div>
                      </article>
                    `}).join(``)}
                </div>`:`<div class="empty-state">Volte para a pagina principal do campeonato e sorteie os grupos primeiro.</div>`}
        </section>

        <section class="championship-block championship-management-block">
          <div class="championship-management-head">
            <div class="championship-block-head">
              <h3>Gestao dos jogos</h3>
              <p>As mesas ficam dedicadas ao grupo ativo. Se um grupo terminar, a vaga passa para o proximo grupo que ainda tiver jogos pendentes.</p>
            </div>
            <div class="championship-management-toolbar">
              <button class="btn secondary" onclick="changeTables(-1)">- Mesa</button>
              <button class="btn secondary" onclick="changeTables(1)">+ Mesa</button>
              <button class="btn primary" ${r.length&&!n.finished?``:`disabled`} onclick="startCategory()">${n.started?`Atualizar jogos`:`Iniciar jogos`}</button>
              <button class="btn secondary" ${h?``:`disabled`} onclick="openFinalizeCategoryModal()">Encerrar categoria</button>
            </div>
          </div>
          <div class="group-compare-grid dual">
            <div class="group-column">
              <div class="group-section queue-section">
                <div class="group-section-header queue-section-header compact">
                  <div>
                    <span class="section-label">Proximos jogos</span>
                    <h3>${c.length?`${c.length} confronto(s) aguardando`:`Fila vazia`}</h3>
                  </div>
                </div>
                ${c.length?`<div class="queue-grid compact-queue-grid">
                        ${c.slice(0,8).map((e,t)=>`
                          <div class="queue-card next-match-card compact-next-match-card">
                            <div class="queue-card-top">
                              <span class="queue-order">Proximo ${t+1}</span>
                              <span class="result-pill neutral">${e.groupId||`Grupo`} - ${G(n,e.groupId||``)}</span>
                            </div>
                            <div class="queue-player-block">
                              <strong>${E(e.playerIds[0])}</strong>
                              <span>${D(e.playerIds[0])}</span>
                            </div>
                            <div class="queue-versus">vs</div>
                            <div class="queue-player-block">
                              <strong>${E(e.playerIds[1])}</strong>
                              <span>${D(e.playerIds[1])}</span>
                            </div>
                          </div>
                        `).join(``)}
                      </div>`:`<div class="queue-empty rich">Nenhum jogo aguardando agora.</div>`}
              </div>

              <div class="group-section queue-section">
                <div class="group-section-header queue-section-header compact">
                  <div>
                    <span class="section-label">Adicionar atleta</span>
                    <h3>${u.length} atleta(s) fora dos grupos</h3>
                  </div>
                </div>
                ${f?u.length?`<div class="championship-assign-list">
                          ${u.map(e=>`
                            <div class="championship-assign-row">
                              <div class="championship-assign-player">
                                <strong>${e.name}</strong>
                                <span>${e.club||`Sem clube`}</span>
                              </div>
                              <select id="assignGroup_${e.id}">
                                ${r.map(e=>`<option value="${e.id}">${e.name}</option>`).join(``)}
                              </select>
                              <button class="btn secondary" onclick="addPlayerToGroup('${e.id}')">Adicionar</button>
                            </div>
                          `).join(``)}
                        </div>`:`<div class="queue-empty rich">Todos os atletas aprovados desta categoria já estao distribuidos nos grupos.</div>`:`<div class="queue-empty rich">Não é mais possivel adicionar atletas: todos os jogos da fase de grupos já foram concluídos.</div>`}
              </div>
            </div>

            <div class="group-column">
              <div class="group-section">
                <div class="group-section-header compact">
                  <div>
                    <span class="section-label">Mesas / Partidas</span>
                    <h3>${a.length} mesa(s) em andamento</h3>
                  </div>
                </div>
                <div class="tables compact-tables">
                  ${(n.activeTables??[]).map((e,t)=>{let n=e.match;return n?`<div class="table-card busy enhanced-table-card compact-card">
                      <div class="table-header">Mesa ${e.id}<span class="status busy">${n.stage===`knockout`?n.roundTitle||`Mata-mata`:n.groupId||`Grupo`}</span></div>
                      <div class="players enhanced-players compact-players">
                        <div class="table-player"><strong>${E(n.playerIds[0])}</strong><span>${D(n.playerIds[0])}</span></div>
                        <span class="vs">vs</span>
                        <div class="table-player"><strong>${E(n.playerIds[1])}</strong><span>${D(n.playerIds[1])}</span></div>
                      </div>
                      <div class="score-box compact-score-box">
                        <input id="score1_${t}" type="number" min="0" step="1" value="${n.score1??0}">
                        <span>x</span>
                        <input id="score2_${t}" type="number" min="0" step="1" value="${n.score2??0}">
                      </div>
                      <button class="finish-btn compact-finish-btn" onclick="finishMatch(${t})">Finalizar</button>
                    </div>`:`<div class="table-card free enhanced-table-card compact-card">
                        <div class="table-header">Mesa ${e.id}<span class="status free">${e.groupId||`Livre`}</span></div>
                        <div class="table-idle-state compact"><strong>Pronta</strong><span>${e.groupId?`Reservada para ${e.groupId}`:`Aguardando o proximo grupo.`}</span></div>
                      </div>`}).join(``)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="championship-block">
          <div class="championship-block-head">
            <h3>Mata-mata</h3>
            <p>O mata-mata pode ser iniciado assim que algum confronto ja estiver definido, mesmo com outros grupos ainda em andamento.</p>
          </div>
          <div class="championship-knockout-head">
            <div class="info-card compact"><span>Status</span><strong>${n.knockoutStarted?`Em andamento`:`Aguardando inicio`}</strong></div>
            <div class="info-card compact"><span>Fila</span><strong>${s.length}</strong></div>
            <div class="info-card compact"><span>Mesas</span><strong>${l.length}</strong></div>
            <button class="btn primary" ${p&&!n.finished?``:`disabled`} onclick="startKnockout()">${n.knockoutStarted?`Atualizar mata-mata`:`Iniciar mata-mata`}</button>
          </div>
          ${o.length?`<div class="championship-bracket-frame-wrap">
                  <iframe
                    class="championship-bracket-frame"
                    title="Bracket da categoria ${t}"
                    loading="lazy"
                    src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}"
                  ></iframe>
                </div>`:`<div class="empty-state">O chaveamento aparece depois que os grupos forem sorteados.</div>`}
          <div class="championship-knockout-panels">
            <div class="group-section queue-section">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">Proximos jogos do mata-mata</span>
                  <h3>${s.length?`${s.length} confronto(s) liberados`:`Nenhum confronto liberado ainda`}</h3>
                </div>
              </div>
              ${s.length?`<div class="queue-grid compact-queue-grid">
                      ${s.slice(0,8).map((e,t)=>`
                        <div class="queue-card next-match-card compact-next-match-card">
                          <div class="queue-card-top">
                            <span class="queue-order">Mata-mata ${t+1}</span>
                            <span class="result-pill neutral">${e.roundTitle||`Eliminatoria`}</span>
                          </div>
                          <div class="queue-player-block">
                            <strong>${E(e.playerIds[0])}</strong>
                            <span>${D(e.playerIds[0])}</span>
                          </div>
                          <div class="queue-versus">vs</div>
                          <div class="queue-player-block">
                            <strong>${E(e.playerIds[1])}</strong>
                            <span>${D(e.playerIds[1])}</span>
                          </div>
                        </div>
                      `).join(``)}
                    </div>`:`<div class="queue-empty rich">Assim que dois classificados estiverem definidos no mesmo confronto, ele aparece aqui.</div>`}
            </div>
          </div>
        </section>
        ${ae(n)}
      </div>
    </article>
  `}function Y(e,t,n){let r=document.getElementById(e);r&&(r.innerHTML=t.map(e=>`<option value="${e}" ${n===e?`selected`:``}>${E(e)}</option>`).join(``))}function X(){let e=[Q(`semifinal1Winner`),Q(`semifinal2Winner`)].filter(Boolean),t=Q(`finalWinner`);Y(`finalWinner`,e,e.includes(t)?t:e[0])}function be(){let e=_;if(!e)return;let t=w(e);if(!j(t)){u(`Finalize a fase de grupos, esvazie as mesas e tenha pelo menos 4 atletas para encerrar a categoria.`,`warning`);return}if(O(t)){$();return}let n=x(e).map(e=>e.id),[r,i,a,o]=n;Y(`semifinal1Winner`,n,r),Y(`semifinal1Loser`,n,i),Y(`semifinal2Winner`,n,a),Y(`semifinal2Loser`,n,o),Y(`finalWinner`,[r,a].filter(Boolean),r),[`semifinal1Winner`,`semifinal2Winner`].forEach(e=>{let t=document.getElementById(e);t&&(t.onchange=()=>{X()})});let s=document.getElementById(`finalizeCategoryModal`);s&&(s.style.display=`flex`)}function Z(){let e=document.getElementById(`finalizeCategoryModal`);e&&(e.style.display=`none`)}function Q(e){return document.getElementById(e)?.value?.trim()||``}async function $(){let e=_;if(!e)return;let t=w(e);if(!j(t)){u(`Esta categoria ainda nao pode ser encerrada.`,`warning`);return}let n=O(t);if(!n){let e=Q(`semifinal1Winner`),t=Q(`semifinal1Loser`),r=Q(`semifinal2Winner`),i=Q(`semifinal2Loser`),a=Q(`finalWinner`),o=[e,t,r,i],s=new Set(o);if(o.some(e=>!e)){u(`Preencha todos os jogadores das semifinais.`,`warning`);return}if(e===t||r===i){u(`Cada semifinal precisa ter vencedor e derrotado diferentes.`,`warning`);return}if(s.size!==4){u(`Os quatro semifinalistas precisam ser diferentes.`,`warning`);return}let c=[e,r];if(!c.includes(a)){u(`O campeao da final precisa ser um dos vencedores das semifinais.`,`warning`);return}let l=c.find(e=>e!==a);if(!l){u(`Nao foi possivel identificar o vice-campeao.`,`error`);return}n=[a,l,a===e?t:i,l===e?t:i]}let r={finished:!0,started:!1,knockoutStarted:!1,queue:[],activeTables:C([],t.tableCount??1),finalStandings:n};await q(r),await ie(e,{...t,...r},n),Z(),J()}window.changeTables=async e=>{let t=_;if(!t)return;let n=w(t);if(n.finished){u(`Esta categoria ja foi encerrada.`,`warning`);return}let r=C(n.activeTables,n.tableCount??1),i=r.filter(e=>e.match).length,a=Math.max(1,(n.tableCount??1)+e);if(a<i){u(`Nao e possivel remover mesas enquanto existem partidas em andamento nelas.`,`warning`);return}let o=r.slice(0,a),s=K({...n,tableCount:a,activeTables:o});await q({tableCount:a,activeTables:s.activeTables,queue:s.queue}),J()},window.startCategory=async()=>{let e=_;if(!e)return;let t=w(e);if(t.finished){u(`Esta categoria ja foi encerrada.`,`warning`);return}if(!t.groups?.length){u(`Sorteie os grupos na pagina principal antes de iniciar a categoria.`,`warning`);return}let n=K({...t,defined:!0,started:!0});await q({defined:!0,started:!0,activeTables:n.activeTables,queue:n.queue}),J()},window.startKnockout=async()=>{let e=_;if(!e)return;let t=w(e);if(t.finished){u(`Esta categoria ja foi encerrada.`,`warning`);return}if(!H(t.groups??[],t).some(e=>e.matches.some(e=>e.playerIds))){u(`Ainda nao ha confrontos definidos para iniciar o mata-mata.`,`warning`);return}let n=K({...t,knockoutStarted:!0});await q({knockoutStarted:!0,activeTables:n.activeTables,queue:n.queue}),J()},window.addPlayerToGroup=async e=>{let t=_;if(!t)return;let n=w(t);if(n.finished){u(`Esta categoria ja foi encerrada.`,`warning`);return}if(!W(n)){u(`Nao e mais possivel adicionar atletas a esta categoria.`,`warning`);return}let r=document.getElementById(`assignGroup_${e}`)?.value;if(!r){u(`Escolha um grupo para adicionar o atleta.`,`warning`);return}let i=(n.groups??[]).map(t=>t.id===r?{...t,playerIds:t.playerIds.includes(e)?t.playerIds:[...t.playerIds,e]}:t),a=K({...n,groups:i});await q({groups:i,activeTables:a.activeTables,queue:a.queue}),J()},window.finishMatch=async e=>{let t=_;if(!t)return;let n=w(t);if(n.finished){u(`Esta categoria ja foi encerrada.`,`warning`);return}let r=C(n.activeTables,n.tableCount??1),i=r[e];if(!i?.match)return;let a=Number(document.getElementById(`score1_${e}`)?.value||0),o=Number(document.getElementById(`score2_${e}`)?.value||0);if(Number.isNaN(a)||Number.isNaN(o)||a===o){u(`Informe um placar valido e sem empate.`,`warning`);return}let s={...i.match,score1:a,score2:o,winnerId:a>o?i.match.playerIds[0]:i.match.playerIds[1],playedAt:Date.now()};r[e]={id:i.id,groupId:i.groupId};let c=[...n.completedMatches??[],s],l=K({...n,activeTables:r,completedMatches:c});await q({activeTables:l.activeTables,queue:l.queue,completedMatches:c}),J()},window.openTournamentRegistrations=()=>{let e=g;e&&(window.location.href=`/pages/tournament-registrations.html?id=${e.id}`)},window.goBackToChampionship=()=>{let e=g;e&&(window.location.href=`/pages/championship-manage.html?id=${e.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openFinalizeCategoryModal=()=>{be()},window.closeFinalizeCategoryModal=()=>{Z()},window.confirmFinalizeCategory=async()=>{try{await $()}catch(e){u(`Erro ao encerrar categoria: `+e.message,`error`)}},window.logout=async()=>{await l(c),window.location.replace(`/pages/login.html`)},e(c,async e=>{if(h)return;if(h=!0,!e){window.location.replace(`/pages/login.html`);return}let t=b((await i(s(o,`users`,e.uid))).data());t&&(ee(t),await ve(),await ye(),J())});