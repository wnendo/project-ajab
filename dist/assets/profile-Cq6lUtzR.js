import"./modulepreload-polyfill-CGdBa_z4.js";import{_ as e,a as t,b as n,f as r,i,n as a,o,p as s,s as c,t as l}from"./firebase-DxeB7Pug.js";/* empty css               */var u=null,d=[],f=new Set,p=new Map,m=null;function h(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Nao informado`}function g(e,t){return!t||t===e?h(e):`${h(e)} ate ${h(t)}`}function _(e){return e===void 0?`Nao informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function v(e){return Array.isArray(e.categories)&&e.categories.length?e.categories.join(`, `):e.category||`Livre`}function y(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):u?.category?[u.category]:[`Livre`]}function b(e){return e.status===`finished`||e.status===`closed`?!0:e.status===`open`?!1:!!(e.registrationDeadline&&e.registrationDeadline<Date.now())}function x(e){return!!(e.registrationFee&&e.pixKey&&e.pixHolder)}function S(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function C(e,t){let n=document.getElementById(`profilePhoto`),r=document.getElementById(`profilePhotoFallback`);if(!(!n||!r)){if(r.textContent=S(e||`Atleta`),t){n.src=t,n.style.display=`block`,r.style.display=`none`,n.onerror=()=>{n.style.display=`none`,r.style.display=`flex`};return}n.style.display=`none`,r.style.display=`flex`}}function w(e){let t=document.getElementById(`registrationModal`),n=document.getElementById(`registrationModalText`),r=document.getElementById(`registrationCategoryOptions`);if(!t||!n||!r)return;let i=y(e);n.textContent=`Escolha a categoria para se inscrever em ${e.title}.`,r.innerHTML=i.map((e,t)=>`
        <label class="checkbox-option registration-option">
          <input type="radio" name="registrationCategory" value="${e}" ${t===0?`checked`:``}>
          <span>${e}</span>
        </label>
      `).join(``),m=e.id,t.style.display=`flex`}function T(){return document.querySelector(`input[name="registrationCategory"]:checked`)?.value.trim()||``}function E(e){let t=document.getElementById(`profileInfoGrid`);t&&(t.innerHTML=[{label:`Nome`,value:e.name||`Nao informado`},{label:`Email`,value:e.email||`Nao informado`},{label:`Telefone`,value:e.phone||`Nao informado`},{label:`Clube`,value:e.club||`Nao informado`},{label:`Categoria`,value:e.category||`Nao informado`},{label:`Cadastro`,value:h(e.createdAt)}].map(e=>`
        <div class="info-card">
          <span>${e.label}</span>
          <strong>${e.value}</strong>
        </div>
      `).join(``))}function D(e){let t=document.getElementById(`tournamentsList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Seu historico de torneios ainda nao foi registrado.</div>`;return}t.innerHTML=e.map(e=>`
        <div class="stack-item">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.category||`Categoria nao informada`}</span>
            </div>
            <span class="stack-item-date">${h(e.playedAt)}</span>
          </div>
          <div class="stack-item-grid">
            <span>Colocacao: ${e.placement||`Nao informada`}</span>
            <span>Resultado: ${e.result||`Nao informado`}</span>
            <span>Partidas: ${e.matchCount??0}</span>
            <span>Campanha: ${e.wins??0}V / ${e.losses??0}D</span>
          </div>
        </div>
      `).join(``)}}function O(e){let t=document.getElementById(`matchesList`);if(t){if(!e.length){t.innerHTML=`<div class="empty-state">Nenhuma partida vinculada ao seu perfil ainda.</div>`;return}t.innerHTML=e.map(e=>`
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
            <span>Mesa: ${e.tableLabel||`Nao informada`}</span>
            <span>Data: ${h(e.playedAt)}</span>
          </div>
        </div>
      `).join(``)}}function k(e){return p.get(e)}function A(e,t,n){let r=document.getElementById(`upcomingList`);if(r){if(!e.length){r.innerHTML=`<div class="empty-state">Ainda nao ha proximos torneios cadastrados.</div>`;return}r.innerHTML=e.map(e=>{let r=k(e.id);return`
        <div class="stack-item upcoming-item ${r===`pending_payment`?`pending-payment-item`:``}">
          <div class="stack-item-header">
            <div>
              <strong>${e.title}</strong>
              <span>${e.location||`Local a definir`}</span>
            </div>
            <span class="result-pill ${r===`approved`?`win`:`neutral`}">${r===`approved`?`Inscrito`:r===`pending_payment`?`Pagamento em analise`:e.status===`open`?`Inscricoes abertas`:`Em breve`}</span>
          </div>
          <div class="stack-item-grid">
            <span>Quando: ${g(e.startDate,e.endDate)}</span>
            <span>Categoria: ${v(e)}</span>
            <span>Valor: ${_(e.registrationFee)}</span>
            <span>Inscricoes: ${h(e.registrationDeadline)}</span>
          </div>
          ${e.description?`<p class="item-description">${e.description}</p>`:``}
          ${t.role===`admin`?``:`
                <div class="admin-tournament-actions">
                  <button
                    class="btn primary"
                    onclick="registerForTournament('${e.id}')"
                    ${n.has(e.id)?`disabled`:``}
                    ${r===`pending_payment`?`disabled`:``}
                    ${x(e)?``:`disabled`}
                    ${b(e)?`disabled`:``}
                  >
                    ${r===`approved`?`Inscrito`:r===`pending_payment`?`Pagamento em analise`:x(e)?e.status===`finished`?`Finalizado`:b(e)?`Inscricoes encerradas`:u?.role===`admin`?`Inscricoes`:`Pagar com Pix`:`Pix indisponivel`}
                  </button>
                </div>
              `}
        </div>
      `}).join(``)}}function j(e,t,n,r){document.getElementById(`profileName`).textContent=e.name||`Atleta AJAB`,document.getElementById(`profileRole`).textContent=e.role===`admin`?`Administrador`:`Atleta`,document.getElementById(`profileMeta`).textContent=`${e.club||`Sem clube`} - ${e.category||`Categoria nao informada`} - ${e.email||`Email nao informado`}`;let i=n.filter(e=>e.result===`win`).length;document.getElementById(`statsTournaments`).textContent=String(t.length),document.getElementById(`statsMatches`).textContent=String(n.length),document.getElementById(`statsWins`).textContent=String(i),document.getElementById(`statsUpcoming`).textContent=String(r.length),C(e.name,e.photoURL||l.currentUser?.photoURL||void 0);let a=document.querySelector(`[onclick="goToDashboard()"]`);a&&(a.style.display=e.role===`admin`?`inline-flex`:`none`)}async function M(e){let n=s(a,`users`,e),l=c(r(a,`users`,e,`tournaments`),o(`playedAt`,`desc`)),m=c(r(a,`users`,e,`matches`),o(`playedAt`,`desc`)),h=c(r(a,`users`,e,`registrations`),o(`registeredAt`,`desc`)),g=c(r(a,`tournaments`),o(`startDate`,`asc`)),[_,v,y,b,x]=await Promise.all([i(n),t(l),t(m),t(h),t(g)]);if(!_.exists()){window.location.replace(`/pages/complete-profile.html`);return}let S={id:_.id,..._.data()};if(!S.profileComplete){window.location.replace(`/pages/complete-profile.html`);return}let C=v.docs.map(e=>({id:e.id,...e.data()})),w=y.docs.map(e=>({id:e.id,...e.data()})),T=b.docs.map(e=>({id:e.id,...e.data()})),k=Date.now(),M=x.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.status?e.status!==`finished`&&e.status!==`closed`:!0).filter(e=>e.startDate>=k||e.endDate===void 0||e.endDate>=k).slice(0,6),N=await Promise.all(M.map(async t=>({tournamentId:t.id,snapshot:await i(s(a,`tournaments`,t.id,`registrations`,e))}))),P=new Set(N.filter(e=>e.snapshot.exists()).map(e=>e.tournamentId));u=S,d=M,p=new Map(T.map(e=>[e.tournamentId||e.id,e.paymentStatus])),f=new Set(T.map(e=>e.tournamentId||e.id).filter(e=>P.has(e)).filter(e=>p.get(e)===`approved`)),j(S,C,w,M),E(S),D(C),O(w),A(M,S,f)}window.logout=async()=>{await n(l),window.location.replace(`/pages/login.html`)},window.editProfile=()=>{window.location.href=`/pages/complete-profile.html`},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.registerForTournament=async e=>{if(!l.currentUser||!u){window.location.replace(`/pages/login.html`);return}if(u.role===`admin`){alert(`Administradores nao participam da inscricao de atletas.`);return}if(f.has(e)){alert(`Voce ja esta inscrito neste torneio.`);return}if(p.get(e)===`pending_payment`){alert(`Seu pagamento para este torneio ainda esta em analise.`);return}let t=d.find(t=>t.id===e);if(!t){alert(`Torneio nao encontrado.`);return}if(b(t)){alert(`As inscricoes para este torneio nao estao disponiveis.`);return}if(!x(t)){alert(`A organizacao ainda nao configurou o pagamento Pix para este torneio.`);return}w(t)},window.closeRegistrationModal=()=>{let e=document.getElementById(`registrationModal`);e&&(e.style.display=`none`),m=null},window.confirmTournamentRegistration=async()=>{if(!l.currentUser||!u||!m){window.location.replace(`/pages/login.html`);return}if(f.has(m)){alert(`Voce ja esta inscrito neste torneio.`),window.closeRegistrationModal();return}let e=d.find(e=>e.id===m);if(!e){alert(`Torneio nao encontrado.`),window.closeRegistrationModal();return}let t=T();if(!t){alert(`Escolha uma categoria para concluir a inscricao.`);return}window.closeRegistrationModal(),window.location.href=`/pages/payment-pix.html?tournamentId=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}`},e(l,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await M(e.uid)}catch(e){console.error(`Erro ao carregar perfil:`,e);let t=document.getElementById(`tournamentsList`),n=document.getElementById(`matchesList`),r=document.getElementById(`upcomingList`);t&&(t.innerHTML=`<div class="empty-state">Nao foi possivel carregar o perfil agora.</div>`),n&&(n.innerHTML=`<div class="empty-state">Tente novamente em instantes.</div>`),r&&(r.innerHTML=`<div class="empty-state">Os proximos torneios nao puderam ser consultados.</div>`)}});