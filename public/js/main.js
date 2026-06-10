/* ─────────────────────────────────────────────────────────────
   public/js/main.js  —  Mayank Sharma Portfolio
───────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ══ 1. CUSTOM CURSOR ══════════════════════════════════════ */
  const cursor = $('#cursor'), ring = $('#cursor-ring');
  if (cursor && ring && window.matchMedia('(pointer:fine)').matches) {
    let mx=0,my=0,rx=0,ry=0;
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      cursor.style.left=mx+'px'; cursor.style.top=my+'px';
    });
    (function tick(){ rx+=(mx-rx)*.12; ry+=(my-ry)*.12; ring.style.left=rx+'px'; ring.style.top=ry+'px'; requestAnimationFrame(tick); })();
    document.addEventListener('mouseleave',()=>{ cursor.style.opacity='0'; ring.style.opacity='0'; });
    document.addEventListener('mouseenter',()=>{ cursor.style.opacity='1'; ring.style.opacity='1'; });
  }

  /* ══ 2. NAV + BACK-TO-TOP ══════════════════════════════════ */
  const nav     = $('#nav');
  const backTop = $('#back-top');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    if (backTop) backTop.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  /* ══ 3. MOBILE MENU ════════════════════════════════════════ */
  const hamburger  = $('#hamburger');
  const mobileMenu = $('#mobile-menu');

  function closeMobileMenu() {
    hamburger && hamburger.classList.remove('open');
    mobileMenu && mobileMenu.classList.remove('open');
    if (hamburger) hamburger.setAttribute('aria-expanded','false');
    if (mobileMenu) mobileMenu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('.mob-link').forEach(l => l.addEventListener('click', closeMobileMenu));
  }

  /* ══ 4. TOAST ══════════════════════════════════════════════ */
  let toastTimer = null;
  function showToast(msg, type='success') {
    const t = $('#toast'); if (!t) return;
    $('#toast-icon').textContent = type==='success' ? '✓' : '✕';
    $('#toast-msg').textContent  = msg;
    t.className = `toast ${type} show`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> t.classList.remove('show'), 5000);
  }

  /* ══ 5. VIDEO MODAL ════════════════════════════════════════
     Plays local video files via native <video> element.
     All project videos stream from /api/video/stream/projects/
     Showreel streams from /api/video/stream/showreel
  ══════════════════════════════════════════════════════════ */
  const modal      = $('#video-modal');
  const modalVideo = $('#modal-video');
  const backdrop   = $('#modal-backdrop');
  const closeBtn   = $('#modal-close');
  
  function openModal(src, title, catLabel, tools) {
    if (!modal || !modalVideo) return;

    const catEl   = $('#modal-proj-cat');
    const titleEl = $('#modal-proj-title');
    const toolsEl = $('#modal-proj-tools');
    if (catEl)   catEl.textContent   = catLabel || '';
    if (titleEl) titleEl.textContent = title    || '';
    if (toolsEl) toolsEl.textContent = tools    || '';
    modalVideo.src = src;
    modalVideo.load();
    modalVideo.play().catch(()=>{});

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (closeBtn) closeBtn.focus();
  }

  function closeModal() {
    if (!modal || !modalVideo) return;
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key==='Escape') closeModal(); });

  /* ── Showreel button (hero) ─────────────────────────────
     Drop file at: public/videos/showreel/showreel.mp4    */
  const reelBtn = $('#reel-btn');
  if (reelBtn) {
    reelBtn.addEventListener('click', () => {
      openModal(
        '/api/video/stream/showreel',
        'My Showreel 2024–2025',
        'Showreel',
        'Blender · Premiere Pro · DaVinci · After Effects',
        'A curated highlight reel of my best projects, showcasing commercial, cinematic, and CGI work.'
      );
    });
  }

  /* ══ 6. PROJECT CARDS ══════════════════════════════════════
     Each card has:
       data-video-src   = "/api/video/stream/projects/filename.mp4"
       data-title       = "Project Title"
       data-cat-label   = "Category"
       data-tools       = "Tool1 · Tool2"

     The "Watch Project" button inside each card triggers the modal.
     Coming Soon cards have disabled buttons — nothing happens.
  ══════════════════════════════════════════════════════════ */
  $$('.proj-card').forEach(card => {
    const btn = card.querySelector('.proj-cta-btn');
    if (!btn || btn.disabled) return;

    btn.addEventListener('click', e => {
      e.stopPropagation();
      const src      = card.dataset.videoSrc;
      const title    = card.dataset.title    || '';
      const catLabel = card.dataset.catLabel || '';
      const tools    = card.dataset.tools    || '';

      if (!src) {
        showToast('Video not added yet — see README for instructions.', 'error');
        return;
      }
      openModal(src, title, catLabel, tools);
    });

    card.addEventListener('click', () => btn.click());

    // Keyboard
    card.setAttribute('tabindex','0');
    card.addEventListener('keypress', e => {
      if (e.key==='Enter' || e.key===' ') btn.click();
    });
  });

  /* ══ 7. CATEGORY FILTER ════════════════════════════════════
     Filters by cat-block data-cat attribute:
     "all" | "commercial" | "ai" | "cinematic" | "coming"
  ══════════════════════════════════════════════════════════ */
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      $$('.cat-block').forEach(block => {
        if (filter === 'all') {
          block.classList.remove('hidden');
        } else {
          block.classList.toggle('hidden', block.dataset.cat !== filter);
        }
      });
    });
  });

  /* ══ 8. SCROLL REVEAL ══════════════════════════════════════ */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  $$('.reveal').forEach(el => revealObs.observe(el));

  /* ══ 9. STAT COUNT-UP ══════════════════════════════════════ */
  const countObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el=e.target, target=+el.dataset.target;
      let cur=0; const step=Math.max(target/50,.4);
      const t=setInterval(()=>{
        cur=Math.min(cur+step,target);
        el.textContent=Math.floor(cur)+'+';
        if(cur>=target) clearInterval(t);
      },28);
      countObs.unobserve(el);
    });
  },{ threshold:.6 });
  $$('[data-target]').forEach(el => countObs.observe(el));

  /* ══ 10. CONTACT FORM ══════════════════════════════════════ */
  const form      = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const btnText   = $('#btn-text');
  const btnLoader = $('#btn-loader');

  function setFieldError(name, msg) {
    const inp=$(`#f-${name}`), err=$(`#err-${name}`);
    if(inp) inp.classList.add('error');
    if(err) err.textContent=msg;
  }
  function clearAllErrors() {
    $$('.form-input,.form-textarea',form).forEach(el=>el.classList.remove('error'));
    $$('.field-error',form).forEach(el=>el.textContent='');
  }
  function clientValidate(d) {
    let ok=true;
    if(!d.name||d.name.trim().length<2)           { setFieldError('name','Please enter your name.');             ok=false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)){ setFieldError('email','Please enter a valid email.');       ok=false; }
    if(!d.projectType||d.projectType.trim()<2)    { setFieldError('project','Please enter a project type.');     ok=false; }
    if(!d.message||d.message.trim().length<20)    { setFieldError('message','Message must be at least 20 characters.'); ok=false; }
    return ok;
  }

  if (form) {
    $$('.form-input,.form-textarea',form).forEach(el=>{
      el.addEventListener('input',()=>{
        el.classList.remove('error');
        const err=$(`#err-${el.name}`); if(err) err.textContent='';
      });
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      clearAllErrors();
      const d = {
        name       : form.elements.name.value,
        email      : form.elements.email.value,
        projectType: form.elements.projectType.value,
        budget     : form.elements.budget.value,
        message    : form.elements.message.value,
      };
      if (!clientValidate(d)) return;

      submitBtn.disabled=true; btnText.hidden=true; btnLoader.hidden=false;

      try {
        const res    = await fetch('/api/contact',{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(d) });
        const result = await res.json();
        if (res.ok && result.success) {
          showToast(result.message||"Thanks! I'll get back to you within 24 hours.",'success');
          form.reset();
        } else {
          (result.errors||[]).forEach(err=>setFieldError(err.field,err.msg));
          showToast(result.message||'Something went wrong. Please try again.','error');
        }
      } catch {
        showToast('Network error. Email me at mayanksharma6901@gmail.com','error');
      } finally {
        submitBtn.disabled=false; btnText.hidden=false; btnLoader.hidden=true;
      }
    });
  }

  /* ══ 11. SMOOTH SCROLL ═════════════════════════════════════ */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
        closeMobileMenu();
      }
    });
  });

})();
