import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,v as l,x as u}from"./firebase-VBRKn9At.js";import{n as d}from"./toast-kV3jSCF7.js";/* empty css               */import{f,u as p}from"./tournament-rules-CmdOaKKb.js";var m=null,h=[],g=[],_=new Map,v=new Map,y=null,b=null,x=!1,S=[`A`,`B`,`C`,`D`,`Iniciante`];function C(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function w(e,t){return!t||t===e?C(e):`${C(e)} até ${C(t)}`}function T(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Não informado`}function E(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function D(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function O(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function k(e){return p(e)===`championship`&&e.doubleRegistrationFee!==void 0?`${E(e.registrationFee)} (1 cat.) / ${E(e.doubleRegistrationFee)} (2 cats.)`:E(e.registrationFee)}function A(e){return Array.isArray(e.categories)&&e.categories.length?e.categories.join(`, `):e.category||`Livre`}function j(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function M(e,t){let n=document.getElementById(`profilePhoto`),r=document.getElementById(`profilePhotoFallback`);if(!(!n||!r)){if(r.textContent=j(e||`Atleta`),t){n.src=t,n.style.display=`block`,r.style.display=`none`,n.onerror=()=>{n.style.display=`none`,r.style.display=`flex`};return}n.style.display=`none`,r.style.display=`flex`}}function N(e){let t=document.getElementById(`profileInfoGrid`);t&&(t.innerHTML=[{label:`Nome`,value:e.name||`Não informado`},{label:`Email`,value:e.email||`Não informado`},{label:`Telefone`,value:e.phone||`Não informado`},{label:`Clube`,value:e.club||`Não informado`},{label:`Categoria`,value:e.category||`Não informado`},{label:`Cadastro`,value:C(e.createdAt)}].map(e=>`
        <div class="info-card">
          <span>${e.label}</span>
          <strong>${e.value}</strong>
        </div>
      `).join(``))}function P(e){return g.find(t=>t.id===e)??null}function F(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function I(e,t,n){let r=new Map;return e.playerIds.forEach(e=>{r.set(e,{wins:0,losses:0,pointsWon:0,pointsLost:0})}),(t.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).forEach(e=>{let[t,n]=e.playerIds,i=r.get(t),a=r.get(n);if(!i||!a)return;let o=e.score1??0,s=e.score2??0;i.pointsWon+=o,i.pointsLost+=s,a.pointsWon+=s,a.pointsLost+=o,e.winnerId===t?(i.wins+=1,a.losses+=1):e.winnerId===n&&(a.wins+=1,i.losses+=1)}),[...r.entries()].map(([e,t])=>({playerId:e,...t})).sort((e,t)=>{if(t.wins!==e.wins)return t.wins-e.wins;let r=e.pointsWon-e.pointsLost,i=t.pointsWon-t.pointsLost;return i===r?(n.get(e.playerId)||`Atleta`).localeCompare(n.get(t.playerId)||`Atleta`):i-r})}function L(e){let t=e.finalStandings??[];return t.length?`
    <section class="final-results-section">
      <div class="final-results-head">
        <span class="section-label">Classificação geral</span>
        <strong>${t.length} atleta${t.length===1?``:`s`}</strong>
      </div>
      <div class="final-results-ranking-list">
        ${t.map((e,t)=>`
              <article class="ranking-athlete-card final-results-ranking-card ${t===0?`podium-gold`:t===1?`podium-silver`:t===2?`podium-bronze`:``}">
                <span>${D(e.placement)}</span>
                <div class="final-results-ranking-copy">
                  <strong>${D(e.name)}</strong>
                  <small>${D(e.result)}</small>
                </div>
                <span class="ranking-athlete-stats">${e.wins}V / ${e.losses}D / ${e.games}J</span>
              </article>
            `).join(``)}
      </div>
    </section>
  `:`<div class="empty-state">O resultado final deste ranking ainda não foi publicado.</div>`}async function R(e){let r=await t(n(i,`tournaments`,e,`registrations`)),a=new Map;return r.docs.forEach(e=>{let t={id:e.id,...e.data()};a.set(t.id,t.name)}),a}function z(e){let t=(Array.isArray(e.categories)?e.categories:[]).map(e=>O(e)).filter(Boolean),n=Object.keys(e.championshipState??{}).map(e=>O(e)).filter(Boolean);return[...new Set([...t,...n])].sort((e,t)=>S.indexOf(e)-S.indexOf(t))}function B(e,t,n,r){if(!(n.groups??[]).length)return`
      <section class="championship-result-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Categoria ${D(t)}</span>
            <h3>Categoria não iniciada</h3>
          </div>
        </div>
        <div class="empty-state">Categoria não iniciada.</div>
      </section>
    `;let i=n.groups??[],a=i.some(e=>e.id===b)?b:i[0]?.id,o=(n.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===a).sort((e,t)=>(t.playedAt??0)-(e.playedAt??0));return`
    <section class="championship-result-section">
      <div class="section-header compact-section-header">
        <div>
          <span class="section-label">Categoria ${D(t)}</span>
          <h3>${n.finished?`Resultado final`:`Andamento do campeonato`}</h3>
        </div>
      </div>
      <div class="championship-result-groups">
        ${i.map(e=>{let i=F(t,e).length,o=(n.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).length,s=I(e,n,r);return`
              <button class="championship-result-group-card ${a===e.id?`active`:``}" onclick="setProfileTournamentResultGroup('${e.id}')" type="button">
                <strong>${D(e.name)}</strong>
                <span>${o}/${i} jogos</span>
                <div class="championship-result-group-mini">
                  ${s.length?s.map((e,t)=>`
                            <small>${t+1}o ${D(r.get(e.playerId)||`Atleta`)} - ${e.wins}V</small>
                          `).join(``):`<small>Aguardando jogos</small>`}
                </div>
              </button>
            `}).join(``)}
      </div>
      <section class="group-section championship-history-inner">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Histórico do grupo</span>
            <h3>${a?D(i.find(e=>e.id===a)?.name||`Grupo`):`Grupo`}</h3>
          </div>
        </div>
        ${o.length?`
              <div class="championship-history-compact-grid">
                ${o.map(e=>`
                    <article class="championship-history-compact-card">
                      <strong>${D(r.get(e.playerIds[0])||`Atleta`)} ${e.score1??0} x ${e.score2??0} ${D(r.get(e.playerIds[1])||`Atleta`)}</strong>
                      <span>${D(e.groupId||`Grupo`)} • ${D(T(e.playedAt))}</span>
                    </article>
                  `).join(``)}
              </div>
            `:`<div class="empty-state">Nenhuma partida registrada neste grupo ainda.</div>`}
      </section>
      <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
        <iframe
          class="championship-bracket-frame championship-result-bracket"
          title="Mata-mata ${D(t)}"
          loading="lazy"
          src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}"
        ></iframe>
      </div>
    </section>
  `}async function V(e,t){let n=await R(e.id),r=z(e);if(!r.length)return`<div class="empty-state">Este campeonato ainda não possui grupos ou mata-mata definidos.</div>`;let i=r.includes(t)?t:r[0],a=e.championshipState?.[i]??{};return`
    <div class="form-group championship-result-selector">
      <span>Categoria</span>
      <select onchange="setProfileTournamentResultCategory(this.value)">
        ${r.map(e=>`<option value="${e}" ${e===i?`selected`:``}>Categoria ${D(e)}</option>`).join(``)}
      </select>
    </div>
    ${B(e,i,a,n)}
  `}function H(e){let t=document.getElementById(`tournamentsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Seu histórico de torneios ainda não foi registrado.</div>`;return}t.innerHTML=e.map(e=>`
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.category||`Categoria não informada`}</span>
            </div>
            <span class="stack-item-date">${C(e.playedAt)}</span>
          </div>
          <div class="stack-item-grid">
            <span>Colocação: ${e.placement||`Não informada`}</span>
            <span>Resultado: ${e.result||`Não informado`}</span>
            <span>Partidas: ${e.matchCount??0}</span>
            <span>Campanha: ${e.wins??0}V / ${e.losses??0}D</span>
          </div>
        </div>
      `).join(``)}}function U(e){let t=document.getElementById(`matchesList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Nenhuma partida vinculada ao seu perfil ainda.</div>`;return}t.innerHTML=e.map(e=>`
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>vs ${e.opponentName}</strong>
              <span>${e.tournamentTitle||`Torneio sem nome`}${e.stage?` - ${e.stage}`:``}</span>
            </div>
            <span class="result-pill ${e.result}">${e.result===`win`?`Vitoria`:`Derrota`}</span>
          </div>
          <div class="stack-item-grid">
            <span>Placar: ${e.scoreLabel}</span>
            <span>Mesa: ${e.tableLabel||`Não informada`}</span>
            <span>Data: ${C(e.playedAt)}</span>
          </div>
        </div>
      `).join(``)}}function W(e){let t=document.getElementById(`tournamentsList`);t&&Array.from(t.children).forEach((t,n)=>{let r=t,i=e[n];if(!r||!i||r.querySelector(`.history-result-action`))return;let a=i.tournamentId||i.id,o=P(a),s=document.createElement(`div`);s.className=`admin-tournament-actions history-result-action`,s.innerHTML=`<button class="btn secondary" ${o?``:`disabled`} onclick="openProfileTournamentResult('${a}')">Ver resultado</button>`,r.appendChild(s)})}function G(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function K(e,t){let n=(Array.isArray(e.categories)?e.categories:[]).map(e=>O(e)).filter(Boolean),r=G(t).map(e=>O(e)).filter(Boolean),i=n.length?r.filter(e=>n.includes(e)):r;return i.length?[...new Set(i)]:[...new Set(n)]}function q(e,t){if(p(e)===`ranking`)return e.status!==`finished`;let n=K(e,t);return n.length?n.some(t=>!e.championshipState?.[t]?.finished):e.status!==`finished`}function J(e,t,n){return e.filter(e=>{let r=e.tournamentId||e.id,i=t.find(e=>e.id===r),a=n.find(e=>(e.tournamentId||e.id)===r&&e.paymentStatus===`approved`);return!i||!a?!0:!q(i,a)})}function Y(e,t){let n=document.getElementById(`myChampionshipsCard`);if(!n)return;let r=t.filter(e=>e.paymentStatus===`approved`).map(t=>{let n=t.tournamentId||t.id,r=e.find(e=>e.id===n);return!r||!q(r,t)?null:{id:r.id,title:r.title,type:p(r),categories:p(r)===`championship`?K(r,t):Array.isArray(t.categories)&&t.categories.length?t.categories:t.category?t.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}}).filter(Boolean);if(!r.length){n.innerHTML=`
      <div class="empty-state">Você ainda não possui torneios aprovados para acompanhar.</div>
      <button class="btn secondary" onclick="openMyTournaments()">Abrir meus torneios</button>
    `;return}let i=r.filter(e=>e.type===`ranking`).length,a=r.filter(e=>e.type===`championship`).length,o=r[0];n.innerHTML=`
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${r.length} Torneio${r.length===1?``:`s`} em andamento</strong>
          <span>${i} Ranking${i===1?``:`s`} e ${a} Campeonato${a===1?``:`s`}</span>
        </div>
        <span class="result-pill neutral">Ao vivo</span>
      </div>
      <div class="stack-item-grid">
        <span>Destaque: ${o.title}</span>
        <span>Categoria(s): ${o.categories.join(`, `)||`A definir`}</span>
      </div>
    </div>
    <button class="btn primary" onclick="openMyTournaments()">Abrir meus torneios</button>
  `}function X(e){return _.get(e)}function Z(e){return v.get(e)}function Q(e){let t=document.getElementById(`upcomingList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Ainda não há próximos torneios cadastrados.</div>`;return}t.innerHTML=e.map(e=>{let t=X(e.id),n=Z(e.id),r=t===`approved`?`Inscrito`:t===`pending_payment`?n===`pay_on_day`?`Pagar no dia - pendente`:`Pagamento em análise`:e.status===`open`?`Inscrições abertas`:`Em breve`;return`
        <div class="stack-item upcoming-item ${t===`pending_payment`?`pending-payment-item`:``}">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.location||`Local a definir`}</span>
            </div>
            <span class="result-pill ${t===`approved`?`win`:`neutral`}">${r}</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${w(e.startDate,e.endDate)}</span>
            <span>Categoria: ${A(e)}</span>
            <span>Valor: ${k(e)}</span>
            <span>Inscrições: ${C(e.registrationDeadline)}</span>
          </div>
          ${e.description?`<p class="item-description">${e.description}</p>`:``}
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="registerForTournament('${e.id}')">
              ${t?`Ver detalhes`:`Inscreva-se`}
            </button>
          </div>
        </div>
      `}).join(``)}}function $(e,t,n,r){document.getElementById(`profileName`).textContent=e.name||`Atleta AJAB`,document.getElementById(`profileRole`).textContent=e.role===`admin`?`Administrador`:`Atleta`,document.getElementById(`profileMeta`).textContent=`${e.club||`Sem clube`} - ${e.category||`Categoria não informada`} - ${e.email||`Email não informado`}`;let i=n.filter(e=>e.result===`win`).length;document.getElementById(`statsTournaments`).textContent=String(t.length),document.getElementById(`statsMatches`).textContent=String(n.length),document.getElementById(`statsWins`).textContent=String(i),document.getElementById(`statsUpcoming`).textContent=String(r.length),M(e.name,e.photoURL||c.currentUser?.photoURL||void 0);let a=document.querySelector(`[onclick="goToDashboard()"]`);a&&(a.style.display=e.role===`admin`?`flow`:`none`)}async function ee(e){let c=o(i,`users`,e),l=s(n(i,`users`,e,`tournaments`),a(`playedAt`,`desc`)),u=s(n(i,`users`,e,`matches`),a(`playedAt`,`desc`)),d=s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`)),f=s(n(i,`tournaments`),a(`startDate`,`asc`)),[p,y,b,x,S]=await Promise.all([r(c),t(l),t(u),t(d),t(f)]);if(!p.exists()){window.location.replace(`/pages/complete-profile.html`);return}let C={id:p.id,...p.data()};if(!C.profileComplete){window.location.replace(`/pages/complete-profile.html`);return}let w=y.docs.map(e=>({id:e.id,...e.data()})),T=b.docs.map(e=>({id:e.id,...e.data()})),E=x.docs.map(e=>({id:e.id,...e.data()})),D=Date.now(),O=S.docs.map(e=>({id:e.id,...e.data()})),k=O.filter(e=>e.status?e.status!==`finished`&&e.status!==`closed`:!0).filter(e=>e.startDate>=D||e.endDate===void 0||e.endDate>=D).slice(0,6);m=C,h=k,g=O,_=new Map(E.map(e=>[e.tournamentId||e.id,e.paymentStatus])),v=new Map(E.map(e=>[e.tournamentId||e.id,e.paymentMethod]));let A=J(w,O,E);$(C,w,T,k),N(C),H(A),W(A),U(T),Y(O,E),Q(k)}window.logout=async()=>{await u(c),window.location.replace(`/pages/login.html`)},window.editProfile=()=>{window.location.href=`/pages/complete-profile.html`},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openMyTournaments=()=>{window.location.href=`/pages/my-championships.html`},window.openMyChampionships=()=>{window.location.href=`/pages/my-championships.html`},window.closeProfileTournamentResultModal=()=>{let e=document.getElementById(`profileTournamentResultModal`),t=document.querySelector(`#profileTournamentResultModal .profile-tournament-result-modal-card`),n=document.getElementById(`profileTournamentResultExpandButton`);e&&(e.style.display=`none`),x=!1,t&&t.classList.remove(`expanded`),n&&(n.textContent=`Expandir resultados`),y=null,b=null},window.toggleProfileTournamentResultExpand=()=>{let e=document.querySelector(`#profileTournamentResultModal .profile-tournament-result-modal-card`),t=document.getElementById(`profileTournamentResultExpandButton`);!e||!t||(x=!x,e.classList.toggle(`expanded`,x),t.textContent=x?`Recolher resultados`:`Expandir resultados`)},window.openProfileTournamentResult=async e=>{let t=P(e),n=document.getElementById(`profileTournamentResultTitle`),r=document.getElementById(`profileTournamentResultContent`),i=document.getElementById(`profileTournamentResultModal`),a=document.querySelector(`#profileTournamentResultModal .profile-tournament-result-modal-card`),o=document.getElementById(`profileTournamentResultExpandButton`);if(!t||!n||!r||!i){d(`Não foi possível abrir o resultado deste torneio.`,`warning`);return}n.textContent=`Resultado - ${t.title}`,r.innerHTML=`<div class="empty-state">Carregando resultado...</div>`,i.style.display=`flex`,x=!1,a&&a.classList.remove(`expanded`),o&&(o.textContent=`Expandir resultados`),y=e,b=null;try{r.innerHTML=f(t)?L(t):await V(t)}catch(e){r.innerHTML=`<div class="empty-state">Não foi possível carregar o resultado agora.</div>`,d(`Erro ao carregar resultado: `+e.message,`error`)}},window.setProfileTournamentResultCategory=async e=>{let t=y,n=document.getElementById(`profileTournamentResultContent`);if(!t||!n)return;let r=P(t),i=O(e);if(!(!r||!i)){n.innerHTML=`<div class="empty-state">Carregando resultado...</div>`,b=null;try{n.innerHTML=await V(r,i)}catch(e){n.innerHTML=`<div class="empty-state">Não foi possível carregar o resultado agora.</div>`,d(`Erro ao carregar categoria: `+e.message,`error`)}}},window.setProfileTournamentResultGroup=async e=>{let t=y,n=document.getElementById(`profileTournamentResultContent`);if(!t||!n)return;let r=P(t);if(!r)return;let i=O(n.querySelector(`select`)?.value);if(i){b=e,n.innerHTML=`<div class="empty-state">Carregando resultado...</div>`;try{n.innerHTML=await V(r,i)}catch(e){n.innerHTML=`<div class="empty-state">Não foi possível carregar o resultado agora.</div>`,d(`Erro ao carregar grupo: `+e.message,`error`)}}},window.requestPasswordReset=async()=>{let e=m?.email||c.currentUser?.email;if(!e){d(`Seu perfil não possui email cadastrado para redefinição de senha.`,`warning`);return}try{await l(c,e),d(`Enviamos um link de redefinição de senha para o seu email.`,`success`)}catch(e){d(`Erro ao enviar redefinição de senha: `+e.message,`error`)}},window.registerForTournament=async e=>{if(!c.currentUser||!m){window.location.replace(`/pages/login.html`);return}let t=h.find(t=>t.id===e);if(!t){d(`Torneio não encontrado.`,`error`);return}window.location.href=`/pages/tournament-details.html?id=${encodeURIComponent(t.id)}`},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await ee(e.uid)}catch(e){console.error(`Erro ao carregar perfil:`,e);let t=document.getElementById(`tournamentsList`),n=document.getElementById(`matchesList`),r=document.getElementById(`upcomingList`),i=document.getElementById(`myChampionshipsCard`);t&&(t.innerHTML=`<div class="empty-state">Não foi possível carregar o perfil agora.</div>`),n&&(n.innerHTML=`<div class="empty-state">Tente novamente em instantes.</div>`),r&&(r.innerHTML=`<div class="empty-state">Os próximos torneios não puderam ser consultados.</div>`),i&&(i.innerHTML=`<div class="empty-state">Seus campeonatos não puderam ser carregados agora.</div>`)}});