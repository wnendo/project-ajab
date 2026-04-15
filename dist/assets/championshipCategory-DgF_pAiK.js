import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,l as i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";/* empty css               */import{c as l}from"./tournament-rules-DUbpQbwy.js";var u=new URLSearchParams(window.location.search),d=u.get(`id`),f=u.get(`category`),p=!1,m=null,h=null,g=[];function _(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function v(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`<strong>${e.name}</strong><span>${e.club||`Sem clube`}</span><span>${e.category||`Sem categoria`}</span>`)}function ee(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function te(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>_(e)).filter(Boolean))]}function y(e){return g.filter(e=>e.paymentStatus===`approved`).filter(t=>te(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function b(e,t){return y(e).find(e=>e.id===t)}function x(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function S(e){let t=m?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,knockoutStarted:t?.knockoutStarted??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:x(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function C(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function w(e){return h&&b(h,e)?.name||`Atleta`}function T(e){return h&&b(h,e)?.club||`Sem clube`}function ne(e){return e===1?`1o lugar`:e===2?`2o lugar`:e===3?`3o lugar`:`4o lugar`}function re(e){return e===1?`podium-gold`:e===2?`podium-silver`:`podium-bronze`}function E(e){let t=L(e.groups??[],e);if(t.length<2)return null;let n=t[t.length-1],r=t[t.length-2],i=n.matches[0];if(!i?.playerIds||!i.resolvedWinnerId)return null;let a=i.resolvedWinnerId,o=i.playerIds.find(e=>e!==a);if(!o)return null;let s=r.matches.filter(e=>e.playerIds&&e.resolvedWinnerId);if(s.length<2)return null;let c=s.find(e=>e.playerIds?.includes(a)),l=s.find(e=>e.playerIds?.includes(o));if(!c||!l)return null;let u=c.playerIds?.find(e=>e!==a),d=l.playerIds?.find(e=>e!==o);return!u||!d?null:[a,o,u,d]}function D(e){let t=h;return!t||e.finished||!U(e)||(e.activeTables??[]).some(e=>e.match)?!1:y(t).length>=4}function ie(e){let t=e.finalStandings??[];return t.length?`
    <section class="championship-block">
      <div class="championship-block-head">
        <h3>Classificacao final</h3>
        <p>Encerramento oficial da categoria com definicao do 1o ao 4o lugar.</p>
      </div>
      <div class="stack-list">
        ${t.slice(0,4).map((e,t)=>`
          <div class="stack-item">
            <div class="stack-item-header">
              <div>
                <strong>${w(e)}</strong>
                <span>${T(e)}</span>
              </div>
              <span class="result-pill ${re(t+1)}">${ne(t+1)}</span>
            </div>
          </div>
        `).join(``)}
      </div>
    </section>
  `:``}function O(e,t){let n=w(e.playerIds[0]),r=w(e.playerIds[1]);return t?`${n} ${t.score1??0}x${t.score2??0} ${r}`:`${n} x ${r}`}function ae(e,t){return(e.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===t)}function oe(e,t){return(e.completedMatches??[]).find(e=>e.id===t)}function se(e,t){let n=k(e,t);return n.length?`
    <div class="championship-standings-list">
      ${n.map((e,t)=>`
        <div class="championship-standing-row">
          <span class="championship-standing-place">${t+1}o</span>
          <div class="championship-standing-player">
            <strong>${w(e.playerId)}</strong>
            <small>${e.wins}V · ${e.setDiff>=0?`+`:``}${e.setDiff} sets · ${e.pointDiff>=0?`+`:``}${e.pointDiff} pts</small>
          </div>
        </div>
      `).join(``)}
    </div>
  `:`<div class="championship-standings-empty">Sem atletas neste grupo.</div>`}function k(e,t){let n=new Map;return e.playerIds.forEach(e=>{n.set(e,{playerId:e,wins:0,losses:0,setsWon:0,setsLost:0,setDiff:0,pointsWon:0,pointsLost:0,pointDiff:0})}),ae(t,e.id).forEach(e=>{let[t,r]=e.playerIds,i=e.score1??0,a=e.score2??0,o=n.get(t),s=n.get(r);!o||!s||(o.setsWon+=i,o.setsLost+=a,s.setsWon+=a,s.setsLost+=i,o.pointsWon+=i,o.pointsLost+=a,s.pointsWon+=a,s.pointsLost+=i,e.winnerId===t?(o.wins+=1,s.losses+=1):e.winnerId===r&&(s.wins+=1,o.losses+=1))}),[...n.values()].map(e=>({...e,setDiff:e.setsWon-e.setsLost,pointDiff:e.pointsWon-e.pointsLost})).sort((e,t)=>t.wins===e.wins?t.setDiff===e.setDiff?t.pointsWon===e.pointsWon?t.pointDiff===e.pointDiff?w(e.playerId).localeCompare(w(t.playerId)):t.pointDiff-e.pointDiff:t.pointsWon-e.pointsWon:t.setDiff-e.setDiff:t.wins-e.wins)}function ce(e){return[...e].sort((e,t)=>t.wins===e.wins?t.setDiff===e.setDiff?t.pointsWon===e.pointsWon?t.pointDiff===e.pointDiff?w(e.playerId).localeCompare(w(t.playerId)):t.pointDiff-e.pointDiff:t.pointsWon-e.pointsWon:t.setDiff-e.setDiff:t.wins-e.wins)}function le(e,t){let n=[],r=[];return e.forEach(e=>{let i=ce(k(e,t)),a=i[0],o=i[1];a&&n.push({...a,groupId:e.id,groupName:e.name,placement:1}),o&&r.push({...o,groupId:e.id,groupName:e.name,placement:2})}),{winners:n,runnersUp:r}}function A(e,t){let n=`${e??``} ${t??``}`.trim().match(/(\d+)/);return n?Number(n[1]):2**53-1}function j(e){return[...e].sort((e,t)=>{let n=A(e.groupName,e.groupId)-A(t.groupName,t.groupId);return n===0?w(e.playerId).localeCompare(w(t.playerId)):n})}function M(e){return e>=8?`Oitavas`:e>=4?`Quartas`:e>=2?`Semifinais`:`Final`}function N(e){return(e.completedMatches??[]).filter(e=>e.stage===`knockout`)}function ue(e){return new Map(N(e).map(e=>[e.id,e]))}function P(e){return new Set(x(e.activeTables,e.tableCount??1).filter(e=>e.match?.stage===`knockout`).map(e=>e.match?.id).filter(Boolean))}function F(e){let t=1;for(;t<e;)t*=2;return t}function I(e){let t=[...e],n=[];for(;t.length>=2;){let e=t.shift();if(!e)break;let r=t.findIndex(t=>t.groupId!==e.groupId);r<0&&(r=0);let[i]=t.splice(r,1);i&&n.push([e,i])}return n}function L(e,t){if(e.length<2)return[];let{winners:n,runnersUp:r}=le(e,t),i=n.length+r.length;if(i<2)return[];let a=F(i),o=ue(t),s=[],c=Math.max(0,a-i),l=j(n),u=j(r),d=l.slice(0,c),f=l.slice(c),p=[...u],m=[];f.forEach(e=>{if(!p.length)return;let t=p.findIndex(t=>t.groupId!==e.groupId);t<0&&(t=0);let[n]=p.splice(t,1);n&&m.push({labels:[w(e.playerId),w(n.playerId)],playerIds:[e.playerId,n.playerId]})}),I(p).forEach(([e,t])=>{m.push({labels:[w(e.playerId),w(t.playerId)],playerIds:[e.playerId,t.playerId]})});let h=[],g=a/2;for(let e=0;e<g;e++){let t=d[e],n=m[e];if(t){let e=h.length+1;h.push({id:`KO_R1_S${e}`,title:`J1-${e}`,labels:[w(t.playerId),`BYE`],resolvedWinnerId:t.playerId,isBye:!0,roundIndex:1,slot:e})}if(n){let e=h.length+1;h.push({id:`KO_R1_S${e}`,title:`J1-${e}`,labels:n.labels,playerIds:n.playerIds,resolvedWinnerId:o.get(`KO_R1_S${e}`)?.winnerId,roundIndex:1,slot:e})}}if(!h.length)return[];s.push({title:M(h.length),matches:h});let _=h,v=2;for(;_.length>1;){let e=[];for(let t=0;t<_.length;t+=2){let n=_[t],r=_[t+1];if(!n||!r)continue;let i=o.get(n.id)?.winnerId,a=o.get(r.id)?.winnerId,s=e.length+1,c=i??n.resolvedWinnerId,l=a??r.resolvedWinnerId;e.push({id:`KO_R${v}_S${s}`,title:`J${v}-${s}`,labels:[c?w(c):`Vencedor ${n.title}`,l?w(l):`Vencedor ${r.title}`],playerIds:c&&l?[c,l]:void 0,resolvedWinnerId:o.get(`KO_R${v}_S${s}`)?.winnerId,roundIndex:v,slot:s})}if(!e.length)break;s.push({title:e.length===1?`Final`:M(e.length),matches:e}),_=e,v+=1}return s}function R(e){let t=h;return t?(e.groups??[]).flatMap(e=>C(t,e)):[]}function z(e){return new Set((e.completedMatches??[]).filter(e=>e.stage===`groups`).map(e=>e.id))}function B(e){return new Set(x(e.activeTables,e.tableCount??1).map(e=>e.match?.id).filter(Boolean))}function V(e){let t=h;if(!t)return new Map;let n=z(e),r=B(e),i=new Map;for(let a of e.groups??[]){let e=C(t,a).filter(e=>!n.has(e.id)).filter(e=>!r.has(e.id));i.set(a.id,e)}return i}function H(e){let t=h;if(!e.knockoutStarted||!t)return[];let n=L(e.groups??[],e).flatMap(e=>e.matches.map(n=>({id:n.id,stage:`knockout`,category:t,playerIds:n.playerIds,roundIndex:n.roundIndex,roundTitle:e.title,slot:n.slot}))),r=new Set(N(e).map(e=>e.id)),i=P(e);return n.filter(e=>!!e.playerIds).filter(e=>!r.has(e.id)).filter(e=>!i.has(e.id)).map(e=>({id:e.id,stage:`knockout`,category:e.category,playerIds:e.playerIds,roundIndex:e.roundIndex,roundTitle:e.roundTitle,slot:e.slot}))}function U(e){let t=R(e).length,n=(e.completedMatches??[]).filter(e=>e.stage===`groups`).length;return t>0&&n>=t}function W(e){return!e.defined||!e.groups?.length?!1:!U(e)}function de(e){let t=h;if(!t)return[];let n=new Set((e.groups??[]).flatMap(e=>e.playerIds));return y(t).filter(e=>!n.has(e.id))}function G(e,t){let n=x(e.activeTables,e.tableCount??1).find(e=>e.groupId===t);return n?`Mesa ${n.id}`:`Aguardando mesa`}function K(e){let t=e.groups??[],n=V(e),r=H(e),i=x(e.activeTables,e.tableCount??1).map(e=>({...e,...e.match?.groupId?{groupId:e.match.groupId}:{}})),a=new Set;return i.forEach(e=>{if(e.match?.groupId){a.add(e.match.groupId);return}if(e.groupId){let t=n.get(e.groupId)??[];t.length>0?(e.match=t.shift(),a.add(e.groupId)):delete e.groupId}}),i.forEach(e=>{if(e.match||e.groupId)return;let r=t.find(e=>a.has(e.id)?!1:(n.get(e.id)?.length??0)>0);if(!r)return;let i=n.get(r.id)?.shift();i&&(e.groupId=r.id,e.match=i,a.add(r.id))}),i.forEach(e=>{if(e.match)return;let t=r.shift();t&&(delete e.groupId,e.match=t)}),{activeTables:i,queue:[...t.flatMap(e=>n.get(e.id)??[]),...r]}}async function q(e){let t=m,n=h;if(!t||!n)return;let r=S(n),s=Math.max(1,e.tableCount??r.tableCount??1),c={...r,...e,tableCount:s,activeTables:x(e.activeTables??r.activeTables,s)};t.championshipState={...t.championshipState??{},[n]:c},m=t,await i(o(a,`tournaments`,t.id),{championshipState:t.championshipState,updatedAt:Date.now()})}async function J(){if(!d){window.location.replace(`/pages/dashboard.html`);return}if(h=_(f||void 0),!h){window.location.replace(`/pages/championship-manage.html?id=${d}`);return}let e=await r(o(a,`tournaments`,d));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}m={id:e.id,...e.data()},l(m)!==`championship`&&window.location.replace(`/pages/tournament-manage.html?id=${e.id}`)}async function fe(){let e=m;e&&(g=(await t(n(a,`tournaments`,e.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()})))}function Y(){let e=m,t=h;if(!e||!t)return;let n=S(t),r=n.groups??[],i=n.queue??[],a=n.activeTables?.filter(e=>e.match)??[],o=L(r,n),s=i.filter(e=>e.stage===`knockout`),c=i.filter(e=>e.stage===`groups`),l=a.filter(e=>e.match?.stage===`knockout`),u=de(n),d=U(n),f=W(n),p=o.some(e=>e.matches.some(e=>e.playerIds)),g=n.finished?`Categoria encerrada`:d?`Grupos concluidos`:n.started?`Jogos em andamento`:`Categoria aberta`,_=D(n);document.getElementById(`categoryPageTitle`).textContent=`${e.title}`,document.getElementById(`categoryTitle`).textContent=`Categoria ${t}`,document.getElementById(`categoryTitle`).style.textAlign=`left`,document.getElementById(`categoryPageSubtitle`).textContent=`${e.location||`Local a definir`} - esta categoria ja esta definida. Os grupos jogam em mesas dedicadas e so trocam quando um grupo termina seus confrontos.`,document.getElementById(`categoryPageContent`).innerHTML=`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${t}</span>
          <h2>${y(t).length} atletas aprovados</h2>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card"><span>Status</span><strong>${g}</strong></div>
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
                  ${r.map(e=>{let r=i.filter(t=>t.groupId===e.id),a=G(n,e.id),o=C(t,e).every(e=>(n.completedMatches??[]).some(t=>t.id===e.id));return`
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
                            <strong>Classificacao do grupo</strong>
                            <span>${e.playerIds.length} atleta(s)</span>
                          </div>
                          ${se(e,n)}
                        </div>
                        <div class="championship-match-list">
                          ${C(t,e).map(e=>`<span>${O(e,oe(n,e.id))}</span>`).join(``)}
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
              <button class="btn secondary" ${_?``:`disabled`} onclick="openFinalizeCategoryModal()">Encerrar categoria</button>
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
                              <strong>${w(e.playerIds[0])}</strong>
                              <span>${T(e.playerIds[0])}</span>
                            </div>
                            <div class="queue-versus">vs</div>
                            <div class="queue-player-block">
                              <strong>${w(e.playerIds[1])}</strong>
                              <span>${T(e.playerIds[1])}</span>
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
                        <div class="table-player"><strong>${w(n.playerIds[0])}</strong><span>${T(n.playerIds[0])}</span></div>
                        <span class="vs">vs</span>
                        <div class="table-player"><strong>${w(n.playerIds[1])}</strong><span>${T(n.playerIds[1])}</span></div>
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
                            <strong>${w(e.playerIds[0])}</strong>
                            <span>${T(e.playerIds[0])}</span>
                          </div>
                          <div class="queue-versus">vs</div>
                          <div class="queue-player-block">
                            <strong>${w(e.playerIds[1])}</strong>
                            <span>${T(e.playerIds[1])}</span>
                          </div>
                        </div>
                      `).join(``)}
                    </div>`:`<div class="queue-empty rich">Assim que dois classificados estiverem definidos no mesmo confronto, ele aparece aqui.</div>`}
            </div>
          </div>
        </section>
        ${ie(n)}
      </div>
    </article>
  `}function X(e,t,n){let r=document.getElementById(e);r&&(r.innerHTML=t.map(e=>`<option value="${e}" ${n===e?`selected`:``}>${w(e)}</option>`).join(``))}function pe(){let e=[Q(`semifinal1Winner`),Q(`semifinal2Winner`)].filter(Boolean),t=Q(`finalWinner`);X(`finalWinner`,e,e.includes(t)?t:e[0])}function me(){let e=h;if(!e)return;let t=S(e);if(!D(t)){alert(`Finalize a fase de grupos, esvazie as mesas e tenha pelo menos 4 atletas para encerrar a categoria.`);return}if(E(t)){$();return}let n=y(e).map(e=>e.id),[r,i,a,o]=n;X(`semifinal1Winner`,n,r),X(`semifinal1Loser`,n,i),X(`semifinal2Winner`,n,a),X(`semifinal2Loser`,n,o),X(`finalWinner`,[r,a].filter(Boolean),r),[`semifinal1Winner`,`semifinal2Winner`].forEach(e=>{let t=document.getElementById(e);t&&(t.onchange=()=>{pe()})});let s=document.getElementById(`finalizeCategoryModal`);s&&(s.style.display=`flex`)}function Z(){let e=document.getElementById(`finalizeCategoryModal`);e&&(e.style.display=`none`)}function Q(e){return document.getElementById(e)?.value?.trim()||``}async function $(){let e=h;if(!e)return;let t=S(e);if(!D(t)){alert(`Esta categoria ainda nao pode ser encerrada.`);return}let n=E(t);if(!n){let e=Q(`semifinal1Winner`),t=Q(`semifinal1Loser`),r=Q(`semifinal2Winner`),i=Q(`semifinal2Loser`),a=Q(`finalWinner`),o=[e,t,r,i],s=new Set(o);if(o.some(e=>!e)){alert(`Preencha todos os jogadores das semifinais.`);return}if(e===t||r===i){alert(`Cada semifinal precisa ter vencedor e derrotado diferentes.`);return}if(s.size!==4){alert(`Os quatro semifinalistas precisam ser diferentes.`);return}let c=[e,r];if(!c.includes(a)){alert(`O campeao da final precisa ser um dos vencedores das semifinais.`);return}let l=c.find(e=>e!==a);if(!l){alert(`Nao foi possivel identificar o vice-campeao.`);return}n=[a,l,a===e?t:i,l===e?t:i]}await q({finished:!0,started:!1,knockoutStarted:!1,queue:[],activeTables:x([],t.tableCount??1),finalStandings:n}),Z(),Y()}window.changeTables=async e=>{let t=h;if(!t)return;let n=S(t);if(n.finished){alert(`Esta categoria ja foi encerrada.`);return}let r=x(n.activeTables,n.tableCount??1),i=r.filter(e=>e.match).length,a=Math.max(1,(n.tableCount??1)+e);if(a<i){alert(`NÃ£o Ã© possÃ­vel remover mesas enquanto existem partidas em andamento nelas.`);return}let o=r.slice(0,a),s=K({...n,tableCount:a,activeTables:o});await q({tableCount:a,activeTables:s.activeTables,queue:s.queue}),Y()},window.startCategory=async()=>{let e=h;if(!e)return;let t=S(e);if(t.finished){alert(`Esta categoria ja foi encerrada.`);return}if(!t.groups?.length){alert(`Sorteie os grupos na pagina principal antes de iniciar a categoria.`);return}let n=K({...t,defined:!0,started:!0});await q({defined:!0,started:!0,activeTables:n.activeTables,queue:n.queue}),Y()},window.startKnockout=async()=>{let e=h;if(!e)return;let t=S(e);if(t.finished){alert(`Esta categoria ja foi encerrada.`);return}if(!L(t.groups??[],t).some(e=>e.matches.some(e=>e.playerIds))){alert(`Ainda nao ha confrontos definidos para iniciar o mata-mata.`);return}let n=K({...t,knockoutStarted:!0});await q({knockoutStarted:!0,activeTables:n.activeTables,queue:n.queue}),Y()},window.addPlayerToGroup=async e=>{let t=h;if(!t)return;let n=S(t);if(n.finished){alert(`Esta categoria ja foi encerrada.`);return}if(!W(n)){alert(`NÃ£o Ã© mais possÃ­vel adicionar atletas a esta categoria.`);return}let r=document.getElementById(`assignGroup_${e}`)?.value;if(!r){alert(`Escolha um grupo para adicionar o atleta.`);return}let i=(n.groups??[]).map(t=>t.id===r?{...t,playerIds:t.playerIds.includes(e)?t.playerIds:[...t.playerIds,e]}:t),a=K({...n,groups:i});await q({groups:i,activeTables:a.activeTables,queue:a.queue}),Y()},window.finishMatch=async e=>{let t=h;if(!t)return;let n=S(t);if(n.finished){alert(`Esta categoria ja foi encerrada.`);return}let r=x(n.activeTables,n.tableCount??1),i=r[e];if(!i?.match)return;let a=Number(document.getElementById(`score1_${e}`)?.value||0),o=Number(document.getElementById(`score2_${e}`)?.value||0);if(Number.isNaN(a)||Number.isNaN(o)||a===o){alert(`Informe um placar valido e sem empate.`);return}let s={...i.match,score1:a,score2:o,winnerId:a>o?i.match.playerIds[0]:i.match.playerIds[1],playedAt:Date.now()};r[e]={id:i.id,groupId:i.groupId};let c=[...n.completedMatches??[],s],l=K({...n,activeTables:r,completedMatches:c});await q({activeTables:l.activeTables,queue:l.queue,completedMatches:c}),Y()},window.openTournamentRegistrations=()=>{let e=m;e&&(window.location.href=`/pages/tournament-registrations.html?id=${e.id}`)},window.goBackToChampionship=()=>{let e=m;e&&(window.location.href=`/pages/championship-manage.html?id=${e.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openFinalizeCategoryModal=()=>{me()},window.closeFinalizeCategoryModal=()=>{Z()},window.confirmFinalizeCategory=async()=>{try{await $()}catch(e){alert(`Erro ao encerrar categoria: `+e.message)}},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(p)return;if(p=!0,!e){window.location.replace(`/pages/login.html`);return}let t=ee((await r(o(a,`users`,e.uid))).data());t&&(v(t),await J(),await fe(),Y())});