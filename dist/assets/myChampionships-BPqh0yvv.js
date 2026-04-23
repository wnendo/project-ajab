import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,x as l}from"./firebase-VBRKn9At.js";/* empty css               */import{c as u,f as d,s as f}from"./tournament-rules-CmdOaKKb.js";import{n as p}from"./ranking-standings-Dec7PvHv.js";var m=null,h=[],g=[],_=new Map,v=new Map,y=null,b=null,x=null,S=null,C=`all`,w=``,T=[`A`,`B`,`C`,`D`,`Iniciante`];function E(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function D(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function O(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Não informado`}function k(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function A(e){return g.find(t=>t.id===e)??null}function j(e){return h.find(t=>(t.tournamentId||t.id)===e)??null}function M(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function N(e,t){let n=(Array.isArray(e.categories)?e.categories:[]).map(e=>k(e)).filter(Boolean),r=M(t).map(e=>k(e)).filter(Boolean),i=n.length?r.filter(e=>n.includes(e)):r;return i.length?[...new Set(i)]:[...new Set(n)]}function P(e){let t=e.category?.trim();if(t)return t;if(Array.isArray(e.categories)){let t=e.categories.map(e=>e.trim()).find(Boolean);if(t)return t}return`A`}function F(e){let t=new Set;return(e?.queue??[]).forEach(e=>{e.playerIds?.forEach(e=>{e&&t.add(e)})}),(e?.activeTables??[]).forEach(e=>{e.playerIds?.forEach(e=>{e&&t.add(e)})}),t}function I(e,t){let n=N(e,t),r=Array.isArray(e.categories)&&e.categories.length?e.categories:n;return n.filter(e=>r.includes(e))}function L(e){let t=Object.entries(e.championshipState??{}).filter(([,e])=>(e?.groups?.length??0)>0).map(([e])=>k(e)).filter(Boolean),n=(Array.isArray(e.categories)?e.categories:[]).map(e=>k(e)).filter(Boolean);return[...new Set([...t,...n])].sort((e,t)=>T.indexOf(e)-T.indexOf(t))}function R(e,t){let n=t.map(e=>k(e)).filter(Boolean);if(!n.length)return{label:e.status===`finished`?`Finalizado`:`Em andamento`,tone:e.status===`finished`?`neutral`:`win`};let r=n.map(t=>e.championshipState?.[t]).filter(e=>e?.finished).length;return r===n.length?{label:`Finalizado`,tone:`neutral`}:r>0?{label:`Parcial`,tone:`neutral`}:{label:e.status===`closed`?`Inscrições encerradas`:e.status===`open`?`Em andamento`:`Aguardando`,tone:`win`}}function z(e,t){if(d(e))return e.status!==`finished`;let n=L(e);return n.length?n.some(t=>!e.championshipState?.[t]?.finished):e.status!==`finished`}function B(e){return new Map(V(e).map(e=>[e.id,e.name]))}function V(e){return(_.get(e)??[]).filter(e=>e.paymentStatus===`approved`)}function H(e,t=13){let n=e.trim();if(n.length<=t)return n;let r=n.split(/\s+/).filter(Boolean);if(r.length>=2){let e=r[0],n=r[r.length-1],i=r.slice(1,-1).filter(e=>![`de`,`da`,`do`,`dos`,`das`,`e`].includes(e.toLowerCase()));if(i.length){let r=`${e} ${i[0][0]}. ${n}`;if(r.length<=t+6)return r;let a=`${e} ${i.map(e=>`${e[0]}.`).join(` `)} ${n}`.replace(/\s+/g,` `).trim();if(a.length<=t+8)return a}let a=`${e} ${n}`;if(a.length<=t+4)return a}return`${n.slice(0,Math.max(1,t-3)).trimEnd()}...`}function U(){let e=document.getElementById(`tournamentViewerModal`);if(!e)return;let t=Array.from(e.querySelectorAll(`.ranking-completed-card`)),n=e.querySelector(`.ranking-filter-empty`),r=e.querySelector(`.ranking-history-count`),i=0;t.forEach(e=>{let t=(e.dataset.search||``).toLowerCase(),n=!w||t.includes(w.toLowerCase());e.style.display=n?``:`none`,n&&(i+=1)}),r&&(r.textContent=i?`${i} confronto(s)`:`Sem jogos exibidos`),n&&(n.style.display=i?`none`:`block`)}function W(e,t){let n=new Map;return(_.get(e)??[]).filter(e=>e.paymentStatus===`approved`).forEach(e=>{n.set(e.id,{wins:0,losses:0,games:0})}),(v.get(e)??[]).filter(e=>(e.group??`general`)===t).forEach(e=>{let t=n.get(e.p1),r=n.get(e.p2);t&&(t.games+=1),r&&(r.games+=1),e.winner===e.p1?(t&&(t.wins+=1),r&&(r.losses+=1)):(r&&(r.wins+=1),t&&(t.losses+=1))}),n}function G(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function K(e,t,n){let r=new Map;return e.playerIds.forEach(e=>{r.set(e,{wins:0,losses:0,scored:0,conceded:0})}),(t.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).forEach(e=>{let[t,n]=e.playerIds,i=r.get(t),a=r.get(n);if(!i||!a)return;let o=e.score1??0,s=e.score2??0;i.scored+=o,i.conceded+=s,a.scored+=s,a.conceded+=o,e.winnerId===t?(i.wins+=1,a.losses+=1):e.winnerId===n&&(a.wins+=1,i.losses+=1)}),[...r.entries()].map(([e,t])=>({playerId:e,...t})).sort((e,t)=>{if(t.wins!==e.wins)return t.wins-e.wins;let r=e.scored-e.conceded,i=t.scored-t.conceded;return i===r?(n.get(e.playerId)||`Atleta`).localeCompare(n.get(t.playerId)||`Atleta`):i-r})}function q(e){let t=new Map;return(e.completedMatches??[]).filter(e=>e.stage===`groups`).forEach(e=>{let n=e.groupId||`Sem grupo`;t.set(n,[...t.get(n)??[],e])}),t}function J(e,t,n,r,i=``){return`
    <section class="group-section queue-section ${i}">
      ${e?`<div class="group-section-header queue-section-header compact">
              <div>
                <span class="section-label">${e}</span>
                <h3>${n.length?`${n.length} confronto(s)`:`Sem confrontos`}</h3>
              </div>
            </div>`:``}
      ${n.length?`<div class="queue-grid compact-queue-grid tournament-mini-grid">
              ${n.map((e,n)=>`
                    <div class="queue-card next-match-card compact-next-match-card tournament-mini-card">
                      <div class="queue-card-top">
                        <span class="queue-order">${t} ${n+1}</span>
                      </div>
                      <div class="queue-player-block">
                        <strong>${E(e.left)}</strong>
                        <span>${E(e.meta)}</span>
                      </div>
                      <div class="queue-versus">vs</div>
                      <div class="queue-player-block">
                        <strong>${E(e.right)}</strong>
                        <span>${E(e.detail||``)}</span>
                      </div>
                    </div>
                  `).join(``)}
            </div>`:`<div class="queue-empty rich">${r}</div>`}
    </section>
  `}function Y(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=m;if(!n||!r||!i||!a)return;let o=u(e,P(t)),s=e.rankingLiveState?.[o],c=B(e.id),l=W(e.id,o),d=F(s),h=(v.get(e.id)??[]).filter(e=>(e.group??`general`)===o),g=d.size>0||h.length>0,_=V(e.id),y=new Map(_.map(e=>[e.id,e])),b=p(g?[...new Set([...d,...h.flatMap(e=>[e.p1,e.p2])])].map(e=>{let t=y.get(e);return{id:e,name:t?.name||c.get(e)||`Atleta`,category:t?P(t):f(o),...l.get(e)??{wins:0,losses:0,games:0}}}):_.filter(t=>u(e,P(t))===o).map(e=>({id:e.id,name:e.name,category:P(e),...l.get(e.id)??{wins:0,losses:0,games:0}})),h),x=(s?.activeTables??[]).filter(e=>e.playerIds?.length===2).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:f(o)})),S=(s?.queue??[]).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:f(o),detail:`Na fila`})),C=h.sort((e,t)=>t.createdAt-e.createdAt).map(e=>({left:c.get(e.p1)||`Atleta`,right:c.get(e.p2)||`Atleta`,meta:`${e.score1} x ${e.score2}`,detail:O(e.createdAt)})).slice(0,12),T=`
    <section class="group-section queue-section tournament-feed-card ranking-history-card">
      <div class="group-section-header queue-section-header compact">
        <div>
          <span class="section-label">Jogos realizados</span>
          <h3 class="ranking-history-count">${C.length?`${C.length} confronto(s)`:`Sem jogos exibidos`}</h3>
        </div>
        <div class="championship-history-filter ranking-history-filter">
          <label for="rankingCompletedSearch">Buscar atleta</label>
          <input
            id="rankingCompletedSearch"
            type="search"
            placeholder="Nome do jogador"
            value="${E(w)}"
            oninput="setRankingCompletedSearch(this.value)"
          />
        </div>
      </div>
      ${C.length?`
            <div class="ranking-completed-grid">
              ${C.map(e=>`
                    <article class="ranking-completed-card" data-search="${E(`${e.left} ${e.right}`.toLowerCase())}">
                      <strong>${E(H(e.left))} ${E(e.meta)} ${E(H(e.right))}</strong>
                      <span>${E(e.detail)}</span>
                    </article>
                  `).join(``)}
            </div>
            <div class="queue-empty rich ranking-filter-empty" style="display:none">Nenhum jogo encontrado para essa busca.</div>
          `:`<div class="empty-state">Ainda não houve partidas registradas.</div>`}
    </section>
  `;n.textContent=`${e.title} - ${f(o)}`,r.innerHTML=`
    <div class="tournament-viewer-shell">
      <section class="ranking-showcase">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Ranking</span>
            <h3>Sua categoria em disputa</h3>
          </div>
        </div>
        <div class="ranking-athlete-grid">
            ${b.map((e,t)=>`
                  <article class="ranking-athlete-card ${e.id===a.id?`highlight`:``} ${t===0?`podium-gold`:t===1?`podium-silver`:t===2?`podium-bronze`:``}">
                  <span>${t+1}º</span>
                  <strong>${E(e.name)}</strong>
                  <small>${E(e.category)}</small>
                  <span>${e.wins}V / ${e.losses}D / ${e.games}J</span>
                </article>
              `).join(``)}
        </div>
      </section>
      ${J(`Jogos em andamento`,`Ao vivo`,x,`Nenhum jogo em andamento agora.`,`tournament-feed-card`)}
      ${J(`Próximos jogos`,`Fila`,S,`Nenhum jogo aguardando nesta categoria.`,`tournament-feed-card`)}
      ${T}
    </div>
  `.replace(/Ã‚º/g,`º`),U(),i.style.display=`flex`}function X(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=m;if(!n||!r||!i||!a)return;let o=e.championshipState?.[t],s=B(e.id),c=o?.groups??[],l=q(o??{}),u=(C===`all`?[...l.values()].flat():l.get(C)??[]).map(e=>({match:e,left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`})).sort((e,t)=>{let n=+(e.left===a.name||e.right===a.name),r=+(t.left===a.name||t.right===a.name);return r===n?(t.match.playedAt??0)-(e.match.playedAt??0):r-n}).slice(0,9).map(e=>({left:e.left,right:e.right,meta:`${e.match.score1??0} x ${e.match.score2??0}`,detail:e.match.groupId||e.match.roundTitle||`Jogo`,playedAt:e.match.playedAt})),d=(o?.activeTables??[]).filter(e=>e.match).map(e=>({left:s.get(e.match.playerIds[0])||`Atleta`,right:s.get(e.match.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:e.match?.roundTitle||e.match?.groupId||`Ao vivo`})),f=(o?.queue??[]).slice(0,10).map(e=>({left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`,meta:e.roundTitle||e.groupId||`Fila`,detail:e.stage===`knockout`?`Mata-mata`:`Grupos`})),p=c.map(e=>({id:e.id,name:e.name}));n.textContent=`${e.title} - Categoria ${t}`,r.innerHTML=`
    <div class="tournament-viewer-shell">
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Grupos</span>
            <h3>Acompanhamento da fase inicial</h3>
          </div>
        </div>
        <div class="championship-result-groups">
          ${c.length?c.map(e=>{let n=K(e,o??{},s).slice(0,4),r=G(t,e).length,i=(o?.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).length;return`
                    <div class="championship-result-group-card ${e.playerIds.includes(a.id)?`highlight`:``}">
                      <strong>${E(e.name)}</strong>
                      <span>${i}/${r} jogos</span>
                      <div class="championship-result-group-mini">
                        ${n.map((e,t)=>`
                              <small>${t+1}º ${E(s.get(e.playerId)||`Atleta`)} - ${e.wins}V</small>
                            `).join(``)}
                      </div>
                    </div>
                  `}).join(``):`<div class="empty-state">Os grupos ainda não foram definidos.</div>`}
        </div>
      </section>
      ${J(`Jogos em andamento`,`Ao vivo`,d,`Nenhum jogo em andamento nesta categoria.`,`tournament-feed-card championship-live-card`)}
      ${J(`Próximos jogos`,`Fila`,f,`Nenhum próximo jogo liberado ainda.`,`tournament-feed-card championship-live-card`)}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Jogos disputados</span>
            <h3>${u.length?`${u.length} jogo(s)`:`Sem jogos exibidos`}</h3>
          </div>
          <div class="championship-history-filter championship-history-toolbar">
            <label for="championshipCompletedFilter">Grupo</label>
            <select id="championshipCompletedFilter" onchange="setChampionshipCompletedFilter(this.value)">
              <option value="all" ${C===`all`?`selected`:``}>Todos</option>
              ${p.map(e=>`<option value="${e.id}" ${C===e.id?`selected`:``}>${E(e.name)}</option>`).join(``)}
            </select>
          </div>
        </div>
        ${u.length?`
              <div class="championship-history-compact-grid">
                ${u.map(e=>`
                      <article class="championship-history-compact-card ${e.left===a.name||e.right===a.name?`highlight`:``}">
                        <strong>${E(H(e.left))} ${E(e.meta)} ${E(H(e.right))}</strong>
                        <span>${E(e.detail||`Jogo`)} • ${E(O(e.playedAt))}</span>
                      </article>
                    `).join(``)}
              </div>
            `:`<div class="queue-empty rich">Nenhuma partida concluida ainda.</div>`}
      </section>
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Mata-mata</span>
            <h3>Painel eliminatorio</h3>
          </div>
        </div>
        <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
          <iframe
            class="championship-bracket-frame championship-result-bracket"
            title="Mata-mata ${E(t)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}&highlight=${encodeURIComponent(a.id)}"
          ></iframe>
        </div>
      </section>
    </div>
  `,i.style.display=`flex`}function Z(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=m;if(!n||!r||!i||!a)return;let o=L(e),s=o.includes(t)?t:o[0]??t,c=e.championshipState?.[s],l=B(e.id),u=c?.groups??[],d=u.length>0,f=!!c?.finished,p=u.some(e=>e.id===S)?S:u[0]?.id,h=(c?.completedMatches??[]).filter(e=>e.stage===`groups`&&e.groupId===p).sort((e,t)=>(t.playedAt??0)-(e.playedAt??0)),g=(c?.activeTables??[]).filter(e=>e.match).map(e=>({left:l.get(e.match.playerIds[0])||`Atleta`,right:l.get(e.match.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:e.match?.roundTitle||e.match?.groupId||`Ao vivo`})),_=(c?.queue??[]).slice(0,10).map(e=>({left:l.get(e.playerIds[0])||`Atleta`,right:l.get(e.playerIds[1])||`Atleta`,meta:e.roundTitle||e.groupId||`Fila`,detail:e.stage===`knockout`?`Mata-mata`:`Grupos`}));if(n.textContent=`${e.title} - Categoria ${s}`,!d){r.innerHTML=`
      <div class="tournament-viewer-shell">
        <div class="form-group championship-result-selector">
          <span>Categoria</span>
          <select onchange="setChampionshipViewerCategory(this.value)">
            ${o.map(e=>`<option value="${e}" ${e===s?`selected`:``}>Categoria ${E(e)}</option>`).join(``)}
          </select>
        </div>
        <div class="empty-state">Categoria não iniciada.</div>
      </div>
    `,i.style.display=`flex`;return}r.innerHTML=`
    <div class="tournament-viewer-shell">
      <div class="form-group championship-result-selector">
        <span>Categoria</span>
        <select onchange="setChampionshipViewerCategory(this.value)">
          ${o.map(e=>`<option value="${e}" ${e===s?`selected`:``}>Categoria ${E(e)}</option>`).join(``)}
        </select>
      </div>
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Grupos</span>
            <h3>Acompanhamento da fase inicial</h3>
          </div>
        </div>
        <div class="championship-result-groups">
          ${u.length?u.map(e=>{let t=K(e,c??{},l).slice(0,4),n=G(s,e).length,r=(c?.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).length;return`
                    <button type="button" class="championship-result-group-card ${e.playerIds.includes(a.id)?`highlight`:``} ${p===e.id?`active`:``}" onclick="setChampionshipViewerGroup('${e.id}')">
                      <strong>${E(e.name)}</strong>
                      <span>${r}/${n} jogos</span>
                      <div class="championship-result-group-mini">
                        ${t.map((e,t)=>`
                              <small>${t+1}º ${E(l.get(e.playerId)||`Atleta`)} - ${e.wins}V</small>
                            `).join(``)}
                      </div>
                    </button>
                  `}).join(``):`<div class="empty-state">Os grupos ainda não foram definidos.</div>`}
        </div>
      </section>
      ${f?``:J(`Jogos em andamento`,`Ao vivo`,g,`Nenhum jogo em andamento nesta categoria.`,`tournament-feed-card championship-live-card`)}
      ${f?``:J(`Próximos jogos`,`Fila`,_,`Nenhum próximo jogo liberado ainda.`,`tournament-feed-card championship-live-card`)}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Histórico do grupo</span>
            <h3>${p?E(u.find(e=>e.id===p)?.name||`Grupo`):`Grupo`}</h3>
          </div>
        </div>
        ${h.length?`
              <div class="championship-history-compact-grid">
                ${h.map(e=>`
                      <article class="championship-history-compact-card ${e.playerIds.includes(a.id)?`highlight`:``}">
                        <strong>${E(l.get(e.playerIds[0])||`Atleta`)} ${e.score1??0} x ${e.score2??0} ${E(l.get(e.playerIds[1])||`Atleta`)}</strong>
                        <span>${E(e.groupId||`Grupo`)} • ${E(O(e.playedAt))}</span>
                      </article>
                    `).join(``)}
              </div>
            `:`<div class="queue-empty rich">Nenhuma partida concluida ainda.</div>`}
      </section>
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Mata-mata</span>
            <h3>Painel eliminatorio</h3>
          </div>
        </div>
        <div class="championship-bracket-frame-wrap championship-result-bracket-wrap">
          <iframe
            class="championship-bracket-frame championship-result-bracket"
            title="Mata-mata ${E(s)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(s)}&highlight=${encodeURIComponent(a.id)}"
          ></iframe>
        </div>
      </section>
    </div>
  `,i.style.display=`flex`}function Q(){let e=document.getElementById(`myChampionshipsList`);if(!e)return;let t=h.filter(e=>{let t=A(e.tournamentId||e.id);return t?z(t,e):!1}).map(e=>{let t=A(e.tournamentId||e.id);if(!t)return``;let n=I(t,e),r=d(t)?`Ranking`:`Campeonato`,i=d(t)?{label:t.status===`finished`?`Finalizado`:t.status===`open`?`Em andamento`:t.status===`closed`?`Inscrições encerradas`:`Aguardando`,tone:t.status===`finished`?`neutral`:`win`}:R(t,n);return`
        <article class="card profile-card tournament-tracker-card">
          <div class="section-header">
            <div>
              <span class="section-label">${r}</span>
              <h3>${E(t.title)}</h3>
            </div>
            <span class="result-pill ${i.tone}">${i.label}</span>
          </div>
          <div class="stack-item-grid">
            <span>Data: ${D(t.startDate)}</span>
            <span>Local: ${E(t.location||`A definir`)}</span>
            <span>Minhas categorias: ${E(n.join(`, `)||e.category||`Livre`)}</span>
            <span>Tipo: ${r}</span>
          </div>
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="openTournamentViewer('${t.id}')">Acompanhar torneio</button>
          </div>
        </article>
      `}).filter(Boolean);e.innerHTML=t.length?t.join(``):`<div class="empty-state">Você ainda não possui torneios aprovados para acompanhar aqui.</div>`}async function $(e){let[c,l,u,d]=await Promise.all([r(o(i,`users`,e)),t(s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`))),t(s(n(i,`tournaments`),a(`startDate`,`asc`))),t(n(i,`matches`))]);if(!c.exists()){window.location.replace(`/pages/profile.html`);return}m={id:c.id,...c.data()},g=u.docs.map(e=>({id:e.id,...e.data()})),h=l.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.paymentStatus===`approved`).filter(e=>g.some(t=>t.id===(e.tournamentId||e.id)));let f=[...new Set(h.map(e=>e.tournamentId||e.id))],p=await Promise.all(f.map(async e=>[e,(await t(n(i,`tournaments`,e,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))]));_=new Map(p),v=new Map(f.map(e=>[e,d.docs.map(e=>({id:e.id,...e.data()})).filter(t=>t.tournamentId===e)])),Q()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await l(c),window.location.replace(`/pages/login.html`)},window.closeTournamentViewerModal=()=>{let e=document.getElementById(`tournamentViewerModal`);e&&(e.style.display=`none`),b=null,x=null,w=``,S=null,C=`all`},window.closeTournamentCategoryChoiceModal=()=>{let e=document.getElementById(`tournamentCategoryChoiceModal`);e&&(e.style.display=`none`),y=null},window.confirmTournamentCategoryChoice=e=>{let t=y;if(!t)return;let n=A(t);n&&(window.closeTournamentCategoryChoiceModal(),b=t,x=e,S=null,Z(n,e))},window.setChampionshipViewerCategory=e=>{if(!b||!x)return;let t=A(b);if(!t)return;let n=k(e);n&&(x=n,S=null,Z(t,n))},window.setChampionshipViewerGroup=e=>{if(S=e||null,!b||!x)return;let t=A(b);t&&Z(t,x)},window.setChampionshipCompletedFilter=e=>{if(C=e||`all`,!b||!x)return;let t=A(b);t&&X(t,x)},window.setRankingCompletedSearch=e=>{w=e||``,U()},window.openTournamentViewer=e=>{let t=A(e),n=j(e);if(!t||!n)return;if(d(t)){b=e,x=null,C=`all`,Y(t,n);return}let r=L(t);if(!r.length){b=e,x=`A`,S=null,C=`all`,Z(t,`A`);return}if(r.length===1){b=e,x=r[0],S=null,C=`all`,Z(t,r[0]);return}b=e,x=r[0],S=null,C=`all`,Z(t,r[0])},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await $(e.uid)}catch(e){console.error(`Erro ao carregar meus torneios:`,e);let t=document.getElementById(`myChampionshipsList`);t&&(t.innerHTML=`<div class="empty-state">Não foi possível carregar seus torneios agora.</div>`)}});