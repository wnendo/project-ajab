import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,c as n,d as r,f as i,i as a,l as o,n as s,p as c,t as l,x as u}from"./firebase-VBRKn9At.js";import{n as d}from"./toast-kV3jSCF7.js";/* empty css               */import{a as f,i as p,l as ee,n as te,t as m,u as h}from"./tournament-rules-D9Tq3W95.js";var g=new URLSearchParams(window.location.search).get(`id`),_=!1,v=null,y=[],b=[],x=null;function S(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category||`Sem categoria`}</span>
  `)}function C(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function w(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function T(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>w(e)).filter(Boolean))]}function E(){if(!v?.categories?.length)return m;let e=v.categories.map(e=>w(e)).filter(Boolean);return e.length?e:m}function D(){return y.filter(e=>e.paymentStatus===`approved`)}function O(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function k(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function A(e){return y.find(t=>t.id===e||t.uid===e)??null}function ne(){return E()}function j(e){if(!v)return!1;let t=p(v,e);return t?f(y,e)>=t:!1}function M(e=``){let t=O(e);return b.filter(e=>e.profileComplete&&(e.role===`user`||e.role===`admin`)).filter(e=>t?[e.name,e.email,e.club,e.category].some(e=>O(e).includes(t)):!0).map(e=>({user:e,registration:A(e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function N(e){let t=document.getElementById(`championshipManualCategory`);!t||!v||(t.innerHTML=ne().map(t=>{let n=f(y,t),r=p(v,t),i=!!(r&&n>=r),a=(e||``)===t;return`<option value="${t}" ${a?`selected`:``} ${i&&!a?`disabled`:``}>${k(t)}${r?` (${n}/${r})`:``}${i&&!a?` - lotada`:``}</option>`}).join(``))}function P(){let e=document.getElementById(`selectedChampionshipAthleteSummary`);if(!e)return;let t=x?M().find(e=>e.user.id===x):null;if(!t){e.className=`add-athlete-summary empty`,e.textContent=`Nenhum atleta selecionado ainda.`,N();return}e.className=`add-athlete-summary`,e.innerHTML=`
    <strong>${k(t.user.name)}</strong>
    <span>${k(t.user.club||`Sem clube`)} - ${k(t.user.category||`Sem categoria`)}</span>
    <small>${t.registration?`Status atual: ${t.registration.paymentStatus===`approved`?`inscricao aprovada`:`pagamento pendente`}`:`Sem inscricao neste campeonato`}</small>
  `,N(t.registration?.category)}function F(e=``){let t=document.getElementById(`championshipAthleteSearchResults`),n=document.getElementById(`championshipAthleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=M(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado com esse filtro.`:n.textContent=`Digite para localizar um atleta ja cadastrado.`,t.innerHTML=i.length?i.map(e=>{let t=e.registration?e.registration.paymentStatus===`approved`?`Inscrito`:`Pendente`:`Disponivel`;return`
            <button type="button" class="athlete-search-item ${x===e.user.id?`active`:``}" onclick="selectChampionshipAthleteCandidate('${e.user.id}')">
              <div class="athlete-search-copy">
                <strong>${k(e.user.name)}</strong>
                <span>${k(e.user.club||`Sem clube`)} - ${k(e.user.category||`Sem categoria`)}</span>
              </div>
              <span class="result-pill ${e.registration?.paymentStatus===`approved`?`win`:`neutral`}">${t}</span>
            </button>
          `}).join(``):`<div class="empty-state">Nenhum atleta encontrado.</div>`}function I(e){return D().filter(t=>T(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function L(e){if(!v)return{count:0,limit:void 0,remaining:void 0,label:`Sem limite`};let t=f(y,e),n=p(v,e);return{count:t,limit:n,remaining:typeof n==`number`?Math.max(0,n-t):void 0,label:typeof n==`number`?`${t}/${n}`:`${t} inscritos`}}function R(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function z(e){let t=v?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:R(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function re(e,t){return I(e).find(e=>e.id===t)?.name||`Atleta`}function ie(e){return e===0?`1° lugar`:e===1?`2° lugar`:e===2?`3° lugar`:`4° lugar`}function B(e){return e===0?`podium-gold`:e===1?`podium-silver`:`podium-bronze`}function V(e){return Math.max(2,z(e).groupSize??3)}function H(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function U(e,t){if(e<=0)return[];let n=Math.max(1,Math.ceil(e/t)),r=Math.floor(e/n),i=e%n;return Array.from({length:n},(e,t)=>r+ +(t<i)).filter(e=>e>0)}function W(e,t){let n=new Map(I(t).map(e=>[e.id,e]));return e.playerIds.map(e=>n.get(e)).filter(Boolean)}async function G(e,t){if(!v)return;let n=z(e),r=Math.max(1,t.tableCount??n.tableCount??1),i={...n,...t,tableCount:r,activeTables:R(t.activeTables??n.activeTables,r)};v.championshipState={...v.championshipState,[e]:i},await o(c(s,`tournaments`,v.id),{championshipState:v.championshipState,updatedAt:Date.now()})}async function K(){if(!g){window.location.replace(`/pages/dashboard.html`);return}let e=await a(c(s,`tournaments`,g));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}if(v={id:e.id,...e.data()},h(v)!==`championship`){window.location.replace(`/pages/tournament-manage.html?id=${e.id}`);return}}async function q(){if(!v){y=[];return}y=(await t(i(s,`tournaments`,v.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))}async function J(){b=(await t(i(s,`users`))).docs.map(e=>({id:e.id,...e.data()})).sort((e,t)=>e.name.localeCompare(t.name))}function ae(){document.getElementById(`championshipTitle`).textContent=v?.title||`Campeonato`,document.getElementById(`championshipSubtitle`).textContent=`${v?.location||`Local a definir`} - faca o sorteio por categoria e entre na pagina da categoria para operar jogos, mesas e mata-mata.`,document.getElementById(`championshipStatus`).textContent=v?.status===`finished`?`Finalizado`:v?.status===`open`?`Em andamento`:`Preparação`,document.getElementById(`championshipCategories`).textContent=te(E()),document.getElementById(`championshipApprovedCount`).textContent=String(D().length)}function oe(e){let t=I(e),n=z(e),r=L(e),i=n.groups??[],a=U(t.length,V(e)).length,o=n.finished?`Encerrada`:n.defined?`Em andamento`:i.length?`Grupos prontos`:`Aguardando sorteio`;return`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${e}</span>
          <h2>${t.length} atleta${t.length===1?``:`s`} aprovados</h2>
        </div>
        <div class="championship-category-actions">
          <label class="championship-group-size">
            <span>Jogadores por grupo</span>
            <input id="groupSize_${e}" type="number" min="2" max="6" value="${V(e)}" ${n.defined?`disabled`:``}>
          </label>
          <button class="btn primary" ${n.defined?`disabled`:``} onclick="drawCategoryGroups('${e}')">Sortear grupos</button>
          <button class="btn primary" ${i.length?``:`disabled`} onclick="openCategoryPage('${e}')">${n.defined?`Abrir categoria`:`Abrir pagina da categoria`}</button>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card">
          <span>Grupos previstos</span>
          <strong>${i.length||a||0}</strong>
        </div>
        <div class="info-card">
          <span>Classificados</span>
          <strong>${i.length?i.length*2:Math.max(0,a*2)}</strong>
        </div>
        <div class="info-card">
          <span>Status</span>
          <strong>${o}</strong>
        </div>
        <div class="info-card">
          <span>Vagas</span>
          <strong>${r.limit?`${r.remaining} restantes`:`Sem limite`}</strong>
          <small>${r.label}</small>
        </div>
      </div>

      <details class="championship-block championship-collapse" ${i.length?`open`:``}>
        <summary class="championship-collapse-summary">
          <div class="championship-block-head">
            <h3>Grupos sorteados</h3>
            <p>${i.length?n.defined?`A categoria ja foi iniciada. A configuração desta pagina ficou travada e a operação segue dentro da pagina da categoria.`:`Ao abrir a pagina da categoria, esta configuração fica travada e a operação segue por la.`:`Defina o tamanho dos grupos e sorteie a categoria para montar os confrontos.`}</p>
          </div>
        </summary>
        <div class="championship-collapse-content">
          ${i.length?`
                <div class="championship-groups-grid">
                  ${i.map(t=>{let n=W(t,e);return`
                        <article class="championship-group-card">
                          <div class="championship-group-card-head">
                            <strong>${t.name}</strong>
                            <span>${n.length} atleta${n.length===1?``:`s`}</span>
                          </div>
                          <div class="championship-player-list">
                            ${n.map((e,t)=>`
                                  <div class="championship-player-row">
                                    <span>${t+1}.</span>
                                    <strong>${e.name}</strong>
                                    <small>${e.club||`Sem clube`}</small>
                                  </div>
                                `).join(``)}
                          </div>
                        </article>
                      `}).join(``)}
                </div>
              `:`<div class="empty-state">Nenhum grupo sorteado ainda para esta categoria.</div>`}
        </div>
      </details>
      ${n.finalStandings?.length?`
            <details class="championship-block championship-manage-finals championship-collapse" open>
              <summary class="championship-collapse-summary">
                <div class="championship-block-head">
                  <h3>Classificação final</h3>
                  <p>Resumo final da categoria.</p>
                </div>
              </summary>
              <div class="championship-collapse-content">
                <div class="stack-list compact-stack-list">
                  ${n.finalStandings.slice(0,4).map((t,n)=>`
                    <div class="stack-item compact-stack-item">
                      <div class="stack-item-header">
                        <div>
                          <strong>${re(e,t)}</strong>
                        </div>
                        <span class="result-pill ${B(n)}">${ie(n)}</span>
                      </div>
                    </div>
                  `).join(``)}
                </div>
              </div>
            </details>
          `:``}
    </article>
  `}function Y(){ae();let e=document.getElementById(`championshipCategoriesGrid`);e&&(e.innerHTML=E().map(e=>oe(e)).join(``))}function se(){let e=document.getElementById(`addChampionshipAthleteModal`),t=document.getElementById(`championshipAthleteSearch`);if(!e)return;x=null,t&&(t.value=``),[`newChampionshipAthleteName`,`newChampionshipAthleteEmail`,`newChampionshipAthletePhone`,`newChampionshipAthleteClub`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)});let n=document.getElementById(`championshipManualPayment`),r=document.getElementById(`newChampionshipAthleteBaseCategory`);n&&(n.value=`approved`),r&&(r.value=`A`),N(),P(),F(),e.style.display=`flex`}function X(){let e=document.getElementById(`addChampionshipAthleteModal`);e&&(x=null,e.style.display=`none`)}function Z(){return document.getElementById(`championshipManualPayment`)?.value===`pending_payment`?`pending_payment`:`approved`}function Q(){return document.getElementById(`championshipManualCategory`)?.value}function ce(e,t,n){let r=v;if(!r)throw Error(`Campeonato nao carregado.`);let i=Date.now(),a=ee(r,[t]),o=n===`approved`?`pix`:`pay_on_day`;return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:t,categories:[t],registrationFee:a,paymentStatus:n,paymentMethod:o,registeredAt:i,status:`registered`},userRegistrationPayload:{id:r.id,tournamentId:r.id,title:r.title,location:r.location??``,category:t,categories:[t],registrationFee:a,paymentStatus:n,paymentMethod:o,startDate:r.startDate,endDate:r.endDate,registrationDeadline:r.registrationDeadline,registeredAt:i,status:`registered`}}}async function $(e,t,n){if(!v)return;let i=r(s),{registrationPayload:a,userRegistrationPayload:o}=ce(e,t,n);i.set(c(s,`tournaments`,v.id,`registrations`,e.id),a),i.set(c(s,`users`,e.id,`registrations`,v.id),o),await i.commit()}async function le(){let e=document.getElementById(`newChampionshipAthleteName`)?.value.trim()||``,t=document.getElementById(`newChampionshipAthleteEmail`)?.value.trim()||``,r=document.getElementById(`newChampionshipAthletePhone`)?.value.trim()||``,a=document.getElementById(`newChampionshipAthleteClub`)?.value.trim()||``,o=document.getElementById(`newChampionshipAthleteBaseCategory`)?.value||``;if(!e||!o)throw Error(`Informe pelo menos nome e categoria base para cadastrar o atleta.`);let l=c(i(s,`users`)),u=Date.now(),d={id:l.id,name:e,email:t,phone:r,club:a,category:o,role:`user`,createdAt:u,updatedAt:u,profileComplete:!0,playerProfile:{wins:0,losses:0,games:0,active:!1,createdAt:u}};return await n(l,d),b=[...b,d].sort((e,t)=>e.name.localeCompare(t.name)),d}window.drawCategoryGroups=async e=>{if(z(e).defined){d(`Esta categoria ja foi iniciada e nao pode mais sortear grupos nesta pagina.`,`warning`);return}let t=I(e),n=Math.max(2,Number(document.getElementById(`groupSize_${e}`)?.value||V(e)));if(!t.length){d(`Nao ha atletas aprovados nesta categoria para montar grupos.`,`warning`);return}let r=H(t),i=U(r.length,n),a=[],o=0;i.forEach((t,n)=>{a.push({id:`${e}-${n+1}`,name:`Grupo ${n+1}`,playerIds:r.slice(o,o+t).map(e=>e.id)}),o+=t});try{await G(e,{groupSize:n,groups:a,defined:!1,started:!1,queue:[],completedMatches:[],activeTables:R([],z(e).tableCount??1)}),Y()}catch(e){d(`Erro ao sortear grupos: `+e.message,`error`)}},window.openCategoryPage=async e=>{if(!v)return;let t=z(e);if(!t.groups?.length){d(`Sorteie os grupos antes de abrir a categoria.`,`warning`);return}try{t.defined||await G(e,{defined:!0}),window.location.href=`/pages/championship-category.html?id=${v.id}&category=${encodeURIComponent(e)}`}catch(e){d(`Erro ao iniciar categoria: `+e.message,`error`)}},window.openAddChampionshipAthleteModal=()=>{se()},window.closeAddChampionshipAthleteModal=()=>{X()},window.filterChampionshipAthletes=()=>{F(document.getElementById(`championshipAthleteSearch`)?.value??``)},window.selectChampionshipAthleteCandidate=e=>{x=e,P(),F(document.getElementById(`championshipAthleteSearch`)?.value??``)},window.submitExistingChampionshipAthlete=async()=>{if(!x){d(`Selecione um atleta existente antes de adicionar.`,`warning`);return}let e=b.find(e=>e.id===x),t=Q(),n=Z();if(!e||!t){d(`Selecione o atleta e a categoria do campeonato.`,`warning`);return}if(A(e.id)){d(`Esse atleta ja possui inscricao neste campeonato.`,`warning`);return}if(j(t)){d(`Essa categoria ja atingiu o limite de inscritos.`,`warning`);return}try{await $(e,t,n),await q(),Y(),X();let r=z(t).groups?.length?` Refaça a distribuicao da categoria se os grupos ja estavam sorteados.`:``;d(`${n===`approved`?`Atleta inscrito com sucesso.`:`Atleta adicionado com pagamento pendente.`}${r}`,`success`)}catch(e){d(`Erro ao adicionar atleta: `+e.message,`error`)}},window.createAndAddChampionshipAthlete=async()=>{let e=Q(),t=Z();if(!e){d(`Selecione a categoria do campeonato antes de cadastrar.`,`warning`);return}if(j(e)){d(`Essa categoria ja atingiu o limite de inscritos.`,`warning`);return}try{await $(await le(),e,t),await J(),await q(),Y(),X();let n=z(e).groups?.length?` Refaça a distribuicao da categoria se os grupos ja estavam sorteados.`:``;d(`${t===`approved`?`Novo atleta cadastrado e inscrito.`:`Novo atleta cadastrado com pagamento pendente.`}${n}`,`success`)}catch(e){d(`Erro ao cadastrar atleta: `+e.message,`error`)}},window.openTournamentRegistrations=()=>{v&&(window.location.href=`/pages/tournament-registrations.html?id=${v.id}`)},window.editCurrentTournament=()=>{v&&(window.location.href=`/pages/tournament-form.html?id=${v.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await u(l),window.location.replace(`/pages/login.html`)},e(l,async e=>{if(_)return;if(_=!0,!e){window.location.replace(`/pages/login.html`);return}let t=C((await a(c(s,`users`,e.uid))).data());t&&(S(t),await K(),await J(),await q(),Y())});