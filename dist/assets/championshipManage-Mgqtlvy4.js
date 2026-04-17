import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,l as i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";import{n as l}from"./toast-kV3jSCF7.js";/* empty css               */import{a as u,i as d,n as f,t as p,u as m}from"./tournament-rules-D9Tq3W95.js";var h=new URLSearchParams(window.location.search).get(`id`),g=!1,_=null,v=[];function y(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category||`Sem categoria`}</span>
  `)}function b(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function x(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function S(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>x(e)).filter(Boolean))]}function C(){if(!_?.categories?.length)return p;let e=_.categories.map(e=>x(e)).filter(Boolean);return e.length?e:p}function w(){return v.filter(e=>e.paymentStatus===`approved`)}function T(e){return w().filter(t=>S(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function E(e){if(!_)return{count:0,limit:void 0,remaining:void 0,label:`Sem limite`};let t=u(v,e),n=d(_,e);return{count:t,limit:n,remaining:typeof n==`number`?Math.max(0,n-t):void 0,label:typeof n==`number`?`${t}/${n}`:`${t} inscritos`}}function D(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function O(e){let t=_?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:D(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function k(e,t){return T(e).find(e=>e.id===t)?.name||`Atleta`}function A(e){return e===0?`1° lugar`:e===1?`2° lugar`:e===2?`3° lugar`:`4° lugar`}function j(e){return e===0?`podium-gold`:e===1?`podium-silver`:`podium-bronze`}function M(e){return Math.max(2,O(e).groupSize??3)}function N(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function P(e,t){if(e<=0)return[];let n=Math.max(1,Math.ceil(e/t)),r=Math.floor(e/n),i=e%n;return Array.from({length:n},(e,t)=>r+ +(t<i)).filter(e=>e>0)}function F(e,t){let n=new Map(T(t).map(e=>[e.id,e]));return e.playerIds.map(e=>n.get(e)).filter(Boolean)}async function I(e,t){if(!_)return;let n=O(e),r=Math.max(1,t.tableCount??n.tableCount??1),s={...n,...t,tableCount:r,activeTables:D(t.activeTables??n.activeTables,r)};_.championshipState={..._.championshipState,[e]:s},await i(o(a,`tournaments`,_.id),{championshipState:_.championshipState,updatedAt:Date.now()})}async function L(){if(!h){window.location.replace(`/pages/dashboard.html`);return}let e=await r(o(a,`tournaments`,h));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}if(_={id:e.id,...e.data()},m(_)!==`championship`){window.location.replace(`/pages/tournament-manage.html?id=${e.id}`);return}}async function R(){if(!_){v=[];return}v=(await t(n(a,`tournaments`,_.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))}function z(){document.getElementById(`championshipTitle`).textContent=_?.title||`Campeonato`,document.getElementById(`championshipSubtitle`).textContent=`${_?.location||`Local a definir`} - faca o sorteio por categoria e entre na pagina da categoria para operar jogos, mesas e mata-mata.`,document.getElementById(`championshipStatus`).textContent=_?.status===`finished`?`Finalizado`:_?.status===`open`?`Em andamento`:`Preparação`,document.getElementById(`championshipCategories`).textContent=f(C()),document.getElementById(`championshipApprovedCount`).textContent=String(w().length)}function B(e){let t=T(e),n=O(e),r=E(e),i=n.groups??[],a=P(t.length,M(e)).length,o=n.finished?`Encerrada`:n.defined?`Em andamento`:i.length?`Grupos prontos`:`Aguardando sorteio`;return`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${e}</span>
          <h2>${t.length} atleta${t.length===1?``:`s`} aprovados</h2>
        </div>
        <div class="championship-category-actions">
          <label class="championship-group-size">
            <span>Jogadores por grupo</span>
            <input id="groupSize_${e}" type="number" min="2" max="6" value="${M(e)}" ${n.defined?`disabled`:``}>
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
                  ${i.map(t=>{let n=F(t,e);return`
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
                          <strong>${k(e,t)}</strong>
                        </div>
                        <span class="result-pill ${j(n)}">${A(n)}</span>
                      </div>
                    </div>
                  `).join(``)}
                </div>
              </div>
            </details>
          `:``}
    </article>
  `}function V(){z();let e=document.getElementById(`championshipCategoriesGrid`);e&&(e.innerHTML=C().map(e=>B(e)).join(``))}window.drawCategoryGroups=async e=>{if(O(e).defined){l(`Esta categoria ja foi iniciada e nao pode mais sortear grupos nesta pagina.`,`warning`);return}let t=T(e),n=Math.max(2,Number(document.getElementById(`groupSize_${e}`)?.value||M(e)));if(!t.length){l(`Nao ha atletas aprovados nesta categoria para montar grupos.`,`warning`);return}let r=N(t),i=P(r.length,n),a=[],o=0;i.forEach((t,n)=>{a.push({id:`${e}-${n+1}`,name:`Grupo ${n+1}`,playerIds:r.slice(o,o+t).map(e=>e.id)}),o+=t});try{await I(e,{groupSize:n,groups:a,defined:!1,started:!1,queue:[],completedMatches:[],activeTables:D([],O(e).tableCount??1)}),V()}catch(e){l(`Erro ao sortear grupos: `+e.message,`error`)}},window.openCategoryPage=async e=>{if(!_)return;let t=O(e);if(!t.groups?.length){l(`Sorteie os grupos antes de abrir a categoria.`,`warning`);return}try{t.defined||await I(e,{defined:!0}),window.location.href=`/pages/championship-category.html?id=${_.id}&category=${encodeURIComponent(e)}`}catch(e){l(`Erro ao iniciar categoria: `+e.message,`error`)}},window.openTournamentRegistrations=()=>{_&&(window.location.href=`/pages/tournament-registrations.html?id=${_.id}`)},window.editCurrentTournament=()=>{_&&(window.location.href=`/pages/tournament-form.html?id=${_.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(g)return;if(g=!0,!e){window.location.replace(`/pages/login.html`);return}let t=b((await r(o(a,`users`,e.uid))).data());t&&(y(t),await L(),await R(),V())});