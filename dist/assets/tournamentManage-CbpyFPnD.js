import"./modulepreload-polyfill-CGdBa_z4.js";import{_ as e,a as t,b as n,d as r,f as i,i as a,l as o,m as s,n as c,p as l,r as u,s as d,t as f,u as p}from"./firebase-DxeB7Pug.js";/* empty css               */var m=[],h=[],g=[],_=[{id:1}],v=2;function y(){return v++}function b(){let e=new Set;return _.forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)}),e}function x(e,t){return h.some(n=>n.p1===e&&n.p2===t||n.p1===t&&n.p2===e)}function S(e){let t=e.lastPlayed?Date.now()-e.lastPlayed:999999999;return-e.games*1e3+t/1e3}function C(e,t){let n=Math.abs(e.wins-t.wins),r=x(e.id,t.id)?1e6:0;return n*1e3+r}function w(){if(b().size>0)return;let e=[...m.filter(e=>e.active)].sort((e,t)=>S(e)-S(t)),t=new Set,n=[];for(let r=0;r<e.length;r++){let i=e[r];if(t.has(i.id))continue;let a=null,o=1/0;for(let n=r+1;n<e.length;n++){let r=e[n];if(t.has(r.id))continue;let s=C(i,r);s<o&&(o=s,a=r)}a&&(n.push([i,a]),t.add(i.id),t.add(a.id))}g.length>0||n.forEach(e=>g.push(e))}var T=!1;function E(){return m}function D(){let e=new Set;_.forEach(t=>{t.p1&&e.add(t.p1.id),t.p2&&e.add(t.p2.id)}),document.getElementById(`playersPlaying`).innerText=String(e.size),document.getElementById(`playersWaiting`).innerText=String(E().filter(t=>t.active&&!e.has(t.id)).length),document.getElementById(`playersTotal`).innerText=String(E().length)}window.toggleRankingView=()=>{T=!T,O()};function O(){let e=document.getElementById(`ranking`),t=document.getElementById(`registrations`),n=document.getElementById(`tables`),r=document.getElementById(`queue`),i=document.getElementById(`tableCount`),a=document.getElementById(`startBtn`),o=_.length===1;if(a){let e=m.filter(e=>e.active);ee()?e.length<2?(a.disabled=!0,a.innerText=`Ative Atletas`):(a.disabled=!1,a.innerText=`Iniciar`):(a.disabled=!0,a.innerText=`Ative um torneio`)}i&&(i.innerText=String(_.length));let s=[...E()].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?e.name.localeCompare(t.name):e.losses-t.losses:t.wins-e.wins),c=s.slice(0,5),l=s.slice(5);if(e.innerHTML=`
    <div class="ranking-list">
      ${c.map((e,t)=>{let n=``;t===0&&(n=`gold`),t===1&&(n=`silver`),t===2&&(n=`bronze`);let r=$(e.id);return`
            <div class="player-row ${n}">
              <div style="width:70%; display:flex; gap:4px;">
                <span>${t+1} -</span>
                <span class="player-name" onclick="showHistory('${e.id}')">${e.name}</span>
              </div>
              <div style="width:10%;">
                W:${r.wins} L:${r.losses} J:${r.games}
              </div>
              <div class="player-actions">
                <button onclick="editPlayer('${e.id}')">Editar</button>
                <button onclick="togglePlayer('${e.id}')">${e.active?`Ativo`:`Pausado`}</button>
                <button onclick="deletePlayer('${e.id}')">Remover</button>
              </div>
            </div>
          `}).join(``)}

      ${l.length>0?`
            <div class="ranking-hidden ${T?`open`:``}">
              ${l.map((e,t)=>{let n=t+6,r=$(e.id);return`
                    <div class="player-row faded">
                      <div style="width:70%; display:flex; gap:4px;">
                        <span>${n} -</span>
                        <span class="player-name" onclick="showHistory('${e.id}')">${e.name}</span>
                      </div>
                      <div style="width:10%;">
                        W:${r.wins} L:${r.losses} J:${r.games}
                      </div>
                      <div class="player-actions">
                        <button onclick="editPlayer('${e.id}')">Editar</button>
                        <button onclick="togglePlayer('${e.id}')">${e.active?`Ativo`:`Pausado`}</button>
                        <button onclick="deletePlayer('${e.id}')">Remover</button>
                      </div>
                    </div>
                  `}).join(``)}
              ${T?``:`<div class="fade-overlay"></div>`}
            </div>
            <div class="ranking-toggle" onclick="toggleRankingView()">
              ${T?`Mostrar menos`:`Mostrar mais`}
            </div>
          `:``}
    </div>
  `,t){let e=q();t.innerHTML=e.length?e.map(e=>`
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${e.name}</strong>
                    <span>${e.email||`Email nao informado`}</span>
                  </div>
                  <span class="result-pill ${e.paymentStatus===`approved`?`win`:`neutral`}">
                    ${e.paymentStatus===`approved`?`Pago aprovado`:`Pagamento em analise`}
                  </span>
                </div>
                <div class="stack-item-grid">
                  <span>Categoria: ${e.category||`Nao informada`}</span>
                  <span>Valor: ${e.registrationFee===void 0?`Nao informado`:new Intl.NumberFormat(`pt-BR`,{style:`currency`,currency:`BRL`}).format(e.registrationFee)}</span>
                </div>
                <div class="admin-tournament-actions">
                  ${e.paymentStatus===`approved`?`<button class="btn secondary" disabled>Pagamento aprovado</button>`:`<button class="btn primary" onclick="approveRegistration('${e.id}')">Aprovar pagamento</button>`}
                  <button class="btn danger" onclick="removeRegistration('${e.id}')">Remover inscricao</button>
                </div>
              </div>
            `).join(``):`<div class="empty-state">Nenhuma inscricao recebida ainda.</div>`}n.innerHTML=_.map((e,t)=>{let n=e.p1&&e.p2,r=o?`single`:``;return n?`
        <div class="table-card busy ${r}">
          <div class="table-header">
            Mesa ${t+1}
            <span class="status busy">Em jogo</span>
          </div>

          <div class="players">
            <span>${e.p1?.name}</span>
            <span class="vs">vs</span>
            <span>${e.p2?.name}</span>
          </div>

          <div class="score-box">
            <input id="s1_${t}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish(${t})">
            <span>x</span>
            <input id="s2_${t}" type="number" min="0" step="1" value="0" onkeydown="if(event.key==='Enter')finish(${t})">
          </div>

          <button class="finish-btn" onclick="finish(${t})">Finalizar</button>
        </div>
      `:`
          <div class="table-card free ${r}">
            <div class="table-header">
              Mesa ${t+1}
              <span class="status free">Livre</span>
            </div>
          </div>
        `}).join(``);let u=new Set;_.forEach(e=>{e.p1&&u.add(e.p1.id),e.p2&&u.add(e.p2.id)});let d=g.filter(([e,t])=>!u.has(e.id)&&!u.has(t.id)).slice(0,_.length);d.length===0?r.innerHTML=`<div class="queue-empty">Aguardando partidas</div>`:r.innerHTML=d.map(e=>`
          <div class="queue-card">
            ${e[0].name} vs ${e[1].name}
          </div>
        `).join(``),D()}var k=new URLSearchParams(window.location.search).get(`id`),A=!1,j=null,M=new Set,N=[];function P(){return{wins:0,losses:0,games:0,active:!0,createdAt:Date.now()}}function F(e){let t=e.playerProfile??P();return{id:e.id,name:e.name,wins:t.wins??0,losses:t.losses??0,games:t.games??0,active:t.active??!0,createdAt:t.createdAt??e.createdAt,lastPlayed:t.lastPlayed}}function ee(){return!!(j&&j.status!==`finished`)}function I(){_.length=0,_.push({id:1})}function L(){g.length=0}function R(e,t){j&&(e.delete(l(c,`tournaments`,j.id,`registrations`,t)),e.delete(l(c,`users`,t,`registrations`,j.id)))}function z(){localStorage.setItem(`tableCount:${k??`default`}`,String(_.length))}function te(){let e=Number(localStorage.getItem(`tableCount:${k??`default`}`)??`1`);if(!(!Number.isInteger(e)||e<1)){I();for(let t=1;t<e;t++)_.push({id:y()})}}function ne(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function B(){document.getElementById(`activeTournamentName`).textContent=j?.title||`Torneio nao encontrado`,document.getElementById(`tournamentStatusLabel`).textContent=j?.status===`finished`?`Finalizado`:j?.isActive?`Em andamento`:j?.status===`open`?`Inscricoes abertas`:`Em breve`}async function V(){if(!k){window.location.replace(`/pages/dashboard.html`);return}let e=await a(l(c,`tournaments`,k));if(!e.exists()){window.location.replace(`/pages/dashboard.html`);return}j={id:e.id,...e.data()},B()}async function H(){if(!j){m.length=0,M=new Set;return}let[e,n]=await Promise.all([t(d(i(c,`users`),p(`role`,`==`,`user`))),t(i(c,`tournaments`,j.id,`registrations`))]);N=n.docs.map(e=>({id:e.id,...e.data()})),M=new Set(N.filter(e=>e.paymentStatus===`approved`).map(e=>e.id)),m.length=0,m.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.profileComplete&&M.has(e.id)).map(e=>F(e)).sort((e,t)=>e.name.localeCompare(t.name)))}async function U(){if(h.length=0,!j)return;let e=await t(i(c,`matches`));h.push(...e.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.tournamentId===j?.id).sort((e,t)=>e.createdAt-t.createdAt))}async function W(){await V(),await Promise.all([H(),U()]),B(),O()}async function G(){if(j)try{await H(),O()}catch(e){console.error(`Erro ao atualizar inscricoes do torneio:`,e)}}function K(){return m.filter(e=>e.games>0||e.active)}function q(){return N.sort((e,t)=>e.name.localeCompare(t.name))}function J(){return[...K()].sort((e,t)=>t.wins===e.wins?e.losses===t.losses?t.games===e.games?e.name.localeCompare(t.name):t.games-e.games:e.losses-t.losses:t.wins-e.wins)}function Y(e){return e===1?`Campeao`:e===2?`Vice-campeao`:e===3?`3o lugar`:`${e}o lugar`}function X(){m.forEach(e=>{e.wins=0,e.losses=0,e.games=0,e.active=!1,e.lastPlayed=void 0}),h.length=0,L(),I(),z()}async function Z(){if(!j||j.isActive)return;let e=await t(d(i(c,`tournaments`),p(`isActive`,`==`,!0))),n=r(c);e.forEach(e=>{e.id!==j?.id&&n.update(e.ref,{isActive:!1,updatedAt:Date.now()})}),n.update(l(c,`tournaments`,j.id),{isActive:!0,status:`open`,updatedAt:Date.now()}),await n.commit(),j={...j,isActive:!0,status:`open`,updatedAt:Date.now()},B()}async function re(e,t,n){if(!j)return;let i=m.find(e=>e.id===t),a=m.find(e=>e.id===n);if(!i||!a)return;let o={id:e.id,tournamentId:j.id,tournamentTitle:j.title,opponentName:a.name,scoreLabel:`${e.score1} x ${e.score2}`,tableLabel:e.tableLabel,result:`win`,playedAt:e.createdAt},u={id:e.id,tournamentId:j.id,tournamentTitle:j.title,opponentName:i.name,scoreLabel:`${e.score2} x ${e.score1}`,tableLabel:e.tableLabel,result:`loss`,playedAt:e.createdAt},d=r(c);d.set(l(c,`users`,i.id,`matches`,e.id),o),d.set(l(c,`users`,a.id,`matches`,e.id),u),d.set(l(c,`users`,i.id,`tournaments`,j.id),{tournamentId:j.id,title:j.title,category:j.category||`Livre`,result:`Em andamento`,matchCount:s(1),wins:s(1),losses:s(0),playedAt:e.createdAt},{merge:!0}),d.set(l(c,`users`,a.id,`tournaments`,j.id),{tournamentId:j.id,title:j.title,category:j.category||`Livre`,result:`Em andamento`,matchCount:s(1),wins:s(0),losses:s(1),playedAt:e.createdAt},{merge:!0}),await d.commit()}function Q(){for(let e=0;e<_.length;e++)if(!_[e].p1&&g.length){let t=g.shift();_[e]={id:_[e].id,p1:t[0],p2:t[1]}}}function ie(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}async function ae(e){return ie((await a(l(c,`users`,e))).data())}window.logout=async()=>{await n(f),window.location.replace(`/pages/login.html`)},window.goToDashboard=()=>{window.location.href=`/pages/dashboard.html`},window.editCurrentTournament=()=>{j&&(window.location.href=`/pages/tournament-form.html?id=${j.id}`)},window.openProfile=()=>{window.location.href=`/pages/profile.html`},e(f,async e=>{if(A)return;if(A=!0,!e){window.location.replace(`/pages/login.html`);return}let t=await ae(e.uid);t&&(ne(t),te(),await W(),window.addEventListener(`focus`,G),document.addEventListener(`visibilitychange`,()=>{document.visibilityState===`visible`&&G()}),window.setInterval(()=>{G()},15e3))}),window.addPlayer=async()=>{let e=document.getElementById(`name`),t=e.value.trim();if(t){if(await H(),m.some(e=>e.name.toLowerCase()===t.toLowerCase()&&e.active)){alert(`Atleta ja esta ativo neste torneio.`);return}try{let n=m.find(e=>e.name.trim().toLowerCase()===t.toLowerCase()&&!e.active);if(!n){let e=m.some(e=>e.name.trim().toLowerCase()===t.toLowerCase());alert(e?`Esse atleta ja esta ativo neste torneio ou nao pode ser ativado agora.`:`Esse atleta nao esta inscrito neste torneio. Oriente-o a se inscrever pela agenda.`);return}({...P()}),await o(l(c,`users`,n.id),{"playerProfile.active":!0,updatedAt:Date.now()}),n.active=!0,m.sort((e,t)=>e.name.localeCompare(t.name)),e.value=``,O()}catch(e){alert(`Erro ao ativar atleta: `+e.message)}}},window.approveRegistration=async e=>{if(j&&N.find(t=>t.id===e))try{let t=r(c);t.update(l(c,`tournaments`,j.id,`registrations`,e),{paymentStatus:`approved`}),t.update(l(c,`users`,e,`registrations`,j.id),{paymentStatus:`approved`}),await t.commit(),await H(),O()}catch(e){alert(`Erro ao aprovar pagamento: `+e.message)}},window.removeRegistration=async e=>{if(!j)return;let t=N.find(t=>t.id===e);if(t&&confirm(`Remover a inscricao de ${t.name}?`))try{let t=r(c);R(t,e),t.update(l(c,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),await t.commit(),await H(),O()}catch(e){alert(`Erro ao remover inscricao: `+e.message)}},window.start=async()=>{if(!j){alert(`Torneio nao encontrado.`);return}await Z(),w(),Q(),O()},window.resetMatches=async()=>{if(j)try{let e=r(c);h.forEach(t=>{e.delete(l(c,`matches`,t.id)),e.delete(l(c,`users`,t.p1,`matches`,t.id)),e.delete(l(c,`users`,t.p2,`matches`,t.id))}),K().forEach(t=>{e.update(l(c,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.lastPlayed":null}),e.delete(l(c,`users`,t.id,`tournaments`,j.id))}),await e.commit(),h.length=0,L(),I(),z(),O()}catch(e){alert(`Erro ao resetar campeonato: `+e.message)}},window.finishTournament=async()=>{if(!j)return;let e=J();if(!e.length){alert(`Adicione atletas e finalize partidas antes de encerrar o torneio.`);return}if(confirm(`Encerrar o torneio "${j.title}"?`))try{let t=r(c),n=Date.now();e.forEach((e,r)=>{let i=r+1;t.set(l(c,`users`,e.id,`tournaments`,j.id),{tournamentId:j.id,title:j.title,category:j.category||`Livre`,placement:`${i}o lugar`,result:Y(i),matchCount:e.games,wins:e.wins,losses:e.losses,playedAt:n},{merge:!0}),t.update(l(c,`users`,e.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null})}),t.update(l(c,`tournaments`,j.id),{isActive:!1,status:`finished`,updatedAt:n,completedAt:n}),await t.commit(),j={...j,isActive:!1,status:`finished`,updatedAt:n},B(),X(),O()}catch(e){alert(`Erro ao encerrar torneio: `+e.message)}},window.deletePlayer=async e=>{if(confirm(`Remover atleta deste torneio?`))try{let t=r(c);t.update(l(c,`users`,e),{"playerProfile.active":!1,"playerProfile.games":0,"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.lastPlayed":null}),R(t,e),t.delete(l(c,`users`,e,`tournaments`,j.id)),await t.commit();let n=m.find(t=>t.id===e);n&&(n.active=!1,n.games=0,n.wins=0,n.losses=0,n.lastPlayed=void 0),L(),_.forEach(t=>{(t.p1?.id===e||t.p2?.id===e)&&(t.p1=void 0,t.p2=void 0)}),O()}catch(e){alert(`Erro ao remover atleta do torneio: `+e.message)}},window.editPlayer=async e=>{let t=m.find(t=>t.id===e);if(!t)return;let n=prompt(`Novo nome:`,t.name)?.trim();if(n){t.name=n;try{await o(l(c,`users`,e),{name:n,updatedAt:Date.now()}),m.sort((e,t)=>e.name.localeCompare(t.name)),O()}catch(e){alert(`Erro ao editar atleta: `+e.message)}}},window.togglePlayer=async e=>{let t=m.find(t=>t.id===e);if(t){t.active=!t.active;try{await o(l(c,`users`,e),{"playerProfile.active":t.active}),L(),O()}catch(e){alert(`Erro ao atualizar atleta: `+e.message)}}},window.showHistory=e=>{let t=m.find(t=>t.id===e);if(!t)return;let n=h.filter(t=>t.p1===e||t.p2===e).map(t=>{let n=t.p1===e,r=n?t.p2:t.p1,i=m.find(e=>e.id===r),a=t.winner===e,o=n?t.score1:t.score2,s=n?t.score2:t.score1;return`
        <div class="history-item ${a?`win`:`loss`}">
          <div>vs ${i?.name??`Jogador removido`}</div>
          <div>${o} x ${s}</div>
        </div>
      `}).join(``);document.getElementById(`historyTitle`).innerText=`Historico - ${t.name}`;let r=$(e),i=`
    <div class="history-stats">
      <span>${r.wins} vitorias</span>
      <span>${r.losses} derrotas</span>
      <span>${r.setsWon} sets ganhos</span>
      <span>${r.setsLost} sets perdidos</span>
      <span>${r.winRate}% aproveitamento</span>
    </div>
  `;document.getElementById(`historyList`).innerHTML=i+(n||`<div>Nenhum jogo ainda</div>`),document.getElementById(`historyModal`).style.display=`flex`};function $(e){let t=h.filter(t=>t.p1===e||t.p2===e),n=0,r=0,i=0,a=0;t.forEach(t=>{let o=t.p1===e,s=o?t.score1:t.score2,c=o?t.score2:t.score1;i+=s,a+=c,t.winner===e?n++:r++});let o=t.length,s=o>0?(n/o*100).toFixed(1):`0`;return{wins:n,losses:r,games:o,setsWon:i,setsLost:a,winRate:s}}window.clearPlayers=async()=>{if(j&&confirm(`Tem certeza que deseja limpar o campeonato atual e desativar os atletas deste torneio?`))try{let e=r(c);K().forEach(t=>{e.update(l(c,`users`,t.id),{"playerProfile.wins":0,"playerProfile.losses":0,"playerProfile.games":0,"playerProfile.active":!1,"playerProfile.lastPlayed":null}),R(e,t.id),e.delete(l(c,`users`,t.id,`tournaments`,j.id))}),h.forEach(t=>{e.delete(l(c,`matches`,t.id)),e.delete(l(c,`users`,t.p1,`matches`,t.id)),e.delete(l(c,`users`,t.p2,`matches`,t.id))}),await e.commit(),X(),O()}catch(e){console.error(`Erro ao limpar campeonato:`,e)}},window.finish=async e=>{let t=_[e];if(!t.p1||!t.p2||!j)return;let n=parseInt(document.getElementById(`s1_${e}`).value,10),a=parseInt(document.getElementById(`s2_${e}`).value,10);if(isNaN(n)||isNaN(a)){alert(`Preencha o placar corretamente.`);return}if(n<0||a<0){alert(`O placar nao pode ser negativo.`);return}if(n===a){alert(`O jogo precisa ter um vencedor.`);return}let o=n>a?t.p1:t.p2,s=n>a?t.p2:t.p1,d=Date.now();o.wins+=1,s.losses+=1,o.games+=1,s.games+=1,o.lastPlayed=d,s.lastPlayed=d;try{let f={p1:t.p1.id,p2:t.p2.id,score1:n,score2:a,winner:o.id,createdAt:d,tournamentId:j.id,tournamentTitle:j.title,tableLabel:`Mesa ${e+1}`},p=await u(i(c,`matches`),f),m=r(c);m.update(l(c,`users`,o.id),{"playerProfile.wins":o.wins,"playerProfile.games":o.games,"playerProfile.lastPlayed":d}),m.update(l(c,`users`,s.id),{"playerProfile.losses":s.losses,"playerProfile.games":s.games,"playerProfile.lastPlayed":d}),await m.commit();let g={id:p.id,...f};await re(g,o.id,s.id),h.push(g),_[e]={id:_[e].id},L(),w(),Q(),O()}catch(e){alert(`Erro ao finalizar partida: `+e.message)}},window.changeTables=e=>{if(e>0)for(let t=0;t<e;t++)_.push({id:y()});else{let e=_.findIndex(e=>!e.p1);if(e===-1){alert(`Finalize algum jogo antes de remover mesas.`);return}_.splice(e,1)}z(),O()};