function e(e,t,n,r){e.classList.remove(`visible`),window.setTimeout(()=>e.remove(),180),document.removeEventListener(`keydown`,r),t(n)}function t({title:t,message:n,confirmLabel:r=`Confirmar`,cancelLabel:i=`Cancelar`,tone:a=`default`}){return new Promise(o=>{let s=document.createElement(`div`);s.className=`confirm-modal-overlay`;let c=document.createElement(`div`);c.className=`confirm-modal-card`,c.setAttribute(`role`,`dialog`),c.setAttribute(`aria-modal`,`true`),c.innerHTML=`
      <div class="confirm-modal-copy">
        <span class="section-label">Confirmação</span>
        <h3>${t}</h3>
        <p>${n}</p>
      </div>
      <div class="confirm-modal-actions">
        <button type="button" class="btn secondary confirm-modal-cancel">${i}</button>
        <button type="button" class="btn ${a===`danger`?`danger`:`primary`} confirm-modal-confirm">${r}</button>
      </div>
    `;let l=c.querySelector(`.confirm-modal-cancel`),u=c.querySelector(`.confirm-modal-confirm`),d=t=>{t.key===`Escape`&&e(s,o,!1,d)};s.addEventListener(`click`,t=>{t.target===s&&e(s,o,!1,d)}),l?.addEventListener(`click`,()=>e(s,o,!1,d)),u?.addEventListener(`click`,()=>e(s,o,!0,d)),s.appendChild(c),document.body.appendChild(s),document.addEventListener(`keydown`,d),requestAnimationFrame(()=>{s.classList.add(`visible`),u?.focus()})})}export{t};