import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,f as n,i as r,n as i,o as a,p as o,s,t as c,x as l}from"./firebase-VBRKn9At.js";/* empty css               */import{u}from"./tournament-rules-D9Tq3W95.js";function d(e){let t=(e??``).trim().toUpperCase();return t===`A`?`A`:t===`B`?`B`:t===`C`?`C`:t===`D`?`D`:t===`INICIANTE`||t===`INICIANTES`?`Iniciante`:null}function f(e){return Array.isArray(e.categories)&&e.categories.length?e.categories:e.category?e.category.split(`,`).map(e=>e.trim()).filter(Boolean):[]}function p(e,t,n,r){return t===n?r:e?.get(t)||`A definir`}function m(e,t){let n=e?.finalStandings??[];return n.length?`
    <div class="stack-item">
      <div class="stack-item-header">
        <div>
          <strong>Classificacao final</strong>
          <span>Resultado oficial da categoria</span>
        </div>
      </div>
      <div class="stack-item-grid stack-item-grid-dense">
        ${n.slice(0,4).map((e,n)=>`<span>${n+1}o - ${t?.get(e)||`Atleta`}</span>`).join(``)}
      </div>
    </div>
  `:``}function h(e,t,n,r,i){let a=n?.groups??[],o=a.find(e=>e.playerIds.includes(r.id)),s=(n?.activeTables??[]).find(e=>e.match?.playerIds.includes(r.id)),c=(n?.queue??[]).find(e=>e.playerIds.includes(r.id)),l=s?.match?(()=>{let e=p(i,s.match?.playerIds.find(e=>e!==r.id)??``,r.id,r.name);return`
          <div class="stack-item">
            <div class="stack-item-header">
              <div>
                <strong>Proximo jogo</strong>
                <span>Categoria ${t}</span>
              </div>
              <span class="result-pill win">Em andamento</span>
            </div>
            <div class="stack-item-grid stack-item-grid-dense">
              <span>Mesa: ${s.id}</span>
              <span>Adversario: ${e}</span>
            </div>
          </div>
        `})():c?(()=>{let e=p(i,c.playerIds.find(e=>e!==r.id)??``,r.id,r.name);return`
            <div class="stack-item">
              <div class="stack-item-header">
                <div>
                  <strong>Proximo jogo</strong>
                  <span>Categoria ${t}</span>
                </div>
                <span class="result-pill neutral">Na fila</span>
              </div>
              <div class="stack-item-grid stack-item-grid-dense">
                <span>Grupo: ${c.groupId||`Fase de grupos`}</span>
                <span>Adversario: ${e}</span>
              </div>
            </div>
          `})():`<div class="empty-state">Nenhum proximo jogo encontrado nesta categoria.</div>`;return`
    <article class="card profile-card">
      <div class="section-header">
        <div>
          <span class="section-label">${e.title}</span>
          <h3>Categoria ${t}</h3>
        </div>
      </div>
      <div class="stack-list">
        ${l}
        ${o?`
              <div class="stack-item">
                <div class="stack-item-header">
                  <div>
                    <strong>${o.name}</strong>
                    <span>Jogadores do seu grupo</span>
                  </div>
                </div>
                <div class="stack-item-grid stack-item-grid-dense">
                  ${o.playerIds.map(e=>`<span>${i?.get(e)||`Atleta`}</span>`).join(``)}
                </div>
              </div>
            `:`<div class="empty-state">Seu grupo ainda não foi definido nesta categoria.</div>`}
        ${m(n,i)}
        ${a.length>=2?`
              <div class="championship-bracket-frame-wrap championship-bracket-frame-wrap-profile">
                <iframe
                  class="championship-bracket-frame championship-bracket-frame-profile"
                  title="Bracket da categoria ${t}"
                  loading="lazy"
                  src="/pages/championship-bracket-frame.html?id=${encodeURIComponent(e.id)}&category=${encodeURIComponent(t)}&highlight=${encodeURIComponent(r.id)}"
                ></iframe>
              </div>
            `:``}
      </div>
    </article>
  `}async function g(e){let[c,l,p]=await Promise.all([r(o(i,`users`,e)),t(s(n(i,`users`,e,`registrations`),a(`registeredAt`,`desc`))),t(s(n(i,`tournaments`),a(`startDate`,`asc`)))]);if(!c.exists()){window.location.replace(`/pages/profile.html`);return}let m={id:c.id,...c.data()},g=l.docs.map(e=>({id:e.id,...e.data()})),_=p.docs.map(e=>({id:e.id,...e.data()})).filter(e=>u(e)===`championship`),v=g.filter(e=>e.paymentStatus===`approved`&&_.some(t=>t.id===(e.tournamentId||e.id))),y=await Promise.all(v.map(async e=>{let r=e.tournamentId||e.id,a=await t(n(i,`tournaments`,r,`registrations`)),o=new Map;return a.docs.forEach(e=>{let t={id:e.id,...e.data()};o.set(t.id,t.name)}),[r,o]})),b=new Map(y),x=document.getElementById(`myChampionshipsList`);if(!x)return;let S=[];for(let e of v){let t=e.tournamentId||e.id,n=_.find(e=>e.id===t);if(!n)continue;let r=b.get(t);for(let t of f(e)){let e=d(t);if(!e)continue;let i=n.championshipState?.[e];S.push(h(n,e,i,m,r))}}x.innerHTML=S.length?S.join(``):`<div class="empty-state">Você ainda não possui campeonatos aprovados para acompanhar aqui.</div>`}window.goBackToProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await l(c),window.location.replace(`/pages/login.html`)},e(c,async e=>{if(!e){window.location.replace(`/pages/login.html`);return}try{await g(e.uid)}catch(e){console.error(`Erro ao carregar meus campeonatos:`,e);let t=document.getElementById(`myChampionshipsList`);t&&(t.innerHTML=`<div class="empty-state">Não foi possível carregar seus campeonatos agora.</div>`)}});