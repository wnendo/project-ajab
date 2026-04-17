import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,m as o,n as s,p as c,r as l,s as u,t as d,u as f,x as p}from"./firebase-VBRKn9At.js";import{n as m}from"./toast-kV3jSCF7.js";/* empty css               */import{c as h,f as g,l as ee,o as te,r as ne,s as _,u as re}from"./tournament-rules-D9Tq3W95.js";import{t as v}from"./confirm-modal-Dnnch5Ng.js";var y=[],b=[],x={general:[],A:[],B:[]},S={general:[{id:1,group:`general`}],A:[{id:2,group:`A`}],B:[{id:3,group:`B`}]},ie=4;function ae(){return ie++}function C(e,t=1){S[e].length=0;for(let n=0;n<t;n++)S[e].push({id:n===0?oe(e):ae(),group:e})}function w(e){x[e].length=0}function oe(e){return e===`general`?1:e===`A`?2:3}function se(e){let t=new Set;return S[e].forEach(e=>{e.p1&&t.add(e.p1.id),e.p2&&t.add(e.p2.id)}),t}function ce(e,t,n){return b.some(r=>(r.group??`general`)===n&&(r.p1===e&&r.p2===t||r.p1===t&&r.p2===e))}function le(e,t,n){return t.some(t=>t.id!==e.id&&!ce(e.id,t.id,n))}function ue(e){let t=e.lastPlayed?Date.now()-e.lastPlayed:999999999;return-e.games*1e3+t/1e3}function de(e,t,n){return Math.abs(e.wins-t.wins)*1e3}function T(e,t){if(se(e).size>0||x[e].length>0)return;let n=[...t.filter(n=>le(n,t,e))].sort((e,t)=>ue(e)-ue(t)),r=new Set,i=[];for(let t=0;t<n.length;t++){let a=n[t];if(r.has(a.id))continue;let o=null,s=1/0;for(let i=t+1;i<n.length;i++){let t=n[i];if(r.has(t.id)||ce(a.id,t.id,e))continue;let c=de(a,t,e);c<s&&(s=c,o=t)}o&&(i.push([a,o]),r.add(a.id),r.add(o.id))}i.forEach(t=>x[e].push(t))}var E=!1,fe=``;function pe(){return y}function D(e){let t=e.trim();if(t.length<=20)return t;let n=t.split(/\s+/).filter(Boolean);if(n.length<=2)return t;let r=n[0],i=n[n.length-1],a=n.slice(1,-1).find(e=>e.length>2);return a?`${r} ${a.charAt(0)}. ${i}`:`${r} ${i}`}function me(e){return[...e].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?e.name.localeCompare(t.name):e.losses-t.losses:t.wins-e.wins)}function he(e,t,n=!1){let r=``;n||(t===0&&(r=`gold`),t===1&&(r=`silver`),t===2&&(r=`bronze`));let i=$(e.id);return`
    <div class="player-row compact-player-row ${r} ${n?`faded`:``}">
      <div class="player-row-main">
        <span>${t+1} -</span>
        <span class="player-name" title="${e.name}" onclick="showHistory('${e.id}')">${D(e.name)}</span>
      </div>
      <div class="player-row-stats">
        W:${i.wins} L:${i.losses} J:${i.games}
      </div>
      <div class="player-inline-action">
        <button type="button" onclick="openAthleteProfile('${e.id}')">Perfil</button>
      </div>
      <div class="player-actions">
        <button onclick="editPlayer('${e.id}')">✏️</button>
        <button onclick="togglePlayer('${e.id}')">${e.active?`✅`:`⛔`}</button>
        <button onclick="deletePlayer('${e.id}')">❌</button>
      </div>
    </div>
  `}function ge(e,t,n){let r=me(t.filter(e=>fe?e.name.toLowerCase().includes(fe):!0)),i=r.slice(0,5),a=r.slice(5),o=n?`ranking-hidden-${n}`:`ranking-hidden-general`;return`
    <div class="group-section ranking-group-card">
      <div class="group-section-header compact">
        <div>
          <span class="section-label">${e}</span>
          <h3>${r.length?`${r.length} atleta${r.length===1?``:`s`} no ranking`:`Nenhum atleta encontrado`}</h3>
        </div>
      </div>
      ${r.length?`
            <div class="ranking-list">
              ${i.map((e,t)=>he(e,t)).join(``)}
              ${a.length>0?`
                    <div id="${o}" class="ranking-hidden ${E?`open`:``}">
                      ${a.map((e,t)=>he(e,t+5,!0)).join(``)}
                      ${E?``:`<div class="fade-overlay"></div>`}
                    </div>
                    <div class="ranking-toggle" onclick="toggleRankingView()">
                      ${E?`Mostrar menos`:`Mostrar mais`}
                    </div>
                  `:``}
            </div>
          `:`<div class="empty-state">Nenhum jogador encontrado na pesquisa.</div>`}
    </div>
  `}function _e(e){return`<strong title="${e.name}">${D(e.name)}</strong>`}function ve(){let e=new Set;Xe().forEach(t=>{Y(t).forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)})}),document.getElementById(`playersPlaying`).innerText=String(e.size),document.getElementById(`playersWaiting`).innerText=String(pe().filter(t=>t.active&&!e.has(t.id)).length),document.getElementById(`playersTotal`).innerText=String(pe().length)}window.toggleRankingView=()=>{E=!E,O()},window.setRankingSearch=()=>{fe=document.getElementById(`rankingSearch`)?.value.trim().toLowerCase()??``,O()};function O(){let e=document.getElementById(`ranking`),t=document.getElementById(`tables`),n=document.getElementById(`queue`),r=document.getElementById(`tableCount`),i=document.getElementById(`startBtn`),a=document.getElementById(`tournamentModeLabel`),o=document.getElementById(`rankingModeAction`),s=Xe();a&&(a.innerText=Je()),i&&(Ne()?et()===s.length?(i.disabled=!0,i.innerText=`Categorias iniciadas`):(i.disabled=!1,i.innerText=`Use os paineis abaixo`):(i.disabled=!0,i.innerText=`Ative um torneio`)),o&&(o.style.display=Ye()?`flow`:`none`,o.innerText=s.length===1?`Separar A e B`:`Juntar categorias`),r&&(r.innerText=s.map(e=>`${X(e)}: ${Y(e).length}`).join(` | `)),e.innerHTML=`
    <div class="group-compare-grid ${Ye()&&s.length>1?`dual`:`single`}">
      ${Ye()&&s.length>1?s.map(e=>`
                  <div class="group-column">
                    ${ge(X(e),J(e),e)}
                  </div>
                `).join(``):`<div class="group-column">${ge(`Ranking geral`,pe())}</div>`}
    </div>
  `,t.innerHTML=`
    <div class="group-compare-grid ${s.length>1?`dual`:`single`}">
      ${s.map(e=>{let t=Y(e),n=Qe(e);return`
            <div class="group-section group-column">
              <div class="group-section-header compact">
                <div>
                  <span class="section-label">${X(e)}</span>
                  <h3>${J(e).length} atletas ativos</h3>
                </div>
                <div class="admin-tournament-actions compact">
                  <button class="btn primary" ${n?``:`disabled`} onclick="startGroup('${e}')">${$e(e)?`Atualizar jogos`:`Iniciar ${X(e)}`}</button>
                  <button class="btn secondary" onclick="changeTables('${e}', 1)">+ Mesa</button>
                  <button class="btn secondary" onclick="changeTables('${e}', -1)">- Mesa</button>
                </div>
              </div>
              <div class="tables compact-tables">
                ${t.map((t,n)=>t.p1&&t.p2?`
                      <div class="table-card busy enhanced-table-card compact-card">
                        <div class="table-header">
                          Mesa ${n+1}
                          <span class="status busy">Em jogo</span>
                        </div>
                          <div class="players enhanced-players compact-players">
                          <div class="table-player">
                            <strong title="${t.p1?.name||``}">${t.p1?D(t.p1.name):``}</strong>
                          </div>
                          <span class="vs">vs</span>
                          <div class="table-player">
                            <strong title="${t.p2?.name||``}">${t.p2?D(t.p2.name):``}</strong>
                          </div>
                        </div>
                        <div class="score-box compact-score-box">
                          <input id="s1_${e}_${n}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish('${e}', ${n})">
                          <span>x</span>
                          <input id="s2_${e}_${n}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish('${e}', ${n})">
                        </div>
                        <button class="finish-btn compact-finish-btn" onclick="finish('${e}', ${n})">Finalizar</button>
                      </div>
                    `:`
                        <div class="table-card free enhanced-table-card compact-card">
                          <div class="table-header">
                            Mesa ${n+1}
                            <span class="status free">Livre</span>
                          </div>
                          <div class="table-idle-state compact">
                            <strong>Pronta</strong>
                            <span>Aguardando a proxima partida.</span>
                          </div>
                        </div>
                      `).join(``)}
              </div>
            </div>
          `}).join(``)}
    </div>
  `;let c=new Set;s.forEach(e=>{Y(e).forEach(e=>{e.p1&&c.add(e.p1.id),e.p2&&c.add(e.p2.id)})}),n.innerHTML=`
    <div class="group-compare-grid ${s.length>1?`dual`:`single`}">
      ${s.map(e=>{let t=Ze(e).filter(([e,t])=>!c.has(e.id)&&!c.has(t.id));return`
            <div class="group-section queue-section group-column">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">${X(e)}</span>
                  <h3>${t.length?`${t.length} confronto(s) na fila`:`Fila de partidas`}</h3>
                </div>
              </div>
              ${t.length===0?`<div class="queue-empty rich">Nenhum jogo aguardando agora. Assim que uma mesa liberar, a proxima disputa aparece aqui.</div>`:`<div class="queue-grid compact-queue-grid">
                      ${t.map((t,n)=>{let r=$(t[0].id),i=$(t[1].id);return`
                              <div class="queue-card next-match-card compact-next-match-card">
                              <div class="queue-card-top">
                                <span class="queue-order">Proximo ${n+1}</span>
                                <span class="result-pill neutral">${X(e)}</span>
                              </div>
                              <div class="queue-player-block">
                                ${_e(t[0])}
                                <span>${r.wins}V | ${r.losses}D</span>
                              </div>
                              <div class="queue-versus">vs</div>
                              <div class="queue-player-block">
                                ${_e(t[1])}
                                <span>${i.wins}V | ${i.losses}D</span>
                              </div>
                            </div>
                          `}).join(``)}
                    </div>`}
            </div>
          `}).join(``)}
    </div>
  `,ve()}var ye=new URLSearchParams(window.location.search).get(`id`),be=!1,k=null,A=[],xe=new Set,j=[],M=null,N=null,P=null;function F(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Se(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function Ce(){return{wins:0,losses:0,games:0,active:!0,createdAt:Date.now()}}function we(e){let t=e.playerProfile??Ce(),n=L(e.id);return{id:e.id,name:e.name,wins:t.wins??0,losses:t.losses??0,games:t.games??0,active:t.active??!0,registrationCategory:n?.category,createdAt:t.createdAt??e.createdAt,lastPlayed:t.lastPlayed}}function I(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function Te(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function L(e){return j.find(t=>t.id===e||t.uid===e)}function Ee(e){return A.find(t=>t.id===e)??null}function R(e=``){let t=I(e);return A.filter(e=>!e.profileComplete||e.role!==`user`&&e.role!==`admin`?!1:t?[e.name,e.email,e.club,e.category].some(e=>I(e).includes(t)):!0).map(e=>({user:e,registration:L(e.id),player:y.find(t=>t.id===e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function De(e){return e.player?.active?{label:`Inscrito e ativo`,tone:`neutral`}:e.registration?.paymentStatus===`approved`?{label:`Pronto para ativar`,tone:`win`}:e.registration?.paymentStatus===`pending_payment`?{label:`Pagamento pendente`,tone:`loss`}:{label:`Sem inscrição`,tone:`neutral`}}function Oe(e=``){let t=document.getElementById(`athleteSearchResults`),n=document.getElementById(`athleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=R(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado para essa busca.`:n.textContent=`Digite para buscar atletas cadastrados.`,t.innerHTML=i.length?i.map(e=>{let t=De(e),n=e.user.name.trim(),r=[e.user.club||`Sem clube`,e.user.category||`Sem categoria`].join(` - `);return`
            <button
              type="button"
              class="athlete-search-item"
              onclick="selectAthleteCandidate('${e.user.id}')"
              title="${e.user.name}"
            >
              <div class="athlete-search-copy">
                <strong>${n}</strong>
                <span>${r}</span>
              </div>
              <span class="result-pill ${t.tone}">${t.label}</span>
            </button>
          `}).join(``):``}function z(){Oe(document.getElementById(`name`)?.value??``)}function ke(e){if(k){let t=ne(k,e.category);if(t.length)return t[0]}return e.category||k?.category||`Livre`}function Ae(e,t){let n=k;if(!n)throw Error(`Torneio nao carregado.`);let r=Date.now(),i=ke(e),a=ee(n,[i]);return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:i,registrationFee:a,paymentStatus:t,paymentMethod:`pix`,registeredAt:r,status:`registered`},userRegistrationPayload:{id:n.id,tournamentId:n.id,title:n.title,location:n.location??``,category:i,categories:n.categories??[],registrationFee:a,paymentStatus:t,paymentMethod:`pix`,startDate:n.startDate,endDate:n.endDate,registrationDeadline:n.registrationDeadline,registeredAt:r,status:`registered`}}}function je(e){let t=document.getElementById(`athleteActivationModal`),n=document.getElementById(`athleteActivationTitle`),r=document.getElementById(`athleteActivationDescription`);!t||!n||!r||(P=e,n.textContent=`Ativar ${e.user.name}?`,r.textContent=`Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para análise.`,t.style.display=`flex`)}function B(){let e=document.getElementById(`athleteActivationModal`);e&&(P=null,e.style.display=`none`)}async function Me(e,t){let r=k;if(!r)return;let{registrationPayload:i,userRegistrationPayload:a}=Ae(e.user,t),o=n(s);o.set(c(s,`tournaments`,r.id,`registrations`,e.user.id),i),o.set(c(s,`users`,e.user.id,`registrations`,r.id),a),t===`approved`&&o.set(c(s,`users`,e.user.id),{playerProfile:{...Ce(),active:!0},updatedAt:Date.now()},{merge:!0}),await o.commit()}function Ne(){return!!(k&&k.status!==`finished`)}function V(){return te(k)}function H(){k&&(k.groupStates={general:{started:!1,tableCount:1,...k.groupStates?.general},A:{started:!1,tableCount:1,...k.groupStates?.A},B:{started:!1,tableCount:1,...k.groupStates?.B}})}function Pe(e){return H(),k?.groupStates?.[e]??{started:!1,tableCount:1}}function U(e){return!!Pe(e).started}function Fe(e){return Pe(e).tableCount??1}function Ie(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>C(e,Fe(e)))}function W(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>w(e))}function Le(e,t){k&&(e.delete(c(s,`tournaments`,k.id,`registrations`,t)),e.delete(c(s,`users`,t,`registrations`,k.id)))}async function Re(e,t){k&&(H(),k.groupStates={...k.groupStates,[e]:{...k.groupStates?.[e],...t}},await a(c(s,`tournaments`,k.id),{groupStates:k.groupStates,updatedAt:Date.now()}))}function ze(){H(),[`general`,`A`,`B`].forEach(e=>{C(e,Fe(e))})}function Be(e){return k?.rankingLiveState?.[e]??{}}function Ve(){[`general`,`A`,`B`].forEach(e=>{w(e),C(e,Fe(e));let t=Be(e);(t.queue??[]).forEach(t=>{let[n,r]=t.playerIds,i=y.find(e=>e.id===n),a=y.find(e=>e.id===r);i&&a&&x[e].push([i,a])}),(t.activeTables??[]).forEach((t,n)=>{let r=t.playerIds,i=r?y.find(e=>e.id===r[0]):void 0,a=r?y.find(e=>e.id===r[1]):void 0;S[e][n]={id:t.id,group:e,...i?{p1:i}:{},...a?{p2:a}:{}}})})}async function G(){let e=k;e&&(e.rankingLiveState={general:{queue:x.general.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.general.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},A:{queue:x.A.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.A.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},B:{queue:x.B.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.B.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))}},k=e,await a(c(s,`tournaments`,e.id),{rankingLiveState:e.rankingLiveState,updatedAt:Date.now()}))}function He(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function K(){document.getElementById(`activeTournamentName`).textContent=k?.title||`Torneio nao encontrado`,document.getElementById(`tournamentStatusLabel`).textContent=k?.status===`finished`?`Finalizado`:k?.isActive?`Em andamento`:k?.status===`open`?`Inscricoes abertas`:`Aguardando inicio`}function Ue(e=k?.finalStandings??[]){let t=document.getElementById(`finalResultsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">O resultado final ainda nao foi gerado.</div>`;return}t.innerHTML=V().filter(t=>e.some(e=>e.group===t)).map(t=>{let n=e.filter(e=>e.group===t);return`
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${_(t)}</span>
            <strong>${n.length} atleta${n.length===1?``:`s`}</strong>
          </div>
          <div class="ranking-showcase">
            <div class="ranking-showcase-podium">
              ${n.slice(0,3).map((e,t)=>`
                    <article class="ranking-showcase-podium-card place-${t+1}">
                      <span class="ranking-showcase-place">${F(e.placement)}</span>
                      <strong>${F(e.name)}</strong>
                      <small>${F(e.category)}</small>
                      <div class="ranking-showcase-score">${e.wins}V - ${e.losses}D - ${e.games} jogos</div>
                    </article>
                  `).join(``)}
            </div>
            <div class="ranking-showcase-table">
              ${n.map(e=>`
                    <div class="ranking-showcase-row">
                      <span>${F(e.placement)}</span>
                      <strong>${F(e.name)}</strong>
                      <small>${F(e.result)}</small>
                      <span>${e.wins}V / ${e.losses}D</span>
                    </div>
                  `).join(``)}
            </div>
          </div>
        </section>
      `}).join(``)}}function We(){Ue();let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`flex`)}function Ge(){let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`none`)}function Ke(e){let t=document.getElementById(`athleteProfileModal`),n=document.getElementById(`athleteProfileContent`);if(!t||!n)return;let r=Ee(e),i=y.find(t=>t.id===e);if(!r){m(`Nao foi possivel carregar o perfil do atleta.`,`warning`);return}let a=$(e),o=Se(r.name||`Atleta`);n.innerHTML=`
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${r.photoURL?`<img class="profile-avatar" src="${F(r.photoURL)}" alt="Foto de ${F(r.name)}">`:`<div class="profile-avatar profile-avatar-fallback">${F(o)}</div>`}</div>
        <div class="athlete-profile-copy">
          <h3>${F(r.name)}</h3>
          <p>${F(r.club||`Sem clube`)} - ${F(r.category||`Sem categoria`)}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${i?.active?`Ativo no ranking`:`Sem jogos ativos`}</span>
            <span class="result-pill ${L(e)?.paymentStatus===`approved`?`win`:`loss`}">${L(e)?.paymentStatus===`approved`?`Inscricao aprovada`:`Inscricao pendente`}</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${F(r.email||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${F(r.phone||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Partidas</span><strong>${a.games}</strong></div>
        <div class="info-card"><span>Vitorias</span><strong>${a.wins}</strong></div>
        <div class="info-card"><span>Derrotas</span><strong>${a.losses}</strong></div>
        <div class="info-card"><span>Ultimo jogo</span><strong>${Te(i?.lastPlayed)}</strong></div>
      </div>
      <div class="athlete-profile-actions">
        <button class="btn danger" onclick="resetAthleteMatches('${e}')">Resetar partidas do atleta</button>
      </div>
    </div>
  `,t.style.display=`flex`}async function qe(){if(!ye){window.location.replace(`/pages/dashboard.html`);return}let e=await i(c(s,`tournaments`,ye));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}k={id:e.id,...e.data()},H(),K()}async function q(){if(!k){A=[],j=[],y.length=0;return}let[e,n]=await Promise.all([t(r(s,`users`)),t(r(s,`tournaments`,k.id,`registrations`))]);j=n.docs.map(e=>({id:e.id,...e.data()})),xe=new Set(j.filter(e=>e.paymentStatus===`approved`).map(e=>e.id)),A=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.role===`user`||e.role===`admin`).sort((e,t)=>e.name.localeCompare(t.name)),y.length=0,y.push(...A.filter(e=>e.profileComplete&&xe.has(e.id)).map(e=>we(e)).sort((e,t)=>e.name.localeCompare(t.name))),z()}function Je(){return re(k)===`ranking`?`Ranking`:`Campeonato`}function Ye(){return g(k)}function Xe(){return V()}function J(e){return y.filter(t=>t.active&&h(k,t.registrationCategory)===e)}function Y(e){return S[e]}function Ze(e){return x[e]}function X(e){return _(e)}function Qe(e){return!!(k&&k.status!==`finished`)&&J(e).length>=2}function $e(e){return U(e)}function et(){return V().filter(e=>U(e)).length}async function tt(){if(b.length=0,!k)return;let e=await t(r(s,`matches`));b.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.tournamentId===k?.id).sort((e,t)=>e.createdAt-t.createdAt))}async function nt(){await qe(),await Promise.all([q(),tt()]),Ve(),K(),O()}async function rt(){if(k)try{await q(),O()}catch(e){console.error(`Erro ao atualizar inscricoes do torneio:`,e)}}function it(){return y.filter(e=>e.games>0||e.active)}function at(e){return[...e].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?t.games===e.games?e.name.localeCompare(t.name):t.games-e.games:e.losses-t.losses:t.wins-e.wins)}function ot(e){return b.filter(t=>t.tournamentId===k?.id&&(t.group??`general`)===e)}function st(e){let t=J(e),n=[];for(let r=0;r<t.length;r++)for(let i=r+1;i<t.length;i++){let a=t[r],o=t[i];ot(e).some(e=>e.p1===a.id&&e.p2===o.id||e.p1===o.id&&e.p2===a.id)||n.push([a,o])}return n}function ct(){return V().flatMap(e=>at(it().filter(t=>h(k,t.registrationCategory)===e)).map((t,n)=>{let r=n+1;return{playerId:t.id,name:t.name,category:t.registrationCategory||_(e),group:e,placement:`${r}o lugar`,result:lt(r),wins:t.wins,losses:t.losses,games:t.games}}))}function lt(e){return e===1?`Campeao`:e===2?`Vice-campeao`:e===3?`3o lugar`:`${e}o lugar`}function ut(){y.forEach(e=>{e.wins=0,e.losses=0,e.games=0,e.active=!1,e.lastPlayed=void 0}),b.length=0,W(),Ie()}async function dt(){let e=k;if(!e||e.isActive)return;let i=await t(u(r(s,`tournaments`),f(`isActive`,`==`,!0))),a=n(s);i.forEach(t=>{t.id!==e.id&&a.update(t.ref,{isActive:!1,updatedAt:Date.now()})}),a.update(c(s,`tournaments`,e.id),{isActive:!0,status:`open`,updatedAt:Date.now()}),await a.commit(),k={...e,isActive:!0,status:`open`,updatedAt:Date.now()},K()}async function ft(e,t,r){let i=k;if(!i)return;let a=y.find(e=>e.id===t),l=y.find(e=>e.id===r);if(!a||!l)return;let u={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:l.name,scoreLabel:`${e.score1} x ${e.score2}`,tableLabel:e.tableLabel,result:`win`,playedAt:e.createdAt},d={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:a.name,scoreLabel:`${e.score2} x ${e.score1}`,tableLabel:e.tableLabel,result:`loss`,playedAt:e.createdAt},f={tournamentId:i.id,title:i.title,category:a.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(1),losses:o(0),playedAt:e.createdAt},p={tournamentId:i.id,title:i.title,category:l.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(0),losses:o(1),playedAt:e.createdAt},m=n(s);m.set(c(s,`users`,a.id,`matches`,e.id),u),m.set(c(s,`users`,l.id,`matches`,e.id),d),m.set(c(s,`users`,a.id,`tournaments`,i.id),f,{merge:!0}),m.set(c(s,`users`,l.id,`tournaments`,i.id),p,{merge:!0}),await m.commit()}function Z(e){let t=S[e],n=x[e];for(let r=0;r<t.length;r++)if(!t[r].p1&&n.length){let i=n.shift();t[r]={id:t[r].id,group:e,p1:i[0],p2:i[1]}}}function Q(e){return S[e].some(e=>e.p1&&e.p2)}function pt(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}async function mt(e){return pt((await i(c(s,`users`,e))).data())}window.logout=async()=>{await p(d),window.location.replace(`/pages/login.html`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.editCurrentTournament=()=>{k&&(window.location.href=`/pages/tournament-form.html?id=${k.id}`)},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.openAthleteProfile=e=>{Ke(e)},window.closeAthleteProfileModal=()=>{let e=document.getElementById(`athleteProfileModal`);e&&(e.style.display=`none`)},window.openFinalResultsModal=()=>{We()},window.closeFinalResultsModal=()=>{Ge()},window.openTournamentRegistrations=()=>{k&&(window.location.href=`/pages/tournament-registrations.html?id=${k.id}`)},window.closeAthleteActivationModal=()=>{B()},e(d,async e=>{if(be)return;if(be=!0,!e){window.location.replace(`/pages/login.html`);return}let t=await mt(e.uid);t&&(He(t),ze(),await nt(),window.addEventListener(`focus`,rt),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&rt()}),M=window.setInterval(()=>{rt()},15e3))}),window.addEventListener(`beforeunload`,()=>{M!==null&&(window.clearInterval(M),M=null)}),window.addPlayer=async()=>{let e=document.getElementById(`name`),t=e.value.trim();if(t){await q();try{let n=(N?R().find(e=>e.user.id===N):void 0)??R(t).find(e=>I(e.user.name)===I(t));if(!n){m(`Selecione um atleta da busca para ativar.`,`warning`);return}if(n.player?.active){m(`Esse jogador ja esta inscrito e ativo neste torneio.`,`warning`);return}if(n.registration?.paymentStatus===`approved`){let t=y.find(e=>e.id===n.user.id&&!e.active);if(!t){m(`Nao foi possivel ativar esse atleta agora.`,`error`);return}await a(c(s,`users`,t.id),{"playerProfile.active":!0,updatedAt:Date.now()}),t.active=!0,N=null;let r=h(k,t.registrationCategory);U(r)&&!Q(r)&&(w(r),T(r,J(r)),Z(r),await G()),y.sort((e,t)=>e.name.localeCompare(t.name)),e.value=``,z(),O(),m(`Atleta reativado com sucesso.`,`success`);return}je(n)}catch(e){m(`Erro ao ativar atleta: `+e.message,`error`)}}},window.searchAthletes=()=>{N=null,z()},window.selectAthleteCandidate=e=>{let t=document.getElementById(`name`),n=R().find(t=>t.user.id===e);!t||!n||(N=e,t.value=n.user.name,Oe(n.user.name))},window.confirmAthletePaymentStatus=async e=>{let t=P,n=document.getElementById(`name`);if(t){if(e===`cancel`){B();return}try{if(await Me(t,e),await q(),e===`approved`){let e=h(k,t.user.category);U(e)&&!Q(e)&&(w(e),T(e,J(e)),Z(e),await G())}e===`approved`?m(`Atleta adicionado automaticamente ao campeonato.`,`success`):m(`Inscrição adicionada para análise no gerenciamento de inscrições.`,`info`),N=null,n&&(n.value=``),B(),z(),O()}catch(e){m(`Erro ao registrar atleta: `+e.message,`error`)}}},window.approveRegistration=async e=>{if(k&&j.find(t=>t.id===e))try{let t=n(s);t.update(c(s,`tournaments`,k.id,`registrations`,e),{paymentStatus:`approved`}),t.update(c(s,`users`,e,`registrations`,k.id),{paymentStatus:`approved`}),await t.commit(),await q(),O()}catch(e){m(`Erro ao aprovar pagamento: `+e.message,`error`)}},window.removeRegistration=async e=>{if(!k)return;let t=j.find(t=>t.id===e);if(t&&await v({title:`Remover inscrição`,message:`Remover a inscrição de ${t.name}?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);Le(t,e),t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),await t.commit(),await q(),O()}catch(e){m(`Erro ao remover inscrição: `+e.message,`error`)}},window.toggleRankingMode=async()=>{if(!k||!g(k))return;if(b.length>0){m(`Nao e possivel juntar ou separar categorias apos iniciar partidas.`,`warning`);return}let e=k.rankingMode===`split`?`single`:`split`;await a(c(s,`tournaments`,k.id),{rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}},updatedAt:Date.now()}),k={...k,rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}}},W(),Ie(),await G(),O()},window.startGroup=async e=>{if(!k){m(`Torneio nao encontrado.`,`error`);return}if(!Qe(e)){m(`Essa categoria precisa de pelo menos 2 atletas ativos.`,`warning`);return}await dt(),U(e)||await Re(e,{started:!0}),Q(e)||w(e),T(e,J(e)),Z(e),await G(),O()},window.resetMatches=async()=>{if(k)try{let e=n(s);b.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),it().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.lastPlayed":null}),e.delete(c(s,`users`,t.id,`tournaments`,k.id))}),await e.commit(),b.length=0,W(),Ie(),await G(),O()}catch(e){m(`Erro ao resetar campeonato: `+e.message,`error`)}},window.resetAthleteMatches=async e=>{if(!k)return;let t=Ee(e),r=y.find(t=>t.id===e);if(!t||!r){m(`Atleta nao encontrado no torneio atual.`,`warning`);return}let i=b.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e));if(!i.length){m(`Esse atleta ainda nao possui partidas registradas neste ranking.`,`info`);return}if(await v({title:`Resetar partidas do atleta`,message:`Limpar ${i.length} partida(s) de ${t.name} neste ranking?`,confirmLabel:`Resetar partidas`,tone:`danger`}))try{let t=new Set([e]);i.forEach(e=>{t.add(e.p1),t.add(e.p2)});let a=b.filter(e=>!i.some(t=>t.id===e.id)),o=n(s);i.forEach(e=>{o.delete(c(s,`matches`,e.id)),o.delete(c(s,`users`,e.p1,`matches`,e.id)),o.delete(c(s,`users`,e.p2,`matches`,e.id))}),t.forEach(e=>{let t=a.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e)),n=t.filter(t=>t.winner===e).length,r=t.length-n,i=t.length?Math.max(...t.map(e=>e.createdAt)):null;o.update(c(s,`users`,e),{"playerProfile.wins":n,"playerProfile.losses":r,"playerProfile.games":t.length,"playerProfile.lastPlayed":i}),t.length?o.set(c(s,`users`,e,`tournaments`,k.id),{tournamentId:k.id,title:k.title,category:L(e)?.category||k.category||`Livre`,result:`Em andamento`,matchCount:t.length,wins:n,losses:r,playedAt:i??Date.now()},{merge:!0}):o.delete(c(s,`users`,e,`tournaments`,k.id))}),await o.commit(),b.length=0,b.push(...a),t.forEach(e=>{let t=y.find(t=>t.id===e),n=a.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e));t&&(t.wins=n.filter(t=>t.winner===e).length,t.losses=n.length-t.wins,t.games=n.length,t.lastPlayed=n.length?Math.max(...n.map(e=>e.createdAt)):void 0)});let l=h(k,r.registrationCategory);w(l),S[l]=S[l].map(t=>t.p1?.id===e||t.p2?.id===e?{id:t.id,group:l}:t),U(l)&&!Q(l)&&(T(l,J(l)),Z(l)),await G(),O(),Ke(e),m(`Partidas do atleta resetadas com sucesso.`,`success`)}catch(e){m(`Erro ao resetar partidas do atleta: `+e.message,`error`)}},window.finishTournament=async()=>{let e=k;if(!e)return;let t=ct();if(!t.length){m(`Adicione atletas e finalize partidas antes de encerrar o torneio.`,`warning`);return}if(V().flatMap(e=>st(e)).length){m(`Ainda existem confrontos obrigatorios pendentes neste ranking.`,`warning`);return}if(await v({title:`Encerrar torneio`,message:`Encerrar o torneio "${e.title}"?\n\nEssa ação finaliza o ranking e grava a classificação dos atletas.`,confirmLabel:`Encerrar`,tone:`danger`}))try{let r=n(s),i=Date.now();t.forEach(t=>{let n={id:e.id,tournamentId:e.id,title:e.title,category:t.category||e.category||`Livre`,placement:t.placement,result:t.result,matchCount:t.games,wins:t.wins,losses:t.losses,playedAt:i};r.set(c(s,`users`,t.playerId,`tournaments`,e.id),n,{merge:!0}),r.update(c(s,`users`,t.playerId),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null})}),r.update(c(s,`tournaments`,e.id),{isActive:!1,status:`finished`,finalStandings:t,updatedAt:i,completedAt:i}),await r.commit(),k={...e,isActive:!1,status:`finished`,finalStandings:t,updatedAt:i},K(),ut(),await G(),O(),We(),m(`Torneio encerrado com sucesso.`,`success`)}catch(e){m(`Erro ao encerrar torneio: `+e.message,`error`)}},window.deletePlayer=async e=>{if(await v({title:`Remover atleta`,message:`Remover este atleta do torneio atual?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),Le(t,e),t.delete(c(s,`users`,e,`tournaments`,k.id)),await t.commit();let r=y.find(t=>t.id===e);r&&(r.active=!1,r.games=0,r.wins=0,r.losses=0,r.lastPlayed=void 0),W(),[`general`,`A`,`B`].forEach(t=>{S[t].forEach(t=>{(t.p1?.id===e||t.p2?.id===e)&&(t.p1=void 0,t.p2=void 0)})}),await G(),O()}catch(e){m(`Erro ao remover atleta do torneio: `+e.message,`error`)}},window.editPlayer=async e=>{let t=y.find(t=>t.id===e);if(!t)return;let n=prompt(`Novo nome:`,t.name)?.trim();if(n){t.name=n;try{await a(c(s,`users`,e),{name:n,updatedAt:Date.now()}),y.sort((e,t)=>e.name.localeCompare(t.name)),O()}catch(e){m(`Erro ao editar atleta: `+e.message,`error`)}}},window.togglePlayer=async e=>{let t=y.find(t=>t.id===e);if(t){t.active=!t.active;try{await a(c(s,`users`,e),{"playerProfile.active":t.active}),W(),await G(),O()}catch(e){m(`Erro ao atualizar atleta: `+e.message,`error`)}}},window.showHistory=e=>{let t=y.find(t=>t.id===e);if(!t)return;let n=b.filter(t=>t.p1===e||t.p2===e).map(t=>{let n=t.p1===e,r=n?t.p2:t.p1,i=y.find(e=>e.id===r),a=t.winner===e,o=n?t.score1:t.score2,s=n?t.score2:t.score1;return`
        <div class="history-item ${a?`win`:`loss`}">
          <div>vs ${i?.name??`Jogador removido`}</div>
          <div>${o} x ${s}</div>
        </div>
      `}).join(``);document.getElementById(`historyTitle`).innerText=`Historico - ${t.name}`;let r=$(e),i=`
    <div class="history-stats">
      <span>${r.wins} vitorias</span>
      <span>${r.losses} derrotas</span>
      <span>${r.setsWon} sets ganhos</span>
      <span>${r.setsLost} sets perdidos</span>
      <span>${r.winRate}% aproveitamento</span>
    </div>
  `;document.getElementById(`historyList`).innerHTML=i+(n||`<div>Nenhum jogo ainda</div>`),document.getElementById(`historyModal`).style.display=`flex`};function $(e){let t=b.filter(t=>t.p1===e||t.p2===e),n=0,r=0,i=0,a=0;t.forEach(t=>{let o=t.p1===e,s=o?t.score1:t.score2,c=o?t.score2:t.score1;i+=s,a+=c,t.winner===e?n++:r++});let o=t.length,s=o>0?(n/o*100).toFixed(1):`0`;return{wins:n,losses:r,games:o,setsWon:i,setsLost:a,winRate:s}}window.clearPlayers=async()=>{if(k&&await v({title:`Limpar torneio atual`,message:`Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?`,confirmLabel:`Limpar`,tone:`danger`}))try{let e=n(s);it().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null}),Le(e,t.id),e.delete(c(s,`users`,t.id,`tournaments`,k.id))}),b.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),await e.commit(),ut(),await G(),O()}catch(e){console.error(`Erro ao limpar campeonato:`,e)}},window.finish=async(e,t)=>{let i=S[e][t],a=k;if(!i?.p1||!i?.p2||!a)return;let o=parseInt(document.getElementById(`s1_${e}_${t}`).value,10),u=parseInt(document.getElementById(`s2_${e}_${t}`).value,10);if(isNaN(o)||isNaN(u)){m(`Preencha o placar corretamente.`,`warning`);return}if(o<0||u<0){m(`O placar nao pode ser negativo.`,`warning`);return}if(o===u){m(`O jogo precisa ter um vencedor.`,`warning`);return}let d=o>u?i.p1:i.p2,f=o>u?i.p2:i.p1,p=Date.now();d.wins+=1,f.losses+=1,d.games+=1,f.games+=1,d.lastPlayed=p,f.lastPlayed=p;try{let m={p1:i.p1.id,p2:i.p2.id,score1:o,score2:u,winner:d.id,createdAt:p,tournamentId:a.id,tournamentTitle:a.title,tableLabel:`${_(e)} - Mesa ${t+1}`,group:e,registrationCategory:d.registrationCategory},h=await l(r(s,`matches`),m),g=n(s);g.update(c(s,`users`,d.id),{"playerProfile.wins":d.wins,"playerProfile.games":d.games,"playerProfile.lastPlayed":p}),g.update(c(s,`users`,f.id),{"playerProfile.losses":f.losses,"playerProfile.games":f.games,"playerProfile.lastPlayed":p}),await g.commit();let ee={id:h.id,...m};await ft(ee,d.id,f.id),b.push(ee),S[e][t]={id:S[e][t].id,group:e},w(e),T(e,J(e)),Z(e),await G(),O()}catch(e){m(`Erro ao finalizar partida: `+e.message,`error`)}},window.changeTables=async(e,t)=>{let n=S[e];if(t>0)for(let r=0;r<t;r++)n.push({id:ae(),group:e});else{let e=n.findIndex(e=>!e.p1);if(e===-1){m(`Finalize algum jogo antes de remover mesas.`,`warning`);return}n.splice(e,1)}await Re(e,{tableCount:n.length}),await G(),O()};