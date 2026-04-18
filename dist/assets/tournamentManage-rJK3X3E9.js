import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,m as o,n as s,p as c,r as l,s as u,t as d,u as f,x as p}from"./firebase-VBRKn9At.js";import{n as m}from"./toast-kV3jSCF7.js";/* empty css               */import{c as h,f as g,l as _,o as ee,r as te,s as v,u as ne}from"./tournament-rules-D9Tq3W95.js";import{t as y}from"./confirm-modal-Dnnch5Ng.js";import{n as re,t as ie}from"./ranking-standings-Dec7PvHv.js";var b=[],x=[],S={general:[],A:[],B:[]},C={general:[{id:1,group:`general`}],A:[{id:2,group:`A`}],B:[{id:3,group:`B`}]},ae=4;function oe(){return ae++}function w(e,t=1){C[e].length=0;for(let n=0;n<t;n++)C[e].push({id:n===0?se(e):oe(),group:e})}function T(e){S[e].length=0}function se(e){return e===`general`?1:e===`A`?2:3}function ce(e){let t=new Set;return C[e].forEach(e=>{e.p1&&t.add(e.p1.id),e.p2&&t.add(e.p2.id)}),t}function le(e,t,n){return x.some(r=>(r.group??`general`)===n&&(r.p1===e&&r.p2===t||r.p1===t&&r.p2===e))}function ue(e,t,n){return t.some(t=>t.id!==e.id&&!le(e.id,t.id,n))}function de(e){let t=e.lastPlayed?Date.now()-e.lastPlayed:999999999;return-e.games*1e3+t/1e3}function fe(e,t,n){return Math.abs(e.wins-t.wins)*1e3}function pe(e,t){if(ce(e).size>0||S[e].length>0)return;let n=[...t.filter(n=>ue(n,t,e))].sort((e,t)=>de(e)-de(t)),r=new Set,i=[];for(let t=0;t<n.length;t++){let a=n[t];if(r.has(a.id))continue;let o=null,s=1/0;for(let i=t+1;i<n.length;i++){let t=n[i];if(r.has(t.id)||le(a.id,t.id,e))continue;let c=fe(a,t,e);c<s&&(s=c,o=t)}o&&(i.push([a,o]),r.add(a.id),r.add(o.id))}i.forEach(t=>S[e].push(t))}var E=!1,me=``;function he(){return b}function D(e){let t=e.trim();if(t.length<=20)return t;let n=t.split(/\s+/).filter(Boolean);if(n.length<=2)return t;let r=n[0],i=n[n.length-1],a=n.slice(1,-1).find(e=>e.length>2);return a?`${r} ${a.charAt(0)}. ${i}`:`${r} ${i}`}function ge(e,t,n=!1){let r=``;n||(t===0&&(r=`gold`),t===1&&(r=`silver`),t===2&&(r=`bronze`));let i=$(e.id);return`
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
        <button onclick="togglePlayer('${e.id}')">${e.active?`&#9989;`:`&#9940;`}</button>
        <button onclick="deletePlayer('${e.id}')">❌</button>
      </div>
    </div>
  `}function _e(e,t,n){let r=ot(t.filter(e=>me?e.name.toLowerCase().includes(me):!0),n??`general`),i=r.slice(0,5),a=r.slice(5),o=n?`ranking-hidden-${n}`:`ranking-hidden-general`;return`
    <div class="group-section ranking-group-card">
      <div class="group-section-header compact">
        <div>
          <span class="section-label">${e}</span>
          <h3>${r.length?`${r.length} atleta${r.length===1?``:`s`} no ranking`:`Nenhum atleta encontrado`}</h3>
        </div>
      </div>
      ${r.length?`
            <div class="ranking-list">
              ${i.map((e,t)=>ge(e,t)).join(``)}
              ${a.length>0?`
                    <div id="${o}" class="ranking-hidden ${E?`open`:``}">
                      ${a.map((e,t)=>ge(e,t+5,!0)).join(``)}
                      ${E?``:`<div class="fade-overlay"></div>`}
                    </div>
                    <div class="ranking-toggle" onclick="toggleRankingView()">
                      ${E?`Mostrar menos`:`Mostrar mais`}
                    </div>
                  `:``}
            </div>
          `:`<div class="empty-state">Nenhum jogador encontrado na pesquisa.</div>`}
    </div>
  `}function ve(e){return`<strong title="${e.name}">${D(e.name)}</strong>`}function ye(){let e=new Set;Ze().forEach(t=>{X(t).forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)})}),document.getElementById(`playersPlaying`).innerText=String(e.size),document.getElementById(`playersWaiting`).innerText=String(he().filter(t=>t.active&&!e.has(t.id)).length),document.getElementById(`playersTotal`).innerText=String(he().length)}window.toggleRankingView=()=>{E=!E,O()},window.setRankingSearch=()=>{me=document.getElementById(`rankingSearch`)?.value.trim().toLowerCase()??``,O()};function O(){let e=document.getElementById(`ranking`),t=document.getElementById(`tables`),n=document.getElementById(`queue`),r=document.getElementById(`tableCount`),i=document.getElementById(`startBtn`),a=document.getElementById(`tournamentModeLabel`),o=document.getElementById(`rankingModeAction`),s=Ze();a&&(a.innerText=Ye()),i&&(Pe()?nt()===s.length?(i.disabled=!0,i.innerText=`Categorias iniciadas`):(i.disabled=!1,i.innerText=`Use os paineis abaixo`):(i.disabled=!0,i.innerText=`Ative um torneio`)),o&&(o.style.display=Xe()?`flow`:`none`,o.innerText=s.length===1?`Separar A e B`:`Juntar categorias`),r&&(r.innerText=s.map(e=>`${Z(e)}: ${X(e).length}`).join(` | `)),e.innerHTML=`
    <div class="group-compare-grid ${Xe()&&s.length>1?`dual`:`single`}">
      ${Xe()&&s.length>1?s.map(e=>`
                  <div class="group-column">
                    ${_e(Z(e),Qe(e),e)}
                  </div>
                `).join(``):`<div class="group-column">${_e(`Ranking geral`,he())}</div>`}
    </div>
  `,t.innerHTML=`
    <div class="group-compare-grid ${s.length>1?`dual`:`single`}">
      ${s.map(e=>{let t=X(e),n=et(e);return`
            <div class="group-section group-column">
              <div class="group-section-header compact">
                <div>
                  <span class="section-label">${Z(e)}</span>
                  <h3>${Y(e).length} atletas aptos a jogar</h3>
                </div>
                <div class="admin-tournament-actions compact">
                  <button class="btn primary" ${n?``:`disabled`} onclick="startGroup('${e}')">${tt(e)?`Atualizar jogos`:`Iniciar ${Z(e)}`}</button>
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
  `;let c=new Set;s.forEach(e=>{X(e).forEach(e=>{e.p1&&c.add(e.p1.id),e.p2&&c.add(e.p2.id)})}),n.innerHTML=`
    <div class="group-compare-grid ${s.length>1?`dual`:`single`}">
      ${s.map(e=>{let t=$e(e).filter(([e,t])=>!c.has(e.id)&&!c.has(t.id));return`
            <div class="group-section queue-section group-column">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">${Z(e)}</span>
                  <h3>${t.length?`${t.length} confronto(s) na fila`:`Fila de partidas`}</h3>
                </div>
              </div>
              ${t.length===0?`<div class="queue-empty rich">Nenhum jogo aguardando agora. Assim que uma mesa liberar, a proxima disputa aparece aqui.</div>`:`<div class="queue-grid compact-queue-grid">
                      ${t.map((t,n)=>{let r=$(t[0].id),i=$(t[1].id);return`
                              <div class="queue-card next-match-card compact-next-match-card">
                              <div class="queue-card-top">
                                <span class="queue-order">Proximo ${n+1}</span>
                                <span class="result-pill neutral">${Z(e)}</span>
                              </div>
                              <div class="queue-player-block">
                                ${ve(t[0])}
                                <span>${r.wins}V | ${r.losses}D</span>
                              </div>
                              <div class="queue-versus">vs</div>
                              <div class="queue-player-block">
                                ${ve(t[1])}
                                <span>${i.wins}V | ${i.losses}D</span>
                              </div>
                            </div>
                          `}).join(``)}
                    </div>`}
            </div>
          `}).join(``)}
    </div>
  `,ye()}var be=new URLSearchParams(window.location.search).get(`id`),xe=!1,k=null,A=[],j=new Set,M=[],N=null,P=null,F=null;function I(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function Se(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function Ce(){return{wins:0,losses:0,games:0,active:!0,createdAt:Date.now()}}function we(e){let t=e.playerProfile??Ce(),n=R(e.id);return{id:e.id,name:e.name,wins:t.wins??0,losses:t.losses??0,games:t.games??0,active:t.active??!0,registrationCategory:n?.category,createdAt:t.createdAt??e.createdAt,lastPlayed:t.lastPlayed}}function L(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function Te(e,t=13){let n=e.trim();if(n.length<=t)return n;let r=n.split(/\s+/).filter(Boolean);if(r.length>=2){let e=r[0],n=r[r.length-1],i=r.slice(1,-1).filter(e=>![`de`,`da`,`do`,`dos`,`das`,`e`].includes(e.toLowerCase()));if(i.length){let r=`${e} ${i[0][0]}. ${n}`;if(r.length<=t+6)return r;let a=`${e} ${i.map(e=>`${e[0]}.`).join(` `)} ${n}`.replace(/\s+/g,` `).trim();if(a.length<=t+8)return a}let a=`${e} ${n}`;if(a.length<=t+4)return a}return`${n.slice(0,Math.max(1,t-3)).trimEnd()}...`}function Ee(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function R(e){return M.find(t=>t.id===e||t.uid===e)}function De(e){return A.find(t=>t.id===e)??null}function z(e=``){let t=L(e);return A.filter(e=>!e.profileComplete||e.role!==`user`&&e.role!==`admin`?!1:t?[e.name,e.email,e.club,e.category].some(e=>L(e).includes(t)):!0).map(e=>({user:e,registration:R(e.id),player:b.find(t=>t.id===e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function Oe(e){return e.player?.active?{label:`Ativo`,helper:`Participando`,tone:`neutral`}:e.registration?.paymentStatus===`approved`?{label:`Pronto`,helper:`Inativo`,tone:`win`}:e.registration?.paymentStatus===`pending_payment`?{label:`Pendente`,helper:`Pagamento não aprovado`,tone:`loss`}:{label:`Novo`,helper:`Sem inscrição`,tone:`neutral`}}function ke(e=``){let t=document.getElementById(`athleteSearchResults`),n=document.getElementById(`athleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=z(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado para essa busca.`:n.textContent=`Digite para buscar atletas cadastrados.`,t.innerHTML=i.length?i.map(e=>{let t=Oe(e),n=Te(e.user.name.trim(),16),r=[e.user.club||`Sem clube`,e.user.category||`Sem categoria`].join(` - `);return`
            <button
              type="button"
              class="athlete-search-item"
              onclick="selectAthleteCandidate('${e.user.id}')"
              title="${e.user.name}"
            >
              <div class="athlete-search-copy">
                <strong>${n}</strong>
                <span>${r}</span>
                <small class="athlete-search-status ${t.tone}">${t.helper}</small>
              </div>
              <span class="result-pill athlete-search-pill ${t.tone}">${t.label}</span>
            </button>
          `}).join(``):``}function B(){ke(document.getElementById(`name`)?.value??``)}function Ae(e){if(k){let t=te(k,e.category);if(t.length)return t[0]}return e.category||k?.category||`Livre`}function je(e,t){let n=k;if(!n)throw Error(`Torneio nao carregado.`);let r=Date.now(),i=Ae(e),a=_(n,[i]);return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:i,registrationFee:a,paymentStatus:t,paymentMethod:`pix`,registeredAt:r,status:`registered`},userRegistrationPayload:{id:n.id,tournamentId:n.id,title:n.title,location:n.location??``,category:i,categories:[i],registrationFee:a,paymentStatus:t,paymentMethod:`pix`,startDate:n.startDate,endDate:n.endDate,registrationDeadline:n.registrationDeadline,registeredAt:r,status:`registered`}}}function Me(e){let t=document.getElementById(`athleteActivationModal`),n=document.getElementById(`athleteActivationTitle`),r=document.getElementById(`athleteActivationDescription`);!t||!n||!r||(F=e,n.textContent=`Ativar ${e.user.name}?`,r.textContent=`Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para análise.`,t.style.display=`flex`)}function V(){let e=document.getElementById(`athleteActivationModal`);e&&(F=null,e.style.display=`none`)}async function Ne(e,t){let r=k;if(!r)return;let{registrationPayload:i,userRegistrationPayload:a}=je(e.user,t),o=n(s);o.set(c(s,`tournaments`,r.id,`registrations`,e.user.id),i),o.set(c(s,`users`,e.user.id,`registrations`,r.id),a),t===`approved`&&o.set(c(s,`users`,e.user.id),{playerProfile:{...Ce(),active:!0},updatedAt:Date.now()},{merge:!0}),await o.commit()}function Pe(){return!!(k&&k.status!==`finished`)}function H(){return ee(k)}function U(){k&&(k.groupStates={general:{started:!1,tableCount:1,...k.groupStates?.general},A:{started:!1,tableCount:1,...k.groupStates?.A},B:{started:!1,tableCount:1,...k.groupStates?.B}})}function Fe(e){return U(),k?.groupStates?.[e]??{started:!1,tableCount:1}}function W(e){return!!Fe(e).started}function Ie(e){return Fe(e).tableCount??1}function Le(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>w(e,Ie(e)))}function G(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>T(e))}function Re(e,t){k&&(e.delete(c(s,`tournaments`,k.id,`registrations`,t)),e.delete(c(s,`users`,t,`registrations`,k.id)),M=M.filter(e=>e.id!==t&&e.uid!==t),j.delete(t))}async function ze(e,t){k&&(U(),k.groupStates={...k.groupStates,[e]:{...k.groupStates?.[e],...t}},await a(c(s,`tournaments`,k.id),{groupStates:k.groupStates,updatedAt:Date.now()}))}function Be(){U(),[`general`,`A`,`B`].forEach(e=>{w(e,Ie(e))})}function Ve(e){return k?.rankingLiveState?.[e]??{}}function He(){[`general`,`A`,`B`].forEach(e=>{T(e),w(e,Ie(e));let t=Ve(e);(t.queue??[]).forEach(t=>{let[n,r]=t.playerIds,i=b.find(e=>e.id===n),a=b.find(e=>e.id===r);i&&a&&S[e].push([i,a])}),(t.activeTables??[]).forEach((t,n)=>{let r=t.playerIds,i=r?b.find(e=>e.id===r[0]):void 0,a=r?b.find(e=>e.id===r[1]):void 0;C[e][n]={id:t.id,group:e,...i?{p1:i}:{},...a?{p2:a}:{}}})})}async function K(){let e=k;e&&(e.rankingLiveState={general:{queue:S.general.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:C.general.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},A:{queue:S.A.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:C.A.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},B:{queue:S.B.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:C.B.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))}},k=e,await a(c(s,`tournaments`,e.id),{rankingLiveState:e.rankingLiveState,updatedAt:Date.now()}))}function Ue(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function q(){document.getElementById(`activeTournamentName`).textContent=k?.title||`Torneio nao encontrado`,document.getElementById(`tournamentStatusLabel`).textContent=k?.status===`finished`?`Finalizado`:k?.isActive?`Em andamento`:k?.status===`open`?`Inscricoes abertas`:`Aguardando inicio`}function We(e=k?.finalStandings??[]){let t=document.getElementById(`finalResultsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">O resultado final ainda nao foi gerado.</div>`;return}t.innerHTML=H().filter(t=>e.some(e=>e.group===t)).map(t=>{let n=e.filter(e=>e.group===t);return`
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${v(t)}</span>
            <strong>${n.length} atleta${n.length===1?``:`s`}</strong>
          </div>
          <div class="ranking-showcase">
            <div class="ranking-showcase-podium">
              ${n.slice(0,3).map((e,t)=>`
                    <article class="ranking-showcase-podium-card place-${t+1}">
                      <span class="ranking-showcase-place">${I(e.placement)}</span>
                      <strong>${I(e.name)}</strong>
                      <small>${I(e.category)}</small>
                      <div class="ranking-showcase-score">${e.wins}V - ${e.losses}D - ${e.games} jogos</div>
                    </article>
                  `).join(``)}
            </div>
            <div class="ranking-showcase-table">
              ${n.map(e=>`
                    <div class="ranking-showcase-row">
                      <span>${I(e.placement)}</span>
                      <strong>${I(e.name)}</strong>
                      <small>${I(e.result)}</small>
                      <span>${e.wins}V / ${e.losses}D</span>
                    </div>
                  `).join(``)}
            </div>
          </div>
        </section>
      `}).join(``)}}function Ge(){We();let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`flex`)}function Ke(){let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`none`)}function qe(e){let t=document.getElementById(`athleteProfileModal`),n=document.getElementById(`athleteProfileContent`);if(!t||!n)return;let r=De(e),i=b.find(t=>t.id===e);if(!r){m(`Nao foi possivel carregar o perfil do atleta.`,`warning`);return}let a=$(e),o=Se(r.name||`Atleta`);n.innerHTML=`
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${r.photoURL?`<img class="profile-avatar" src="${I(r.photoURL)}" alt="Foto de ${I(r.name)}">`:`<div class="profile-avatar profile-avatar-fallback">${I(o)}</div>`}</div>
        <div class="athlete-profile-copy">
          <h3>${I(r.name)}</h3>
          <p>${I(r.club||`Sem clube`)} - ${I(r.category||`Sem categoria`)}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${i?.active?`Ativo no ranking`:`Sem jogos ativos`}</span>
            <span class="result-pill ${R(e)?.paymentStatus===`approved`?`win`:`loss`}">${R(e)?.paymentStatus===`approved`?`Inscricao aprovada`:`Inscricao pendente`}</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${I(r.email||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${I(r.phone||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Partidas</span><strong>${a.games}</strong></div>
        <div class="info-card"><span>Vitorias</span><strong>${a.wins}</strong></div>
        <div class="info-card"><span>Derrotas</span><strong>${a.losses}</strong></div>
        <div class="info-card"><span>Ultimo jogo</span><strong>${Ee(i?.lastPlayed)}</strong></div>
      </div>
      <div class="athlete-profile-actions">
        <button class="btn danger" onclick="resetAthleteMatches('${e}')">Resetar partidas do atleta</button>
      </div>
    </div>
  `,t.style.display=`flex`}async function Je(){if(!be){window.location.replace(`/pages/dashboard.html`);return}let e=await i(c(s,`tournaments`,be));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}k={id:e.id,...e.data()},U(),q()}async function J(){if(!k){A=[],M=[],b.length=0;return}let[e,n]=await Promise.all([t(r(s,`users`)),t(r(s,`tournaments`,k.id,`registrations`))]);M=n.docs.map(e=>({id:e.id,...e.data()})),j=new Set(M.filter(e=>e.paymentStatus===`approved`).map(e=>e.id)),A=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.role===`user`||e.role===`admin`).sort((e,t)=>e.name.localeCompare(t.name)),b.length=0,b.push(...A.filter(e=>e.profileComplete&&j.has(e.id)).map(e=>we(e)).sort((e,t)=>e.name.localeCompare(t.name))),B()}function Ye(){return ne(k)===`ranking`?`Ranking`:`Campeonato`}function Xe(){return g(k)}function Ze(){return H()}function Y(e){let t=k;return t?b.filter(n=>n.active&&h(t,n.registrationCategory)===e):[]}function Qe(e){let t=k;return t?b.filter(n=>h(t,n.registrationCategory)===e&&R(n.id)?.paymentStatus===`approved`):[]}function X(e){return C[e]}function $e(e){return S[e]}function Z(e){return v(e)}function et(e){return!!(k&&k.status!==`finished`)&&Y(e).length>=2}function tt(e){return W(e)}function nt(){return H().filter(e=>W(e)).length}async function rt(){if(x.length=0,!k)return;let e=await t(r(s,`matches`));x.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.tournamentId===k?.id).sort((e,t)=>e.createdAt-t.createdAt))}async function it(){await Je(),await Promise.all([J(),rt()]),He(),q(),O()}async function at(){if(k)try{await J(),O()}catch(e){console.error(`Erro ao atualizar inscricoes do torneio:`,e)}}function Q(){return b.filter(e=>R(e.id)?.paymentStatus===`approved`)}function ot(e,t=`general`){return re(e,st(t))}function st(e){return x.filter(t=>t.tournamentId===k?.id&&(t.group??`general`)===e)}function ct(e){let t=Y(e),n=[];for(let r=0;r<t.length;r++)for(let i=r+1;i<t.length;i++){let a=t[r],o=t[i];st(e).some(e=>e.p1===a.id&&e.p2===o.id||e.p1===o.id&&e.p2===a.id)||n.push([a,o])}return n}function lt(){let e=k;return e?H().flatMap(t=>(()=>{let n=Q().filter(n=>h(e,n.registrationCategory)===t),{stats:r}=ie(n.map(e=>e.id),st(t));return ot(n,t).map((e,n)=>{let i=n+1,a=r.get(e.id)??{wins:0,losses:0,games:0};return{playerId:e.id,name:e.name,category:e.registrationCategory||v(t),group:t,placement:`${i}o lugar`,result:ut(i),wins:a.wins,losses:a.losses,games:a.games}})})()):[]}function ut(e){return e===1?`Campeao`:e===2?`Vice-campeao`:e===3?`3o lugar`:`${e}o lugar`}function dt(){b.forEach(e=>{e.wins=0,e.losses=0,e.games=0,e.active=!1,e.lastPlayed=void 0}),x.length=0,G(),Le()}async function ft(){let e=k;if(!e||e.isActive)return;let i=await t(u(r(s,`tournaments`),f(`isActive`,`==`,!0))),a=n(s);i.forEach(t=>{t.id!==e.id&&a.update(t.ref,{isActive:!1,updatedAt:Date.now()})}),a.update(c(s,`tournaments`,e.id),{isActive:!0,status:`open`,updatedAt:Date.now()}),await a.commit(),k={...e,isActive:!0,status:`open`,updatedAt:Date.now()},q()}async function pt(e,t,r){let i=k;if(!i)return;let a=b.find(e=>e.id===t),l=b.find(e=>e.id===r);if(!a||!l)return;let u={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:l.name,scoreLabel:`${e.score1} x ${e.score2}`,tableLabel:e.tableLabel,result:`win`,playedAt:e.createdAt},d={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:a.name,scoreLabel:`${e.score2} x ${e.score1}`,tableLabel:e.tableLabel,result:`loss`,playedAt:e.createdAt},f={tournamentId:i.id,title:i.title,category:a.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(1),losses:o(0),playedAt:e.createdAt},p={tournamentId:i.id,title:i.title,category:l.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(0),losses:o(1),playedAt:e.createdAt},m=n(s);m.set(c(s,`users`,a.id,`matches`,e.id),u),m.set(c(s,`users`,l.id,`matches`,e.id),d),m.set(c(s,`users`,a.id,`tournaments`,i.id),f,{merge:!0}),m.set(c(s,`users`,l.id,`tournaments`,i.id),p,{merge:!0}),await m.commit()}function mt(e){let t=C[e],n=S[e];for(let r=0;r<t.length;r++)if(!t[r].p1&&n.length){let i=n.shift();t[r]={id:t[r].id,group:e,p1:i[0],p2:i[1]}}}function ht(e){return C[e].some(e=>e.p1&&e.p2)}function gt(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}async function _t(e){return gt((await i(c(s,`users`,e))).data())}window.logout=async()=>{await p(d),window.location.replace(`/pages/login.html`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.editCurrentTournament=()=>{k&&(window.location.href=`/pages/tournament-form.html?id=${k.id}`)},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.openAthleteProfile=e=>{qe(e)},window.closeAthleteProfileModal=()=>{let e=document.getElementById(`athleteProfileModal`);e&&(e.style.display=`none`)},window.openFinalResultsModal=()=>{Ge()},window.closeFinalResultsModal=()=>{Ke()},window.openTournamentRegistrations=()=>{k&&(window.location.href=`/pages/tournament-registrations.html?id=${k.id}`)},window.closeAthleteActivationModal=()=>{V()},e(d,async e=>{if(xe)return;if(xe=!0,!e){window.location.replace(`/pages/login.html`);return}let t=await _t(e.uid);t&&(Ue(t),Be(),await it(),window.addEventListener(`focus`,at),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&at()}),N=window.setInterval(()=>{at()},15e3))}),window.addEventListener(`beforeunload`,()=>{N!==null&&(window.clearInterval(N),N=null)}),window.addPlayer=async()=>{let e=document.getElementById(`name`),t=e.value.trim();if(t){await J();try{let n=(P?z().find(e=>e.user.id===P):void 0)??z(t).find(e=>L(e.user.name)===L(t));if(!n){m(`Selecione um atleta da busca para ativar.`,`warning`);return}if(n.player?.active){m(`Esse jogador ja esta inscrito e ativo neste torneio.`,`warning`);return}if(n.registration?.paymentStatus===`approved`){let t=b.find(e=>e.id===n.user.id&&!e.active);if(!t){m(`Nao foi possivel ativar esse atleta agora.`,`error`);return}let r=k;if(!r){m(`Torneio nao encontrado.`,`error`);return}await a(c(s,`users`,t.id),{"playerProfile.active":!0,updatedAt:Date.now()}),t.active=!0,P=null,W(h(r,t.registrationCategory))&&(await K(),m(`Atleta reativado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.`,`info`)),b.sort((e,t)=>e.name.localeCompare(t.name)),e.value=``,B(),O(),m(`Atleta reativado com sucesso.`,`success`);return}Me(n)}catch(e){m(`Erro ao ativar atleta: `+e.message,`error`)}}},window.searchAthletes=()=>{P=null,B()},window.selectAthleteCandidate=e=>{let t=document.getElementById(`name`),n=z().find(t=>t.user.id===e);!t||!n||(P=e,t.value=n.user.name,ke(n.user.name))},window.confirmAthletePaymentStatus=async e=>{let t=F,n=document.getElementById(`name`);if(t){if(e===`cancel`){V();return}try{if(await Ne(t,e),await J(),e===`approved`){let e=k;if(!e){m(`Torneio nao encontrado.`,`error`);return}W(h(e,t.user.category))&&(await K(),m(`Atleta adicionado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.`,`info`))}e===`approved`?m(`Atleta adicionado automaticamente ao campeonato.`,`success`):m(`Inscrição adicionada para análise no gerenciamento de inscrições.`,`info`),P=null,n&&(n.value=``),V(),B(),O()}catch(e){m(`Erro ao registrar atleta: `+e.message,`error`)}}},window.approveRegistration=async e=>{if(k&&M.find(t=>t.id===e))try{let t=n(s);t.update(c(s,`tournaments`,k.id,`registrations`,e),{paymentStatus:`approved`}),t.update(c(s,`users`,e,`registrations`,k.id),{paymentStatus:`approved`}),await t.commit(),await J(),O()}catch(e){m(`Erro ao aprovar pagamento: `+e.message,`error`)}},window.removeRegistration=async e=>{if(!k)return;let t=M.find(t=>t.id===e);if(t&&await y({title:`Remover inscrição`,message:`Remover a inscrição de ${t.name}?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);Re(t,e),t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),await t.commit(),await J(),O()}catch(e){m(`Erro ao remover inscrição: `+e.message,`error`)}},window.toggleRankingMode=async()=>{if(!k||!g(k))return;if(x.length>0){m(`Nao e possivel juntar ou separar categorias apos iniciar partidas.`,`warning`);return}let e=k.rankingMode===`split`?`single`:`split`;await a(c(s,`tournaments`,k.id),{rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}},updatedAt:Date.now()}),k={...k,rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}}},G(),Le(),await K(),O()},window.startGroup=async e=>{if(!k){m(`Torneio nao encontrado.`,`error`);return}if(!et(e)){m(`Essa categoria precisa de pelo menos 2 atletas ativos.`,`warning`);return}await ft(),W(e)||await ze(e,{started:!0}),ht(e)||T(e),pe(e,Y(e)),mt(e),await K(),O()},window.resetMatches=async()=>{if(k)try{let e=n(s);x.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),Q().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.lastPlayed":null}),e.delete(c(s,`users`,t.id,`tournaments`,k.id))}),await e.commit(),x.length=0,G(),Le(),await K(),O()}catch(e){m(`Erro ao resetar campeonato: `+e.message,`error`)}},window.resetAthleteMatches=async e=>{if(!k)return;let t=De(e),r=b.find(t=>t.id===e);if(!t||!r){m(`Atleta nao encontrado no torneio atual.`,`warning`);return}let i=x.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e));if(!i.length){m(`Esse atleta ainda nao possui partidas registradas neste ranking.`,`info`);return}if(await y({title:`Resetar partidas do atleta`,message:`Limpar ${i.length} partida(s) de ${t.name} neste ranking?`,confirmLabel:`Resetar partidas`,tone:`danger`}))try{let t=k;if(!t){m(`Torneio nao encontrado.`,`error`);return}let a=new Set([e]);i.forEach(e=>{a.add(e.p1),a.add(e.p2)});let o=x.filter(e=>!i.some(t=>t.id===e.id)),l=n(s);i.forEach(e=>{l.delete(c(s,`matches`,e.id)),l.delete(c(s,`users`,e.p1,`matches`,e.id)),l.delete(c(s,`users`,e.p2,`matches`,e.id))}),a.forEach(e=>{let n=o.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e)),r=n.filter(t=>t.winner===e).length,i=n.length-r,a=n.length?Math.max(...n.map(e=>e.createdAt)):null;l.update(c(s,`users`,e),{"playerProfile.wins":r,"playerProfile.losses":i,"playerProfile.games":n.length,"playerProfile.lastPlayed":a}),n.length?l.set(c(s,`users`,e,`tournaments`,t.id),{tournamentId:t.id,title:t.title,category:R(e)?.category||t.category||`Livre`,result:`Em andamento`,matchCount:n.length,wins:r,losses:i,playedAt:a??Date.now()},{merge:!0}):l.delete(c(s,`users`,e,`tournaments`,t.id))}),await l.commit(),x.length=0,x.push(...o),a.forEach(e=>{let t=b.find(t=>t.id===e),n=o.filter(t=>t.tournamentId===k?.id&&(t.p1===e||t.p2===e));t&&(t.wins=n.filter(t=>t.winner===e).length,t.losses=n.length-t.wins,t.games=n.length,t.lastPlayed=n.length?Math.max(...n.map(e=>e.createdAt)):void 0)});let u=h(t,r.registrationCategory);T(u),C[u]=C[u].map(t=>t.p1?.id===e||t.p2?.id===e?{id:t.id,group:u}:t),W(u)&&!ht(u)&&(pe(u,Y(u)),mt(u)),await K(),O(),qe(e),m(`Partidas do atleta resetadas com sucesso.`,`success`)}catch(e){m(`Erro ao resetar partidas do atleta: `+e.message,`error`)}},window.finishTournament=async()=>{let e=k;if(!e)return;let t=lt();if(!t.length){m(`Adicione atletas e finalize partidas antes de encerrar o torneio.`,`warning`);return}if(H().flatMap(e=>ct(e)).length){m(`Ainda existem confrontos obrigatorios pendentes neste ranking.`,`warning`);return}if(await y({title:`Encerrar torneio`,message:`Encerrar o torneio "${e.title}"?\n\nEssa ação finaliza o ranking e grava a classificação dos atletas.`,confirmLabel:`Encerrar`,tone:`danger`}))try{let r=n(s),i=Date.now();t.forEach(t=>{let n={id:e.id,tournamentId:e.id,title:e.title,category:t.category||e.category||`Livre`,placement:t.placement,result:t.result,matchCount:t.games,wins:t.wins,losses:t.losses,playedAt:i};r.set(c(s,`users`,t.playerId,`tournaments`,e.id),n,{merge:!0}),r.update(c(s,`users`,t.playerId),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null})}),r.update(c(s,`tournaments`,e.id),{isActive:!1,status:`finished`,finalStandings:t,updatedAt:i,completedAt:i}),await r.commit(),k={...e,isActive:!1,status:`finished`,finalStandings:t,updatedAt:i},q(),dt(),await K(),O(),Ge(),m(`Torneio encerrado com sucesso.`,`success`)}catch(e){m(`Erro ao encerrar torneio: `+e.message,`error`)}},window.deletePlayer=async e=>{if(await y({title:`Remover atleta`,message:`Remover este atleta do torneio atual?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),Re(t,e),t.delete(c(s,`users`,e,`tournaments`,k.id)),await t.commit();let r=b.find(t=>t.id===e);r&&(r.active=!1,r.games=0,r.wins=0,r.losses=0,r.lastPlayed=void 0),G(),[`general`,`A`,`B`].forEach(t=>{C[t].forEach(t=>{(t.p1?.id===e||t.p2?.id===e)&&(t.p1=void 0,t.p2=void 0)})}),await K(),O()}catch(e){m(`Erro ao remover atleta do torneio: `+e.message,`error`)}},window.editPlayer=async e=>{let t=b.find(t=>t.id===e);if(!t)return;let n=prompt(`Novo nome:`,t.name)?.trim();if(n){t.name=n;try{await a(c(s,`users`,e),{name:n,updatedAt:Date.now()}),b.sort((e,t)=>e.name.localeCompare(t.name)),O()}catch(e){m(`Erro ao editar atleta: `+e.message,`error`)}}},window.togglePlayer=async e=>{let t=b.find(t=>t.id===e);if(t){t.active=!t.active;try{await a(c(s,`users`,e),{"playerProfile.active":t.active}),G(),await K(),O()}catch(e){m(`Erro ao atualizar atleta: `+e.message,`error`)}}},window.showHistory=e=>{let t=b.find(t=>t.id===e);if(!t)return;let n=x.filter(t=>t.p1===e||t.p2===e).map(t=>{let n=t.p1===e,r=n?t.p2:t.p1,i=b.find(e=>e.id===r),a=t.winner===e,o=n?t.score1:t.score2,s=n?t.score2:t.score1;return`
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
  `;document.getElementById(`historyList`).innerHTML=i+(n||`<div>Nenhum jogo ainda</div>`),document.getElementById(`historyModal`).style.display=`flex`};function $(e){let t=x.filter(t=>t.p1===e||t.p2===e),n=0,r=0,i=0,a=0;t.forEach(t=>{let o=t.p1===e,s=o?t.score1:t.score2,c=o?t.score2:t.score1;i+=s,a+=c,t.winner===e?n++:r++});let o=t.length,s=o>0?(n/o*100).toFixed(1):`0`;return{wins:n,losses:r,games:o,setsWon:i,setsLost:a,winRate:s}}window.clearPlayers=async()=>{if(k&&await y({title:`Limpar torneio atual`,message:`Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?`,confirmLabel:`Limpar`,tone:`danger`}))try{let e=n(s);Q().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null}),Re(e,t.id),e.delete(c(s,`users`,t.id,`tournaments`,k.id))}),x.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),await e.commit(),dt(),await K(),O()}catch(e){console.error(`Erro ao limpar campeonato:`,e)}},window.finish=async(e,t)=>{let i=C[e][t],a=k;if(!i?.p1||!i?.p2||!a)return;let o=parseInt(document.getElementById(`s1_${e}_${t}`).value,10),u=parseInt(document.getElementById(`s2_${e}_${t}`).value,10);if(isNaN(o)||isNaN(u)){m(`Preencha o placar corretamente.`,`warning`);return}if(o<0||u<0){m(`O placar nao pode ser negativo.`,`warning`);return}if(o===u){m(`O jogo precisa ter um vencedor.`,`warning`);return}let d=o>u?i.p1:i.p2,f=o>u?i.p2:i.p1,p=Date.now();d.wins+=1,f.losses+=1,d.games+=1,f.games+=1,d.lastPlayed=p,f.lastPlayed=p;try{let m={p1:i.p1.id,p2:i.p2.id,score1:o,score2:u,winner:d.id,createdAt:p,tournamentId:a.id,tournamentTitle:a.title,tableLabel:`${v(e)} - Mesa ${t+1}`,group:e,registrationCategory:d.registrationCategory},h=await l(r(s,`matches`),m),g=n(s);g.update(c(s,`users`,d.id),{"playerProfile.wins":d.wins,"playerProfile.games":d.games,"playerProfile.lastPlayed":p}),g.update(c(s,`users`,f.id),{"playerProfile.losses":f.losses,"playerProfile.games":f.games,"playerProfile.lastPlayed":p}),await g.commit();let _={id:h.id,...m};await pt(_,d.id,f.id),x.push(_),C[e][t]={id:C[e][t].id,group:e},T(e),pe(e,Y(e)),mt(e),await K(),O()}catch(e){m(`Erro ao finalizar partida: `+e.message,`error`)}},window.changeTables=async(e,t)=>{let n=C[e];if(t>0)for(let r=0;r<t;r++)n.push({id:oe(),group:e});else{let e=n.findIndex(e=>!e.p1);if(e===-1){m(`Finalize algum jogo antes de remover mesas.`,`warning`);return}n.splice(e,1)}await ze(e,{tableCount:n.length}),await K(),O()};