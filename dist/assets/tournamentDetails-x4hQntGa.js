import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";import{n as l,t as u}from"./toast-kV3jSCF7.js";/* empty css               */import{a as d,d as f,f as p,i as m,l as h,n as g,p as _,r as v,u as y}from"./tournament-rules-D9Tq3W95.js";var b=new URLSearchParams(window.location.search).get(`id`),x=null,S=null,C=[],w=null,T=null,E=``,D=new Map;function O(){return Array.from(document.querySelectorAll(`input[name="registrationCategory"]:checked`)).map(e=>e.value.trim()).filter(Boolean)}function k(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function A(e,t){return e?!t||t===e?k(e):`${k(e)} até ${k(t)}`:`Não informado`}function j(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function M(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function N(e){return e.split(` `).filter(Boolean).slice(0,2).map(e=>e[0]?.toUpperCase()??``).join(``)}function P(){return[...C].filter(e=>e.paymentStatus===`approved`).sort((e,t)=>e.name.localeCompare(t.name))}function F(){let e=P();return E?e.filter(e=>[e.name,e.club,e.category,...e.categories??[]].filter(Boolean).some(e=>e.toLowerCase().includes(E))):e}function I(e){return Array.from(new Set(e.map(e=>e.group))).map(t=>({group:t,entries:e.filter(e=>e.group===t)}))}function L(e){return`
    <div class="ranking-showcase">
      <div class="ranking-showcase-podium">
        ${e.slice(0,3).map((e,t)=>`
              <article class="ranking-showcase-podium-card place-${t+1}">
                <span class="ranking-showcase-place">${M(e.placement)}</span>
                <strong>${M(e.name)}</strong>
                <small>${M(e.category)}</small>
                <div class="ranking-showcase-score">${e.wins}V - ${e.losses}D - ${e.games} jogos</div>
              </article>
            `).join(``)}
      </div>
      <div class="ranking-showcase-table">
        ${e.map(e=>`
              <div class="ranking-showcase-row">
                <span>${M(e.placement)}</span>
                <strong>${M(e.name)}</strong>
                <small>${M(e.result)}</small>
                <span>${e.wins}V / ${e.losses}D</span>
              </div>
            `).join(``)}
      </div>
    </div>
  `}function R(e){return p(e)||e.doubleRegistrationFee===void 0?j(e.registrationFee):`${j(e.registrationFee)} (1 cat.) / ${j(e.doubleRegistrationFee)} (2 cats.)`}function z(e){return e.status===`finished`||e.status===`closed`?!0:e.status===`open`?!1:!!(e.registrationDeadline&&e.registrationDeadline<Date.now())}function B(){let e=document.getElementById(`registrationModal`),t=document.getElementById(`registrationModalText`),n=document.getElementById(`registrationCategoryOptions`),r=S;if(!e||!t||!n||!r)return;let i=v(r,x?.category);if(!i.length){l(`Sua categoria atual não permite inscrição neste torneio.`,`warning`);return}t.textContent=p(r)?`Escolha a categoria do ranking para se inscrever em ${r.title}.`:`Escolha uma ou duas categorias para se inscrever em ${r.title}.`,n.innerHTML=i.map((e,t)=>{let n=f(r,C,e),i=d(C,e),a=m(r,e);return`
        <label class="checkbox-option registration-option">
          <input type="${p(r)?`radio`:`checkbox`}" name="registrationCategory" value="${e}" ${t===0&&!n?`checked`:``} ${n?`disabled`:``}>
          <span>${e}${a?` (${i}/${a})`:``}${n?` - lotada`:``}</span>
        </label>
      `}).join(``),e.style.display=`flex`}function V(){let e=document.getElementById(`rankingRegistrationsList`),t=document.getElementById(`rankingRegistrationsCount`);if(!e||!t)return;let n=F(),r=P().length;t.textContent=`${n.length} de ${r} atletas`,e.innerHTML=n.length?n.map(e=>`
            <div class="stack-item compact-stack-item ranking-registration-item">
              <div class="stack-item-header">
                <div>
                  <strong>${M(e.name)}</strong>
                  <span>${M(e.club||`Sem clube`)}</span>
                </div>
                <span class="result-pill neutral">${M(e.category||`Categoria`)}</span>
              </div>
              <div class="admin-tournament-actions">
                <button class="btn secondary" onclick="openRegisteredAthleteProfile('${e.id}')">Ver perfil</button>
              </div>
            </div>
          `).join(``):`<div class="empty-state">Nenhum atleta encontrado nesta busca.</div>`}function H(){let e=document.getElementById(`tournamentResultsCard`),t=document.getElementById(`tournamentResultsList`);if(!e||!t||!S?.finalStandings?.length){e&&(e.style.display=`none`);return}e.style.display=`block`,t.innerHTML=I(S.finalStandings).map(({group:e,entries:t})=>`
        <div class="tournament-results-group">
          <div class="section-header compact-section-header">
            <div>
              <span class="section-label">${e===`general`?`Ranking geral`:`Categoria ${e}`}</span>
              <h3>${t[0]?.result||`Classificação final`}</h3>
            </div>
          </div>
          ${L(t)}
        </div>
      `).join(``)}function U(){let e=document.getElementById(`tournamentResultsModalList`);!e||!S?.finalStandings?.length||(e.innerHTML=I(S.finalStandings).map(({group:e,entries:t})=>`
        <section class="final-results-section">
          <div class="final-results-head">
            <span class="section-label">${e===`general`?`Ranking geral`:`Categoria ${e}`}</span>
            <strong>${t.length} atleta${t.length===1?``:`s`}</strong>
          </div>
          ${L(t)}
        </section>
      `).join(``))}function W(e){let t=document.getElementById(`registeredAthleteProfileModal`),n=document.getElementById(`registeredAthleteProfileContent`),r=D.get(e),i=C.find(t=>t.id===e||t.uid===e);if(!t||!n||!r){l(`Nao foi possivel carregar o perfil deste atleta.`,`warning`);return}n.innerHTML=`
    <div class="athlete-profile-card">
      <div class="athlete-profile-head">
        <div class="athlete-profile-avatar-wrap">${r.photoURL?`<img class="profile-avatar" src="${M(r.photoURL)}" alt="Foto de ${M(r.name)}">`:`<div class="profile-avatar profile-avatar-fallback">${M(N(r.name))}</div>`}</div>
        <div class="athlete-profile-copy">
          <h3>${M(r.name)}</h3>
          <p>${M(r.club||`Sem clube`)} - ${M(r.category||`Sem categoria`)}</p>
          <div class="athlete-profile-badges">
            <span class="result-pill neutral">${M(i?.category||`Categoria`)}</span>
            <span class="result-pill win">Inscricao confirmada</span>
          </div>
        </div>
      </div>
      <div class="profile-info-grid athlete-profile-grid">
        <div class="info-card"><span>Email</span><strong>${M(r.email||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Telefone</span><strong>${M(r.phone||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Clube</span><strong>${M(r.club||`Nao informado`)}</strong></div>
        <div class="info-card"><span>Categoria base</span><strong>${M(r.category||`Nao informada`)}</strong></div>
        <div class="info-card"><span>Categoria no torneio</span><strong>${M(i?.category||`Nao informada`)}</strong></div>
        <div class="info-card"><span>Cadastro</span><strong>${k(r.createdAt)}</strong></div>
      </div>
    </div>
  `,t.style.display=`flex`}function G(){let e=document.getElementById(`tournamentDetailsTitle`),t=document.getElementById(`tournamentDetailsSubtitle`),n=document.getElementById(`tournamentDetailsInfo`),r=document.getElementById(`tournamentDetailsDescription`),i=document.getElementById(`rankingRegistrationsCard`),a=document.getElementById(`tournamentDetailsRegistration`),o=S;if(!e||!t||!n||!r||!i||!a||!o)return;e.textContent=o.title,t.textContent=`${o.location||`Local a definir`} - confira as informações antes de seguir para a inscrição.`,n.innerHTML=`
    <div class="info-card"><span>Tipo</span><strong>${y(o)===`ranking`?`Ranking`:`Campeonato`}</strong></div>
    <div class="info-card"><span>Data</span><strong>${A(o.startDate,o.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${o.location||`Local a definir`}</strong></div>
    <div class="info-card"><span>Status</span><strong>${o.status===`finished`?`Finalizado`:z(o)?`Inscrições encerradas`:`Inscrições abertas`}</strong></div>
  `,r.innerHTML=`<p>${o.description||`Texto do torneio ainda não definido. Depois você pode editar essa apresentação no cadastro do torneio.`}</p>`,p(o)?(i.style.display=`block`,V(),H(),U()):i.style.display=`none`;let s=v(o,x?.category).some(e=>!f(o,C,e)),c=w===`approved`?`Inscrito`:w===`pending_payment`?T===`pay_on_day`?`Pagar no dia - pendente`:`Pagamento em análise`:s?`Inscreva-se`:`Categoria lotada`,l=!!(o.pixKey&&o.pixHolder);a.innerHTML=`
    <div class="stack-item tournament-registration-panel">
      <div class="stack-item-header">
        <div>
          <strong>${c}</strong>
          <span>${p(o)?`Inscrição do ranking com categoria, prazo, pagamento e status atual.`:`Confira as regras da inscrição antes de concluir sua vaga.`}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Valor: ${R(o)}</span>
        <span>Inscrições até: ${k(o.registrationDeadline)}</span>
        <span>Pix: ${l?`Disponível`:`Ainda não configurado`}</span>
        <span>Favorecido: ${o.pixHolder||`Não informado`}</span>
        <span>Chave Pix: ${o.pixKey||`Não informada`}</span>
        <span>Pagamento no dia: disponível</span>
        <span>Status da inscrição: ${w===`pending_payment`?`pendente de aprovação`:w===`approved`?`aprovada`:`não enviada`}</span>
      </div>
      <div class="schema-note registration-note">
        <p>${p(o)?`Cada atleta joga contra todos da mesma categoria e não há repetição de confronto. Se entrar um novo inscrito depois, apenas os duelos inéditos voltam para a fila.`:`Selecione as categorias permitidas para o seu perfil e conclua a inscrição pelo método desejado.`}</p>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${w?`disabled`:``}
          ${z(o)||!s?`disabled`:``}
        >
          ${c}
        </button>
      </div>
    </div>
  `}async function K(e){if(!b){window.location.replace(`/pages/profile.html`);return}let[n,s,c,l]=await Promise.all([i(o(a,`users`,e)),i(o(a,`tournaments`,b)),t(r(a,`tournaments`,b,`registrations`)),i(o(a,`users`,e,`registrations`,b))]);if(!n.exists()||!s.exists()){window.location.replace(`/pages/profile.html`);return}x={id:n.id,...n.data()},S={id:s.id,...s.data()},C=c.docs.map(e=>({id:e.id,...e.data()})),w=l.exists()?l.data().paymentStatus:null,T=l.exists()?l.data().paymentMethod??null:null;let u=C.filter(e=>e.paymentStatus===`approved`),d=await Promise.all(u.map(async e=>{let t=await i(o(a,`users`,e.id));return t.exists()?{id:t.id,...t.data()}:null}));D=new Map(d.filter(Boolean).map(e=>[e.id,e])),G()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.closeRegistrationModal=()=>{let e=document.getElementById(`registrationModal`);e&&(e.style.display=`none`)},window.openRegisteredAthleteProfile=e=>{W(e)},window.closeRegisteredAthleteProfileModal=()=>{let e=document.getElementById(`registeredAthleteProfileModal`);e&&(e.style.display=`none`)},window.filterRankingRegistrations=()=>{E=document.getElementById(`rankingRegistrationsSearch`)?.value.trim().toLowerCase()??``,V()},window.openTournamentResultsModal=()=>{U();let e=document.getElementById(`tournamentResultsModal`);e&&(e.style.display=`flex`)},window.closeTournamentResultsModal=()=>{let e=document.getElementById(`tournamentResultsModal`);e&&(e.style.display=`none`)},window.startRegistrationFlow=()=>{!S||w||B()};async function q(e,t){let r=S,i=x;if(!r||!i)return;if(t.some(e=>f(r,C,e)))throw Error(`Uma das categorias selecionadas atingiu o limite de inscritos.`);let s=g(t),c=h(r,t),l=Date.now(),u={id:i.id,uid:i.id,name:i.name,email:i.email,club:i.club,category:s,categories:t,registrationFee:c,paymentStatus:`pending_payment`,paymentMethod:e,registeredAt:l,status:`registered`},d={id:r.id,tournamentId:r.id,title:r.title,location:r.location??``,category:s,categories:t,registrationFee:c,paymentStatus:`pending_payment`,paymentMethod:e,startDate:r.startDate,endDate:r.endDate,registrationDeadline:r.registrationDeadline,registeredAt:l,status:`registered`},p=n(a);p.set(o(a,`tournaments`,r.id,`registrations`,i.id),u),p.set(o(a,`users`,i.id,`registrations`,r.id),d),await p.commit()}window.confirmTournamentRegistration=async e=>{let t=S,n=x;if(!t||!n)return;let r=O();if(!r.length){l(`Escolha pelo menos uma categoria para concluir a inscrição.`,`warning`);return}if(!p(t)&&!_(n.category,r)){l(`Sua seleção de categorias não é válida para o Campeonato.`,`warning`);return}if(r.some(e=>f(t,C,e))){l(`Uma das categorias selecionadas já atingiu o limite de inscritos.`,`warning`);return}if(e===`pix`){if(!t.pixKey||!t.pixHolder){l(`Este torneio ainda não está configurado para pagamento Pix.`,`warning`);return}window.closeRegistrationModal();let e=encodeURIComponent(r.join(`,`));window.location.href=`/pages/payment-pix.html?tournamentId=${encodeURIComponent(t.id)}&categories=${e}`;return}try{await q(`pay_on_day`,r),window.closeRegistrationModal(),u(`/pages/profile.html`,`Inscrição registrada com pagamento no dia. Ela ficará pendente de aprovação pela organização.`,`success`),window.location.replace(`/pages/profile.html`)}catch(e){l(`Erro ao registrar inscrição: `+e.message,`error`)}},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await K(e.uid)}catch(e){console.error(`Erro ao carregar detalhes do torneio:`,e),u(`/pages/profile.html`,`Não foi possível carregar os detalhes do torneio agora.`,`error`),window.location.replace(`/pages/profile.html`)}});