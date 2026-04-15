import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";/* empty css               */import{c as l,l as u,n as d,r as f,s as p,u as m}from"./tournament-rules-DUbpQbwy.js";var h=new URLSearchParams(window.location.search).get(`id`),g=null,_=null,v=[],y=null,b=null;function x(){return Array.from(document.querySelectorAll(`input[name="registrationCategory"]:checked`)).map(e=>e.value.trim()).filter(Boolean)}function S(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function C(e,t){return e?!t||t===e?S(e):`${S(e)} ate ${S(t)}`:`Não informado`}function w(e){return e===void 0?`Não informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e)}function T(e){return e.status===`finished`||e.status===`closed`?!0:e.status===`open`?!1:!!(e.registrationDeadline&&e.registrationDeadline<Date.now())}function E(){let e=document.getElementById(`registrationModal`),t=document.getElementById(`registrationModalText`),n=document.getElementById(`registrationCategoryOptions`);if(!e||!t||!n||!_)return;let r=f(_,g?.category);if(!r.length){alert(`Sua categoria atual não permite inscrição neste torneio.`);return}t.textContent=u(_)?`Escolha a categoria do ranking para se inscrever em ${_.title}.`:`Escolha uma ou duas categorias para se inscrever em ${_.title}.`,n.innerHTML=r.map((e,t)=>`
        <label class="checkbox-option registration-option">
          <input type="${u(_)?`radio`:`checkbox`}" name="registrationCategory" value="${e}" ${t===0?`checked`:``}>
          <span>${e}</span>
        </label>
      `).join(``),e.style.display=`flex`}function D(){let e=document.getElementById(`tournamentDetailsTitle`),t=document.getElementById(`tournamentDetailsSubtitle`),n=document.getElementById(`tournamentDetailsInfo`),r=document.getElementById(`tournamentDetailsDescription`),i=document.getElementById(`rankingRegistrationsCard`),a=document.getElementById(`rankingRegistrationsList`),o=document.getElementById(`tournamentDetailsRegistration`);if(!e||!t||!n||!r||!i||!a||!o||!_)return;e.textContent=_.title,t.textContent=`${_.location||`Local a definir`} - confira as informacoes antes de seguir para a inscrição.`,n.innerHTML=`
    <div class="info-card"><span>Tipo</span><strong>${l(_)===`ranking`?`Ranking`:`Campeonato`}</strong></div>
    <div class="info-card"><span>Data</span><strong>${C(_.startDate,_.endDate)}</strong></div>
    <div class="info-card"><span>Local</span><strong>${_.location||`Local a definir`}</strong></div>
    <div class="info-card"><span>Inscricoes ate</span><strong>${S(_.registrationDeadline)}</strong></div>
    <div class="info-card"><span>Valor</span><strong>${w(_.registrationFee)}</strong></div>
    <div class="info-card"><span>Status</span><strong>${T(_)?`Inscricoes encerradas`:`Inscricoes abertas`}</strong></div>
  `,r.innerHTML=`<p>${_.description||`Texto do torneio ainda não definido. Depois você pode editar essa apresentacao no cadastro do torneio.`}</p>`,u(_)?(i.style.display=`block`,a.innerHTML=v.length?[...v].filter(e=>e.paymentStatus===`approved`).sort((e,t)=>e.name.localeCompare(t.name)).map(e=>`
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${e.name}</strong>
                    <span>${e.club||`Sem clube`}</span>
                  </div>
                  <span class="result-pill win">${e.category||`Categoria`}</span>
                </div>
              </div>
            `).join(``):`<div class="empty-state">Ainda não há inscritos confirmados neste ranking.</div>`):i.style.display=`none`;let s=y===`approved`?`Inscrito`:y===`pending_payment`?b===`pay_on_day`?`Pagar no dia - pendente`:`Pagamento em analise`:`Inscreva-se`,c=!!(_.pixKey&&_.pixHolder);o.innerHTML=`
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>${s}</strong>
          <span>${u(_)?`Ranking com visao completa dos inscritos e das informacoes do evento.`:`Campeonato com informacoes gerais antes de seguir para a inscrição.`}</span>
        </div>
      </div>
      <div class="stack-item-grid">
        <span>Pix: ${c?`Disponivel`:`Ainda não configurado`}</span>
        <span>Favorecido: ${_.pixHolder||`Não informado`}</span>
        <span>Pagamento no dia: disponivel</span>
        <span>Status da inscrição: ${y===`pending_payment`?`pendente de aprovacao`:y===`approved`?`aprovada`:`não enviada`}</span>
      </div>
      <div class="admin-tournament-actions">
        <button
          class="btn primary"
          onclick="startRegistrationFlow()"
          ${y?`disabled`:``}
          ${T(_)?`disabled`:``}
        >
          ${s}
        </button>
      </div>
    </div>
  `}async function O(e){if(!h){window.location.replace(`/pages/profile.html`);return}let[n,s,c,l]=await Promise.all([i(o(a,`users`,e)),i(o(a,`tournaments`,h)),t(r(a,`tournaments`,h,`registrations`)),i(o(a,`users`,e,`registrations`,h))]);if(!n.exists()||!s.exists()){window.location.replace(`/pages/profile.html`);return}g={id:n.id,...n.data()},_={id:s.id,...s.data()},v=c.docs.map(e=>({id:e.id,...e.data()})),y=l.exists()?l.data().paymentStatus:null,b=l.exists()?l.data().paymentMethod??null:null,D()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.closeRegistrationModal=()=>{let e=document.getElementById(`registrationModal`);e&&(e.style.display=`none`)},window.startRegistrationFlow=()=>{_&&(y||E())};async function k(e,t){if(!_||!g)return;let r=d(t),i=p(_,t),s=Date.now(),c={id:g.id,uid:g.id,name:g.name,email:g.email,club:g.club,category:r,categories:t,registrationFee:i,paymentStatus:`pending_payment`,paymentMethod:e,registeredAt:s,status:`registered`},l={id:_.id,tournamentId:_.id,title:_.title,location:_.location??``,category:r,categories:t,registrationFee:i,paymentStatus:`pending_payment`,paymentMethod:e,startDate:_.startDate,endDate:_.endDate,registrationDeadline:_.registrationDeadline,registeredAt:s,status:`registered`},u=n(a);u.set(o(a,`tournaments`,_.id,`registrations`,g.id),c),u.set(o(a,`users`,g.id,`registrations`,_.id),l),await u.commit()}window.confirmTournamentRegistration=async e=>{if(!_||!g)return;let t=x();if(!t.length){alert(`Escolha pelo menos uma categoria para concluir a inscrição.`);return}if(!u(_)&&!m(g.category,t)){alert(`Sua selecao de categorias não e válida para o Campeonato.`);return}if(e===`pix`){if(!_.pixKey||!_.pixHolder){alert(`Este torneio ainda não esta configurado para pagamento Pix.`);return}window.closeRegistrationModal();let e=encodeURIComponent(t.join(`,`));window.location.href=`/pages/payment-pix.html?tournamentId=${encodeURIComponent(_.id)}&categories=${e}`;return}try{await k(`pay_on_day`,t),window.closeRegistrationModal(),alert(`Inscricao registrada com pagamento no dia. Ela ficara pendente de aprovacao pela organizacao.`),window.location.href=`/pages/profile.html`}catch(e){alert(`Erro ao registrar inscrição: `+e.message)}},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await O(e.uid)}catch(e){console.error(`Erro ao carregar detalhes do torneio:`,e),alert(`Não foi possível carregar os detalhes do torneio agora.`),window.location.replace(`/pages/profile.html`)}});