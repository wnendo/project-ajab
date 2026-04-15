import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,l as i,n as a,p as o,t as s,x as c}from"./firebase-VBRKn9At.js";/* empty css               */import{c as l,n as u,t as d}from"./tournament-rules-DUbpQbwy.js";var f=new URLSearchParams(window.location.search).get(`id`),p=!1,m=null,h=[];function g(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category||`Sem categoria`}</span>
  `)}function _(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function v(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function y(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>v(e)).filter(Boolean))]}function b(){if(!m?.categories?.length)return d;let e=m.categories.map(e=>v(e)).filter(Boolean);return e.length?e:d}function x(){return h.filter(e=>e.paymentStatus===`approved`)}function S(e){return x().filter(t=>y(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function C(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function w(e){let t=m?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:C(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function T(e,t){return S(e).find(e=>e.id===t)?.name||`Atleta`}function E(e){return e===0?`1o lugar`:e===1?`2o lugar`:e===2?`3o lugar`:`4o lugar`}function D(e){return e===0?`podium-gold`:e===1?`podium-silver`:`podium-bronze`}function O(e){return Math.max(2,w(e).groupSize??3)}function k(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function A(e,t){if(e<=0)return[];let n=Math.max(1,Math.ceil(e/t)),r=Math.floor(e/n),i=e%n;return Array.from({length:n},(e,t)=>r+ +(t<i)).filter(e=>e>0)}function j(e,t){let n=new Map(S(t).map(e=>[e.id,e]));return e.playerIds.map(e=>n.get(e)).filter(Boolean)}async function M(e,t){if(!m)return;let n=w(e),r=Math.max(1,t.tableCount??n.tableCount??1),s={...n,...t,tableCount:r,activeTables:C(t.activeTables??n.activeTables,r)};m.championshipState={...m.championshipState,[e]:s},await i(o(a,`tournaments`,m.id),{championshipState:m.championshipState,updatedAt:Date.now()})}async function N(){if(!f){window.location.replace(`/pages/dashboard.html`);return}let e=await r(o(a,`tournaments`,f));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}if(m={id:e.id,...e.data()},l(m)!==`championship`){window.location.replace(`/pages/tournament-manage.html?id=${e.id}`);return}}async function P(){if(!m){h=[];return}h=(await t(n(a,`tournaments`,m.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))}function F(){document.getElementById(`championshipTitle`).textContent=m?.title||`Campeonato`,document.getElementById(`championshipSubtitle`).textContent=`${m?.location||`Local a definir`} - faca o sorteio por categoria e entre na pagina da categoria para operar jogos, mesas e mata-mata.`,document.getElementById(`championshipStatus`).textContent=m?.status===`finished`?`Finalizado`:m?.status===`open`?`Em andamento`:`Preparacao`,document.getElementById(`championshipCategories`).textContent=u(b()),document.getElementById(`championshipApprovedCount`).textContent=String(x().length)}function I(e){let t=S(e),n=w(e),r=n.groups??[],i=A(t.length,O(e)).length,a=n.finished?`Encerrada`:n.defined?`Em andamento`:r.length?`Grupos prontos`:`Aguardando sorteio`;return`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${e}</span>
          <h2>${t.length} atleta${t.length===1?``:`s`} aprovados</h2>
        </div>
        <div class="championship-category-actions">
          <label class="championship-group-size">
            <span>Jogadores por grupo</span>
            <input id="groupSize_${e}" type="number" min="2" max="6" value="${O(e)}" ${n.defined?`disabled`:``}>
          </label>
          <button class="btn secondary" ${n.defined?`disabled`:``} onclick="saveCategoryGroupSize('${e}')">Salvar tamanho</button>
          <button class="btn primary" ${n.defined?`disabled`:``} onclick="drawCategoryGroups('${e}')">Sortear grupos</button>
          <button class="btn primary" ${r.length?``:`disabled`} onclick="openCategoryPage('${e}')">${n.defined?`Abrir categoria`:`Abrir pagina da categoria`}</button>
        </div>
      </div>

      <div class="championship-category-summary">
        <div class="info-card">
          <span>Grupos previstos</span>
          <strong>${r.length||i||0}</strong>
        </div>
        <div class="info-card">
          <span>Classificados</span>
          <strong>${r.length?r.length*2:Math.max(0,i*2)}</strong>
        </div>
        <div class="info-card">
          <span>Status</span>
          <strong>${a}</strong>
        </div>
      </div>

      <details class="championship-block championship-collapse" ${r.length?`open`:``}>
        <summary class="championship-collapse-summary">
          <div class="championship-block-head">
            <h3>Grupos sorteados</h3>
            <p>${r.length?n.defined?`A categoria ja foi iniciada. A configuracao desta pagina ficou travada e a operacao segue dentro da pagina da categoria.`:`Ao abrir a pagina da categoria, esta configuracao fica travada e a operacao segue por la.`:`Defina o tamanho dos grupos e sorteie a categoria para montar os confrontos.`}</p>
          </div>
        </summary>
        <div class="championship-collapse-content">
          ${r.length?`
                <div class="championship-groups-grid">
                  ${r.map(t=>{let n=j(t,e);return`
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
                  <h3>Classificacao final</h3>
                  <p>Resumo final da categoria.</p>
                </div>
              </summary>
              <div class="championship-collapse-content">
                <div class="stack-list compact-stack-list">
                  ${n.finalStandings.slice(0,4).map((t,n)=>`
                    <div class="stack-item compact-stack-item">
                      <div class="stack-item-header">
                        <div>
                          <strong>${T(e,t)}</strong>
                        </div>
                        <span class="result-pill ${D(n)}">${E(n)}</span>
                      </div>
                    </div>
                  `).join(``)}
                </div>
              </div>
            </details>
          `:``}
    </article>
  `}function L(){F();let e=document.getElementById(`championshipCategoriesGrid`);e&&(e.innerHTML=b().map(e=>I(e)).join(``))}window.saveCategoryGroupSize=async e=>{if(w(e).defined){alert(`Esta categoria jÃ¡ foi iniciada e nÃ£o pode mais ser alterada nesta pagina.`);return}let t=document.getElementById(`groupSize_${e}`),n=Math.max(2,Number(t?.value||3));try{await M(e,{groupSize:n,tableCount:w(e).tableCount??1}),L()}catch(e){alert(`Erro ao salvar tamanho do grupo: `+e.message)}},window.drawCategoryGroups=async e=>{if(w(e).defined){alert(`Esta categoria jÃ¡ foi iniciada e nÃ£o pode mais sortear grupos nesta pagina.`);return}let t=S(e),n=Math.max(2,Number(document.getElementById(`groupSize_${e}`)?.value||O(e)));if(!t.length){alert(`NÃ£o hÃ¡ atletas aprovados nesta categoria para montar grupos.`);return}let r=k(t),i=A(r.length,n),a=[],o=0;i.forEach((t,n)=>{a.push({id:`${e}-${n+1}`,name:`Grupo ${n+1}`,playerIds:r.slice(o,o+t).map(e=>e.id)}),o+=t});try{await M(e,{groupSize:n,groups:a,defined:!1,started:!1,queue:[],completedMatches:[],activeTables:C([],w(e).tableCount??1)}),L()}catch(e){alert(`Erro ao sortear grupos: `+e.message)}},window.openCategoryPage=async e=>{if(!m)return;let t=w(e);if(!t.groups?.length){alert(`Sorteie os grupos antes de abrir a categoria.`);return}try{t.defined||await M(e,{defined:!0}),window.location.href=`/pages/championship-category.html?id=${m.id}&category=${encodeURIComponent(e)}`}catch(e){alert(`Erro ao iniciar categoria: `+e.message)}},window.openTournamentRegistrations=()=>{m&&(window.location.href=`/pages/tournament-registrations.html?id=${m.id}`)},window.editCurrentTournament=()=>{m&&(window.location.href=`/pages/tournament-form.html?id=${m.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await c(s),window.location.replace(`/pages/login.html`)},e(s,async e=>{if(p)return;if(p=!0,!e){window.location.replace(`/pages/login.html`);return}let t=_((await r(o(a,`users`,e.uid))).data());t&&(g(t),await N(),await P(),L())});