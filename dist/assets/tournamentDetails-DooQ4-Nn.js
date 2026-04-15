import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";import{n as l,t as u}from"./toast-kV3jSCF7.js";/* empty css               */import{a as d,d as f,f as p,i as m,l as h,n as g,p as _,r as v,u as y}from"./tournament-rules-D9Tq3W95.js";var b=new URLSearchParams(window.location.search).get(`id`),x=null,S=null,C=[],w=null,T=null;function E(){return Array.from(document.querySelectorAll(`input[name="registrationCategory"]:checked`)).map(e=>e.value.trim()).filter(Boolean)}function D(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function O(e,t){return e?!t||t===e?D(e):`${D(e)} até ${D(t)}`:`Não informado`}function k(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function A(e){return p(e)||e.doubleRegistrationFee===void 0?k(e.registrationFee):`${k(e.registrationFee)} (1 cat.) / ${k(e.doubleRegistrationFee)} (2 cats.)`}function j(e){return e.status===`finished`||e.status===`closed`?!0:e.status===`open`?!1:!!(e.registrationDeadline&&e.registrationDeadline<Date.now())}function M(){let e=document.getElementById(`registrationModal`),t=document.getElementById(`registrationModalText`),n=document.getElementById(`registrationCategoryOptions`),r=S;if(!e||!t||!n||!r)return;let i=v(r,x?.category);if(!i.length){l(`Sua categoria atual não permite inscrição neste torneio.`,`warning`);return}t.textContent=p(r)?`Escolha a categoria do ranking para se inscrever em ${r.title}.`:`Escolha uma ou duas categorias para se inscrever em ${r.title}.`,n.innerHTML=i.map((e,t)=>{let n=f(r,C,e),i=d(C,e),a=m(r,e);return`
        <label class="checkbox-option registration-option">
          <input type="${p(r)?`radio`:`checkbox`}" name="registrationCategory" value="${e}" ${t===0&&!n?`checked`:``} ${n?`disabled`:``}>
          <span>${e}${a?` (${i}/${a})`:``}${n?` - lotada`:``}</span>
        </label>
      `}).join(``),e.style.display=`flex`}function N(){let e=document.getElementById(`tournamentDetailsTitle`),t=document.getElementById(`tournamentDetailsSubtitle`),n=document.getElementById(`tournamentDetailsInfo`),r=document.getElementById(`tournamentDetailsDescription`),i=document.getElementById(`rankingRegistrationsCard`),a=document.getElementById(`rankingRegistrationsList`),o=document.getElementById(`tournamentDetailsRegistration`),s=S;if(!e||!t||!n||!r||!i||!a||!o||!s)return;e.textContent=s.title,t.textContent=`${s.location||`Local a definir`} - confira as informações antes de seguir para a inscrição.`,n.innerHTML=`
    <div class="info-card"><span>Tipo</span><strong>${y(s)===`ranking`?`Ranking`:`Campeonato`}</strong></div>
    <div class="info-card"><span>Data</span><strong>${O(s.startDate,s.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${s.location||`Local a definir`}</strong></div>
    <div class="info-card"><span>Inscrições até</span><strong>${D(s.registrationDeadline)}</strong></div>
    <div class="info-card"><span>Valor</span><strong>${A(s)}</strong></div>
    <div class="info-card"><span>Status</span><strong>${j(s)?`Inscrições encerradas`:`Inscrições abertas`}</strong></div>
  `,r.innerHTML=`<p>${s.description||`Texto do torneio ainda não definido. Depois você pode editar essa apresentação no cadastro do torneio.`}</p>`,p(s)?(i.style.display=`block`,a.innerHTML=C.length?[...C].filter(e=>e.paymentStatus===`approved`).sort((e,t)=>e.name.localeCompare(t.name)).map(e=>`
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${e.name}</strong>
                    <span>${e.club||`Sem clube`}</span>
                  </div>
                  <span class="result-pill win">${e.category||`Categoria`}</span>
                </div>
              </div>
            `).join(``):`<div class="empty-state">Ainda não há inscritos confirmados neste ranking.</div>`):i.style.display=`none`;let c=v(s,x?.category).some(e=>!f(s,C,e)),l=w===`approved`?`Inscrito`:w===`pending_payment`?T===`pay_on_day`?`Pagar no dia - pendente`:`Pagamento em análise`:c?`Inscreva-se`:`Categoria lotada`,u=!!(s.pixKey&&s.pixHolder);o.innerHTML=`
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${l}</strong>
          <span>${p(s)?`Ranking com visão completa dos inscritos e das informações do evento.`:`Campeonato com informações gerais antes de seguir para a inscrição.`}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Valor: ${A(s)}</span>
        <span>Pix: ${u?`Disponível`:`Ainda não configurado`}</span>
        <span>Favorecido: ${s.pixHolder||`Não informado`}</span>
        <span>Pagamento no dia: disponível</span>
        <span>Status da inscrição: ${w===`pending_payment`?`pendente de aprovação`:w===`approved`?`aprovada`:`não enviada`}</span>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${w?`disabled`:``}
          ${j(s)||!c?`disabled`:``}
        >
          ${l}
        </button>
      </div>
    </div>
  `}async function P(e){if(!b){window.location.replace(`/pages/profile.html`);return}let[n,s,c,l]=await Promise.all([i(o(a,`users`,e)),i(o(a,`tournaments`,b)),t(r(a,`tournaments`,b,`registrations`)),i(o(a,`users`,e,`registrations`,b))]);if(!n.exists()||!s.exists()){window.location.replace(`/pages/profile.html`);return}x={id:n.id,...n.data()},S={id:s.id,...s.data()},C=c.docs.map(e=>({id:e.id,...e.data()})),w=l.exists()?l.data().paymentStatus:null,T=l.exists()?l.data().paymentMethod??null:null,N()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.closeRegistrationModal=()=>{let e=document.getElementById(`registrationModal`);e&&(e.style.display=`none`)},window.startRegistrationFlow=()=>{!S||w||M()};async function F(e,t){let r=S,i=x;if(!r||!i)return;if(t.some(e=>f(r,C,e)))throw Error(`Uma das categorias selecionadas atingiu o limite de inscritos.`);let s=g(t),c=h(r,t),l=Date.now(),u={id:i.id,uid:i.id,name:i.name,email:i.email,club:i.club,category:s,categories:t,registrationFee:c,paymentStatus:`pending_payment`,paymentMethod:e,registeredAt:l,status:`registered`},d={id:r.id,tournamentId:r.id,title:r.title,location:r.location??``,category:s,categories:t,registrationFee:c,paymentStatus:`pending_payment`,paymentMethod:e,startDate:r.startDate,endDate:r.endDate,registrationDeadline:r.registrationDeadline,registeredAt:l,status:`registered`},p=n(a);p.set(o(a,`tournaments`,r.id,`registrations`,i.id),u),p.set(o(a,`users`,i.id,`registrations`,r.id),d),await p.commit()}window.confirmTournamentRegistration=async e=>{let t=S,n=x;if(!t||!n)return;let r=E();if(!r.length){l(`Escolha pelo menos uma categoria para concluir a inscrição.`,`warning`);return}if(!p(t)&&!_(n.category,r)){l(`Sua seleção de categorias não é válida para o Campeonato.`,`warning`);return}if(r.some(e=>f(t,C,e))){l(`Uma das categorias selecionadas já atingiu o limite de inscritos.`,`warning`);return}if(e===`pix`){if(!t.pixKey||!t.pixHolder){l(`Este torneio ainda não está configurado para pagamento Pix.`,`warning`);return}window.closeRegistrationModal();let e=encodeURIComponent(r.join(`,`));window.location.href=`/pages/payment-pix.html?tournamentId=${encodeURIComponent(t.id)}&categories=${e}`;return}try{await F(`pay_on_day`,r),window.closeRegistrationModal(),u(`/pages/profile.html`,`Inscrição registrada com pagamento no dia. Ela ficará pendente de aprovação pela organização.`,`success`),window.location.replace(`/pages/profile.html`)}catch(e){l(`Erro ao registrar inscrição: `+e.message,`error`)}},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await P(e.uid)}catch(e){console.error(`Erro ao carregar detalhes do torneio:`,e),u(`/pages/profile.html`,`Não foi possível carregar os detalhes do torneio agora.`,`error`),window.location.replace(`/pages/profile.html`)}});