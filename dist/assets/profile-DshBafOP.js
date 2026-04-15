import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,v as l,x as u}from"./firebase-VBRKn9At.js";import{n as d}from"./toast-kV3jSCF7.js";/* empty css               */import{u as f}from"./tournament-rules-D9Tq3W95.js";var p=null,m=[],h=new Map,g=new Map;function _(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function v(e,t){return!t||t===e?_(e):`${_(e)} ate ${_(t)}`}function y(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function b(e){return f(e)===`championship`&&e.doubleRegistrationFee!==void 0?`${y(e.registrationFee)} (1 cat.) / ${y(e.doubleRegistrationFee)} (2 cats.)`:y(e.registrationFee)}function x(e){return Array.isArray(e.categories)&&e.categories.length?e.categories.join(`, `):e.category||`Livre`}function S(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function C(e,t){let n=document.getElementById(`profilePhoto`),r=document.getElementById(`profilePhotoFallback`);if(!(!n||!r)){if(r.textContent=S(e||`Atleta`),t){n.src=t,n.style.display=`block`,r.style.display=`none`,n.onerror=()=>{n.style.display=`none`,r.style.display=`flex`};return}n.style.display=`none`,r.style.display=`flex`}}function w(e){let t=document.getElementById(`profileInfoGrid`);t&&(t.innerHTML=[{label:`Nome`,value:e.name||`Não informado`},{label:`Email`,value:e.email||`Não informado`},{label:`Telefone`,value:e.phone||`Não informado`},{label:`Clube`,value:e.club||`Não informado`},{label:`Categoria`,value:e.category||`Não informado`},{label:`Cadastro`,value:_(e.createdAt)}].map(e=>`
        <div class="info-card">
          <span>${e.label}</span>
          <strong>${e.value}</strong>
        </div>
      `).join(``))}function T(e){let t=document.getElementById(`tournamentsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Seu historico de torneios ainda não foi registrado.</div>`;return}t.innerHTML=e.map(e=>`
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.category||`Categoria não informada`}</span>
            </div>
            <span class="stack-item-date">${_(e.playedAt)}</span>
          </div>
          <div class="stack-item-grid">
            <span>Colocacao: ${e.placement||`Não informada`}</span>
            <span>Resultado: ${e.result||`Não informado`}</span>
            <span>Partidas: ${e.matchCount??0}</span>
            <span>Campanha: ${e.wins??0}V / ${e.losses??0}D</span>
          </div>
        </div>
      `).join(``)}}function E(e){let t=document.getElementById(`matchesList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Nenhuma partida vinculada ao seu perfil ainda.</div>`;return}t.innerHTML=e.map(e=>`
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
            <span>Data: ${_(e.playedAt)}</span>
          </div>
        </div>
      `).join(``)}}function D(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function O(e,t){let n=document.getElementById(`myChampionshipsCard`);if(!n)return;let r=t.filter(e=>e.paymentStatus===`approved`).map(t=>{let n=t.tournamentId||t.id,r=e.find(e=>e.id===n&&f(e)===`championship`);return r?{id:r.id,title:r.title,categories:D(t)}:null}).filter(Boolean);if(!r.length){n.innerHTML=`
      <div class="empty-state">Você ainda não esta participando de nenhum campeonato aprovado.</div>
      <button class="btn secondary" onclick="openMyChampionships()">Abrir meus campeonatos</button>
    `;return}let i=new Set(r.map(e=>e.id)).size,a=r.reduce((e,t)=>e+t.categories.length,0),o=r[0];n.innerHTML=`
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${i} campeonato${i>1?`s`:``} em andamento</strong>
          <span>${a} categoria${a>1?`s`:``} acompanhada${a>1?`s`:``}</span>
        </div>
        <span class="result-pill neutral">Ativo</span>
      </div>
      <div class="stack-item-grid">
        <span>Destaque: ${o.title}</span>
        <span>Categorias: ${o.categories.join(`, `)||`A definir`}</span>
      </div>
    </div>
    <button class="btn primary" onclick="openMyChampionships()">Abrir meus campeonatos</button>
  `}function k(e){return h.get(e)}function A(e){return g.get(e)}function j(e){let t=document.getElementById(`upcomingList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Ainda não há próximos torneios cadastrados.</div>`;return}t.innerHTML=e.map(e=>{let t=k(e.id),n=A(e.id),r=t===`approved`?`Inscrito`:t===`pending_payment`?n===`pay_on_day`?`Pagar no dia - pendente`:`Pagamento em analise`:e.status===`open`?`Inscricoes abertas`:`Em breve`;return`
        <div class="stack-item upcoming-item ${t===`pending_payment`?`pending-payment-item`:``}">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.location||`Local a definir`}</span>
            </div>
            <span class="result-pill ${t===`approved`?`win`:`neutral`}">${r}</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${v(e.startDate,e.endDate)}</span>
            <span>Categoria: ${x(e)}</span>
            <span>Valor: ${b(e)}</span>
            <span>Inscricoes: ${_(e.registrationDeadline)}</span>
          </div>
          ${e.description?`<p class="item-description">${e.description}</p>`:``}
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="registerForTournament('${e.id}')">
              ${t?`Ver detalhes`:`Inscreva-se`}
            </button>
          </div>
        </div>
      `}).join(``)}}function M(e,t,n,r){document.getElementById(`profileName`).textContent=e.name||`Atleta AJAB`,document.getElementById(`profileRole`).textContent=e.role===`admin`?`Administrador`:`Atleta`,document.getElementById(`profileMeta`).textContent=`${e.club||`Sem clube`} - ${e.category||`Categoria não informada`} - ${e.email||`Email não informado`}`;let i=n.filter(e=>e.result===`win`).length;document.getElementById(`statsTournaments`).textContent=String(t.length),document.getElementById(`statsMatches`).textContent=String(n.length),document.getElementById(`statsWins`).textContent=String(i),document.getElementById(`statsUpcoming`).textContent=String(r.length),C(e.name,e.photoURL||c.currentUser?.photoURL||void 0);let a=document.querySelector(`[onclick="goToDashboard()"]`);a&&(a.style.display=e.role===`admin`?`flow`:`none`)}async function N(e){let c=o(i,`users`,e),l=s(n(i,`users`,e,`tournaments`),a(`playedAt`,`desc`)),u=s(n(i,`users`,e,`matches`),a(`playedAt`,`desc`)),d=s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`)),f=s(n(i,`tournaments`),a(`startDate`,`asc`)),[_,v,y,b,x]=await Promise.all([r(c),t(l),t(u),t(d),t(f)]);if(!_.exists()){window.location.replace(`/pages/complete-profile.html`);return}let S={id:_.id,..._.data()};if(!S.profileComplete){window.location.replace(`/pages/complete-profile.html`);return}let C=v.docs.map(e=>({id:e.id,...e.data()})),D=y.docs.map(e=>({id:e.id,...e.data()})),k=b.docs.map(e=>({id:e.id,...e.data()})),A=Date.now(),N=x.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status?e.status!==`finished`&&e.status!==`closed`:!0).filter(e=>e.startDate>=A||e.endDate===void 0||e.endDate>=A).slice(0,6);p=S,m=N,h=new Map(k.map(e=>[e.tournamentId||e.id,e.paymentStatus])),g=new Map(k.map(e=>[e.tournamentId||e.id,e.paymentMethod])),M(S,C,D,N),w(S),T(C),E(D),O(N,k),j(N)}window.logout=async()=>{await u(c),window.location.replace(`/pages/login.html`)},window.editProfile=()=>{window.location.href=`/pages/complete-profile.html`},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openMyChampionships=()=>{window.location.href=`/pages/my-championships.html`},window.requestPasswordReset=async()=>{let e=p?.email||c.currentUser?.email;if(!e){d(`Seu perfil nao possui email cadastrado para redefinicao de senha.`,`warning`);return}try{await l(c,e),d(`Enviamos um link de redefinicao de senha para o seu email.`,`success`)}catch(e){d(`Erro ao enviar redefinicao de senha: `+e.message,`error`)}},window.registerForTournament=async e=>{if(!c.currentUser||!p){window.location.replace(`/pages/login.html`);return}let t=m.find(t=>t.id===e);if(!t){d(`Torneio nao encontrado.`,`error`);return}window.location.href=`/pages/tournament-details.html?id=${encodeURIComponent(t.id)}`},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await N(e.uid)}catch(e){console.error(`Erro ao carregar perfil:`,e);let t=document.getElementById(`tournamentsList`),n=document.getElementById(`matchesList`),r=document.getElementById(`upcomingList`),i=document.getElementById(`myChampionshipsCard`);t&&(t.innerHTML=`<div class="empty-state">Não foi possível carregar o perfil agora.</div>`),n&&(n.innerHTML=`<div class="empty-state">Tente novamente em instantes.</div>`),r&&(r.innerHTML=`<div class="empty-state">Os proximos torneios não puderam ser consultados.</div>`),i&&(i.innerHTML=`<div class="empty-state">Seus campeonatos não puderam ser carregados agora.</div>`)}});