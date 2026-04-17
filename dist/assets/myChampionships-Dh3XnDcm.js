import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,x as l}from"./firebase-VBRKn9At.js";/* empty css               */import{c as u,f as d,s as f}from"./tournament-rules-D9Tq3W95.js";var p=null,m=[],h=[],g=new Map,_=new Map,v=null,y=null,b=null,x=`all`,S=``;function C(e){return(e??``).replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`).replace(/"/g,`&quot;`).replace(/'/g,`&#39;`)}function w(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Nao informado`}function T(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`,timeStyle:`short`}).format(e):`Nao informado`}function E(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function D(e){return h.find(t=>t.id===e)??null}function O(e){return m.find(t=>(t.tournamentId||t.id)===e)??null}function k(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function A(e){return new Map((g.get(e)??[]).map(e=>[e.id,e.name]))}function j(e,t,n){if(!n)return!0;let r=n.toLowerCase();return e.toLowerCase().includes(r)||t.toLowerCase().includes(r)}function M(e,t){let n=new Map;return(g.get(e)??[]).filter(e=>e.paymentStatus===`approved`).forEach(e=>{n.set(e.id,{wins:0,losses:0,games:0})}),(_.get(e)??[]).filter(e=>(e.group??`general`)===t).forEach(e=>{let t=n.get(e.p1),r=n.get(e.p2);t&&(t.games+=1),r&&(r.games+=1),e.winner===e.p1?(t&&(t.wins+=1),r&&(r.losses+=1)):(r&&(r.wins+=1),t&&(t.losses+=1))}),n}function N(e,t){let n=[];for(let r=0;r<t.playerIds.length;r++)for(let i=r+1;i<t.playerIds.length;i++)n.push({id:`${e}_${t.id}_${t.playerIds[r]}_${t.playerIds[i]}`,stage:`groups`,category:e,groupId:t.id,playerIds:[t.playerIds[r],t.playerIds[i]]});return n}function P(e,t,n){let r=new Map;return e.playerIds.forEach(e=>{r.set(e,{wins:0,losses:0,scored:0,conceded:0})}),(t.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).forEach(e=>{let[t,n]=e.playerIds,i=r.get(t),a=r.get(n);if(!i||!a)return;let o=e.score1??0,s=e.score2??0;i.scored+=o,i.conceded+=s,a.scored+=s,a.conceded+=o,e.winnerId===t?(i.wins+=1,a.losses+=1):e.winnerId===n&&(a.wins+=1,i.losses+=1)}),[...r.entries()].map(([e,t])=>({playerId:e,...t})).sort((e,t)=>{if(t.wins!==e.wins)return t.wins-e.wins;let r=e.scored-e.conceded,i=t.scored-t.conceded;return i===r?(n.get(e.playerId)||`Atleta`).localeCompare(n.get(t.playerId)||`Atleta`):i-r})}function F(e){let t=new Map;return(e.completedMatches??[]).filter(e=>e.stage===`groups`).forEach(e=>{let n=e.groupId||`Sem grupo`;t.set(n,[...t.get(n)??[],e])}),t}function I(e,t,n,r,i=``){return`
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
                        <strong>${C(e.left)}</strong>
                        <span>${C(e.meta)}</span>
                      </div>
                      <div class="queue-versus">vs</div>
                      <div class="queue-player-block">
                        <strong>${C(e.right)}</strong>
                        <span>${C(e.detail||``)}</span>
                      </div>
                    </div>
                  `).join(``)}
            </div>`:`<div class="queue-empty rich">${r}</div>`}
    </section>
  `}function L(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=p;if(!n||!r||!i||!a)return;let o=u(e,k(t)[0]||t.category||`A`),s=e.rankingLiveState?.[o],c=A(e.id),l=M(e.id,o),d=(g.get(e.id)??[]).filter(e=>e.paymentStatus===`approved`).filter(t=>u(e,t.category||t.categories?.[0])===o).map(e=>({id:e.id,name:e.name,category:e.category||`Categoria`,...l.get(e.id)??{wins:0,losses:0,games:0}})).sort((e,t)=>t.wins===e.wins?e.losses===t.losses?t.games===e.games?e.name.localeCompare(t.name):t.games-e.games:e.losses-t.losses:t.wins-e.wins),m=(s?.activeTables??[]).filter(e=>e.playerIds?.length===2).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:f(o)})),h=(s?.queue??[]).map(e=>({left:c.get(e.playerIds[0])||`Atleta`,right:c.get(e.playerIds[1])||`Atleta`,meta:f(o),detail:`Na fila`})),v=(_.get(e.id)??[]).filter(e=>(e.group??`general`)===o).sort((e,t)=>t.createdAt-e.createdAt).map(e=>({left:c.get(e.p1)||`Atleta`,right:c.get(e.p2)||`Atleta`,meta:`${e.score1} x ${e.score2}`,detail:T(e.createdAt)})).filter(e=>j(e.left,e.right,S)).slice(0,12),y=`
    <section class="group-section queue-section tournament-feed-card ranking-history-card">
      <div class="group-section-header queue-section-header compact">
        <div>
          <span class="section-label">Jogos realizados</span>
          <h3>${v.length?`${v.length} confronto(s)`:`Sem jogos exibidos`}</h3>
        </div>
        <div class="championship-history-filter ranking-history-filter">
          <label for="rankingCompletedSearch">Buscar atleta</label>
          <input
            id="rankingCompletedSearch"
            type="search"
            placeholder="Nome do jogador"
            value="${C(S)}"
            oninput="setRankingCompletedSearch(this.value)"
          />
        </div>
      </div>
      ${v.length?`
            <div class="ranking-completed-grid">
              ${v.map(e=>`
                    <article class="ranking-completed-card">
                      <strong>${C(e.left)} ${C(e.meta)} ${C(e.right)}</strong>
                      <span>${C(e.detail)}</span>
                    </article>
                  `).join(``)}
            </div>
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
          ${d.map((e,t)=>`
                <article class="ranking-athlete-card ${e.id===a.id?`highlight`:``} ${t===0?`podium-gold`:t===1?`podium-silver`:t===2?`podium-bronze`:``}">
                  <span>${t+1}°</span>
                  <strong>${C(e.name)}</strong>
                  <small>${C(e.category)}</small>
                  <span>${e.wins}V / ${e.losses}D / ${e.games}J</span>
                </article>
              `).join(``)}
        </div>
      </section>
      ${I(`Jogos em andamento`,`Ao vivo`,m,`Nenhum jogo em andamento agora.`,`tournament-feed-card`)}
      ${I(`Proximos jogos`,`Fila`,h,`Nenhum jogo aguardando nesta categoria.`,`tournament-feed-card`)}
      ${y}
    </div>
  `.replace(/Â°/g,`o`),i.style.display=`flex`}function R(e,t){let n=document.getElementById(`tournamentViewerTitle`),r=document.getElementById(`tournamentViewerContent`),i=document.getElementById(`tournamentViewerModal`),a=p;if(!n||!r||!i||!a)return;let o=e.championshipState?.[t],s=A(e.id),c=o?.groups??[],l=F(o??{}),u=(x===`all`?[...l.values()].flat():l.get(x)??[]).sort((e,t)=>(t.playedAt??0)-(e.playedAt??0)).slice(0,3).map(e=>({left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`,meta:`${e.score1??0} x ${e.score2??0}`,detail:e.groupId||e.roundTitle||`Jogo`})),d=(o?.activeTables??[]).filter(e=>e.match).map(e=>({left:s.get(e.match.playerIds[0])||`Atleta`,right:s.get(e.match.playerIds[1])||`Atleta`,meta:`Mesa ${e.id}`,detail:e.match?.roundTitle||e.match?.groupId||`Ao vivo`})),f=(o?.queue??[]).slice(0,10).map(e=>({left:s.get(e.playerIds[0])||`Atleta`,right:s.get(e.playerIds[1])||`Atleta`,meta:e.roundTitle||e.groupId||`Fila`,detail:e.stage===`knockout`?`Mata-mata`:`Grupos`})),m=c.map(e=>({id:e.id,name:e.name}));n.textContent=`${e.title} - Categoria ${t}`,r.innerHTML=`
    <div class="tournament-viewer-shell">
      <section class="group-section">
        <div class="section-header compact-section-header">
          <div>
            <span class="section-label">Grupos</span>
            <h3>Acompanhamento da fase inicial</h3>
          </div>
        </div>
        <div class="championship-result-groups">
          ${c.length?c.map(e=>{let n=P(e,o??{},s).slice(0,4),r=N(t,e).length,i=(o?.completedMatches??[]).filter(t=>t.stage===`groups`&&t.groupId===e.id).length;return`
                    <div class="championship-result-group-card ${e.playerIds.includes(a.id)?`highlight`:``}">
                      <strong>${C(e.name)}</strong>
                      <span>${i}/${r} jogos</span>
                      <div class="championship-result-group-mini">
                        ${n.map((e,t)=>`
                              <small>${t+1}° ${C(s.get(e.playerId)||`Atleta`)} - ${e.wins}V</small>
                            `).join(``)}
                      </div>
                    </div>
                  `}).join(``):`<div class="empty-state">Os grupos ainda nao foram definidos.</div>`}
        </div>
      </section>
      ${I(`Jogos em andamento`,`Ao vivo`,d,`Nenhum jogo em andamento nesta categoria.`,`tournament-feed-card championship-live-card`)}
      ${I(`Proximos jogos`,`Fila`,f,`Nenhum proximo jogo liberado ainda.`,`tournament-feed-card championship-live-card`)}
      <section class="group-section queue-section tournament-feed-card championship-history-card">
        <div class="group-section-header queue-section-header compact">
          <div>
            <span class="section-label">Jogos disputados</span>
            <h3>${u.length?`${u.length} jogo(s)`:`Sem jogos exibidos`}</h3>
          </div>
          <div class="championship-history-filter">
            <label for="championshipCompletedFilter">Grupo</label>
            <select id="championshipCompletedFilter" onchange="setChampionshipCompletedFilter(this.value)">
              <option value="all" ${x===`all`?`selected`:``}>Todos</option>
              ${m.map(e=>`<option value="${e.id}" ${x===e.id?`selected`:``}>${C(e.name)}</option>`).join(``)}
            </select>
          </div>
        </div>
        ${I(``,`Finalizado`,u,`Nenhuma partida concluida ainda.`,`championship-history-inner`)}
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
            title="Mata-mata ${C(t)}"
            loading="lazy"
            src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}&highlight=${encodeURIComponent(a.id)}"
          ></iframe>
        </div>
      </section>
    </div>
  `,i.style.display=`flex`}function z(e,t){let n=document.getElementById(`tournamentCategoryChoiceText`),r=document.getElementById(`tournamentCategoryChoiceOptions`),i=D(e),a=document.getElementById(`tournamentCategoryChoiceModal`);!n||!r||!a||!i||(v=e,n.textContent=`Selecione qual categoria voce deseja acompanhar em ${i.title}.`,r.innerHTML=t.map(e=>`<button class="btn primary" onclick="confirmTournamentCategoryChoice('${e}')">Categoria ${e}</button>`).join(``),a.style.display=`flex`)}function B(){let e=document.getElementById(`myChampionshipsList`);if(!e)return;let t=m.map(e=>{let t=D(e.tournamentId||e.id);if(!t)return``;let n=k(e),r=d(t)?`Ranking`:`Campeonato`,i=t.status===`finished`?`Finalizado`:t.status===`open`?`Em andamento`:t.status===`closed`?`Inscricoes encerradas`:`Aguardando`;return`
        <article class="card profile-card tournament-tracker-card">
          <div class="section-header">
            <div>
              <span class="section-label">${r}</span>
              <h3>${C(t.title)}</h3>
            </div>
            <span class="result-pill ${t.status===`finished`?`neutral`:`win`}">${i}</span>
          </div>
          <div class="stack-item-grid">
            <span>Data: ${w(t.startDate)}</span>
            <span>Local: ${C(t.location||`A definir`)}</span>
            <span>Minhas categorias: ${C(n.join(`, `)||e.category||`Livre`)}</span>
            <span>Tipo: ${r}</span>
          </div>
          <div class="admin-tournament-actions">
            <button class="btn primary" onclick="openTournamentViewer('${t.id}')">Acompanhar torneio</button>
          </div>
        </article>
      `}).filter(Boolean);e.innerHTML=t.length?t.join(``):`<div class="empty-state">Voce ainda nao possui torneios aprovados para acompanhar aqui.</div>`}async function V(e){let[c,l,u,d]=await Promise.all([r(o(i,`users`,e)),t(s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`))),t(s(n(i,`tournaments`),a(`startDate`,`asc`))),t(n(i,`matches`))]);if(!c.exists()){window.location.replace(`/pages/profile.html`);return}p={id:c.id,...c.data()},h=u.docs.map(e=>({id:e.id,...e.data()})),m=l.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.paymentStatus===`approved`).filter(e=>h.some(t=>t.id===(e.tournamentId||e.id)));let f=[...new Set(m.map(e=>e.tournamentId||e.id))],v=await Promise.all(f.map(async e=>[e,(await t(n(i,`tournaments`,e,`registrations`))).docs.map(e=>({id:e.id,...e.data()}))]));g=new Map(v),_=new Map(f.map(e=>[e,d.docs.map(e=>({id:e.id,...e.data()})).filter(t=>t.tournamentId===e)])),B()}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await l(c),window.location.replace(`/pages/login.html`)},window.closeTournamentViewerModal=()=>{let e=document.getElementById(`tournamentViewerModal`);e&&(e.style.display=`none`),y=null,b=null,S=``,x=`all`},window.closeTournamentCategoryChoiceModal=()=>{let e=document.getElementById(`tournamentCategoryChoiceModal`);e&&(e.style.display=`none`),v=null},window.confirmTournamentCategoryChoice=e=>{let t=v;if(!t)return;let n=D(t);n&&(window.closeTournamentCategoryChoiceModal(),y=t,b=e,x=`all`,R(n,e))},window.setChampionshipCompletedFilter=e=>{if(x=e||`all`,!y||!b)return;let t=D(y);t&&R(t,b)},window.setRankingCompletedSearch=e=>{if(S=e||``,!y)return;let t=D(y),n=O(y);!t||!n||!d(t)||L(t,n)},window.openTournamentViewer=e=>{let t=D(e),n=O(e);if(!t||!n)return;if(d(t)){y=e,b=null,L(t,n);return}let r=k(n).map(e=>E(e)).filter(Boolean);if(!r.length){y=e,b=`A`,x=`all`,R(t,`A`);return}if(r.length===1){y=e,b=r[0],x=`all`,R(t,r[0]);return}z(e,r)},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await V(e.uid)}catch(e){console.error(`Erro ao carregar meus torneios:`,e);let t=document.getElementById(`myChampionshipsList`);t&&(t.innerHTML=`<div class="empty-state">Nao foi possivel carregar seus torneios agora.</div>`)}});