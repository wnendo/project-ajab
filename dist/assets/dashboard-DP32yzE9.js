import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,l as a,n as o,o as s,p as c,s as l,t as u,u as d,x as f}from"./firebase-VBRKn9At.js";/* empty css               */import{u as p}from"./tournament-rules-D9Tq3W95.js";var m=!1,h=[],g=[];function _(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function v(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function y(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function b(e){switch(e){case`open`:return`Em andamento`;case`closed`:return`Inscrições encerradas`;case`finished`:return`Finalizado`;default:return`Cadastrado`}}function x(e,t){let n=[];return t===`registered`&&(n.push(`<button class="btn primary" onclick="startTournament('${e.id}')">Iniciar</button>`),n.push(`<button class="btn secondary" onclick="manageTournament('${e.id}')">Gerenciar</button>`),n.push(`<button class="btn secondary" onclick="editTournament('${e.id}')">Editar</button>`)),t===`ongoing`&&(n.push(`<button class="btn primary" onclick="manageTournament('${e.id}')">Entrar no gerenciamento</button>`),n.push(`<button class="btn secondary" onclick="resetTournamentStatus('${e.id}')">Voltar para nao iniciado</button>`),n.push(`<button class="btn secondary" onclick="editTournament('${e.id}')">Editar</button>`)),t===`finished`&&n.push(`<button class="btn secondary" onclick="manageTournament('${e.id}')">Abrir gerenciamento</button>`),`
    <article class="admin-tournament-card ${e.isActive?`active`:``}">
      <div class="admin-tournament-head">
        <div>
          <h4>${e.title}</h4>
          <span>${e.location||`Local a definir`}</span>
        </div>
        <div>
          <span class="tournament-status-pill ${e.status||`upcoming`}">${b(e.status)}</span>
          ${e.isActive?`<span class="active-tournament-badge">Ativo</span>`:``}
        </div>
      </div>
      <div class="admin-tournament-meta">
        <span>Categoria: ${e.category||`Livre`}</span>
        <span>Inicio: ${y(e.startDate)}</span>
        <span>Fim: ${y(e.endDate)}</span>
      </div>
      ${e.description?`<p class="admin-tournament-description">${e.description}</p>`:``}
      <div class="admin-tournament-actions">
        ${n.join(``)}
      </div>
    </article>
  `}function S(e){return p(e)===`championship`?`/pages/championship-manage.html`:`/pages/tournament-manage.html`}function C(){let e=document.getElementById(`registeredTournaments`),t=document.getElementById(`ongoingTournaments`),n=document.getElementById(`finishedTournaments`),r=h.filter(e=>!e.isActive&&e.status!==`open`&&e.status!==`finished`),i=h.filter(e=>e.isActive||e.status===`open`),a=h.filter(e=>e.status===`finished`);e&&(e.innerHTML=r.length?r.map(e=>x(e,`registered`)).join(``):`<div class="empty-state">Nenhum proximo torneio cadastrado no momento.</div>`),t&&(t.innerHTML=i.length?i.map(e=>x(e,`ongoing`)).join(``):`<div class="empty-state">Nenhum torneio em andamento no momento.</div>`),n&&(n.innerHTML=a.length?a.map(e=>x(e,`finished`)).join(``):`<div class="empty-state">Nenhum torneio finalizado ainda.</div>`)}function w(e=``){let t=document.getElementById(`athleteSearchResults`);if(!t)return;let n=e.trim().toLowerCase(),r=g.filter(e=>n?[e.name,e.email,e.club,e.category].some(e=>(e||``).toLowerCase().includes(n)):!0);t.innerHTML=r.length?r.map(e=>`
            <div class="admin-athlete-card">
              <strong>${e.name}</strong>
              <span>${e.email}</span>
              <span>${e.club||`Sem clube`} - ${e.category||`Sem categoria`}</span>
              <div class="admin-athlete-actions">
                <button class="btn secondary" onclick="openUserManager('${e.id}')">Gerenciar</button>
              </div>
            </div>
          `).join(``):`<div class="empty-state">Nenhum atleta encontrado.</div>`}async function T(){let[e,n]=await Promise.all([t(l(r(o,`tournaments`),s(`startDate`,`asc`))),t(l(r(o,`users`),d(`role`,`==`,`user`)))]);h=e.docs.map(e=>({id:e.id,...e.data()})),g=n.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.profileComplete).sort((e,t)=>e.name.localeCompare(t.name)),C(),w()}window.filterAthletes=()=>{let e=document.getElementById(`athleteSearch`).value;w(e)},window.goToTournamentForm=()=>{window.location.href=`/pages/tournament-form.html`},window.goToAthleteRegistration=()=>{window.location.href=`/pages/register.html`},window.goToUsersAdmin=()=>{window.location.href=`/pages/users-admin.html`},window.openUserManager=e=>{window.location.href=`/pages/users-admin.html?id=${e}`},window.editTournament=e=>{window.location.href=`/pages/tournament-form.html?id=${e}`},window.manageTournament=e=>{let t=h.find(t=>t.id===e);window.location.href=`${S(t)}?id=${e}`},window.startTournament=async e=>{try{let t=n(o);h.forEach(n=>{let r=n.id!==e&&n.status!==`finished`&&(n.isActive||n.status===`open`);t.update(c(o,`tournaments`,n.id),{isActive:n.id===e,status:n.id===e?`open`:r?`upcoming`:n.status,updatedAt:Date.now()})}),await t.commit();let r=h.find(t=>t.id===e);window.location.href=`${S(r)}?id=${e}`}catch(e){alert(`Erro ao iniciar torneio: `+e.message)}},window.resetTournamentStatus=async e=>{try{await a(c(o,`tournaments`,e),{isActive:!1,status:`upcoming`,updatedAt:Date.now()}),h=h.map(t=>t.id===e?{...t,isActive:!1,status:`upcoming`,updatedAt:Date.now()}:t),C()}catch(e){alert(`Erro ao voltar torneio para nao iniciado: `+e.message)}},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await f(u),window.location.replace(`/pages/login.html`)},e(u,async e=>{if(m)return;if(m=!0,!e){window.location.replace(`/pages/login.html`);return}let t=v((await i(c(o,`users`,e.uid))).data());t&&(_(t),await T())});