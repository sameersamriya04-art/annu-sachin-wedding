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
  function hideLoader() { const l = $('#loader'); if (l) l.classList.add('is-done'); }
  window.addEventListener('load', () => setTimeout(hideLoader, 350));
  setTimeout(hideLoader, 4000); // never trap the visitor on the loader

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
      scrollTrigger: { trigger: hero, start: 'top top', end: '+=140%', pin: '.hero__pin', scrub: 0.8, anticipatePin: 1 }
    });
    heroTl
      .to('.hero__sky',     { yPercent: -6, scale: 1.08, ease: 'none' }, 0)
      .to('.hero__palace',  { yPercent: -10, scale: 1.22, ease: 'none' }, 0)
      .to('.hero__aisle',   { yPercent: 18, scale: 1.25, ease: 'none' }, 0)
      .to('.hero__garland', { yPercent: -110, ease: 'none' }, 0)
      .to('.hero__text',    { yPercent: -40, autoAlpha: 0, ease: 'none' }, 0.05)
      .to('.scroll-cue',    { autoAlpha: 0 }, 0)
      .to('.hero__pin',     { autoAlpha: 0, duration: 0.25 }, 0.75);

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
      scrollTrigger: { trigger: '#invite', start: 'top 85%', end: 'top 25%', scrub: 0.6 },
      y: 140, scale: 0.86, autoAlpha: 0, ease: 'none'
    });
    gsap.to('.invite__bg', { scrollTrigger: { trigger: '#invite', start: 'top bottom', end: 'bottom top', scrub: true }, backgroundPositionY: '30%', ease: 'none' });
    gsap.from('.card-oval > *', { scrollTrigger: { trigger: '[data-card]', start: 'top 70%' }, y: 18, autoAlpha: 0, stagger: 0.06, duration: 0.9 });

    /* GARDEN — parallax staircase transition */
    gsap.fromTo('.garden__img', { yPercent: -8, scale: 1.15 }, {
      scrollTrigger: { trigger: '#garden', start: 'top bottom', end: 'bottom top', scrub: true }, yPercent: 8, scale: 1, ease: 'none'
    });

    /* HEARTS — pop in one by one */
    gsap.from('[data-heart]', {
      scrollTrigger: { trigger: '.hearts', start: 'top 80%' },
      scale: 0.2, autoAlpha: 0, rotation: -8, transformOrigin: '50% 60%', stagger: 0.18, duration: 1.1, ease: 'elastic.out(1, 0.55)'
    });

    /* PORTRAITS — cinematic clip reveal + shine */
    $$('[data-portrait]').forEach((fig, i) => {
      const frame = $('.portrait__frame', fig);
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 78%' } });
      tl.from(frame, { clipPath: 'inset(50% 0 50% 0 round 50%)', autoAlpha: 0, duration: 1.2, ease: 'power3.inOut' })
        .from($('img', frame), { scale: 1.3, duration: 1.6, ease: 'power2.out' }, 0)
        .to($('.portrait__shine', fig), { x: '240%', duration: 1.2, ease: 'power1.inOut' }, 0.6)
        .from($$('figcaption > *', fig), { y: 14, autoAlpha: 0, stagger: 0.08, duration: 0.7 }, 0.5);
    });
    gsap.from('.portraits__amp', { scrollTrigger: { trigger: '.portraits__amp', start: 'top 85%' }, scale: 0, rotation: -30, duration: 1, ease: 'back.out(2)' });

    /* STORY frame draws in */
    gsap.from('.story__arch', { scrollTrigger: { trigger: '#story', start: 'top 75%' }, scale: 0.92, autoAlpha: 0, transformOrigin: '50% 100%', duration: 1.2 });

    /* EVENTS — slide in along the timeline */
    $$('[data-event]').forEach(ev => {
      gsap.from(ev, { scrollTrigger: { trigger: ev, start: 'top 88%' }, x: -40, autoAlpha: 0, duration: 0.9 });
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
    gsap.from('.cd', { scrollTrigger: { trigger: '#countdown', start: 'top 85%' }, scale: 0.6, autoAlpha: 0, stagger: 0.1, duration: 0.8, ease: 'back.out(1.6)' });

    /* SIGNATURE */

    // Recalculate once fonts/images settle
    window.addEventListener('load', () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
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
    btn.addEventListener('click', async () => {
      if (!available) { toast('Music not added yet (assets/audio/music.mp3)'); return; }
      if (audio.paused) {
        try { await audio.play(); btn.setAttribute('aria-pressed', 'true'); btn.setAttribute('aria-label', 'Pause background music'); }
        catch (e) { toast('Could not start music — tap again'); }
      } else { audio.pause(); btn.setAttribute('aria-pressed', 'false'); btn.setAttribute('aria-label', 'Play background music'); }
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden && !audio.paused) { audio.pause(); btn.setAttribute('aria-pressed', 'false'); } });
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
    initHearts(); initScroll(); initCountdown(); initRSVP(); initShare(); initMusic(); initCalendar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
