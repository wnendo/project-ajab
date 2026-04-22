import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,p as a,t as o,x as s}from"./firebase-VBRKn9At.js";import{n as c}from"./toast-kV3jSCF7.js";/* empty css               */import{a as l,d as u,f as d,i as f,p,r as m,u as h}from"./tournament-rules-Dalw4FyS.js";var g=new URLSearchParams(window.location.search).get(`id`),_=null,v=null,y=[],b=null,x=``,S=new Map,C=null,w=null;function T(){return Array.from(document.querySelectorAll(`input[name="registrationCategory"]:checked`)).map(e=>e.value.trim()).filter(Boolean)}function E(e,t){return m(e,t).filter(e=>e!==`Iniciante`)}function D(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function O(e,t){return e?!t||t===e?D(e):`${D(e)} até ${D(t)}`:`Não informado`}function k(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function A(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function j(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function M(){return[...y].filter(e=>e.paymentStatus===`approved`).sort((e,t)=>e.name.localeCompare(t.name))}function N(){let e=M();return x?e.filter(e=>[e.name,e.club,e.category,...e.categories??[]].filter(Boolean).some(e=>e.toLowerCase().includes(x))):e}function P(e){return Array.from(new Set(e.map(e=>e.group))).map(t=>({group:t,entries:e.filter(e=>e.group===t)}))}function F(e){let t=[`general`,`A`,`B`];return P(e).map(({group:e})=>e).sort((e,n)=>t.indexOf(e)-t.indexOf(n))}function I(e){return e===`general`?`Ranking geral`:`Categoria ${e}`}function L(e,t=!1,n){let r=e=>e===0?`podium-gold`:e===1?`podium-silver`:e===2?`podium-bronze`:``,i=t?e:e.slice(0,5),a=e.length>5;return`
    <div class="ranking-public-results-list ranking-athlete-grid ${t?`expanded`:``}">
        ${i.map((e,t)=>`
              <article class="ranking-athlete-card ranking-public-results-card ${r(t)}">
                <span>${t+1}o</span>
                <div class="ranking-public-results-copy">
                  <strong>${A(e.name)}</strong>
                  <small>${e.wins}V - ${e.losses}D - ${e.games}J</small>
                </div>
                <span class="ranking-athlete-stats">${e.wins}V / ${e.losses}D / ${e.games}J</span>
              </article>
            `).join(``)}
    </div>
    ${a?`<div class="tournament-results-expand-row">
            <button class="btn secondary btn-sm" onclick="toggleTournamentResultsExpanded('${n??``}')">
              ${t?`Mostrar menos`:`Mostrar mais (${e.length-i.length})`}
            </button>
          </div>`:``}
  `}function R(e){return d(e)||e.doubleRegistrationFee===void 0?k(e.registrationFee):`${k(e.registrationFee)} (1 cat.) / ${k(e.doubleRegistrationFee)} (2 cats.)`}function z(e){return e.status===`finished`||e.status===`closed`?!0:e.status===`open`?!1:!!(e.registrationDeadline&&e.registrationDeadline<Date.now())}function B(){let e=document.getElementById(`registrationModal`),t=document.getElementById(`registrationModalText`),n=document.getElementById(`registrationCategoryOptions`),r=v;if(!e||!t||!n||!r)return;let i=E(r,_?.category);if(!i.length){c(`Sua categoria atual nao possui inscricao publica disponivel neste campeonato.`,`warning`);return}t.textContent=d(r)?`Escolha a categoria do ranking para se inscrever em ${r.title}.`:`Escolha uma ou duas categorias para se inscrever em ${r.title}.`,n.innerHTML=i.map((e,t)=>{let n=u(r,y,e),i=l(y,e),a=f(r,e);return`
        <label class="checkbox-option registration-option">
          <input type="${d(r)?`radio`:`checkbox`}" name="registrationCategory" value="${e}" ${t===0&&!n?`checked`:``} ${n?`disabled`:``}>
          <span>${e}${a?` (${i}/${a})`:``}${n?` - lotada`:``}</span>
        </label>
      `}).join(``),e.style.display=`flex`}function V(){let e=document.getElementById(`rankingRegistrationsList`),t=document.getElementById(`rankingRegistrationsCount`);if(!e||!t)return;let n=N(),r=M().length;t.textContent=`${n.length} de ${r} atletas`,e.innerHTML=n.length?n.map(e=>`
            <div class="stack-item compact-stack-item ranking-registration-item">
              <div class="stack-item-header">
                <div>
                  <strong>${A(e.name)}</strong>
                  <span>${A(e.club||`Sem clube`)}</span>
                </div>
                <span class="result-pill neutral">${A(e.category||`Categoria`)}</span>
              </div>
              <div class="admin-tournament-actions">
                <button class="btn secondary" onclick="openRegisteredAthleteProfile('${e.id}')">Ver perfil</button>
              </div>
            </div>
          `).join(``):`<div class="empty-state">Nenhum atleta encontrado nesta busca.</div>`}function H(){let e=document.getElementById(`tournamentResultsCard`),t=document.getElementById(`tournamentResultsList`);if(!e||!t||!v?.finalStandings?.length){e&&(e.style.display=`none`);return}e.style.display=`block`,t.innerHTML=`
    <div class="tournament-results-summary">
      <p>Escolha uma categoria para abrir o resultado completo com todos os participantes e estatisticas.</p>
      <div class="tournament-results-actions">
        ${F(v.finalStandings).map(e=>`
              <button class="btn secondary btn-sm" onclick="openTournamentResultsModal('${e}')">
                ${A(I(e))}
              </button>
            `).join(``)}
      </div>
    </div>
  `}function U(e){let t=document.getElementById(`tournamentResultsModalList`);if(!t)return;if(!v?.finalStandings?.length){t.innerHTML=`<div class="empty-state">O resultado final ainda nao foi gerado.</div>`;return}let n=F(v.finalStandings),r=n.includes(e)?e:n[0];C=r;let i=w===r,a=v.finalStandings.filter(e=>e.group===r);t.innerHTML=`
    <div class="form-group championship-result-selector">
      <span>Categoria</span>
      <select onchange="setTournamentResultsGroup(this.value)">
        ${n.map(e=>`<option value="${e}" ${e===r?`selected`:``}>${A(I(e))}</option>`).join(``)}
      </select>
    </div>
    <section class="final-results-section">
      <div class="final-results-head">
        <span class="section-label">${A(I(r))}</span>
        <strong>${a.length} atleta${a.length===1?``:`s`}</strong>
      </div>
      ${L(a,i,r)}
    </section>
  `}function W(e){let t=document.getElementById(`registeredAthleteProfileModal`),n=document.getElementById(`registeredAthleteProfileContent`),r=S.get(e),i=y.find(t=>t.id===e||t.uid===e);if(!t||!n||!r){c(`Nao foi possivel carregar o perfil deste atleta.`,`warning`);return}n.innerHTML=`
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${r.photoURL?`<img class="profile-avatar" src="${A(r.photoURL)}" alt="Foto de ${A(r.name)}">`:`<div class="profile-avatar profile-avatar-fallback">${A(j(r.name))}</div>`}</div>
        <div class="athlete-profile-copy">
          <h3>${A(r.name)}</h3>
          <p>${A(r.club||`Sem clube`)} - ${A(r.category||`Sem categoria`)}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${A(i?.category||`Categoria`)}</span>
            <span class="result-pill win">Inscricao confirmada</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${A(r.email||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${A(r.phone||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Clube</span><strong>${A(r.club||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Categoria base</span><strong>${A(r.category||`Nao informada`)}</strong></div>
        <div class="info-card"><span>Categoria no torneio</span><strong>${A(i?.category||`Nao informada`)}</strong></div>
        <div class="info-card"><span>Cadastro</span><strong>${D(r.createdAt)}</strong></div>
      </div>
    </div>
  `,t.style.display=`flex`}function G(){let e=document.getElementById(`tournamentDetailsTitle`),t=document.getElementById(`tournamentDetailsSubtitle`),n=document.getElementById(`tournamentDetailsInfo`),r=document.getElementById(`tournamentDetailsDescription`),i=document.getElementById(`rankingRegistrationsCard`),a=document.getElementById(`tournamentDetailsRegistration`),o=v;if(!e||!t||!n||!r||!i||!a||!o)return;e.textContent=o.title,t.textContent=`${o.location||`Local a definir`} - confira as informações antes de seguir para a inscrição.`,n.innerHTML=`
    <div class="info-card"><span>Tipo</span><strong>${h(o)===`ranking`?`Ranking`:`Campeonato`}</strong></div>
    <div class="info-card"><span>Data</span><strong>${O(o.startDate,o.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${o.location||`Local a definir`}</strong></div>
    <div class="info-card"><span>Status</span><strong>${o.status===`finished`?`Finalizado`:z(o)?`Inscrições encerradas`:`Inscrições abertas`}</strong></div>
  `,r.innerHTML=`<p>${o.description||`Texto do torneio ainda não definido. Depois você pode editar essa apresentação no cadastro do torneio.`}</p>`,d(o)?(i.style.display=`block`,V(),H(),U()):i.style.display=`none`;let s=E(o,_?.category).some(e=>!u(o,y,e)),c=b===`approved`?`Inscrito`:b===`pending_payment`?`Pagamento em análise`:s?`Inscreva-se`:`Categoria lotada`,l=!!(o.pixKey&&o.pixHolder);a.innerHTML=`
    <div class="stack-item tournament-registration-panel">
      <div class="stack-item-header">
        <div>
          <strong>${c}</strong>
          <span>${d(o)?`Inscrição do ranking com categoria, prazo, pagamento e status atual.`:`Confira as regras da inscrição antes de concluir sua vaga.`}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Valor: ${R(o)}</span>
        <span>Inscrições até: ${D(o.registrationDeadline)}</span>
        <span>Pix: ${l?`Disponível`:`Ainda não configurado`}</span>
        <span>Favorecido: ${o.pixHolder||`Não informado`}</span>
        <span>Chave Pix: ${o.pixKey||`Não informada`}</span>
        <span>Forma de pagamento: apenas Pix</span>
        <span>Status da inscrição: ${b===`pending_payment`?`pendente de aprovação`:b===`approved`?`aprovada`:`não enviada`}</span>
      </div>
      <div class="schema-note registration-note">
        <p>${d(o)?`Cada atleta joga contra todos da mesma categoria e não há repetição de confronto. Se entrar um novo inscrito depois, apenas os duelos inéditos voltam para a fila.`:`Selecione as categorias permitidas para o seu perfil e conclua a inscrição via Pix.`}</p>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${b?`disabled`:``}
          ${z(o)||!s?`disabled`:``}
        >
          ${c}
        </button>
      </div>
    </div>
  `}async function K(e){if(!g){window.location.replace(`/pages/profile.html`);return}let[o,s,c,l]=await Promise.all([r(a(i,`users`,e)),r(a(i,`tournaments`,g)),t(n(i,`tournaments`,g,`registrations`)),r(a(i,`users`,e,`registrations`,g))]);if(!o.exists()||!s.exists()){window.location.replace(`/pages/profile.html`);return}_={id:o.id,...o.data()},v={id:s.id,...s.data()},y=c.docs.map(e=>({id:e.id,...e.data()})),b=l.exists()?l.data().paymentStatus:null,l.exists()&&l.data().paymentMethod;let u=y.filter(e=>e.paymentStatus===`approved`),d=await Promise.all(u.map(async e=>{let t=await r(a(i,`users`,e.id));return t.exists()?{id:t.id,...t.data()}:null}));S=new Map(d.filter(Boolean).map(e=>[e.id,e])),G()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.closeRegistrationModal=()=>{let e=document.getElementById(`registrationModal`);e&&(e.style.display=`none`)},window.openRegisteredAthleteProfile=e=>{W(e)},window.closeRegisteredAthleteProfileModal=()=>{let e=document.getElementById(`registeredAthleteProfileModal`);e&&(e.style.display=`none`)},window.filterRankingRegistrations=()=>{x=document.getElementById(`rankingRegistrationsSearch`)?.value.trim().toLowerCase()??``,V()},window.openTournamentResultsModal=e=>{U(e??C??void 0);let t=document.getElementById(`tournamentResultsModal`);t&&(t.style.display=`flex`)},window.setTournamentResultsGroup=e=>{w=null,U(e)},window.toggleTournamentResultsExpanded=e=>{let t=e;w=w===t?null:t,U(t)},window.closeTournamentResultsModal=()=>{let e=document.getElementById(`tournamentResultsModal`);e&&(e.style.display=`none`)},window.startRegistrationFlow=()=>{!v||b||B()},window.confirmTournamentRegistration=async e=>{let t=v,n=_;if(!t||!n)return;let r=T();if(!r.length){c(`Escolha pelo menos uma categoria para concluir a inscrição.`,`warning`);return}if(!d(t)&&!p(n.category,r)){c(`Sua seleção de categorias não é válida para o Campeonato.`,`warning`);return}if(r.some(e=>u(t,y,e))){c(`Uma das categorias selecionadas já atingiu o limite de inscritos.`,`warning`);return}if(!t.pixKey||!t.pixHolder){c(`Este torneio ainda não está configurado para pagamento Pix.`,`warning`);return}window.closeRegistrationModal();let i=encodeURIComponent(r.join(`,`));window.location.href=`/pages/payment-pix.html?tournamentId=${encodeURIComponent(t.id)}&categories=${i}`},window.logout=async()=>{await s(o),window.location.replace(`/pages/login.html`)},e(o,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await K(e.uid)}catch(e){console.error(`Erro ao carregar detalhes do torneio:`,e),redirectWithToast(`/pages/profile.html`,`Não foi possível carregar os detalhes do torneio agora.`,`error`),window.location.replace(`/pages/profile.html`)}});