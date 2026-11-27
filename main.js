/* =====================================================================
   Annu & Sachin — invitation behaviour
   1. Loader & petals     2. GSAP ScrollTrigger scenes (with fallbacks)
   3. Countdown           4. WhatsApp RSVP        5. Share / copy hashtag
   6. Music               7. Calendar (.ics + Google)
   ===================================================================== */
(function () {
  'use strict';

  const WEDDING = {
    bride: 'Annu Samriya', groom: 'Sachin Badgujar',
    hashtag: '#AnnuWedsSachin',
    // 28 Jan 2027, 7:00 PM IST — wedding ceremony
    start: new Date('2027-01-28T19:00:00+05:30'),
    end:   new Date('2027-01-29T01:00:00+05:30'),
    venue: 'Satyanarayan Dharamshala, Sri Vijaynagar, Sri Ganganagar, Rajasthan, India',
    maps:  'https://maps.app.goo.gl/Ah7Nt4VfwW95Mtj87',
    rsvpWhatsApp: '919079393817'
  };

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---------- open an external link (works in sandboxed frames where window.open fails) ---------- */
  function openExternal(url) {
    const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener';
    a.style.display = 'none'; document.body.appendChild(a); a.click(); setTimeout(() => a.remove(), 1000);
  }

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }

  /* ---------- 1. loader + petals ---------- */
  function hideLoader() { const l = $('#loader'); if (l) l.classList.add('is-done'); document.documentElement.classList.remove('gate-open'); }
  function readyLoader() { const l = $('#loader'); if (l) l.classList.add('is-ready'); }
  document.documentElement.classList.add('gate-open');
  window.addEventListener('load', () => setTimeout(readyLoader, 300));
  setTimeout(readyLoader, 3500); // show the Open button even if some asset is slow

  function makePetals() {
    if (reduceMotion) return;
    const box = $('#petals'); if (!box) return;
    const n = window.innerWidth < 700 ? 16 : 26;
    for (let i = 0; i < n; i++) {
      const p = document.createElement('i');
      p.className = 'petal' + (i % 3 === 0 ? ' m' : '');
      p.style.left = Math.random() * 100 + '%';
      p.style.setProperty('--dx', (Math.random() * 120 - 60) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDuration = (9 + Math.random() * 9) + 's';
      p.style.animationDelay = (-Math.random() * 18) + 's';
      p.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      p.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
      box.appendChild(p);
    }
  }
  makePetals();

  /* ---------- 2. scroll choreography ---------- */
  function splitWords(el) {
    // Wrap each word in a span for staggered reveals (keeps <br> intact)
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    nodes.forEach(n => {
      if (n.nodeType === 3) {
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { el.appendChild(document.createTextNode(' ')); return; }
          const s = document.createElement('span'); s.className = 'w'; s.style.display = 'inline-block'; s.textContent = part; el.appendChild(s);
        });
      } else el.appendChild(n);
    });
    return $$('.w', el);
  }

  function initScroll() {
    if (reduceMotion) return; // everything is visible by default — static
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') { initFallbackMotion(); return; }
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power2.out' });
    ScrollTrigger.config({ ignoreMobileResize: true });

    /* HERO — pinned, scroll-scrubbed cinematic entrance */
    const hero = $('#hero');
    const heroTl = gsap.timeline({
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=90%', pin: '.hero__pin', scrub: 0.8, anticipatePin: 1 }
    });
    heroTl
      .to('.hero__sky',     { yPercent: -6, scale: 1.08, ease: 'none' }, 0)
      .to('.hero__palace',  { yPercent: -10, scale: 1.22, ease: 'none' }, 0)
      .to('.hero__aisle',   { yPercent: 18, scale: 1.25, ease: 'none' }, 0)
      .to('.hero__garland', { yPercent: -110, ease: 'none' }, 0)
      .to('.hero__text',    { yPercent: -40, autoAlpha: 0, ease: 'none' }, 0.05)
      .to('.scroll-cue',    { autoAlpha: 0 }, 0);

    // intro (time-based, plays once on load)
    const intro = gsap.timeline({ delay: 0.3 });
    intro.from('.hero__garland', { yPercent: -100, duration: 1.2, ease: 'power3.out' })
      .from('.hero__palace', { yPercent: 12, autoAlpha: 0, duration: 1.4 }, 0.1)
      .from('.hero__aisle',  { yPercent: 25, autoAlpha: 0, duration: 1.4 }, 0.2)
      .from('.hero__text > *', { y: 24, autoAlpha: 0, stagger: 0.12, duration: 1 }, 0.5)
      .from('.scroll-cue', { autoAlpha: 0, duration: .8 }, 1.4);
    // garland gentle sway
    gsap.to('.hero__garland', { rotation: 0.6, transformOrigin: '50% 0', yoyo: true, repeat: -1, duration: 3, ease: 'sine.inOut' });

    /* INVITATION CARD — rises & unfolds over the pathway */
    gsap.from('[data-card]', {
      scrollTrigger: { trigger: '#invite', start: 'top 90%', end: 'top 20%', scrub: 0.8 },
      y: 180, rotationX: 62, z: -160, scale: 0.84, autoAlpha: 0, transformPerspective: 1400, transformOrigin: '50% 100%', ease: 'none'
    });
    // gold light sweeping across the card as it settles
    gsap.fromTo('.card-oval .sheen', { xPercent: -160 }, { scrollTrigger: { trigger: '[data-card]', start: 'top 65%', end: 'top 5%', scrub: 1 }, xPercent: 160, ease: 'none' });
    gsap.to('.invite__bg', { scrollTrigger: { trigger: '#invite', start: 'top bottom', end: 'bottom top', scrub: true }, backgroundPositionY: '30%', ease: 'none' });
    gsap.from('.card-oval > *:not(.sheen)', { scrollTrigger: { trigger: '#invite', start: 'top 95%' }, y: 18, autoAlpha: 0, stagger: 0.05, duration: 0.8 });

    /* GARDEN — parallax staircase transition */
    gsap.fromTo('.garden__img', { yPercent: -8, scale: 1.15 }, {
      scrollTrigger: { trigger: '#garden', start: 'top bottom', end: 'bottom top', scrub: true }, yPercent: 8, scale: 1, ease: 'none'
    });

    /* HEARTS — pop in one by one */
    gsap.from('[data-heart]', {
      scrollTrigger: { trigger: '.hearts', start: 'top 82%' },
      rotationY: -140, z: -220, y: 40, scale: 0.5, autoAlpha: 0, transformPerspective: 900, transformOrigin: '50% 60%',
      stagger: 0.16, duration: 1.4, ease: 'back.out(1.4)'
    });

    /* PORTRAITS — cinematic clip reveal + shine */
    $$('[data-portrait]').forEach((fig, i) => {
      const frame = $('.portrait__frame', fig);
      // turns in like the page of an album
      gsap.fromTo(fig, { rotationY: i ? -38 : 38, z: -120, transformPerspective: 1100, transformOrigin: i ? '100% 50%' : '0% 50%' },
        { scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 35%', scrub: 0.8 }, rotationY: 0, z: 0, ease: 'none' });
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 78%' } });
      tl.from(frame, { clipPath: 'inset(50% 0 50% 0 round 50%)', autoAlpha: 0, duration: 1.2, ease: 'power3.inOut' })
        .from($('img', frame), { scale: 1.3, duration: 1.6, ease: 'power2.out' }, 0)
        .to($('.portrait__shine', fig), { x: '240%', duration: 1.2, ease: 'power1.inOut' }, 0.6)
        .from($$('figcaption > *', fig), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.5);
    });
    gsap.from('.portraits__amp', { scrollTrigger: { trigger: '.portraits__amp', start: 'top 85%' }, scale: 0, rotation: -30, duration: 1, ease: 'back.out(2)' });

    /* STORY frame draws in */
    gsap.from('.story__frame', { scrollTrigger: { trigger: '#story', start: 'top 95%', end: 'top 30%', scrub: 0.8 },
      rotationX: 48, z: -140, y: 60, autoAlpha: 0.2, transformPerspective: 1300, transformOrigin: '50% 100%', ease: 'none' });

    /* EVENTS — slide in along the timeline */
    $$('[data-event]').forEach(ev => {
      gsap.from(ev, { scrollTrigger: { trigger: ev, start: 'top 92%' }, rotationY: -75, x: -50, z: -80, autoAlpha: 0, transformPerspective: 900, transformOrigin: '0% 50%', duration: 1.1, ease: 'power3.out' });
      gsap.from($('.event__icon', ev), { scrollTrigger: { trigger: ev, start: 'top 88%' }, scale: 0, rotation: -90, duration: 0.9, ease: 'back.out(1.8)', delay: 0.15 });
    });

    /* MANDAP parallax + hashtag */
    gsap.fromTo('.mandap', { yPercent: 12, scale: 0.9 }, { scrollTrigger: { trigger: '#hashtag', start: 'top bottom', end: 'center center', scrub: true }, yPercent: 0, scale: 1, ease: 'none' });
    gsap.from('.tag', { scrollTrigger: { trigger: '.tag', start: 'top 88%' }, scale: 0.8, autoAlpha: 0, duration: 0.8, ease: 'back.out(2)' });

    /* RSVP panel + contacts, venue card */
    $$('[data-fade]').forEach(el => gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 90%' }, y: 30, autoAlpha: 0, duration: 1 }));

    /* Word reveals for script headings */
    $$('[data-reveal]').forEach(el => {
      const words = splitWords(el); if (!words.length) return;
      gsap.from(words, { scrollTrigger: { trigger: el, start: 'top 90%' }, yPercent: 60, autoAlpha: 0, rotationX: -30, stagger: 0.08, duration: 0.9, ease: 'power3.out' });
    });

    /* FINALE — lake parallax, content rises, lotus bob */
    gsap.fromTo('.finale__lake', { yPercent: 10, scale: 1.12 }, { scrollTrigger: { trigger: '#finale', start: 'top bottom', end: 'bottom bottom', scrub: true }, yPercent: 0, scale: 1, ease: 'none' });
    gsap.from('.finale__content > *', { scrollTrigger: { trigger: '#finale', start: 'top 70%' }, y: 30, autoAlpha: 0, stagger: 0.1, duration: 1 });
    gsap.from('.cd', { scrollTrigger: { trigger: '#countdown', start: 'top 88%' }, rotationX: -90, y: 30, autoAlpha: 0, transformPerspective: 600, stagger: 0.12, duration: 1, ease: 'back.out(1.6)' });
    gsap.from('.mandap', { scrollTrigger: { trigger: '#hashtag', start: 'top 90%', end: 'top 30%', scrub: 0.8 }, rotationX: 35, transformPerspective: 1000, transformOrigin: '50% 100%', ease: 'none' });
    gsap.from('.venue__card', { scrollTrigger: { trigger: '#venue', start: 'top 90%', end: 'top 35%', scrub: 0.8 }, rotationX: 30, z: -100, transformPerspective: 1200, transformOrigin: '50% 100%', ease: 'none' });
    gsap.from('.rsvp__panel', { scrollTrigger: { trigger: '#rsvp', start: 'top 90%', end: 'top 30%', scrub: 0.8 }, rotationX: 28, z: -100, transformPerspective: 1200, transformOrigin: '50% 100%', ease: 'none' });

    /* SIGNATURE */

    // Recalculate once fonts/images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }

  (function () { const card = document.querySelector('.card-oval'); if (card) { const s = document.createElement('span'); s.className = 'sheen'; s.setAttribute('aria-hidden', 'true'); card.appendChild(s); } })();

  /* ---------- 2a. ultra-premium layer: smooth scroll, 3D depth, tilt, flip digits ---------- */
  function initPremium() {
    if (reduceMotion || typeof gsap === 'undefined') return;
    const html = document.documentElement;

    // a) silky momentum scrolling (desktop wheel/trackpad; phones keep native touch scrolling)
    if (window.Lenis && typeof ScrollTrigger !== 'undefined') {
      const lenis = new Lenis({ duration: 1.25, smoothWheel: true, syncTouch: false, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      if (html.classList.contains('gate-open')) lenis.stop();
      new MutationObserver(() => { if (!html.classList.contains('gate-open')) lenis.start(); }).observe(html, { attributes: true, attributeFilter: ['class'] });
      window.__lenis = lenis;
    }

    // b) 3D depth on the opening scene — layers drift apart with tilt / pointer, and breathe gently when idle
    const layers = [['.hero__sky', 6, 4], ['.hero__palace', 16, 8], ['.hero__aisle', 30, 12], ['.hero__garland', -10, -4], ['.hero__text', -14, -6]]
      .map(([s, dx, dy]) => { const el = $(s); return el && { x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' }), dx, dy }; })
      .filter(Boolean);
    let tx = 0, ty = 0, lastInput = 0;
    const apply = () => layers.forEach(l => { l.x(tx * l.dx); l.y(ty * l.dy); });
    window.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; tx = (e.clientX / innerWidth - .5) * 2; ty = (e.clientY / innerHeight - .5) * 2; lastInput = Date.now(); apply(); }, { passive: true });
    const onTilt = e => { if (e.gamma == null) return; tx = Math.max(-1, Math.min(1, e.gamma / 25)); ty = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 25)); lastInput = Date.now(); apply(); };
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    const open = $('#openInvite');   // iPhone needs permission for motion — ask on the Open tap (a user gesture)
    if (open && window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function')
      open.addEventListener('click', () => { DeviceOrientationEvent.requestPermission().catch(() => {}); });
    gsap.ticker.add(() => {           // idle "breathing" so the scene always feels alive
      if (Date.now() - lastInput < 2500) return;
      const t = performance.now() / 1000; tx = Math.sin(t * 0.35) * 0.55; ty = Math.cos(t * 0.27) * 0.4; apply();
    });

    // c) touch / mouse 3D tilt with a glare on the couple photos
    $$('.portrait__frame').forEach(fr => {
      const glare = document.createElement('span'); glare.className = 'glare'; fr.appendChild(glare);
      const rx = gsap.quickTo(fr, 'rotationX', { duration: .6, ease: 'power3.out' }), ry = gsap.quickTo(fr, 'rotationY', { duration: .6, ease: 'power3.out' });
      gsap.set(fr, { transformPerspective: 800 });
      const move = e => { const r = fr.getBoundingClientRect(); const px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5;
        rx(-py * 16); ry(px * 18); glare.style.background = `radial-gradient(circle at ${(px + .5) * 100}% ${(py + .5) * 100}%,rgba(255,250,235,.55),rgba(255,250,235,0) 55%)`; glare.style.opacity = 1; };
      const leave = () => { rx(0); ry(0); glare.style.opacity = 0; };
      fr.addEventListener('pointermove', move); fr.addEventListener('pointerdown', move); fr.addEventListener('pointerleave', leave); fr.addEventListener('pointerup', leave); fr.addEventListener('pointercancel', leave);
    });

    // d) countdown digits flip like a clock
    $$('.cd b').forEach(b => new MutationObserver(() => gsap.fromTo(b, { rotationX: -95, transformPerspective: 300, transformOrigin: '50% 50%' }, { rotationX: 0, duration: .55, ease: 'back.out(2)' }))
      .observe(b, { childList: true, characterData: true, subtree: true }));

    // e) gold-foil shine on the script names
    $$('.hero__names .script .w, .script-title .w, .couple-script .script, .portrait .name, .finale__names .script').forEach(el => el.classList.add('foil'));
  }

  /* ---------- 2c. floating gold sparkles (canvas, very light) ---------- */
  function initSparkles() {
    const c = $('#sparkles'); if (!c || reduceMotion) { if (c) c.remove(); return; }
    const ctx = c.getContext('2d'); const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0; const N = window.innerWidth < 700 ? 26 : 44; const P = [];
    const size = () => { W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; };
    size(); window.addEventListener('resize', size);
    const spawn = (p, init) => { p.x = Math.random() * W; p.y = init ? Math.random() * H : H + 10 * dpr; p.r = (0.6 + Math.random() * 1.8) * dpr; p.vy = (0.12 + Math.random() * 0.35) * dpr; p.vx = (Math.random() - .5) * 0.15 * dpr; p.ph = Math.random() * 6.28; p.sp = 0.6 + Math.random() * 1.6; return p; };
    for (let i = 0; i < N; i++) P.push(spawn({}, true));
    let lastY = window.scrollY;
    function frame(now) {
      const dy = (window.scrollY - lastY) * dpr * 0.15; lastY = window.scrollY;
      ctx.clearRect(0, 0, W, H);
      for (const p of P) {
        p.y -= p.vy + dy; p.x += p.vx + Math.sin(now / 1400 + p.ph) * 0.12 * dpr;
        if (p.y < -12 * dpr || p.y > H + 14 * dpr) spawn(p, false);
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(now / 1000 * p.sp + p.ph));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,236,170,${0.9 * tw})`); g.addColorStop(0.35, `rgba(230,190,90,${0.45 * tw})`); g.addColorStop(1, 'rgba(230,190,90,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 6.283); ctx.fill();
      }
      if (!document.hidden) requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(frame); });
    requestAnimationFrame(frame);
  }

  /* ---------- 2b. dependency-free fallback (used when GSAP cannot load) ---------- */
  function initFallbackMotion() {
    document.documentElement.classList.add('no-gsap');
    // reveal-on-enter
    const targets = $$('[data-card],[data-heart],[data-portrait],[data-event],[data-fade],[data-reveal],.cd,.tag,.portraits__amp');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -4% 0px', threshold: 0.05 });
      // safety net: at the very end of the page reveal everything that is left
      window.addEventListener('scroll', () => { if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 40) targets.forEach(t => t.classList.add('is-in')); }, { passive: true });
      targets.forEach((t, i) => { t.style.transitionDelay = ((i % 4) * 0.12) + 's'; io.observe(t); });
    } else targets.forEach(t => t.classList.add('is-in'));
    // scroll-linked parallax
    const sky = $('.hero__sky'), palace = $('.hero__palace'), aisle = $('.hero__aisle'), garland = $('.hero__garland'), text = $('.hero__text');
    const garden = $('.garden__img'), gardenSec = $('#garden'), lake = $('.finale__lake'), finale = $('#finale'), mandap = $('.mandap');
    let ticking = false;
    function frame() {
      ticking = false;
      const y = window.scrollY, vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, y / vh));
      if (sky) sky.style.transform = `translate3d(0,${-p * 30}px,0) scale(${1 + p * .06})`;
      if (palace) palace.style.transform = `translate3d(-50%,${-p * 60}px,0) scale(${1 + p * .18})`;
      if (aisle) aisle.style.transform = `translate3d(-50%,${p * 120}px,0) scale(${1 + p * .2})`;
      if (garland) garland.style.transform = `translate3d(0,${-p * 140}px,0)`;
      if (text) { text.style.transform = `translate3d(0,${-p * 120}px,0)`; text.style.opacity = String(1 - p * 1.6); }
      const rel = (sec) => { const r = sec.getBoundingClientRect(); return Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))); };
      if (garden && gardenSec) { const q = rel(gardenSec); garden.style.transform = `translate(-50%,${-50 + (q - .5) * 16}%) scale(${1.15 - q * .15})`; }
      if (lake && finale) { const q = rel(finale); lake.style.transform = `translate3d(-50%,${(1 - q) * 40}px,0) scale(${1.1 - q * .1})`; }
      if (mandap) { const q = rel(mandap); mandap.style.transform = `translate3d(0,${(1 - q) * 30}px,0)`; }
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    frame();
  }

  /* ---------- 3. countdown ---------- */
  function initCountdown() {
    const root = $('#countdown'); if (!root) return;
    const units = {
      days: $('[data-unit="days"]', root), hours: $('[data-unit="hours"]', root),
      minutes: $('[data-unit="minutes"]', root), seconds: $('[data-unit="seconds"]', root)
    };
    const CIRC = 226.2; // 2πr, r=36
    const startDays = Math.max(1, Math.ceil((WEDDING.start - new Date()) / 864e5));
    function set(unit, val, max) {
      const el = units[unit]; if (!el) return;
      $('b', el).textContent = String(val).padStart(2, '0');
      $('.cd__ring', el).style.strokeDashoffset = (CIRC * (1 - Math.min(1, val / max))).toFixed(1);
    }
    function tick() {
      let diff = WEDDING.start - new Date();
      if (diff <= 0) {
        root.hidden = true; const d = $('#countdownDone'); if (d) d.hidden = false; return;
      }
      const days = Math.floor(diff / 864e5); diff -= days * 864e5;
      const hours = Math.floor(diff / 36e5); diff -= hours * 36e5;
      const minutes = Math.floor(diff / 6e4); diff -= minutes * 6e4;
      const seconds = Math.floor(diff / 1e3);
      set('days', days, startDays); set('hours', hours, 24); set('minutes', minutes, 60); set('seconds', seconds, 60);
      setTimeout(tick, 1000 - (Date.now() % 1000));
    }
    tick();
  }

  /* ---------- 4. RSVP → WhatsApp ---------- */
  function initRSVP() {
    const form = $('#rsvpForm'); if (!form) return;
    const err = $('#formError');
    form.addEventListener('submit', e => {
      e.preventDefault();
      const fd = new FormData(form);
      const name = (fd.get('name') || '').toString().trim();
      const phone = (fd.get('phone') || '').toString().trim();
      const attend = fd.get('attend'); const team = fd.get('team');
      const wish = (fd.get('wish') || '').toString().trim();
      const phoneOk = /^[0-9+ ]{10,14}$/.test(phone);
      if (!name || !phoneOk || !attend || !team) {
        err.hidden = false; err.textContent = !phoneOk && name ? 'Please enter a valid 10-digit mobile number.' : 'Please fill in your name, mobile number, attendance and team.';
        form.querySelector(':invalid, input:placeholder-shown')?.focus();
        return;
      }
      err.hidden = true;
      const lines = [
        `💌 *RSVP — ${WEDDING.hashtag}*`,
        '',
        `👤 *Name:* ${name}`,
        `📱 *Mobile:* ${phone}`,
        `✅ *Attendance:* ${attend}`,
        `🎉 *Team:* ${team}`,
        wish ? `💬 *Wishes:* ${wish}` : null,
        '',
        '— Sent from the Annu & Sachin wedding invitation'
      ].filter(l => l !== null);
      const url = `https://wa.me/${WEDDING.rsvpWhatsApp}?text=${encodeURIComponent(lines.join('\n'))}`;
      form.dataset.lastUrl = url; // exposed for testing
      openExternal(url);
      toast('Opening WhatsApp with your RSVP…');
    });
  }

  /* ---------- 5. share + copy hashtag ---------- */
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      const ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) {} ta.remove(); return ok;
    }
  }
  async function share() {
    const url = location.href.split('#')[0];
    const text = `You are warmly invited to the wedding of Annu & Sachin — 28 January 2027, Satyanarayan Dharamshala, Sri Vijaynagar. ${WEDDING.hashtag}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Annu & Sachin — Wedding Invitation', text, url }); return; }
      catch (e) { if (e && e.name === 'AbortError') return; }
    }
    // Fallback: WhatsApp share + copy link
    const wa = `https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`;
    const copied = await copyText(url);
    openExternal(wa);
    toast(copied ? 'Link copied — sharing on WhatsApp' : 'Sharing on WhatsApp');
  }
  function initShare() {
    ['#shareBtn', '#shareBtn2'].forEach(s => { const b = $(s); if (b) b.addEventListener('click', share); });
    const tag = $('#copyTag');
    if (tag) tag.addEventListener('click', async () => {
      const ok = await copyText(WEDDING.hashtag);
      toast(ok ? `${WEDDING.hashtag} copied!` : 'Long-press the hashtag to copy');
    });
  }

  /* ---------- 6. music ---------- */
  function initMusic() {
    const btn = $('#musicBtn'), audio = $('#bgMusic'); if (!btn || !audio) return;
    let available = true;
    audio.addEventListener('error', () => {
      available = false; btn.classList.add('is-unavailable');
      btn.title = 'Music file not found — add assets/audio/music.mp3';
    });
    let userPaused = false, pausedByHide = false;
    audio.preload = 'auto';
    audio.volume = 0.7;
    const setUI = (on) => { btn.setAttribute('aria-pressed', String(on)); btn.setAttribute('aria-label', on ? 'Pause background music' : 'Play background music'); };
    audio.addEventListener('play', () => setUI(true));
    audio.addEventListener('pause', () => setUI(false));
    const start = () => { if (!available || userPaused || !audio.paused) return Promise.resolve(); return audio.play().catch(() => {}); };

    // a) try to autoplay as soon as the guest arrives (some browsers allow it)
    start();
    // b) the "Open Invitation" tap always starts it
    const open = $('#openInvite');
    if (open) open.addEventListener('click', () => { start(); hideLoader(); });
    // c) otherwise the guest's first tap / key anywhere starts it
    const EVTS = ['pointerup', 'touchend', 'click', 'keydown'];
    const firstTouch = (e) => { if (e.target.closest && e.target.closest('#musicBtn')) return; start(); };
    EVTS.forEach(ev => document.addEventListener(ev, firstTouch, true));
    audio.addEventListener('playing', () => EVTS.forEach(ev => document.removeEventListener(ev, firstTouch, true)), { once: true });

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!available) { toast('Music not added yet (assets/audio/music.mp3)'); return; }
      if (audio.paused) {
        userPaused = false;
        try { await audio.play(); } catch (err) { toast('Could not start music — tap again'); }
      } else { userPaused = true; audio.pause(); }
    });
    // pause while the tab is hidden, resume when the guest comes back
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (!audio.paused) { pausedByHide = true; audio.pause(); } }
      else if (pausedByHide) { pausedByHide = false; start(); }
    });
  }

  /* ---------- 7. calendar ---------- */
  function pad(n) { return String(n).padStart(2, '0'); }
  function icsDate(d) { return d.getUTCFullYear() + pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' + pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + '00Z'; }
  function initCalendar() {
    const btn = $('#calBtn'), menu = $('#calMenu'); if (!btn || !menu) return;
    const title = 'Wedding of Annu & Sachin';
    const details = `Wedding ceremony & dinner of Annu Samriya and Sachin Badgujar.\nBaraat 6:00 PM · Ceremony & Dinner 7:00 PM · Pheras 11:00 PM\n${WEDDING.hashtag}\nMap: ${WEDDING.maps}`;
    const g = new URL('https://calendar.google.com/calendar/render');
    g.searchParams.set('action', 'TEMPLATE'); g.searchParams.set('text', title);
    g.searchParams.set('dates', `${icsDate(WEDDING.start)}/${icsDate(WEDDING.end)}`);
    g.searchParams.set('details', details); g.searchParams.set('location', WEDDING.venue);
    $('#gcalLink').href = g.toString();
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AnnuWedsSachin//Invitation//EN', 'BEGIN:VEVENT',
      `UID:annu-sachin-2027@invitation`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(WEDDING.start)}`, `DTEND:${icsDate(WEDDING.end)}`,
      `SUMMARY:${title}`, `DESCRIPTION:${details.replace(/\n/g, '\\n')}`, `LOCATION:${WEDDING.venue}`, `URL:${WEDDING.maps}`,
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Annu & Sachin wedding tomorrow', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    $('#icsLink').href = 'data:text/calendar;charset=utf-8,' + encodeURIComponent(ics);
    btn.addEventListener('click', () => { menu.hidden = !menu.hidden; btn.setAttribute('aria-expanded', String(!menu.hidden)); });
  }

  /* ---------- 2c. red hearts flip open one by one (tap to flip back) ---------- */
  function initHearts() {
    const hearts = $$('[data-heart]'); if (!hearts.length || reduceMotion) return;
    document.documentElement.classList.add('js-flip');
    const open = () => hearts.forEach((h, i) => setTimeout(() => h.classList.add('is-open'), 900 + i * 650));
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { open(); io.disconnect(); } }, { threshold: 0.45 });
      io.observe($('.hearts'));
    } else open();
    hearts.forEach(h => h.addEventListener('click', () => h.classList.toggle('is-open')));
  }

  /* ---------- boot ---------- */
  function boot() {
    initHearts(); initScroll(); initPremium(); initSparkles(); initCountdown(); initRSVP(); initShare(); initMusic(); initCalendar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
