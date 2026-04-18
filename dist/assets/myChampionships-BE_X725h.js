import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,x as l}from"./firebase-VBRKn9At.js";/* empty css               */import{c as u,f as d,s as f}from"./tournament-rules-D9Tq3W95.js";import{n as p}from"./ranking-standings-Dec7PvHv.js";var m=null,h=[],g=[],_=new Map,v=new Map,y=null,b=null,x=null,S=`all`,C=``;function w(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function T(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Nao informado`}function E(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function D(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function O(e){return g.find(t=>t.id===e)??null}function k(e){return h.find(t=>(t.tournamentId||t.id)===e)??null}function A(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function j(e){let t=e.category?.trim();if(t)return t;if(Array.isArray(e.categories)){let t=e.categories.map(e=>e.trim()).find(Boolean);if(t)return t}return`A`}function M(e){let t=new Set;return(e?.queue??[]).forEach(e=>{e.playerIds?.forEach(e=>{e&&t.add(e)})}),(e?.activeTables??[]).forEach(e=>{e.playerIds?.forEach(e=>{e&&t.add(e)})}),t}function N(e,t){let n=A(t),r=Array.isArray(e.categories)&&e.categories.length?e.categories:n;return n.filter(e=>r.includes(e))}function P(e){return new Map(F(e).map(e=>[e.id,e.name]))}function F(e){return(_.get(e)??[]).filter(e=>e.paymentStatus===`approved`)}function I(e,t=13){let n=e.trim();if(n.length<=t)return n;let r=n.split(/\s+/).filter(Boolean);if(r.length>=2){let e=r[0],n=r[r.length-1],i=r.slice(1,-1).filter(e=>![`de`,`da`,`do`,`dos`,`das`,`e`].includes(e.toLowerCase()));if(i.length){let r=`${e} ${i[0][0]}. ${n}`;if(r.length<=t+6)return r;let a=`${e} ${i.map(e=>`${e[0]}.`).join(` `)} ${n}`.replace(/\s+/g,` `).trim();if(a.length<=t+8)return a}let a=`${e} ${n}`;if(a.length<=t+4)return a}return`${n.slice(0,Math.max(1,t-3)).trimEnd()}...`}function L(){let e=document.getElementById(`tournamentViewerModal`);if(!e)return;let t=Array.from(e.querySelectorAll(`.ranking-completed-card`)),n=e.querySelector(`.ranking-filter-empty`),r=e.querySelector(`.ranking-history-count`),i=0;t.forEach(e=>{let t=(e.dataset.search||``).toLowerCase(),n=!C||t.includes(C.toLowerCase());e.style.display=n?``:`none`,n&&(i+=1)}),r&&(r.textContent=i?`${i} confronto(s)`:`Sem jogos exibidos`),n&&(n.style.display=i?`none`:`block`)}function R(e,t){let n=new Map;return(_.get(e)??[]).filter(e=>e.paymentStatus===`approved`).forEach(e=>{n.set(e.id,{wins:0,losses:0,games:0})}),(v.get(e)??[]).filter(e=>(e.group??`general`)===t).forEach(e=>{let t=n.get(e.p1),r=n.get(e.p2);t&&(t.games+=1),r&&(r.games+=1),e.winner===e.p1?(t&&(t.wins+=1),r&&(r.losses+=1)):(r&&(r.wins+=1),t&&(t.losses+=1))}),n}function z(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function B(e,t,n){let r=new Map;return e.playerIds.forEach(e=>{r.set(e,{wins:0,losses:0,scored:0,conceded:0})}),(t.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).forEach(e=>{let[t,n]=e.playerIds,i=r.get(t),a=r.get(n);if(!i||!a)return;let o=e.score1??0,s=e.score2??0;i.scored+=o,i.conceded+=s,a.scored+=s,a.conceded+=o,e.winnerId===t?(i.wins+=1,a.losses+=1):e.winnerId===n&&(a.wins+=1,i.losses+=1)}),[...r.entries()].map(([e,t])=>({playerId:e,...t})).sort((e,t)=>{if(t.wins!==e.wins)return t.wins-e.wins;let r=e.scored-e.conceded,i=t.scored-t.conceded;return i===r?(n.get(e.playerId)||`Atleta`).localeCompare(n.get(t.playerId)||`Atleta`):i-r})}function V(e){let t=new Map;return(e.completedMatches??[]).filter(e=>e.stage===`groups`).forEach(e=>{let n=e.groupId||`Sem grupo`;t.set(n,[...t.get(n)??[],e])}),t}function H(e,t,n,r,i=``){return`
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
                        <strong>${w(e.left)}</strong>
                        <span>${w(e.meta)}</span>
                      </div>
                      <div class="queue-versus">vs</div>
                      <div class="queue-player-block">
                        <strong>${w(e.right)}</strong>
                        <span>${w(e.detail||``)}</span>
                      </div>
                    </div>
                  `).join(``)}
            </div>`:`<div class="queue-empty rich">${r}</div>`}
    </section>
  `}function U(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=m;if(!n||!r||!i||!a)return;let o=u(e,j(t)),s=e.rankingLiveState?.[o],c=P(e.id),l=R(e.id,o),d=M(s),h=(v.get(e.id)??[]).filter(e=>(e.group??`general`)===o),g=d.size>0||h.length>0,_=F(e.id),y=new Map(_.map(e=>[e.id,e])),b=p(g?[...new Set([...d,...h.flatMap(e=>[e.p1,e.p2])])].map(e=>{let t=y.get(e);return{id:e,name:t?.name||c.get(e)||`Atleta`,category:t?j(t):f(o),...l.get(e)??{wins:0,losses:0,games:0}}}):_.filter(t=>u(e,j(t))===o).map(e=>({id:e.id,name:e.name,category:j(e),...l.get(e.id)??{wins:0,losses:0,games:0}})),h),x=(s?.activeTables??[]).filter(e=>e.playerIds?.length===2).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:f(o)})),S=(s?.queue??[]).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:f(o),detail:`Na fila`})),T=h.sort((e,t)=>t.createdAt-e.createdAt).map(e=>({left:c.get(e.p1)||`Atleta`,right:c.get(e.p2)||`Atleta`,meta:`${e.score1} x ${e.score2}`,detail:E(e.createdAt)})).slice(0,12),D=`
    <section class="group-section queue-section tournament-feed-card ranking-history-card">
      <div class="group-section-header queue-section-header compact">
        <div>
          <span class="section-label">Jogos realizados</span>
          <h3 class="ranking-history-count">${T.length?`${T.length} confronto(s)`:`Sem jogos exibidos`}</h3>
        </div>
        <div class="championship-history-filter ranking-history-filter">
          <label for="rankingCompletedSearch">Buscar atleta</label>
          <input
            id="rankingCompletedSearch"
            type="search"
            placeholder="Nome do jogador"
            value="${w(C)}"
            oninput="setRankingCompletedSearch(this.value)"
          />
        </div>
      </div>
      ${T.length?`
            <div class="ranking-completed-grid">
              ${T.map(e=>`
                    <article class="ranking-completed-card" data-search="${w(`${e.left} ${e.right}`.toLowerCase())}">
                      <strong>${w(I(e.left))} ${w(e.meta)} ${w(I(e.right))}</strong>
                      <span>${w(e.detail)}</span>
                    </article>
                  `).join(``)}
            </div>
            <div class="queue-empty rich ranking-filter-empty" style="display:none">Nenhum jogo encontrado para essa busca.</div>
          `:`<div class="empty-state">Ainda nao houve partidas registradas.</div>`}
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
                  <span>${t+1}°</span>
                  <strong>${w(e.name)}</strong>
                  <small>${w(e.category)}</small>
                  <span>${e.wins}V / ${e.losses}D / ${e.games}J</span>
                </article>
              `).join(``)}
        </div>
      </section>
      ${H(`Jogos em andamento`,`Ao vivo`,x,`Nenhum jogo em andamento agora.`,`tournament-feed-card`)}
      ${H(`Proximos jogos`,`Fila`,S,`Nenhum jogo aguardando nesta categoria.`,`tournament-feed-card`)}
      ${D}
    </div>
  `.replace(/Â°/g,`o`),L(),i.style.display=`flex`}function W(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=m;if(!n||!r||!i||!a)return;let o=e.championshipState?.[t],s=P(e.id),c=o?.groups??[],l=V(o??{}),u=(S===`all`?[...l.values()].flat():l.get(S)??[]).map(e=>({match:e,left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`})).sort((e,t)=>{let n=+(e.left===a.name||e.right===a.name),r=+(t.left===a.name||t.right===a.name);return r===n?(t.match.playedAt??0)-(e.match.playedAt??0):r-n}).slice(0,9).map(e=>({left:e.left,right:e.right,meta:`${e.match.score1??0} x ${e.match.score2??0}`,detail:e.match.groupId||e.match.roundTitle||`Jogo`,playedAt:e.match.playedAt})),d=(o?.activeTables??[]).filter(e=>e.match).map(e=>({left:s.get(e.match.playerIds[0])||`Atleta`,right:s.get(e.match.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:e.match?.roundTitle||e.match?.groupId||`Ao vivo`})),f=(o?.queue??[]).slice(0,10).map(e=>({left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`,meta:e.roundTitle||e.groupId||`Fila`,detail:e.stage===`knockout`?`Mata-mata`:`Grupos`})),p=c.map(e=>({id:e.id,name:e.name}));n.textContent=`${e.title} - Categoria ${t}`,r.innerHTML=`
    <div class="tournament-viewer-shell">
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Grupos</span>
            <h3>Acompanhamento da fase inicial</h3>
          </div>
        </div>
        <div class="championship-result-groups">
          ${c.length?c.map(e=>{let n=B(e,o??{},s).slice(0,4),r=z(t,e).length,i=(o?.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).length;return`
                    <div class="championship-result-group-card ${e.playerIds.includes(a.id)?`highlight`:``}">
                      <strong>${w(e.name)}</strong>
                      <span>${i}/${r} jogos</span>
                      <div class="championship-result-group-mini">
                        ${n.map((e,t)=>`
                              <small>${t+1}° ${w(s.get(e.playerId)||`Atleta`)} - ${e.wins}V</small>
                            `).join(``)}
                      </div>
                    </div>
                  `}).join(``):`<div class="empty-state">Os grupos ainda nao foram definidos.</div>`}
        </div>
      </section>
      ${H(`Jogos em andamento`,`Ao vivo`,d,`Nenhum jogo em andamento nesta categoria.`,`tournament-feed-card championship-live-card`)}
      ${H(`Proximos jogos`,`Fila`,f,`Nenhum proximo jogo liberado ainda.`,`tournament-feed-card championship-live-card`)}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Jogos disputados</span>
            <h3>${u.length?`${u.length} jogo(s)`:`Sem jogos exibidos`}</h3>
          </div>
          <div class="championship-history-filter championship-history-toolbar">
            <label for="championshipCompletedFilter">Grupo</label>
            <select id="championshipCompletedFilter" onchange="setChampionshipCompletedFilter(this.value)">
              <option value="all" ${S===`all`?`selected`:``}>Todos</option>
              ${p.map(e=>`<option value="${e.id}" ${S===e.id?`selected`:``}>${w(e.name)}</option>`).join(``)}
            </select>
          </div>
        </div>
        ${u.length?`
              <div class="championship-history-compact-grid">
                ${u.map(e=>`
                      <article class="championship-history-compact-card ${e.left===a.name||e.right===a.name?`highlight`:``}">
                        <strong>${w(I(e.left))} ${w(e.meta)} ${w(I(e.right))}</strong>
                        <span>${w(e.detail||`Jogo`)} • ${w(E(e.playedAt))}</span>
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
            title="Mata-mata ${w(t)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}&highlight=${encodeURIComponent(a.id)}"
          ></iframe>
        </div>
      </section>
    </div>
  `,i.style.display=`flex`}function G(e,t){let n=document.getElementById(`tournamentCategoryChoiceText`),r=document.getElementById(`tournamentCategoryChoiceOptions`),i=O(e),a=document.getElementById(`tournamentCategoryChoiceModal`);!n||!r||!a||!i||(y=e,n.textContent=`Selecione qual categoria voce deseja acompanhar em ${i.title}.`,r.innerHTML=t.map(e=>`<button class="btn primary" onclick="confirmTournamentCategoryChoice('${e}')">Categoria ${e}</button>`).join(``),a.style.display=`flex`)}function K(){let e=document.getElementById(`myChampionshipsList`);if(!e)return;let t=h.map(e=>{let t=O(e.tournamentId||e.id);if(!t)return``;let n=N(t,e),r=d(t)?`Ranking`:`Campeonato`,i=t.status===`finished`?`Finalizado`:t.status===`open`?`Em andamento`:t.status===`closed`?`Inscricoes encerradas`:`Aguardando`;return`
        <article class="card profile-card tournament-tracker-card">
          <div class="section-header">
            <div>
              <span class="section-label">${r}</span>
              <h3>${w(t.title)}</h3>
            </div>
            <span class="result-pill ${t.status===`finished`?`neutral`:`win`}">${i}</span>
          </div>
          <div class="stack-item-grid">
            <span>Data: ${T(t.startDate)}</span>
            <span>Local: ${w(t.location||`A definir`)}</span>
            <span>Minhas categorias: ${w(n.join(`, `)||e.category||`Livre`)}</span>
            <span>Tipo: ${r}</span>
          </div>
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="openTournamentViewer('${t.id}')">Acompanhar torneio</button>
          </div>
        </article>
      `}).filter(Boolean);e.innerHTML=t.length?t.join(``):`<div class="empty-state">Voce ainda nao possui torneios aprovados para acompanhar aqui.</div>`}async function q(e){let[c,l,u,d]=await Promise.all([r(o(i,`users`,e)),t(s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`))),t(s(n(i,`tournaments`),a(`startDate`,`asc`))),t(n(i,`matches`))]);if(!c.exists()){window.location.replace(`/pages/profile.html`);return}m={id:c.id,...c.data()},g=u.docs.map(e=>({id:e.id,...e.data()})),h=l.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.paymentStatus===`approved`).filter(e=>g.some(t=>t.id===(e.tournamentId||e.id)));let f=[...new Set(h.map(e=>e.tournamentId||e.id))],p=await Promise.all(f.map(async e=>[e,(await t(n(i,`tournaments`,e,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))]));_=new Map(p),v=new Map(f.map(e=>[e,d.docs.map(e=>({id:e.id,...e.data()})).filter(t=>t.tournamentId===e)])),K()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await l(c),window.location.replace(`/pages/login.html`)},window.closeTournamentViewerModal=()=>{let e=document.getElementById(`tournamentViewerModal`);e&&(e.style.display=`none`),b=null,x=null,C=``,S=`all`},window.closeTournamentCategoryChoiceModal=()=>{let e=document.getElementById(`tournamentCategoryChoiceModal`);e&&(e.style.display=`none`),y=null},window.confirmTournamentCategoryChoice=e=>{let t=y;if(!t)return;let n=O(t);n&&(window.closeTournamentCategoryChoiceModal(),b=t,x=e,S=`all`,W(n,e))},window.setChampionshipCompletedFilter=e=>{if(S=e||`all`,!b||!x)return;let t=O(b);t&&W(t,x)},window.setRankingCompletedSearch=e=>{C=e||``,L()},window.openTournamentViewer=e=>{let t=O(e),n=k(e);if(!t||!n)return;if(d(t)){b=e,x=null,U(t,n);return}let r=N(t,n).map(e=>D(e)).filter(Boolean);if(!r.length){b=e,x=`A`,S=`all`,W(t,`A`);return}if(r.length===1){b=e,x=r[0],S=`all`,W(t,r[0]);return}G(e,r)},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await q(e.uid)}catch(e){console.error(`Erro ao carregar meus torneios:`,e);let t=document.getElementById(`myChampionshipsList`);t&&(t.innerHTML=`<div class="empty-state">Nao foi possivel carregar seus torneios agora.</div>`)}});