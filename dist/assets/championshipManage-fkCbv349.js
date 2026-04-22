import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,c as n,d as r,f as i,i as a,l as o,n as s,p as c,t as l,x as u}from"./firebase-VBRKn9At.js";import{n as d}from"./toast-kV3jSCF7.js";/* empty css               */import{a as f,i as p,l as ee,n as te,t as m,u as ne}from"./tournament-rules-Dalw4FyS.js";var h=new URLSearchParams(window.location.search).get(`id`),g=!1,_=null,v=[],y=[],b=null,x=null,S=null,C=[`A`,`B`,`C`,`D`,`Iniciante`];function re(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category||`Sem categoria`}</span>
  `)}function ie(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function w(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function ae(e){let t=Array.isArray(e.categories)?e.categories:(e.category??``).split(`,`);return[...new Set(t.map(e=>w(e)).filter(Boolean))]}function T(){if(!_?.categories?.length)return m;let e=_.categories.map(e=>w(e)).filter(Boolean);return e.length?e:m}function E(){return v.filter(e=>e.paymentStatus===`approved`)}function D(e){return(e??``).normalize(`NFD`).replace(/[\u0300-\u036f]/g,``).trim().toLowerCase()}function O(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function oe(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function k(e){return v.find(t=>t.id===e||t.uid===e)??null}function se(){return T()}function A(e){if(!_)return!1;let t=p(_,e);return t?f(v,e)>=t:!1}function j(e=``){let t=D(e);return y.filter(e=>e.profileComplete&&(e.role===`user`||e.role===`admin`)).filter(e=>t?[e.name,e.email,e.club,e.category].some(e=>D(e).includes(t)):!0).map(e=>({user:e,registration:k(e.id)})).sort((e,t)=>e.user.name.localeCompare(t.user.name))}function M(e){let t=document.getElementById(`championshipManualCategory`);!t||!_||(t.innerHTML=se().map(t=>{let n=f(v,t),r=p(_,t),i=!!(r&&n>=r),a=(e||``)===t;return`<option value="${t}" ${a?`selected`:``} ${i&&!a?`disabled`:``}>${O(t)}${r?` (${n}/${r})`:``}${i&&!a?` - lotada`:``}</option>`}).join(``))}function N(){let e=document.getElementById(`selectedChampionshipAthleteSummary`);if(!e)return;let t=b?j().find(e=>e.user.id===b):null;if(!t){e.className=`add-athlete-summary empty`,e.textContent=`Nenhum atleta selecionado ainda.`,M();return}e.className=`add-athlete-summary`,e.innerHTML=`
    <strong>${O(t.user.name)}</strong>
    <span>${O(t.user.club||`Sem clube`)} - ${O(t.user.category||`Sem categoria`)}</span>
    <small>${t.registration?`Status atual: ${t.registration.paymentStatus===`approved`?`inscricao aprovada`:`pagamento pendente`}`:`Sem inscricao neste campeonato`}</small>
  `,M(t.registration?.category)}function P(e=``){let t=document.getElementById(`championshipAthleteSearchResults`),n=document.getElementById(`championshipAthleteSearchMessage`);if(!t||!n)return;let r=e.trim(),i=j(r);r?i.length?n.textContent=`${i.length} atleta(s) encontrado(s).`:n.textContent=`Nenhum atleta encontrado com esse filtro.`:n.textContent=`Digite para localizar um atleta ja cadastrado.`,t.innerHTML=i.length?i.map(e=>{let t=e.registration?e.registration.paymentStatus===`approved`?`Inscrito`:`Pendente`:`Disponivel`;return`
            <button type="button" class="athlete-search-item ${b===e.user.id?`active`:``}" onclick="selectChampionshipAthleteCandidate('${e.user.id}')">
              <div class="athlete-search-copy">
                <strong>${O(e.user.name)}</strong>
                <span>${O(e.user.club||`Sem clube`)} - ${O(e.user.category||`Sem categoria`)}</span>
              </div>
              <span class="result-pill ${e.registration?.paymentStatus===`approved`?`win`:`neutral`}">${t}</span>
            </button>
          `}).join(``):`<div class="empty-state">Nenhum atleta encontrado.</div>`}function F(e){return E().filter(t=>ae(t).includes(e)).sort((e,t)=>e.name.localeCompare(t.name))}function ce(e){if(!_)return{count:0,limit:void 0,remaining:void 0,label:`Sem limite`};let t=f(v,e),n=p(_,e);return{count:t,limit:n,remaining:typeof n==`number`?Math.max(0,n-t):void 0,label:typeof n==`number`?`${t}/${n}`:`${t} inscritos`}}function I(e,t){return Array.from({length:Math.max(1,t)},(t,n)=>{let r=e?.[n];return{id:r?.id??n+1,...r?.groupId?{groupId:r.groupId}:{},...r?.match?{match:r.match}:{}}})}function L(e){let t=_?.championshipState?.[e],n=Math.max(1,t?.tableCount??1);return{groupSize:Math.max(2,t?.groupSize??3),groups:t?.groups??[],defined:t?.defined??!1,started:t?.started??!1,finished:t?.finished??!1,tableCount:n,queue:t?.queue??[],activeTables:I(t?.activeTables,n),completedMatches:t?.completedMatches??[],finalStandings:t?.finalStandings??[]}}function R(e,t){return F(e).find(e=>e.id===t)?.name||`Atleta`}function z(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function le(e,t){let n=new Map;return e.playerIds.forEach(e=>{n.set(e,{wins:0,losses:0,pointsWon:0,pointsLost:0})}),(t.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).forEach(e=>{let[t,r]=e.playerIds,i=n.get(t),a=n.get(r);if(!i||!a)return;let o=e.score1??0,s=e.score2??0;i.pointsWon+=o,i.pointsLost+=s,a.pointsWon+=s,a.pointsLost+=o,e.winnerId===t?(i.wins+=1,a.losses+=1):e.winnerId===r&&(a.wins+=1,i.losses+=1)}),[...n.entries()].map(([e,t])=>({playerId:e,...t})).sort((t,n)=>{if(n.wins!==t.wins)return n.wins-t.wins;let r=t.pointsWon-t.pointsLost,i=n.pointsWon-n.pointsLost;return i===r?R(e.id.split(`-`)[0],t.playerId).localeCompare(R(e.id.split(`-`)[0],n.playerId)):i-r})}function B(e){let t=T(),n=Object.keys(e.championshipState??{}).map(e=>w(e)).filter(Boolean);return[...new Set([...t,...n])].sort((e,t)=>C.indexOf(e)-C.indexOf(t))}function ue(e,t){let n=t.groups??[];if(!n.length)return`
      <section class="championship-result-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Categoria ${O(e)}</span>
            <h3>Categoria nao iniciada</h3>
          </div>
        </div>
        <div class="empty-state">Categoria nao iniciada.</div>
      </section>
    `;let r=n.some(e=>e.id===S)?S:n[0]?.id,i=(t.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===r).sort((e,t)=>(t.playedAt??0)-(e.playedAt??0));return`
    <section class="championship-result-section">
      <div class="section-header compact-section-header">
        <div>
          <span class="section-label">Categoria ${O(e)}</span>
          <h3>${t.finished?`Resultado final`:`Andamento do campeonato`}</h3>
        </div>
      </div>
      <div class="championship-result-groups">
        ${n.map(n=>{let i=z(e,n).length,a=(t.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===n.id).length,o=le(n,t);return`
              <button class="championship-result-group-card ${r===n.id?`active`:``}" onclick="setChampionshipResultsGroup('${n.id}')" type="button">
                <strong>${O(n.name)}</strong>
                <span>${a}/${i} jogos</span>
                <div class="championship-result-group-mini">
                  ${o.length?o.map((t,n)=>`<small>${n+1}o ${O(R(e,t.playerId))} - ${t.wins}V</small>`).join(``):`<small>Aguardando jogos</small>`}
                </div>
              </button>
            `}).join(``)}
      </div>
      <section class="group-section championship-history-inner">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Historico do grupo</span>
            <h3>${r?O(n.find(e=>e.id===r)?.name||`Grupo`):`Grupo`}</h3>
          </div>
        </div>
        ${i.length?`
              <div class="championship-history-compact-grid">
                ${i.map(t=>`
                    <article class="championship-history-compact-card">
                      <strong>${O(R(e,t.playerIds[0]))} ${t.score1??0} x ${t.score2??0} ${O(R(e,t.playerIds[1]))}</strong>
                      <span>${O(t.groupId||`Grupo`)} • ${O(oe(t.playedAt))}</span>
                    </article>
                  `).join(``)}
              </div>
            `:`<div class="empty-state">Nenhuma partida registrada neste grupo ainda.</div>`}
      </section>
      <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
        <iframe
          class="championship-bracket-frame championship-result-bracket"
          title="Mata-mata ${O(e)}"
          loading="lazy"
          src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(_?.id||``)}&category=${encodeURIComponent(e)}"
        ></iframe>
      </div>
    </section>
  `}function V(e){let t=_;if(!t)return;let n=document.getElementById(`championshipResultsModalTitle`),r=document.getElementById(`championshipResultsModalContent`),i=document.getElementById(`championshipFinalizeButton`);if(!n||!r)return;let a=B(t);if(!a.length){n.textContent=`Resultado - ${t.title}`,r.innerHTML=`<div class="empty-state">Este campeonato ainda nao possui categorias configuradas.</div>`,i&&(i.disabled=!1,i.textContent=t.status===`finished`?`Torneio finalizado`:`Finalizar torneio`);return}let o=a.includes(e)?e:a[0],s=t.championshipState?.[o]??{};n.textContent=`Resultado - ${t.title}`,r.innerHTML=`
    <div class="form-group championship-result-selector">
      <span>Categoria</span>
      <select onchange="setChampionshipResultsCategory(this.value)">
        ${a.map(e=>`<option value="${e}" ${e===o?`selected`:``}>Categoria ${O(e)}</option>`).join(``)}
      </select>
    </div>
    ${ue(o,s)}
  `,i&&(i.disabled=t.status===`finished`,i.textContent=t.status===`finished`?`Torneio finalizado`:`Finalizar torneio`)}async function H(){let e=_;if(!e)return;let t=e.championshipState??{},n=T().reduce((e,t)=>{let n=L(t),r=Math.max(1,n.tableCount??1);return e[t]={...n,defined:n.groups?.length?!0:n.defined??!1,started:!1,knockoutStarted:!1,finished:!0,queue:[],activeTables:I([],r),tableCount:r},e},{...t});_={...e,status:`finished`,isActive:!1,championshipState:n,updatedAt:Date.now()},await o(c(s,`tournaments`,e.id),{status:`finished`,isActive:!1,championshipState:n,updatedAt:_.updatedAt})}function de(e){return e===0?`1° lugar`:e===1?`2° lugar`:e===2?`3° lugar`:`4° lugar`}function U(e){return e===0?`podium-gold`:e===1?`podium-silver`:`podium-bronze`}function W(e){return Math.max(2,L(e).groupSize??3)}function fe(e){let t=[...e];for(let e=t.length-1;e>0;e--){let n=Math.floor(Math.random()*(e+1));[t[e],t[n]]=[t[n],t[e]]}return t}function G(e,t){if(e<=0)return[];let n=Math.max(1,Math.ceil(e/t)),r=Math.floor(e/n),i=e%n;return Array.from({length:n},(e,t)=>r+ +(t<i)).filter(e=>e>0)}function pe(e,t){let n=new Map(F(t).map(e=>[e.id,e]));return e.playerIds.map(e=>n.get(e)).filter(Boolean)}async function K(e,t){if(!_)return;let n=L(e),r=Math.max(1,t.tableCount??n.tableCount??1),i={...n,...t,tableCount:r,activeTables:I(t.activeTables??n.activeTables,r)};_.championshipState={..._.championshipState,[e]:i},await o(c(s,`tournaments`,_.id),{championshipState:_.championshipState,updatedAt:Date.now()})}async function me(){if(!h){window.location.replace(`/pages/dashboard.html`);return}let e=await a(c(s,`tournaments`,h));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}if(_={id:e.id,...e.data()},ne(_)!==`championship`){window.location.replace(`/pages/tournament-manage.html?id=${e.id}`);return}}async function q(){if(!_){v=[];return}v=(await t(i(s,`tournaments`,_.id,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))}async function J(){y=(await t(i(s,`users`))).docs.map(e=>({id:e.id,...e.data()})).sort((e,t)=>e.name.localeCompare(t.name))}function he(){document.getElementById(`championshipTitle`).textContent=_?.title||`Campeonato`,document.getElementById(`championshipSubtitle`).textContent=`${_?.location||`Local a definir`} - faca o sorteio por categoria e entre na pagina da categoria para operar jogos, mesas e mata-mata.`,document.getElementById(`championshipStatus`).textContent=_?.status===`finished`?`Finalizado`:_?.status===`open`?`Em andamento`:`Preparação`,document.getElementById(`championshipCategories`).textContent=te(T()),document.getElementById(`championshipApprovedCount`).textContent=String(E().length)}function ge(e){let t=F(e),n=L(e),r=ce(e),i=n.groups??[],a=G(t.length,W(e)).length,o=n.finished?`Encerrada`:n.defined?`Em andamento`:i.length?`Grupos prontos`:`Aguardando sorteio`;return`
    <article class="card championship-category-card">
      <div class="championship-category-head">
        <div>
          <span class="section-label">Categoria ${e}</span>
          <h2>${t.length} atleta${t.length===1?``:`s`} aprovados</h2>
        </div>
        <div class="championship-category-actions">
          <label class="championship-group-size">
            <span>Jogadores por grupo</span>
            <input id="groupSize_${e}" type="number" min="2" max="6" value="${W(e)}" ${n.defined?`disabled`:``}>
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
                  ${i.map(t=>{let n=pe(t,e);return`
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
                <div class="championship-final-standings">
                  ${n.finalStandings.slice(0,4).map((t,n)=>`
                    <div class="championship-final-card ${U(n)}">
                      <div class="championship-final-card-head">
                        <div class="championship-final-player">
                          <strong>${R(e,t)}</strong>
                        </div>
                        <span class="result-pill ${U(n)}">${de(n)}</span>
                      </div>
                    </div>
                  `).join(``)}
                </div>
              </div>
            </details>
          `:``}
    </article>
  `}function Y(){he();let e=document.getElementById(`championshipCategoriesGrid`);e&&(e.innerHTML=T().map(e=>ge(e)).join(``))}function _e(){let e=document.getElementById(`addChampionshipAthleteModal`),t=document.getElementById(`championshipAthleteSearch`);if(!e)return;b=null,t&&(t.value=``),[`newChampionshipAthleteName`,`newChampionshipAthleteEmail`,`newChampionshipAthletePhone`,`newChampionshipAthleteClub`].forEach(e=>{let t=document.getElementById(e);t&&(t.value=``)});let n=document.getElementById(`championshipManualPayment`),r=document.getElementById(`newChampionshipAthleteBaseCategory`);n&&(n.value=`approved`),r&&(r.value=`A`),M(),N(),P(),e.style.display=`flex`}function X(){let e=document.getElementById(`addChampionshipAthleteModal`);e&&(b=null,e.style.display=`none`)}function Z(){return document.getElementById(`championshipManualPayment`)?.value===`pending_payment`?`pending_payment`:`approved`}function Q(){return document.getElementById(`championshipManualCategory`)?.value}function ve(e,t,n){let r=_;if(!r)throw Error(`Campeonato nao carregado.`);let i=Date.now(),a=ee(r,[t]),o=n===`approved`?`pix`:`pay_on_day`;return{registrationPayload:{id:e.id,uid:e.id,name:e.name,email:e.email,club:e.club,category:t,categories:[t],registrationFee:a,paymentStatus:n,paymentMethod:o,registeredAt:i,status:`registered`},userRegistrationPayload:{id:r.id,tournamentId:r.id,title:r.title,location:r.location??``,category:t,categories:[t],registrationFee:a,paymentStatus:n,paymentMethod:o,startDate:r.startDate,endDate:r.endDate,registrationDeadline:r.registrationDeadline,registeredAt:i,status:`registered`}}}async function $(e,t,n){if(!_)return;let i=r(s),{registrationPayload:a,userRegistrationPayload:o}=ve(e,t,n);i.set(c(s,`tournaments`,_.id,`registrations`,e.id),a),i.set(c(s,`users`,e.id,`registrations`,_.id),o),await i.commit()}async function ye(){let e=document.getElementById(`newChampionshipAthleteName`)?.value.trim()||``,t=document.getElementById(`newChampionshipAthleteEmail`)?.value.trim()||``,r=document.getElementById(`newChampionshipAthletePhone`)?.value.trim()||``,a=document.getElementById(`newChampionshipAthleteClub`)?.value.trim()||``,o=document.getElementById(`newChampionshipAthleteBaseCategory`)?.value||``;if(!e||!o)throw Error(`Informe pelo menos nome e categoria base para cadastrar o atleta.`);let l=c(i(s,`users`)),u=Date.now(),d={id:l.id,name:e,email:t,phone:r,club:a,category:o,role:`user`,createdAt:u,updatedAt:u,profileComplete:!0,playerProfile:{wins:0,losses:0,games:0,active:!1,createdAt:u}};return await n(l,d),y=[...y,d].sort((e,t)=>e.name.localeCompare(t.name)),d}window.drawCategoryGroups=async e=>{if(L(e).defined){d(`Esta categoria ja foi iniciada e nao pode mais sortear grupos nesta pagina.`,`warning`);return}let t=F(e),n=Math.max(2,Number(document.getElementById(`groupSize_${e}`)?.value||W(e)));if(!t.length){d(`Nao ha atletas aprovados nesta categoria para montar grupos.`,`warning`);return}let r=fe(t),i=G(r.length,n),a=[],o=0;i.forEach((t,n)=>{a.push({id:`${e}-${n+1}`,name:`Grupo ${n+1}`,playerIds:r.slice(o,o+t).map(e=>e.id)}),o+=t});try{await K(e,{groupSize:n,groups:a,defined:!1,started:!1,queue:[],completedMatches:[],activeTables:I([],L(e).tableCount??1)}),Y()}catch(e){d(`Erro ao sortear grupos: `+e.message,`error`)}},window.openCategoryPage=async e=>{if(!_)return;let t=L(e);if(!t.groups?.length){d(`Sorteie os grupos antes de abrir a categoria.`,`warning`);return}try{t.defined||await K(e,{defined:!0}),window.location.href=`/pages/championship-category.html?id=${_.id}&category=${encodeURIComponent(e)}`}catch(e){d(`Erro ao iniciar categoria: `+e.message,`error`)}},window.openAddChampionshipAthleteModal=()=>{_e()},window.closeAddChampionshipAthleteModal=()=>{X()},window.openChampionshipResultsModal=()=>{let e=document.getElementById(`championshipResultsModal`);!e||!_||(x=B(_)[0]??null,S=null,V(x??void 0),e.style.display=`flex`)},window.closeChampionshipResultsModal=()=>{let e=document.getElementById(`championshipResultsModal`);e&&(e.style.display=`none`),x=null,S=null},window.setChampionshipResultsCategory=e=>{let t=w(e);t&&(x=t,S=null,V(t))},window.setChampionshipResultsGroup=e=>{S=e||null,V(x??void 0)},window.confirmFinalizeChampionshipTournament=async()=>{if(!_)return;if(_.status===`finished`){d(`Este campeonato ja esta finalizado.`,`warning`);return}let e=document.getElementById(`championshipFinalizeButton`);try{e&&(e.disabled=!0,e.textContent=`Finalizando...`),await H(),Y(),V(x??void 0),d(`Campeonato finalizado com sucesso.`,`success`)}catch(t){e&&(e.disabled=!1,e.textContent=`Finalizar torneio`),d(`Erro ao finalizar campeonato: `+t.message,`error`)}},window.filterChampionshipAthletes=()=>{P(document.getElementById(`championshipAthleteSearch`)?.value??``)},window.selectChampionshipAthleteCandidate=e=>{b=e,N(),P(document.getElementById(`championshipAthleteSearch`)?.value??``)},window.submitExistingChampionshipAthlete=async()=>{if(!b){d(`Selecione um atleta existente antes de adicionar.`,`warning`);return}let e=y.find(e=>e.id===b),t=Q(),n=Z();if(!e||!t){d(`Selecione o atleta e a categoria do campeonato.`,`warning`);return}if(k(e.id)){d(`Esse atleta ja possui inscricao neste campeonato.`,`warning`);return}if(A(t)){d(`Essa categoria ja atingiu o limite de inscritos.`,`warning`);return}try{await $(e,t,n),await q(),Y(),X();let r=L(t).groups?.length?` Refaça a distribuicao da categoria se os grupos ja estavam sorteados.`:``;d(`${n===`approved`?`Atleta inscrito com sucesso.`:`Atleta adicionado com pagamento pendente.`}${r}`,`success`)}catch(e){d(`Erro ao adicionar atleta: `+e.message,`error`)}},window.createAndAddChampionshipAthlete=async()=>{let e=Q(),t=Z();if(!e){d(`Selecione a categoria do campeonato antes de cadastrar.`,`warning`);return}if(A(e)){d(`Essa categoria ja atingiu o limite de inscritos.`,`warning`);return}try{await $(await ye(),e,t),await J(),await q(),Y(),X();let n=L(e).groups?.length?` Refaça a distribuicao da categoria se os grupos ja estavam sorteados.`:``;d(`${t===`approved`?`Novo atleta cadastrado e inscrito.`:`Novo atleta cadastrado com pagamento pendente.`}${n}`,`success`)}catch(e){d(`Erro ao cadastrar atleta: `+e.message,`error`)}},window.openTournamentRegistrations=()=>{_&&(window.location.href=`/pages/tournament-registrations.html?id=${_.id}`)},window.editCurrentTournament=()=>{_&&(window.location.href=`/pages/tournament-form.html?id=${_.id}`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await u(l),window.location.replace(`/pages/login.html`)},e(l,async e=>{if(g)return;if(g=!0,!e){window.location.replace(`/pages/login.html`);return}let t=ie((await a(c(s,`users`,e.uid))).data());t&&(re(t),await me(),await J(),await q(),Y())});