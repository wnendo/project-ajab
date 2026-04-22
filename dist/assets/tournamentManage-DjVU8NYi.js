import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,m as o,n as s,p as c,r as l,s as u,t as d,u as f,x as p}from"./firebase-VBRKn9At.js";import{n as m}from"./toast-kV3jSCF7.js";/* empty css               */import{c as h,f as g,l as ee,o as te,r as ne,s as _,u as re}from"./tournament-rules-CmdOaKKb.js";import{t as v}from"./confirm-modal-Dnnch5Ng.js";import{n as ie,t as ae}from"./ranking-standings-Dec7PvHv.js";var y=[],b=[],x={general:[],A:[],B:[]},S={general:[{id:1,group:`general`}],A:[{id:2,group:`A`}],B:[{id:3,group:`B`}]},oe=4;function se(){return oe++}function ce(e,t=1){S[e].length=0;for(let n=0;n<t;n++)S[e].push({id:n===0?le(e):se(),group:e})}function C(e){x[e].length=0}function le(e){return e===`general`?1:e===`A`?2:3}function ue(e){let t=new Set;return S[e].forEach(e=>{e.p1&&t.add(e.p1.id),e.p2&&t.add(e.p2.id)}),t}function de(e,t,n){return b.some(r=>(r.group??`general`)===n&&(r.p1===e&&r.p2===t||r.p1===t&&r.p2===e))}function fe(e,t,n){return t.some(t=>t.id!==e.id&&!de(e.id,t.id,n))}function pe(){return{winnerPoolIds:[],loserPoolIds:[]}}function me(e){return e.length?e.reduce((e,t)=>e+t.games,0)/e.length:0}function he(e,t){return[...b].filter(n=>(n.group??`general`)===t&&(n.p1===e||n.p2===e)).sort((e,t)=>t.createdAt-e.createdAt)[0]}function w(e,t){let n=me(t),r=Math.max(0,n-e.games),i=e.lastPlayed?Date.now()-e.lastPlayed:999999999;return r*1e5+(999999999-i)}function T(e,t,n,r){if(de(e.id,t.id,n))return 1/0;let i=me(r),a=e.games<i,o=t.games<i,s=Math.abs(e.games-t.games),c=Math.abs(e.wins-t.wins),l=Math.abs(e.losses-t.losses),u=c*1e3+l*300+s*120;(a||o)&&(u=s*600+l*200-(e.wins+t.wins)*40);let d=he(e.id,n),f=he(t.id,n);if(d&&f&&d.id===f.id){let n=d.winner===e.id,r=f.winner===t.id;a||o?n!==r&&(u-=n||r?250:0):n!==r&&(u+=350)}return u}function ge(e,t){let n=new Set(t.map(e=>e.id));return x[e].filter(([t,r])=>n.has(t.id)&&n.has(r.id)&&t.id!==r.id&&!de(t.id,r.id,e))}function _e(e,t){return e.filter(e=>!t.has(e.id))}function ve(e,t,n,r,i){let a=e.filter(e=>!t.has(e.id));if(a.length<2)return;let o=[...a].sort((e,t)=>w(t,n)-w(e,n)),s=o[0],c=null,l=1/0;for(let e=1;e<o.length;e++){let t=o[e],i=T(s,t,r,n);i<l&&(l=i,c=t)}!c||!Number.isFinite(l)||(i.push([s,c]),t.add(s.id),t.add(c.id))}function ye(e,t,n,r,i,a){let o=new Map(n.map(e=>[e.id,e])),s=e.filter(e=>o.has(e)&&!t.has(e));for(;s.length>=2;){let e=s.shift(),n=o.get(e);if(!n||t.has(n.id))continue;let c=-1,l=1/0;if(s.forEach((e,a)=>{let s=o.get(e);if(!s||t.has(s.id))return;let u=T(n,s,i,r);u<l&&(l=u,c=a)}),c===-1||!Number.isFinite(l))continue;let[u]=s.splice(c,1),d=o.get(u);d&&(a.push([n,d]),t.add(n.id),t.add(d.id))}return s}function be(e,t,n,r,i,a,o){let s=new Set(r.map(e=>e.id)),c=(t.winnerPoolIds??[]).filter(e=>s.has(e)&&!n.has(e)),l=(t.loserPoolIds??[]).filter(e=>s.has(e)&&!n.has(e)),u=new Map(r.map(e=>[e.id,e]));e.forEach(e=>{if(n.has(e.id))return;let t=[...c,...l],r=null,s=1/0;t.forEach(t=>{if(t===e.id||n.has(t))return;let o=u.get(t);if(!o)return;let l=T(e,o,a,i);c.includes(t)&&(l-=180),e.games===0&&c.includes(t)&&(l-=120),l<s&&(s=l,r=o)}),!(!r||!Number.isFinite(s))&&(o.push([e,r]),n.add(e.id),n.add(r.id))}),t.winnerPoolIds=c.filter(e=>!n.has(e)),t.loserPoolIds=l.filter(e=>!n.has(e))}function xe(e,t,n,r,i=pe()){let a={winnerPoolIds:[...i.winnerPoolIds??[]].filter(e=>e!==t.id&&e!==n.id),loserPoolIds:[...i.loserPoolIds??[]].filter(e=>e!==t.id&&e!==n.id)};return fe(t,r,e)&&a.winnerPoolIds.push(t.id),fe(n,r,e)&&a.loserPoolIds.push(n.id),a}function E(e,t,n=pe()){let r=ue(e),i=t.filter(e=>!r.has(e.id)),a=i.filter(t=>fe(t,i,e)),o=me(t),s=[...a].sort((e,n)=>w(n,t)-w(e,t)),c=new Set,l=ge(e,i);l.forEach(([e,t])=>{c.add(e.id),c.add(t.id)});let u={winnerPoolIds:[...n.winnerPoolIds??[]],loserPoolIds:[...n.loserPoolIds??[]]},d=s.filter(e=>!c.has(e.id)&&(e.games<o||e.games===0));ve(d,c,t,e,l),be(d,u,c,i,t,e,l),u.winnerPoolIds=ye(u.winnerPoolIds??[],c,i,t,e,l),u.loserPoolIds=ye(u.loserPoolIds??[],c,i,t,e,l);let f=_e(s,c);for(let n=0;n<f.length;n++){let r=f[n];if(c.has(r.id))continue;let i=null,a=1/0;for(let o=n+1;o<f.length;o++){let n=f[o];if(c.has(n.id))continue;let s=T(r,n,e,t);s<a&&(a=s,i=n)}i&&(l.push([r,i]),c.add(r.id),c.add(i.id))}return x[e].length=0,l.forEach(t=>x[e].push(t)),u}var D=!1,O=``;function Se(){return y}function k(e){let t=e.trim();if(t.length<=20)return t;let n=t.split(/\s+/).filter(Boolean);if(n.length<=2)return t;let r=n[0],i=n[n.length-1],a=n.slice(1,-1).find(e=>e.length>2);return a?`${r} ${a.charAt(0)}. ${i}`:`${r} ${i}`}function Ce(e,t,n=!1){let r=``;n||(t===0&&(r=`gold`),t===1&&(r=`silver`),t===2&&(r=`bronze`));let i=$(e.id);return`
    <div class="player-row compact-player-row ${r} ${n?`faded`:``}">
      <div class="player-row-main">
        <span>${t+1} -</span>
        <span class="player-name" title="${e.name}" onclick="showHistory('${e.id}')">${k(e.name)}</span>
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
  `}function we(e,t,n){let r=mt(t.filter(e=>O?e.name.toLowerCase().includes(O):!0),n??`general`),i=r.slice(0,5),a=r.slice(5),o=n?`ranking-hidden-${n}`:`ranking-hidden-general`;return`
    <div class="group-section ranking-group-card">
      <div class="group-section-header compact">
        <div>
          <span class="section-label">${e}</span>
          <h3>${r.length?`${r.length} atleta${r.length===1?``:`s`} no ranking`:`Nenhum atleta encontrado`}</h3>
        </div>
      </div>
      ${r.length?`
            <div class="ranking-list">
              ${i.map((e,t)=>Ce(e,t)).join(``)}
              ${a.length>0?`
                    <div id="${o}" class="ranking-hidden ${D?`open`:``}">
                      ${a.map((e,t)=>Ce(e,t+5,!0)).join(``)}
                      ${D?``:`<div class="fade-overlay"></div>`}
                    </div>
                    <div class="ranking-toggle" onclick="toggleRankingView()">
                      ${D?`Mostrar menos`:`Mostrar mais`}
                    </div>
                  `:``}
            </div>
          `:`<div class="empty-state">Nenhum jogador encontrado na pesquisa.</div>`}
    </div>
  `}function Te(e){return`<strong title="${e.name}">${k(e.name)}</strong>`}function Ee(){let e=new Set;at().forEach(t=>{Z(t).forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)})}),document.getElementById(`playersPlaying`).innerText=String(e.size),document.getElementById(`playersWaiting`).innerText=String(Se().filter(t=>t.active&&!e.has(t.id)).length),document.getElementById(`playersTotal`).innerText=String(Se().length)}window.toggleRankingView=()=>{D=!D,A()},window.setRankingSearch=()=>{O=document.getElementById(`rankingSearch`)?.value.trim().toLowerCase()??``,A()};function A(){let e=document.getElementById(`ranking`),t=document.getElementById(`tables`),n=document.getElementById(`queue`),r=document.getElementById(`tableCount`),i=document.getElementById(`tournamentModeLabel`),a=document.getElementById(`rankingModeAction`),o=at();i&&(i.innerText=rt()),a&&(a.style.display=it()?`flow`:`none`,a.innerText=o.length===1?`Separar A e B`:`Juntar Categorias`),r&&(r.innerText=o.map(e=>`${Q(e)}: ${Z(e).length}`).join(` | `)),e.innerHTML=`
    <div class="group-compare-grid ${it()&&o.length>1?`dual`:`single`}">
      ${it()&&o.length>1?o.map(e=>`
                  <div class="group-column">
                    ${we(Q(e),ot(e),e)}
                  </div>
                `).join(``):`<div class="group-column">${we(`Ranking geral`,Se())}</div>`}
    </div>
  `,t.innerHTML=`
    <div class="group-compare-grid ${o.length>1?`dual`:`single`}">
      ${o.map(e=>{let t=Z(e),n=ct(e);return`
            <div class="group-section group-column">
              <div class="group-section-header compact">
                <div>
                  <span class="section-label">${Q(e)}</span>
                  <h3>${X(e).length} atletas aptos a jogar</h3>
                </div>
                <div class="admin-tournament-actions compact">
                  <button class="btn primary" ${n?``:`disabled`} onclick="startGroup('${e}')">${lt(e)?`Atualizar jogos`:`Iniciar ${Q(e)}`}</button>
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
                            <strong title="${t.p1?.name||``}">${t.p1?k(t.p1.name):``}</strong>
                          </div>
                          <span class="vs">vs</span>
                          <div class="table-player">
                            <strong title="${t.p2?.name||``}">${t.p2?k(t.p2.name):``}</strong>
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
  `;let s=new Set;o.forEach(e=>{Z(e).forEach(e=>{e.p1&&s.add(e.p1.id),e.p2&&s.add(e.p2.id)})}),n.innerHTML=`
    <div class="group-compare-grid ${o.length>1?`dual`:`single`}">
      ${o.map(e=>{let t=st(e).filter(([e,t])=>!s.has(e.id)&&!s.has(t.id));return`
            <div class="group-section queue-section group-column">
              <div class="group-section-header queue-section-header compact">
                <div>
                  <span class="section-label">${Q(e)}</span>
                  <h3>${t.length?`${t.length} confronto(s) na fila`:`Fila de partidas`}</h3>
                </div>
              </div>
              ${t.length===0?`<div class="queue-empty rich">Nenhum jogo aguardando agora. Assim que uma mesa liberar, a proxima disputa aparece aqui.</div>`:`<div class="queue-grid compact-queue-grid">
                      ${t.map((t,n)=>{let r=$(t[0].id),i=$(t[1].id);return`
                              <div class="queue-card next-match-card compact-next-match-card">
                              <div class="queue-card-top">
                                <span class="queue-order">Proximo ${n+1}</span>
                                <span class="result-pill neutral">${Q(e)}</span>
                              </div>
                              <div class="queue-player-block">
                                ${Te(t[0])}
                                <span>${r.wins}V | ${r.losses}D</span>
                              </div>
                              <div class="queue-versus">vs</div>
                              <div class="queue-player-block">
                                ${Te(t[1])}
                                <span>${i.wins}V | ${i.losses}D</span>
                              </div>
                            </div>
                          `}).join(``)}
                    </div>`}
            </div>
          `}).join(``)}
    </div>
  `,Ee()}var De=new URLSearchParams(window.location.search).get(`id`),Oe=!1,j=null,M=[],ke=new Set,N=[],P=null,F=null,Ae=null,I={general:{winnerPoolIds:[],loserPoolIds:[]},A:{winnerPoolIds:[],loserPoolIds:[]},B:{winnerPoolIds:[],loserPoolIds:[]}};function L(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function je(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function Me(){return{wins:0,losses:0,games:0,active:!0,createdAt:Date.now()}}function Ne(e){let t=e.playerProfile??Me(),n=z(e.id);return{id:e.id,name:e.name,wins:t.wins??0,losses:t.losses??0,games:t.games??0,active:t.active??!0,registrationCategory:n?.category,createdAt:t.createdAt??e.createdAt,lastPlayed:t.lastPlayed}}function R(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function Pe(e,t=13){let n=e.trim();if(n.length<=t)return n;let r=n.split(/\s+/).filter(Boolean);if(r.length>=2){let e=r[0],n=r[r.length-1],i=r.slice(1,-1).filter(e=>![`de`,`da`,`do`,`dos`,`das`,`e`].includes(e.toLowerCase()));if(i.length){let r=`${e} ${i[0][0]}. ${n}`;if(r.length<=t+6)return r;let a=`${e} ${i.map(e=>`${e[0]}.`).join(` `)} ${n}`.replace(/\s+/g,` `).trim();if(a.length<=t+8)return a}let a=`${e} ${n}`;if(a.length<=t+4)return a}return`${n.slice(0,Math.max(1,t-3)).trimEnd()}...`}function Fe(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function z(e){return N.find(t=>t.id===e||t.uid===e)}function Ie(e){return M.find(t=>t.id===e)??null}function B(e=``){let t=R(e);return M.filter(e=>!e.profileComplete||e.role!==`user`&&e.role!==`admin`?!1:t?[e.name,e.email,e.club,e.category].some(e=>R(e).includes(t)):!0).map(e=>({user:e,registration:z(e.id),player:y.find(t=>t.id===e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function Le(e){return e.player?.active?{label:`Ativo`,helper:`Participando`,tone:`neutral`}:e.registration?.paymentStatus===`approved`?{label:`Pronto`,helper:`Inativo`,tone:`win`}:e.registration?.paymentStatus===`pending_payment`?{label:`Pendente`,helper:`Pagamento não aprovado`,tone:`loss`}:{label:`Novo`,helper:`Sem inscrição`,tone:`neutral`}}function Re(e=``){let t=document.getElementById(`athleteSearchResults`),n=document.getElementById(`athleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=B(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado para essa busca.`:n.textContent=`Digite para buscar atletas cadastrados.`,t.innerHTML=i.length?i.map(e=>{let t=Le(e),n=Pe(e.user.name.trim(),16),r=[e.user.club||`Sem clube`,e.user.category||`Sem categoria`].join(` - `);return`
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
          `}).join(``):``}function V(){Re(document.getElementById(`name`)?.value??``)}function ze(e){if(j){let t=ne(j,e.category);if(t.length)return t[0]}return e.category||j?.category||`Livre`}function Be(e,t){let n=j;if(!n)throw Error(`Torneio nao carregado.`);let r=Date.now(),i=ze(e),a=ee(n,[i]);return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:i,registrationFee:a,paymentStatus:t,paymentMethod:`pix`,registeredAt:r,status:`registered`},userRegistrationPayload:{id:n.id,tournamentId:n.id,title:n.title,location:n.location??``,category:i,categories:[i],registrationFee:a,paymentStatus:t,paymentMethod:`pix`,startDate:n.startDate,endDate:n.endDate,registrationDeadline:n.registrationDeadline,registeredAt:r,status:`registered`}}}function Ve(e){let t=document.getElementById(`athleteActivationModal`),n=document.getElementById(`athleteActivationTitle`),r=document.getElementById(`athleteActivationDescription`);!t||!n||!r||(Ae=e,n.textContent=`Ativar ${e.user.name}?`,r.textContent=`Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para análise.`,t.style.display=`flex`)}function He(){let e=document.getElementById(`athleteActivationModal`);e&&(Ae=null,e.style.display=`none`)}async function Ue(e,t){let r=j;if(!r)return;let{registrationPayload:i,userRegistrationPayload:a}=Be(e.user,t),o=n(s);o.set(c(s,`tournaments`,r.id,`registrations`,e.user.id),i),o.set(c(s,`users`,e.user.id,`registrations`,r.id),a),t===`approved`&&o.set(c(s,`users`,e.user.id),{playerProfile:{...Me(),active:!0},updatedAt:Date.now()},{merge:!0}),await o.commit()}function H(){return te(j)}function U(){j&&(j.groupStates={general:{started:!1,tableCount:1,...j.groupStates?.general},A:{started:!1,tableCount:1,...j.groupStates?.A},B:{started:!1,tableCount:1,...j.groupStates?.B}})}function We(e){return U(),j?.groupStates?.[e]??{started:!1,tableCount:1}}function W(e){return!!We(e).started}function G(e){return We(e).tableCount??1}function Ge(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>ce(e,G(e)))}function K(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>C(e))}function Ke(e,t){j&&(e.delete(c(s,`tournaments`,j.id,`registrations`,t)),e.delete(c(s,`users`,t,`registrations`,j.id)),N=N.filter(e=>e.id!==t&&e.uid!==t),ke.delete(t))}async function qe(e,t){j&&(U(),j.groupStates={...j.groupStates,[e]:{...j.groupStates?.[e],...t}},await a(c(s,`tournaments`,j.id),{groupStates:j.groupStates,updatedAt:Date.now()}))}function Je(){U(),[`general`,`A`,`B`].forEach(e=>{ce(e,G(e))})}function Ye(e){return j?.rankingLiveState?.[e]??{}}function Xe(){[`general`,`A`,`B`].forEach(e=>{C(e),ce(e,G(e));let t=Ye(e);I[e]={winnerPoolIds:[...t.scheduler?.winnerPoolIds??[]],loserPoolIds:[...t.scheduler?.loserPoolIds??[]]},(t.queue??[]).forEach(t=>{let[n,r]=t.playerIds,i=y.find(e=>e.id===n),a=y.find(e=>e.id===r);i&&a&&x[e].push([i,a])}),(t.activeTables??[]).forEach((t,n)=>{let r=t.playerIds,i=r?y.find(e=>e.id===r[0]):void 0,a=r?y.find(e=>e.id===r[1]):void 0;S[e][n]={id:t.id,group:e,...i?{p1:i}:{},...a?{p2:a}:{}}})})}async function q(){let e=j;e&&(e.rankingLiveState={general:{queue:x.general.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.general.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}})),scheduler:I.general},A:{queue:x.A.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.A.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}})),scheduler:I.A},B:{queue:x.B.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:S.B.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}})),scheduler:I.B}},j=e,await a(c(s,`tournaments`,e.id),{rankingLiveState:e.rankingLiveState,updatedAt:Date.now()}))}function Ze(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function J(){document.getElementById(`activeTournamentName`).textContent=j?.title||`Torneio nao encontrado`,document.getElementById(`tournamentStatusLabel`).textContent=j?.status===`finished`?`Finalizado`:j?.isActive?`Em andamento`:j?.status===`open`?`Inscricoes abertas`:`Aguardando inicio`}function Qe(e=j?.finalStandings??[]){let t=document.getElementById(`finalResultsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">O resultado final ainda nao foi gerado.</div>`;return}t.innerHTML=H().filter(t=>e.some(e=>e.group===t)).map(t=>{let n=e.filter(e=>e.group===t);return`
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${_(t)}</span>
            <strong>${n.length} atleta${n.length===1?``:`s`}</strong>
          </div>
          <div class="ranking-showcase">
            <div class="ranking-showcase-podium">
              ${n.slice(0,3).map((e,t)=>`
                    <article class="ranking-showcase-podium-card place-${t+1}">
                      <span class="ranking-showcase-place">${L(e.placement)}</span>
                      <strong>${L(e.name)}</strong>
                      <small>${L(e.category)}</small>
                      <div class="ranking-showcase-score">${e.wins}V - ${e.losses}D - ${e.games} jogos</div>
                    </article>
                  `).join(``)}
            </div>
            <div class="ranking-showcase-table">
              ${n.map(e=>`
                    <div class="ranking-showcase-row">
                      <span>${L(e.placement)}</span>
                      <strong>${L(e.name)}</strong>
                      <small>${L(e.result)}</small>
                      <span>${e.wins}V / ${e.losses}D</span>
                    </div>
                  `).join(``)}
            </div>
          </div>
        </section>
      `}).join(``)}}function $e(){Qe();let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`flex`)}function et(){let e=document.getElementById(`finalResultsModal`);e&&(e.style.display=`none`)}function tt(e){let t=document.getElementById(`athleteProfileModal`),n=document.getElementById(`athleteProfileContent`);if(!t||!n)return;let r=Ie(e),i=y.find(t=>t.id===e);if(!r){m(`Nao foi possivel carregar o perfil do atleta.`,`warning`);return}let a=$(e),o=je(r.name||`Atleta`);n.innerHTML=`
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${r.photoURL?`<img class="profile-avatar" src="${L(r.photoURL)}" alt="Foto de ${L(r.name)}">`:`<div class="profile-avatar profile-avatar-fallback">${L(o)}</div>`}</div>
        <div class="athlete-profile-copy">
          <h3>${L(r.name)}</h3>
          <p>${L(r.club||`Sem clube`)} - ${L(r.category||`Sem categoria`)}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${i?.active?`Ativo no ranking`:`Sem jogos ativos`}</span>
            <span class="result-pill ${z(e)?.paymentStatus===`approved`?`win`:`loss`}">${z(e)?.paymentStatus===`approved`?`Inscricao aprovada`:`Inscricao pendente`}</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${L(r.email||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${L(r.phone||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Partidas</span><strong>${a.games}</strong></div>
        <div class="info-card"><span>Vitorias</span><strong>${a.wins}</strong></div>
        <div class="info-card"><span>Derrotas</span><strong>${a.losses}</strong></div>
        <div class="info-card"><span>Ultimo jogo</span><strong>${Fe(i?.lastPlayed)}</strong></div>
      </div>
      <div class="athlete-profile-actions">
        <button class="btn danger" onclick="resetAthleteMatches('${e}')">Resetar partidas do atleta</button>
      </div>
    </div>
  `,t.style.display=`flex`}async function nt(){if(!De){window.location.replace(`/pages/dashboard.html`);return}let e=await i(c(s,`tournaments`,De));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}j={id:e.id,...e.data()},U(),J()}async function Y(){if(!j){M=[],N=[],y.length=0;return}let[e,n]=await Promise.all([t(r(s,`users`)),t(r(s,`tournaments`,j.id,`registrations`))]);N=n.docs.map(e=>({id:e.id,...e.data()})),ke=new Set(N.filter(e=>e.paymentStatus===`approved`).map(e=>e.id)),M=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.role===`user`||e.role===`admin`).sort((e,t)=>e.name.localeCompare(t.name)),y.length=0,y.push(...M.filter(e=>e.profileComplete&&ke.has(e.id)).map(e=>Ne(e)).sort((e,t)=>e.name.localeCompare(t.name))),V()}function rt(){return re(j)===`ranking`?`Ranking`:`Campeonato`}function it(){return g(j)}function at(){return H()}function X(e){let t=j;return t?y.filter(n=>n.active&&h(t,n.registrationCategory)===e):[]}function ot(e){let t=j;return t?y.filter(n=>h(t,n.registrationCategory)===e&&z(n.id)?.paymentStatus===`approved`):[]}function Z(e){return S[e]}function st(e){return x[e]}function Q(e){return _(e)}function ct(e){return!!(j&&j.status!==`finished`)&&X(e).length>=2}function lt(e){return W(e)}async function ut(){if(b.length=0,!j)return;let e=await t(r(s,`matches`));b.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.tournamentId===j?.id).sort((e,t)=>e.createdAt-t.createdAt))}async function dt(){await nt(),await Promise.all([Y(),ut()]),Xe(),J(),A()}async function ft(){if(j)try{await Y(),A()}catch(e){console.error(`Erro ao atualizar inscricoes do torneio:`,e)}}function pt(){return y.filter(e=>z(e.id)?.paymentStatus===`approved`)}function mt(e,t=`general`){return ie(e,ht(t))}function ht(e){return b.filter(t=>t.tournamentId===j?.id&&(t.group??`general`)===e)}function gt(e){let t=X(e),n=[];for(let r=0;r<t.length;r++)for(let i=r+1;i<t.length;i++){let a=t[r],o=t[i];ht(e).some(e=>e.p1===a.id&&e.p2===o.id||e.p1===o.id&&e.p2===a.id)||n.push([a,o])}return n}function _t(){let e=j;return e?H().flatMap(t=>(()=>{let n=pt().filter(n=>h(e,n.registrationCategory)===t),{stats:r}=ae(n.map(e=>e.id),ht(t));return mt(n,t).map((e,n)=>{let i=n+1,a=r.get(e.id)??{wins:0,losses:0,games:0};return{playerId:e.id,name:e.name,category:e.registrationCategory||_(t),group:t,placement:`${i}o lugar`,result:vt(i),wins:a.wins,losses:a.losses,games:a.games}})})()):[]}function vt(e){return e===1?`Campeao`:e===2?`Vice-campeao`:e===3?`3o lugar`:`${e}o lugar`}function yt(){y.forEach(e=>{e.wins=0,e.losses=0,e.games=0,e.active=!1,e.lastPlayed=void 0}),b.length=0,K(),Ge(),I={general:{winnerPoolIds:[],loserPoolIds:[]},A:{winnerPoolIds:[],loserPoolIds:[]},B:{winnerPoolIds:[],loserPoolIds:[]}}}async function bt(){let e=j;if(!e||e.isActive)return;let i=await t(u(r(s,`tournaments`),f(`isActive`,`==`,!0))),a=n(s);i.forEach(t=>{t.id!==e.id&&a.update(t.ref,{isActive:!1,updatedAt:Date.now()})}),a.update(c(s,`tournaments`,e.id),{isActive:!0,status:`open`,updatedAt:Date.now()}),await a.commit(),j={...e,isActive:!0,status:`open`,updatedAt:Date.now()},J()}async function xt(e,t,r){let i=j;if(!i)return;let a=y.find(e=>e.id===t),l=y.find(e=>e.id===r);if(!a||!l)return;let u={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:l.name,scoreLabel:`${e.score1} x ${e.score2}`,tableLabel:e.tableLabel,result:`win`,playedAt:e.createdAt},d={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:a.name,scoreLabel:`${e.score2} x ${e.score1}`,tableLabel:e.tableLabel,result:`loss`,playedAt:e.createdAt},f={tournamentId:i.id,title:i.title,category:a.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(1),losses:o(0),playedAt:e.createdAt},p={tournamentId:i.id,title:i.title,category:l.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(0),losses:o(1),playedAt:e.createdAt},m=n(s);m.set(c(s,`users`,a.id,`matches`,e.id),u),m.set(c(s,`users`,l.id,`matches`,e.id),d),m.set(c(s,`users`,a.id,`tournaments`,i.id),f,{merge:!0}),m.set(c(s,`users`,l.id,`tournaments`,i.id),p,{merge:!0}),await m.commit()}function St(e){let t=S[e],n=x[e];for(let r=0;r<t.length;r++)if(!t[r].p1&&n.length){let i=n.shift();t[r]={id:t[r].id,group:e,p1:i[0],p2:i[1]}}}function Ct(e){return S[e].some(e=>e.p1&&e.p2)}function wt(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}async function Tt(e){return wt((await i(c(s,`users`,e))).data())}window.logout=async()=>{await p(d),window.location.replace(`/pages/login.html`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.editCurrentTournament=()=>{j&&(window.location.href=`/pages/tournament-form.html?id=${j.id}`)},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.openAthleteProfile=e=>{tt(e)},window.closeAthleteProfileModal=()=>{let e=document.getElementById(`athleteProfileModal`);e&&(e.style.display=`none`)},window.openFinalResultsModal=()=>{$e()},window.closeFinalResultsModal=()=>{et()},window.openTournamentRegistrations=()=>{j&&(window.location.href=`/pages/tournament-registrations.html?id=${j.id}`)},window.closeAthleteActivationModal=()=>{He()},e(d,async e=>{if(Oe)return;if(Oe=!0,!e){window.location.replace(`/pages/login.html`);return}let t=await Tt(e.uid);t&&(Ze(t),Je(),await dt(),window.addEventListener(`focus`,ft),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&ft()}),P=window.setInterval(()=>{ft()},15e3))}),window.addEventListener(`beforeunload`,()=>{P!==null&&(window.clearInterval(P),P=null)}),window.addPlayer=async()=>{let e=document.getElementById(`name`),t=e.value.trim();if(t){await Y();try{let n=(F?B().find(e=>e.user.id===F):void 0)??B(t).find(e=>R(e.user.name)===R(t));if(!n){m(`Selecione um atleta da busca para ativar.`,`warning`);return}if(n.player?.active){m(`Esse jogador ja esta inscrito e ativo neste torneio.`,`warning`);return}if(n.registration?.paymentStatus===`approved`){let t=y.find(e=>e.id===n.user.id&&!e.active);if(!t){m(`Nao foi possivel ativar esse atleta agora.`,`error`);return}let r=j;if(!r){m(`Torneio nao encontrado.`,`error`);return}await a(c(s,`users`,t.id),{"playerProfile.active":!0,updatedAt:Date.now()}),t.active=!0,F=null,W(h(r,t.registrationCategory))&&(await q(),m(`Atleta reativado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.`,`info`)),y.sort((e,t)=>e.name.localeCompare(t.name)),e.value=``,V(),A(),m(`Atleta reativado com sucesso.`,`success`);return}Ve(n)}catch(e){m(`Erro ao ativar atleta: `+e.message,`error`)}}},window.searchAthletes=()=>{F=null,V()},window.selectAthleteCandidate=e=>{let t=document.getElementById(`name`),n=B().find(t=>t.user.id===e);!t||!n||(F=e,t.value=n.user.name,Re(n.user.name))},window.confirmAthletePaymentStatus=async e=>{let t=Ae,n=document.getElementById(`name`);if(t){if(e===`cancel`){He();return}try{if(await Ue(t,e),await Y(),e===`approved`){let e=j;if(!e){m(`Torneio nao encontrado.`,`error`);return}W(h(e,t.user.category))&&(await q(),m(`Atleta adicionado. Clique em 'Atualizar jogos' para incluir esse atleta na categoria.`,`info`))}e===`approved`?m(`Atleta adicionado automaticamente ao campeonato.`,`success`):m(`Inscrição adicionada para análise no gerenciamento de inscrições.`,`info`),F=null,n&&(n.value=``),He(),V(),A()}catch(e){m(`Erro ao registrar atleta: `+e.message,`error`)}}},window.approveRegistration=async e=>{if(j&&N.find(t=>t.id===e))try{let t=n(s);t.update(c(s,`tournaments`,j.id,`registrations`,e),{paymentStatus:`approved`}),t.update(c(s,`users`,e,`registrations`,j.id),{paymentStatus:`approved`}),await t.commit(),await Y(),A()}catch(e){m(`Erro ao aprovar pagamento: `+e.message,`error`)}},window.removeRegistration=async e=>{if(!j)return;let t=N.find(t=>t.id===e);if(t&&await v({title:`Remover inscrição`,message:`Remover a inscrição de ${t.name}?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);Ke(t,e),t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),await t.commit(),await Y(),A()}catch(e){m(`Erro ao remover inscrição: `+e.message,`error`)}},window.toggleRankingMode=async()=>{if(!j||!g(j))return;if(b.length>0){m(`Nao e possivel juntar ou separar categorias apos iniciar partidas.`,`warning`);return}let e=j.rankingMode===`split`?`single`:`split`;await a(c(s,`tournaments`,j.id),{rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}},updatedAt:Date.now()}),j={...j,rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}}},K(),Ge(),await q(),A()},window.startGroup=async e=>{if(!j){m(`Torneio nao encontrado.`,`error`);return}if(!ct(e)){m(`Essa categoria precisa de pelo menos 2 atletas ativos.`,`warning`);return}await bt(),W(e)||await qe(e,{started:!0}),Ct(e)||C(e),I[e]=E(e,X(e),I[e]),St(e),await q(),A()},window.resetMatches=async()=>{let e=j;if(e)try{let t=n(s),r=e.registrationDeadline&&e.registrationDeadline<Date.now()?`closed`:`open`,i={general:{queue:[],activeTables:S.general.map(e=>({id:e.id})),scheduler:{winnerPoolIds:[],loserPoolIds:[]}},A:{queue:[],activeTables:S.A.map(e=>({id:e.id})),scheduler:{winnerPoolIds:[],loserPoolIds:[]}},B:{queue:[],activeTables:S.B.map(e=>({id:e.id})),scheduler:{winnerPoolIds:[],loserPoolIds:[]}}};b.forEach(e=>{t.delete(c(s,`matches`,e.id)),t.delete(c(s,`users`,e.p1,`matches`,e.id)),t.delete(c(s,`users`,e.p2,`matches`,e.id))}),pt().forEach(n=>{t.update(c(s,`users`,n.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.lastPlayed":null}),t.delete(c(s,`users`,n.id,`tournaments`,e.id))});let a={general:{started:!1,tableCount:G(`general`)},A:{started:!1,tableCount:G(`A`)},B:{started:!1,tableCount:G(`B`)}};t.update(c(s,`tournaments`,e.id),{groupStates:a,rankingLiveState:i,isActive:!1,status:r,finalStandings:[],completedAt:null,updatedAt:Date.now()}),await t.commit(),b.length=0,j={...e,isActive:!1,status:r,finalStandings:[],groupStates:a,rankingLiveState:i},J(),K(),Ge(),I={general:{winnerPoolIds:[],loserPoolIds:[]},A:{winnerPoolIds:[],loserPoolIds:[]},B:{winnerPoolIds:[],loserPoolIds:[]}},await q(),A()}catch(e){m(`Erro ao resetar campeonato: `+e.message,`error`)}},window.resetAthleteMatches=async e=>{if(!j)return;let t=Ie(e),r=y.find(t=>t.id===e);if(!t||!r){m(`Atleta nao encontrado no torneio atual.`,`warning`);return}let i=b.filter(t=>t.tournamentId===j?.id&&(t.p1===e||t.p2===e));if(!i.length){m(`Esse atleta ainda nao possui partidas registradas neste ranking.`,`info`);return}if(await v({title:`Resetar partidas do atleta`,message:`Limpar ${i.length} partida(s) de ${t.name} neste ranking?`,confirmLabel:`Resetar partidas`,tone:`danger`}))try{let t=j;if(!t){m(`Torneio nao encontrado.`,`error`);return}let a=new Set([e]);i.forEach(e=>{a.add(e.p1),a.add(e.p2)});let o=b.filter(e=>!i.some(t=>t.id===e.id)),l=n(s);i.forEach(e=>{l.delete(c(s,`matches`,e.id)),l.delete(c(s,`users`,e.p1,`matches`,e.id)),l.delete(c(s,`users`,e.p2,`matches`,e.id))}),a.forEach(e=>{let n=o.filter(t=>t.tournamentId===j?.id&&(t.p1===e||t.p2===e)),r=n.filter(t=>t.winner===e).length,i=n.length-r,a=n.length?Math.max(...n.map(e=>e.createdAt)):null;l.update(c(s,`users`,e),{"playerProfile.wins":r,"playerProfile.losses":i,"playerProfile.games":n.length,"playerProfile.lastPlayed":a}),n.length?l.set(c(s,`users`,e,`tournaments`,t.id),{tournamentId:t.id,title:t.title,category:z(e)?.category||t.category||`Livre`,result:`Em andamento`,matchCount:n.length,wins:r,losses:i,playedAt:a??Date.now()},{merge:!0}):l.delete(c(s,`users`,e,`tournaments`,t.id))}),await l.commit(),b.length=0,b.push(...o),a.forEach(e=>{let t=y.find(t=>t.id===e),n=o.filter(t=>t.tournamentId===j?.id&&(t.p1===e||t.p2===e));t&&(t.wins=n.filter(t=>t.winner===e).length,t.losses=n.length-t.wins,t.games=n.length,t.lastPlayed=n.length?Math.max(...n.map(e=>e.createdAt)):void 0)});let u=h(t,r.registrationCategory);C(u),S[u]=S[u].map(t=>t.p1?.id===e||t.p2?.id===e?{id:t.id,group:u}:t),W(u)&&!Ct(u)&&(I[u]={winnerPoolIds:[],loserPoolIds:[]},I[u]=E(u,X(u),I[u]),St(u)),await q(),A(),tt(e),m(`Partidas do atleta resetadas com sucesso.`,`success`)}catch(e){m(`Erro ao resetar partidas do atleta: `+e.message,`error`)}},window.finishTournament=async()=>{let e=j;if(!e)return;let t=_t();if(!t.length){m(`Adicione atletas e finalize partidas antes de encerrar o torneio.`,`warning`);return}if(H().flatMap(e=>gt(e)).length){m(`Ainda existem confrontos obrigatorios pendentes neste ranking.`,`warning`);return}if(await v({title:`Encerrar torneio`,message:`Encerrar o torneio "${e.title}"?\n\nEssa ação finaliza o ranking e grava a classificação dos atletas.`,confirmLabel:`Encerrar`,tone:`danger`}))try{let r=n(s),i=Date.now();t.forEach(t=>{let n={id:e.id,tournamentId:e.id,title:e.title,category:t.category||e.category||`Livre`,placement:t.placement,result:t.result,matchCount:t.games,wins:t.wins,losses:t.losses,playedAt:i};r.set(c(s,`users`,t.playerId,`tournaments`,e.id),n,{merge:!0}),r.update(c(s,`users`,t.playerId),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null})}),r.update(c(s,`tournaments`,e.id),{isActive:!1,status:`finished`,finalStandings:t,updatedAt:i,completedAt:i}),await r.commit(),j={...e,isActive:!1,status:`finished`,finalStandings:t,updatedAt:i},J(),yt(),await q(),A(),$e(),m(`Torneio encerrado com sucesso.`,`success`)}catch(e){m(`Erro ao encerrar torneio: `+e.message,`error`)}},window.deletePlayer=async e=>{if(await v({title:`Remover atleta`,message:`Remover este atleta do torneio atual?`,confirmLabel:`Remover`,tone:`danger`}))try{let t=n(s);t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),Ke(t,e),t.delete(c(s,`users`,e,`tournaments`,j.id)),await t.commit();let r=y.find(t=>t.id===e);r&&(r.active=!1,r.games=0,r.wins=0,r.losses=0,r.lastPlayed=void 0),K(),[`general`,`A`,`B`].forEach(t=>{S[t].forEach(t=>{(t.p1?.id===e||t.p2?.id===e)&&(t.p1=void 0,t.p2=void 0)})}),await q(),A()}catch(e){m(`Erro ao remover atleta do torneio: `+e.message,`error`)}},window.editPlayer=async e=>{let t=y.find(t=>t.id===e);if(!t)return;let n=prompt(`Novo nome:`,t.name)?.trim();if(n){t.name=n;try{await a(c(s,`users`,e),{name:n,updatedAt:Date.now()}),y.sort((e,t)=>e.name.localeCompare(t.name)),A()}catch(e){m(`Erro ao editar atleta: `+e.message,`error`)}}},window.togglePlayer=async e=>{let t=y.find(t=>t.id===e);if(t){t.active=!t.active;try{await a(c(s,`users`,e),{"playerProfile.active":t.active}),K(),await q(),A()}catch(e){m(`Erro ao atualizar atleta: `+e.message,`error`)}}},window.showHistory=e=>{let t=y.find(t=>t.id===e);if(!t)return;let n=b.filter(t=>t.p1===e||t.p2===e).map(t=>{let n=t.p1===e,r=n?t.p2:t.p1,i=y.find(e=>e.id===r),a=t.winner===e,o=n?t.score1:t.score2,s=n?t.score2:t.score1;return`
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
  `;document.getElementById(`historyList`).innerHTML=i+(n||`<div>Nenhum jogo ainda</div>`),document.getElementById(`historyModal`).style.display=`flex`};function $(e){let t=b.filter(t=>t.p1===e||t.p2===e),n=0,r=0,i=0,a=0;t.forEach(t=>{let o=t.p1===e,s=o?t.score1:t.score2,c=o?t.score2:t.score1;i+=s,a+=c,t.winner===e?n++:r++});let o=t.length,s=o>0?(n/o*100).toFixed(1):`0`;return{wins:n,losses:r,games:o,setsWon:i,setsLost:a,winRate:s}}window.clearPlayers=async()=>{if(j&&await v({title:`Limpar torneio atual`,message:`Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?`,confirmLabel:`Limpar`,tone:`danger`}))try{let e=n(s);pt().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null}),Ke(e,t.id),e.delete(c(s,`users`,t.id,`tournaments`,j.id))}),b.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),await e.commit(),yt(),await q(),A()}catch(e){console.error(`Erro ao limpar campeonato:`,e)}},window.finish=async(e,t)=>{let i=S[e][t],a=j;if(!i?.p1||!i?.p2||!a)return;let o=parseInt(document.getElementById(`s1_${e}_${t}`).value,10),u=parseInt(document.getElementById(`s2_${e}_${t}`).value,10);if(isNaN(o)||isNaN(u)){m(`Preencha o placar corretamente.`,`warning`);return}if(o<0||u<0){m(`O placar nao pode ser negativo.`,`warning`);return}if(o===u){m(`O jogo precisa ter um vencedor.`,`warning`);return}let d=o>u?i.p1:i.p2,f=o>u?i.p2:i.p1,p=Date.now();d.wins+=1,f.losses+=1,d.games+=1,f.games+=1,d.lastPlayed=p,f.lastPlayed=p;try{let m={p1:i.p1.id,p2:i.p2.id,score1:o,score2:u,winner:d.id,createdAt:p,tournamentId:a.id,tournamentTitle:a.title,tableLabel:`${_(e)} - Mesa ${t+1}`,group:e,registrationCategory:d.registrationCategory},h=await l(r(s,`matches`),m),g=n(s);g.update(c(s,`users`,d.id),{"playerProfile.wins":d.wins,"playerProfile.games":d.games,"playerProfile.lastPlayed":p}),g.update(c(s,`users`,f.id),{"playerProfile.losses":f.losses,"playerProfile.games":f.games,"playerProfile.lastPlayed":p}),await g.commit();let ee={id:h.id,...m};await xt(ee,d.id,f.id),b.push(ee),S[e][t]={id:S[e][t].id,group:e},C(e),I[e]=xe(e,d,f,X(e),I[e]),I[e]=E(e,X(e),I[e]),St(e),await q(),A()}catch(e){m(`Erro ao finalizar partida: `+e.message,`error`)}},window.changeTables=async(e,t)=>{let n=S[e];if(t>0)for(let r=0;r<t;r++)n.push({id:se(),group:e});else{let e=n.findIndex(e=>!e.p1);if(e===-1){m(`Finalize algum jogo antes de remover mesas.`,`warning`);return}n.splice(e,1)}await qe(e,{tableCount:n.length}),await q(),A()};