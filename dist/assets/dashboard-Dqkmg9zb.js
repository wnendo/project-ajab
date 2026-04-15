import"./modulepreload-polyfill-Btlm8H0F.js";import{_ as e,a as t,d as n,f as r,i,n as a,o,p as s,s as c,t as l,u,x as d}from"./firebase-VBRKn9At.js";/* empty css               */import{c as f}from"./tournament-rules-DUbpQbwy.js";var p=!1,m=[],h=[];function g(e){let t=document.getElementById(`userSummary`);t&&(t.innerHTML=`
    <strong>${e.name}</strong>
    <span>${e.club||`Sem clube`}</span>
    <span>${e.category}</span>
  `)}function _(e){return e?e.profileComplete?e.role===`admin`?e:(window.location.replace(`/pages/profile.html`),null):(window.location.replace(`/pages/complete-profile.html`),null):(window.location.replace(`/pages/login.html`),null)}function v(e){return e?new Intl.DateTimeFormat(`pt-BR`,{dateStyle:`medium`}).format(e):`Não informado`}function y(e){switch(e){case`open`:return`Em andamento`;case`closed`:return`Inscrições encerradas`;case`finished`:return`Finalizado`;default:return`Cadastrado`}}function b(e,t){let n=[];return t===`registered`&&(n.push(`<button class="btn primary" onclick="startTournament('${e.id}')">Iniciar</button>`),n.push(`<button class="btn secondary" onclick="manageTournament('${e.id}')">Gerenciar</button>`),n.push(`<button class="btn secondary" onclick="editTournament('${e.id}')">Editar</button>`)),t===`ongoing`&&(n.push(`<button class="btn primary" onclick="manageTournament('${e.id}')">Entrar no gerenciamento</button>`),n.push(`<button class="btn secondary" onclick="editTournament('${e.id}')">Editar</button>`)),t===`finished`&&n.push(`<button class="btn secondary" onclick="manageTournament('${e.id}')">Abrir gerenciamento</button>`),`
    <article class="admin-tournament-card ${e.isActive?`active`:``}">
      <div class="admin-tournament-head">
        <div>
          <h4>${e.title}</h4>
          <span>${e.location||`Local a definir`}</span>
        </div>
        <div>
          <span class="tournament-status-pill ${e.status||`upcoming`}">${y(e.status)}</span>
          ${e.isActive?`<span class="active-tournament-badge">Ativo</span>`:``}
        </div>
      </div>
      <div class="admin-tournament-meta">
        <span>Categoria: ${e.category||`Livre`}</span>
        <span>Inicio: ${v(e.startDate)}</span>
        <span>Fim: ${v(e.endDate)}</span>
      </div>
      ${e.description?`<p class="admin-tournament-description">${e.description}</p>`:``}
      <div class="admin-tournament-actions">
        ${n.join(``)}
      </div>
    </article>
  `}function x(e){return f(e)===`championship`?`/pages/championship-manage.html`:`/pages/tournament-manage.html`}function S(){let e=document.getElementById(`registeredTournaments`),t=document.getElementById(`ongoingTournaments`),n=document.getElementById(`finishedTournaments`),r=m.filter(e=>!e.isActive&&e.status!==`finished`),i=m.filter(e=>e.isActive||e.status===`open`),a=m.filter(e=>e.status===`finished`);e&&(e.innerHTML=r.length?r.map(e=>b(e,`registered`)).join(``):`<div class="empty-state">Nenhum torneio cadastrado pronto para iniciar.</div>`),t&&(t.innerHTML=i.length?i.map(e=>b(e,`ongoing`)).join(``):`<div class="empty-state">Nenhum torneio em andamento no momento.</div>`),n&&(n.innerHTML=a.length?a.map(e=>b(e,`finished`)).join(``):`<div class="empty-state">Nenhum torneio finalizado ainda.</div>`)}function C(e=``){let t=document.getElementById(`athleteSearchResults`);if(!t)return;let n=e.trim().toLowerCase(),r=h.filter(e=>n?[e.name,e.email,e.club,e.category].some(e=>(e||``).toLowerCase().includes(n)):!0);t.innerHTML=r.length?r.map(e=>`
            <div class="admin-athlete-card">
              <strong>${e.name}</strong>
              <span>${e.email}</span>
              <span>${e.club||`Sem clube`} - ${e.category||`Sem categoria`}</span>
              <div class="admin-athlete-actions">
                <button class="btn secondary" onclick="openUserManager('${e.id}')">Gerenciar</button>
              </div>
            </div>
          `).join(``):`<div class="empty-state">Nenhum atleta encontrado.</div>`}async function w(){let[e,n]=await Promise.all([t(c(r(a,`tournaments`),o(`startDate`,`asc`))),t(c(r(a,`users`),u(`role`,`==`,`user`)))]);m=e.docs.map(e=>({id:e.id,...e.data()})),h=n.docs.map(e=>({id:e.id,...e.data()})).filter(e=>e.profileComplete).sort((e,t)=>e.name.localeCompare(t.name)),S(),C()}window.filterAthletes=()=>{let e=document.getElementById(`athleteSearch`).value;C(e)},window.goToTournamentForm=()=>{window.location.href=`/pages/tournament-form.html`},window.goToAthleteRegistration=()=>{window.location.href=`/pages/register.html`},window.goToUsersAdmin=()=>{window.location.href=`/pages/users-admin.html`},window.openUserManager=e=>{window.location.href=`/pages/users-admin.html?id=${e}`},window.editTournament=e=>{window.location.href=`/pages/tournament-form.html?id=${e}`},window.manageTournament=e=>{let t=m.find(t=>t.id===e);window.location.href=`${x(t)}?id=${e}`},window.startTournament=async e=>{try{let t=n(a);m.forEach(n=>{t.update(s(a,`tournaments`,n.id),{isActive:n.id===e,status:n.id===e?`open`:n.status,updatedAt:Date.now()})}),await t.commit();let r=m.find(t=>t.id===e);window.location.href=`${x(r)}?id=${e}`}catch(e){alert(`Erro ao iniciar torneio: `+e.message)}},window.openProfile=()=>{window.location.href=`/pages/profile.html`},window.logout=async()=>{await d(l),window.location.replace(`/pages/login.html`)},e(l,async e=>{if(p)return;if(p=!0,!e){window.location.replace(`/pages/login.html`);return}let t=_((await i(s(a,`users`,e.uid))).data());t&&(g(t),await w())});