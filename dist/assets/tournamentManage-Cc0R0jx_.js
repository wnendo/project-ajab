import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,m as o,n as s,p as c,r as l,s as u,t as d,u as f,x as p}from"./firebase-VBRKn9At.js";/* empty css               */import{a as m,c as h,i as ee,l as g,o as _,r as te,s as ne}from"./tournament-rules-DUbpQbwy.js";var v=[],y=[],b={general:[],A:[],B:[]},x={general:[{id:1,group:`general`}],A:[{id:2,group:`A`}],B:[{id:3,group:`B`}]},re=4;function ie(){return re++}function S(e,t=1){x[e].length=0;for(let n=0;n<t;n++)x[e].push({id:n===0?ae(e):ie(),group:e})}function C(e){b[e].length=0}function ae(e){return e===`general`?1:e===`A`?2:3}function oe(e){let t=new Set;return x[e].forEach(e=>{e.p1&&t.add(e.p1.id),e.p2&&t.add(e.p2.id)}),t}function se(e,t,n){return y.some(r=>(r.group??`general`)===n&&(r.p1===e&&r.p2===t||r.p1===t&&r.p2===e))}function ce(e){let t=e.lastPlayed?Date.now()-e.lastPlayed:999999999;return-e.games*1e3+t/1e3}function le(e,t,n){let r=Math.abs(e.wins-t.wins),i=se(e.id,t.id,n)?1e6:0;return r*1e3+i}function w(e,t){if(oe(e).size>0||b[e].length>0)return;let n=[...t].sort((e,t)=>ce(e)-ce(t)),r=new Set,i=[];for(let t=0;t<n.length;t++){let a=n[t];if(r.has(a.id))continue;let o=null,s=1/0;for(let i=t+1;i<n.length;i++){let t=n[i];if(r.has(t.id))continue;let c=le(a,t,e);c<s&&(s=c,o=t)}o&&(i.push([a,o]),r.add(a.id),r.add(o.id))}i.forEach(t=>b[e].push(t))}var T=!1,E=``;function D(){return v}function O(e){let t=e.trim();if(t.length<=20)return t;let n=t.split(/\s+/).filter(Boolean);if(n.length<=2)return t;let r=n[0],i=n[n.length-1],a=n.slice(1,-1).find(e=>e.length>2);return a?`${r} ${a.charAt(0)}. ${i}`:`${r} ${i}`}function ue(e){return[...e].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?e.name.localeCompare(t.name):e.losses-t.losses:t.wins-e.wins)}function de(e,t,n=!1){let r=``;n||(t===0&&(r=`gold`),t===1&&(r=`silver`),t===2&&(r=`bronze`));let i=$(e.id);return`
    <div class="player-row ${r} ${n?`faded`:``}">
      <div class="player-row-main">
        <span>${t+1} -</span>
        <span class="player-name" title="${e.name}" onclick="showHistory('${e.id}')">${O(e.name)}</span>
      </div>
      <div class="player-row-stats">
        W:${i.wins} L:${i.losses} J:${i.games}
      </div>
      <div class="player-actions">
        <button onclick="editPlayer('${e.id}')">✏️</button>
        <button onclick="togglePlayer('${e.id}')">${e.active?`✅`:`⛔`}</button>
        <button onclick="deletePlayer('${e.id}')">❌</button>
      </div>
    </div>
  `}function fe(e,t,n){let r=ue(t.filter(e=>E?e.name.toLowerCase().includes(E):!0)),i=r.slice(0,5),a=r.slice(5),o=n?`ranking-hidden-${n}`:`ranking-hidden-general`;return`
    <div class="group-section ranking-group-card">
      <div class="group-section-header compact">
        <div>
          <span class="section-label">${e}</span>
          <h3>${r.length?`${r.length} atleta${r.length===1?``:`s`} no ranking`:`Nenhum atleta encontrado`}</h3>
        </div>
      </div>
      ${r.length?`
            <div class="ranking-list">
              ${i.map((e,t)=>de(e,t)).join(``)}
              ${a.length>0?`
                    <div id="${o}" class="ranking-hidden ${T?`open`:``}">
                      ${a.map((e,t)=>de(e,t+5,!0)).join(``)}
                      ${T?``:`<div class="fade-overlay"></div>`}
                    </div>
                    <div class="ranking-toggle" onclick="toggleRankingView()">
                      ${T?`Mostrar menos`:`Mostrar mais`}
                    </div>
                  `:``}
            </div>
          `:`<div class="empty-state">Nenhum jogador encontrado na pesquisa.</div>`}
    </div>
  `}function pe(e){return`<strong title="${e.name}">${O(e.name)}</strong>`}function me(){let e=new Set;ze().forEach(t=>{Y(t).forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)})}),document.getElementById(`playersPlaying`).innerText=String(e.size),document.getElementById(`playersWaiting`).innerText=String(D().filter(t=>t.active&&!e.has(t.id)).length),document.getElementById(`playersTotal`).innerText=String(D().length)}window.toggleRankingView=()=>{T=!T,k()},window.setRankingSearch=()=>{E=document.getElementById(`rankingSearch`)?.value.trim().toLowerCase()??``,k()};function k(){let e=document.getElementById(`ranking`),t=document.getElementById(`tables`),n=document.getElementById(`queue`),r=document.getElementById(`tableCount`),i=document.getElementById(`startBtn`),a=document.getElementById(`tournamentModeLabel`),o=document.getElementById(`rankingModeAction`),s=ze();a&&(a.innerText=Le()),i&&(Ee()?Ue()===s.length?(i.disabled=!0,i.innerText=`Categorias iniciadas`):(i.disabled=!1,i.innerText=`Use os paineis abaixo`):(i.disabled=!0,i.innerText=`Ative um torneio`)),o&&(o.style.display=Re()?`flow`:`none`,o.innerText=s.length===1?`Separar A e B`:`Juntar categorias`),r&&(r.innerText=s.map(e=>`${X(e)}: ${Y(e).length}`).join(` | `)),e.innerHTML=`
    <div class="group-compare-grid ${Re()&&s.length>1?`dual`:`single`}">
      ${Re()&&s.length>1?s.map(e=>`
                  <div class="group-column">
                    ${fe(X(e),J(e),e)}
                  </div>
                `).join(``):`<div class="group-column">${fe(`Ranking geral`,D())}</div>`}
    </div>
  `,t.innerHTML=`
    <div class="group-compare-grid ${s.length>1?`dual`:`single`}">
      ${s.map(e=>{let t=Y(e),n=Ve(e);return`
            <div class="group-section group-column">
              <div class="group-section-header compact">
                <div>
                  <span class="section-label">${X(e)}</span>
                  <h3>${J(e).length} atletas ativos</h3>
                </div>
                <div class="admin-tournament-actions compact">
                  <button class="btn primary" ${n?``:`disabled`} onclick="startGroup('${e}')">${He(e)?`Atualizar jogos`:`Iniciar ${X(e)}`}</button>
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
                            <strong title="${t.p1?.name||``}">${t.p1?O(t.p1.name):``}</strong>
                          </div>
                          <span class="vs">vs</span>
                          <div class="table-player">
                            <strong title="${t.p2?.name||``}">${t.p2?O(t.p2.name):``}</strong>
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
      ${s.map(e=>{let t=Be(e).filter(([e,t])=>!c.has(e.id)&&!c.has(t.id));return`
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
                                ${pe(t[0])}
                                <span>${r.wins}V | ${r.losses}D</span>
                              </div>
                              <div class="queue-versus">vs</div>
                              <div class="queue-player-block">
                                ${pe(t[1])}
                                <span>${i.wins}V | ${i.losses}D</span>
                              </div>
                            </div>
                          `}).join(``)}
                    </div>`}
            </div>
          `}).join(``)}
    </div>
  `,me()}var he=new URLSearchParams(window.location.search).get(`id`),ge=!1,A=null,j=[],M=new Set,N=[],P=null,F=null,I=null;function _e(){return{wins:0,losses:0,games:0,active:!0,createdAt:Date.now()}}function ve(e){let t=e.playerProfile??_e(),n=ye(e.id);return{id:e.id,name:e.name,wins:t.wins??0,losses:t.losses??0,games:t.games??0,active:t.active??!0,registrationCategory:n?.category,createdAt:t.createdAt??e.createdAt,lastPlayed:t.lastPlayed}}function L(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function ye(e){return N.find(t=>t.id===e||t.uid===e)}function R(e=``){let t=L(e);return j.filter(e=>!e.profileComplete||e.role!==`user`&&e.role!==`admin`?!1:t?[e.name,e.email,e.club,e.category].some(e=>L(e).includes(t)):!0).map(e=>({user:e,registration:ye(e.id),player:v.find(t=>t.id===e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function be(e){return e.player?.active?{label:`Inscrito e ativo`,tone:`neutral`}:e.registration?.paymentStatus===`approved`?{label:`Pronto para ativar`,tone:`win`}:e.registration?.paymentStatus===`pending_payment`?{label:`Pagamento pendente`,tone:`loss`}:{label:`Sem inscrição`,tone:`neutral`}}function xe(e=``){let t=document.getElementById(`athleteSearchResults`),n=document.getElementById(`athleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=R(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado para essa busca.`:n.textContent=`Digite para buscar atletas cadastrados.`,t.innerHTML=i.length?i.map(e=>{let t=be(e),n=e.user.name.trim(),r=[e.user.club||`Sem clube`,e.user.category||`Sem categoria`].join(` · `);return`
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
          `}).join(``):``}function z(){xe(document.getElementById(`name`)?.value??``)}function Se(e){if(A){let t=te(A,e.category);if(t.length)return t[0]}return e.category||A?.category||`Livre`}function Ce(e,t){let n=A;if(!n)throw Error(`Torneio não carregado.`);let r=Date.now(),i=Se(e),a=ne(n,[i]);return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:i,registrationFee:a,paymentStatus:t,paymentMethod:`pix`,registeredAt:r,status:`registered`},userRegistrationPayload:{id:n.id,tournamentId:n.id,title:n.title,location:n.location??``,category:i,categories:n.categories??[],registrationFee:a,paymentStatus:t,paymentMethod:`pix`,startDate:n.startDate,endDate:n.endDate,registrationDeadline:n.registrationDeadline,registeredAt:r,status:`registered`}}}function we(e){let t=document.getElementById(`athleteActivationModal`),n=document.getElementById(`athleteActivationTitle`),r=document.getElementById(`athleteActivationDescription`);!t||!n||!r||(I=e,n.textContent=`Ativar ${e.user.name}?`,r.textContent=`Confirme o status do pagamento para concluir a inscrição ou enviar o atleta para analise.`,t.style.display=`flex`)}function B(){let e=document.getElementById(`athleteActivationModal`);e&&(I=null,e.style.display=`none`)}async function Te(e,t){let r=A;if(!r)return;let{registrationPayload:i,userRegistrationPayload:a}=Ce(e.user,t),o=n(s);o.set(c(s,`tournaments`,r.id,`registrations`,e.user.id),i),o.set(c(s,`users`,e.user.id,`registrations`,r.id),a),t===`approved`&&o.set(c(s,`users`,e.user.id),{playerProfile:{..._e(),active:!0},updatedAt:Date.now()},{merge:!0}),await o.commit()}function Ee(){return!!(A&&A.status!==`finished`)}function De(){return ee(A)}function V(){A&&(A.groupStates={general:{started:!1,tableCount:1,...A.groupStates?.general},A:{started:!1,tableCount:1,...A.groupStates?.A},B:{started:!1,tableCount:1,...A.groupStates?.B}})}function Oe(e){return V(),A?.groupStates?.[e]??{started:!1,tableCount:1}}function H(e){return!!Oe(e).started}function U(e){return Oe(e).tableCount??1}function ke(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>S(e,U(e)))}function W(e){(e?[e]:[`general`,`A`,`B`]).forEach(e=>C(e))}function Ae(e,t){A&&(e.delete(c(s,`tournaments`,A.id,`registrations`,t)),e.delete(c(s,`users`,t,`registrations`,A.id)))}async function je(e,t){A&&(V(),A.groupStates={...A.groupStates,[e]:{...A.groupStates?.[e],...t}},await a(c(s,`tournaments`,A.id),{groupStates:A.groupStates,updatedAt:Date.now()}))}function Me(){V(),[`general`,`A`,`B`].forEach(e=>{S(e,U(e))})}function Ne(e){return A?.rankingLiveState?.[e]??{}}function Pe(){[`general`,`A`,`B`].forEach(e=>{C(e),S(e,U(e));let t=Ne(e);(t.queue??[]).forEach(t=>{let[n,r]=t.playerIds,i=v.find(e=>e.id===n),a=v.find(e=>e.id===r);i&&a&&b[e].push([i,a])}),(t.activeTables??[]).forEach((t,n)=>{let r=t.playerIds,i=r?v.find(e=>e.id===r[0]):void 0,a=r?v.find(e=>e.id===r[1]):void 0;x[e][n]={id:t.id,group:e,...i?{p1:i}:{},...a?{p2:a}:{}}})})}async function G(){let e=A;e&&(e.rankingLiveState={general:{queue:b.general.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:x.general.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},A:{queue:b.A.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:x.A.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))},B:{queue:b.B.map(([e,t])=>({playerIds:[e.id,t.id]})),activeTables:x.B.map(e=>({id:e.id,...e.p1&&e.p2?{playerIds:[e.p1.id,e.p2.id]}:{}}))}},A=e,await a(c(s,`tournaments`,e.id),{rankingLiveState:e.rankingLiveState,updatedAt:Date.now()}))}function Fe(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function K(){document.getElementById(`activeTournamentName`).textContent=A?.title||`Torneio não encontrado`,document.getElementById(`tournamentStatusLabel`).textContent=A?.status===`finished`?`Finalizado`:A?.isActive?`Em andamento`:A?.status===`open`?`Inscrições abertas`:`Em breve`}async function Ie(){if(!he){window.location.replace(`/pages/dashboard.html`);return}let e=await i(c(s,`tournaments`,he));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}A={id:e.id,...e.data()},V(),K()}async function q(){if(!A){j=[],v.length=0,M=new Set;return}let[e,n]=await Promise.all([t(r(s,`users`)),t(r(s,`tournaments`,A.id,`registrations`))]);N=n.docs.map(e=>({id:e.id,...e.data()})),M=new Set(N.filter(e=>e.paymentStatus===`approved`).map(e=>e.id)),j=e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.role===`user`||e.role===`admin`).sort((e,t)=>e.name.localeCompare(t.name)),v.length=0,v.push(...j.filter(e=>e.profileComplete&&M.has(e.id)).map(e=>ve(e)).sort((e,t)=>e.name.localeCompare(t.name))),z()}function Le(){return h(A)===`ranking`?`Ranking`:`Campeonato`}function Re(){return g(A)}function ze(){return De()}function J(e){return v.filter(t=>t.active&&_(A,t.registrationCategory)===e)}function Y(e){return x[e]}function Be(e){return b[e]}function X(e){return m(e)}function Ve(e){return!!(A&&A.status!==`finished`)&&J(e).length>=2}function He(e){return H(e)}function Ue(){return De().filter(e=>H(e)).length}async function We(){if(y.length=0,!A)return;let e=await t(r(s,`matches`));y.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.tournamentId===A?.id).sort((e,t)=>e.createdAt-t.createdAt))}async function Ge(){await Ie(),await Promise.all([q(),We()]),Pe(),K(),k()}async function Z(){if(A)try{await q(),k()}catch(e){console.error(`Erro ao atualizar inscrições do torneio:`,e)}}function Ke(){return v.filter(e=>e.games>0||e.active)}function qe(){return[...Ke()].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?t.games===e.games?e.name.localeCompare(t.name):t.games-e.games:e.losses-t.losses:t.wins-e.wins)}function Je(e){return e===1?`Campeão`:e===2?`Vice-campeão`:e===3?`3o lugar`:`${e}o lugar`}function Ye(){v.forEach(e=>{e.wins=0,e.losses=0,e.games=0,e.active=!1,e.lastPlayed=void 0}),y.length=0,W(),ke()}async function Xe(){let e=A;if(!e||e.isActive)return;let i=await t(u(r(s,`tournaments`),f(`isActive`,`==`,!0))),a=n(s);i.forEach(t=>{t.id!==e.id&&a.update(t.ref,{isActive:!1,updatedAt:Date.now()})}),a.update(c(s,`tournaments`,e.id),{isActive:!0,status:`open`,updatedAt:Date.now()}),await a.commit(),A={...e,isActive:!0,status:`open`,updatedAt:Date.now()},K()}async function Ze(e,t,r){let i=A;if(!i)return;let a=v.find(e=>e.id===t),l=v.find(e=>e.id===r);if(!a||!l)return;let u={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:l.name,scoreLabel:`${e.score1} x ${e.score2}`,tableLabel:e.tableLabel,result:`win`,playedAt:e.createdAt},d={id:e.id,tournamentId:i.id,tournamentTitle:i.title,opponentName:a.name,scoreLabel:`${e.score2} x ${e.score1}`,tableLabel:e.tableLabel,result:`loss`,playedAt:e.createdAt},f={tournamentId:i.id,title:i.title,category:a.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(1),losses:o(0),playedAt:e.createdAt},p={tournamentId:i.id,title:i.title,category:l.registrationCategory||i.category||`Livre`,result:`Em andamento`,matchCount:o(1),wins:o(0),losses:o(1),playedAt:e.createdAt},m=n(s);m.set(c(s,`users`,a.id,`matches`,e.id),u),m.set(c(s,`users`,l.id,`matches`,e.id),d),m.set(c(s,`users`,a.id,`tournaments`,i.id),f,{merge:!0}),m.set(c(s,`users`,l.id,`tournaments`,i.id),p,{merge:!0}),await m.commit()}function Q(e){let t=x[e],n=b[e];for(let r=0;r<t.length;r++)if(!t[r].p1&&n.length){let i=n.shift();t[r]={id:t[r].id,group:e,p1:i[0],p2:i[1]}}}function Qe(e){return x[e].some(e=>e.p1&&e.p2)}function $e(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}async function et(e){return $e((await i(c(s,`users`,e))).data())}window.logout=async()=>{await p(d),window.location.replace(`/pages/login.html`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.editCurrentTournament=()=>{A&&(window.location.href=`/pages/tournament-form.html?id=${A.id}`)},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.openTournamentRegistrations=()=>{A&&(window.location.href=`/pages/tournament-registrations.html?id=${A.id}`)},window.closeAthleteActivationModal=()=>{B()},e(d,async e=>{if(ge)return;if(ge=!0,!e){window.location.replace(`/pages/login.html`);return}let t=await et(e.uid);t&&(Fe(t),Me(),await Ge(),window.addEventListener(`focus`,Z),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&Z()}),P=window.setInterval(()=>{Z()},15e3))}),window.addEventListener(`beforeunload`,()=>{P!==null&&(window.clearInterval(P),P=null)}),window.addPlayer=async()=>{let e=document.getElementById(`name`),t=e.value.trim();if(t){await q();try{let n=(F?R().find(e=>e.user.id===F):void 0)??R(t).find(e=>L(e.user.name)===L(t));if(!n){alert(`Selecione um atleta da busca para ativar.`);return}if(n.player?.active){alert(`Esse jogador já esta inscrito e ativo neste torneio.`);return}if(n.registration?.paymentStatus===`approved`){let t=v.find(e=>e.id===n.user.id&&!e.active);if(!t){alert(`Não foi possível ativar esse atleta agora.`);return}await a(c(s,`users`,t.id),{"playerProfile.active":!0,updatedAt:Date.now()}),t.active=!0,F=null;let r=_(A,t.registrationCategory);H(r)&&!Qe(r)&&(C(r),w(r,J(r)),Q(r),await G()),v.sort((e,t)=>e.name.localeCompare(t.name)),e.value=``,z(),k();return}we(n)}catch(e){alert(`Erro ao ativar atleta: `+e.message)}}},window.searchAthletes=()=>{F=null,z()},window.selectAthleteCandidate=e=>{let t=document.getElementById(`name`),n=R().find(t=>t.user.id===e);!t||!n||(F=e,t.value=n.user.name,xe(n.user.name))},window.confirmAthletePaymentStatus=async e=>{let t=I,n=document.getElementById(`name`);if(t){if(e===`cancel`){B();return}try{if(await Te(t,e),await q(),e===`approved`){let e=_(A,t.user.category);H(e)&&!Qe(e)&&(C(e),w(e,J(e)),Q(e),await G())}alert(e===`approved`?`Atleta adicionado automaticamente ao campeonato.`:`Inscricao adicionada para analise no gerenciamento de inscricoes.`),F=null,n&&(n.value=``),B(),z(),k()}catch(e){alert(`Erro ao registrar atleta: `+e.message)}}},window.approveRegistration=async e=>{if(A&&N.find(t=>t.id===e))try{let t=n(s);t.update(c(s,`tournaments`,A.id,`registrations`,e),{paymentStatus:`approved`}),t.update(c(s,`users`,e,`registrations`,A.id),{paymentStatus:`approved`}),await t.commit(),await q(),k()}catch(e){alert(`Erro ao aprovar pagamento: `+e.message)}},window.removeRegistration=async e=>{if(!A)return;let t=N.find(t=>t.id===e);if(t&&confirm(`Remover a inscrição de ${t.name}?`))try{let t=n(s);Ae(t,e),t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),await t.commit(),await q(),k()}catch(e){alert(`Erro ao remover inscrição: `+e.message)}},window.toggleRankingMode=async()=>{if(!A||!g(A))return;if(y.length>0){alert(`Não é possível juntar ou separar categorias após iniciar partidas.`);return}let e=A.rankingMode===`split`?`single`:`split`;await a(c(s,`tournaments`,A.id),{rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}},updatedAt:Date.now()}),A={...A,rankingMode:e,groupStates:{general:{started:!1,tableCount:1},A:{started:!1,tableCount:1},B:{started:!1,tableCount:1}},rankingLiveState:{general:{queue:[],activeTables:[{id:1}]},A:{queue:[],activeTables:[{id:2}]},B:{queue:[],activeTables:[{id:3}]}}},W(),ke(),await G(),k()},window.startGroup=async e=>{if(!A){alert(`Torneio não encontrado.`);return}if(!Ve(e)){alert(`Essa categoria precisa de pelo menos 2 atletas ativos.`);return}await Xe(),H(e)||await je(e,{started:!0}),Qe(e)||C(e),w(e,J(e)),Q(e),await G(),k()},window.resetMatches=async()=>{if(A)try{let e=n(s);y.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),Ke().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.lastPlayed":null}),e.delete(c(s,`users`,t.id,`tournaments`,A.id))}),await e.commit(),y.length=0,W(),ke(),await G(),k()}catch(e){alert(`Erro ao resetar campeonato: `+e.message)}},window.finishTournament=async()=>{let e=A;if(!e)return;let t=qe();if(!t.length){alert(`Adicione atletas e finalize partidas antes de encerrar o torneio.`);return}if(confirm(`Encerrar o torneio "${e.title}"?`))try{let r=n(s),i=Date.now();t.forEach((t,n)=>{let a=n+1,o={id:e.id,tournamentId:e.id,title:e.title,category:t.registrationCategory||e.category||`Livre`,placement:`${a}o lugar`,result:Je(a),matchCount:t.games,wins:t.wins,losses:t.losses,playedAt:i};r.set(c(s,`users`,t.id,`tournaments`,e.id),o,{merge:!0}),r.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null})}),r.update(c(s,`tournaments`,e.id),{isActive:!1,status:`finished`,updatedAt:i,completedAt:i}),await r.commit(),A={...e,isActive:!1,status:`finished`,updatedAt:i},K(),Ye(),await G(),k()}catch(e){alert(`Erro ao encerrar torneio: `+e.message)}},window.deletePlayer=async e=>{if(confirm(`Remover atleta deste torneio?`))try{let t=n(s);t.update(c(s,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),Ae(t,e),t.delete(c(s,`users`,e,`tournaments`,A.id)),await t.commit();let r=v.find(t=>t.id===e);r&&(r.active=!1,r.games=0,r.wins=0,r.losses=0,r.lastPlayed=void 0),W(),[`general`,`A`,`B`].forEach(t=>{x[t].forEach(t=>{(t.p1?.id===e||t.p2?.id===e)&&(t.p1=void 0,t.p2=void 0)})}),await G(),k()}catch(e){alert(`Erro ao remover atleta do torneio: `+e.message)}},window.editPlayer=async e=>{let t=v.find(t=>t.id===e);if(!t)return;let n=prompt(`Novo nome:`,t.name)?.trim();if(n){t.name=n;try{await a(c(s,`users`,e),{name:n,updatedAt:Date.now()}),v.sort((e,t)=>e.name.localeCompare(t.name)),k()}catch(e){alert(`Erro ao editar atleta: `+e.message)}}},window.togglePlayer=async e=>{let t=v.find(t=>t.id===e);if(t){t.active=!t.active;try{await a(c(s,`users`,e),{"playerProfile.active":t.active}),W(),await G(),k()}catch(e){alert(`Erro ao atualizar atleta: `+e.message)}}},window.showHistory=e=>{let t=v.find(t=>t.id===e);if(!t)return;let n=y.filter(t=>t.p1===e||t.p2===e).map(t=>{let n=t.p1===e,r=n?t.p2:t.p1,i=v.find(e=>e.id===r),a=t.winner===e,o=n?t.score1:t.score2,s=n?t.score2:t.score1;return`
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
  `;document.getElementById(`historyList`).innerHTML=i+(n||`<div>Nenhum jogo ainda</div>`),document.getElementById(`historyModal`).style.display=`flex`};function $(e){let t=y.filter(t=>t.p1===e||t.p2===e),n=0,r=0,i=0,a=0;t.forEach(t=>{let o=t.p1===e,s=o?t.score1:t.score2,c=o?t.score2:t.score1;i+=s,a+=c,t.winner===e?n++:r++});let o=t.length,s=o>0?(n/o*100).toFixed(1):`0`;return{wins:n,losses:r,games:o,setsWon:i,setsLost:a,winRate:s}}window.clearPlayers=async()=>{if(A&&confirm(`Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?`))try{let e=n(s);Ke().forEach(t=>{e.update(c(s,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null}),Ae(e,t.id),e.delete(c(s,`users`,t.id,`tournaments`,A.id))}),y.forEach(t=>{e.delete(c(s,`matches`,t.id)),e.delete(c(s,`users`,t.p1,`matches`,t.id)),e.delete(c(s,`users`,t.p2,`matches`,t.id))}),await e.commit(),Ye(),await G(),k()}catch(e){console.error(`Erro ao limpar campeonato:`,e)}},window.finish=async(e,t)=>{let i=x[e][t],a=A;if(!i?.p1||!i?.p2||!a)return;let o=parseInt(document.getElementById(`s1_${e}_${t}`).value,10),u=parseInt(document.getElementById(`s2_${e}_${t}`).value,10);if(isNaN(o)||isNaN(u)){alert(`Preencha o placar corretamente.`);return}if(o<0||u<0){alert(`O placar não pode ser negativo.`);return}if(o===u){alert(`O jogo precisa ter um vencedor.`);return}let d=o>u?i.p1:i.p2,f=o>u?i.p2:i.p1,p=Date.now();d.wins+=1,f.losses+=1,d.games+=1,f.games+=1,d.lastPlayed=p,f.lastPlayed=p;try{let h={p1:i.p1.id,p2:i.p2.id,score1:o,score2:u,winner:d.id,createdAt:p,tournamentId:a.id,tournamentTitle:a.title,tableLabel:`${m(e)} - Mesa ${t+1}`,group:e,registrationCategory:d.registrationCategory},ee=await l(r(s,`matches`),h),g=n(s);g.update(c(s,`users`,d.id),{"playerProfile.wins":d.wins,"playerProfile.games":d.games,"playerProfile.lastPlayed":p}),g.update(c(s,`users`,f.id),{"playerProfile.losses":f.losses,"playerProfile.games":f.games,"playerProfile.lastPlayed":p}),await g.commit();let _={id:ee.id,...h};await Ze(_,d.id,f.id),y.push(_),x[e][t]={id:x[e][t].id,group:e},C(e),w(e,J(e)),Q(e),await G(),k()}catch(e){alert(`Erro ao finalizar partida: `+e.message)}},window.changeTables=async(e,t)=>{let n=x[e];if(t>0)for(let r=0;r<t;r++)n.push({id:ie(),group:e});else{let e=n.findIndex(e=>!e.p1);if(e===-1){alert(`Finalize algum jogo antes de remover mesas.`);return}n.splice(e,1)}await je(e,{tableCount:n.length}),await G(),k()};