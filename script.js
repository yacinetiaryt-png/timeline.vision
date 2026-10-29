(() => {
  'use strict';

  const doc = document.documentElement;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const mq = q => window.matchMedia(q);
  const mqReduce = mq('(prefers-reduced-motion: reduce)');
  const mqFine = mq('(hover: hover) and (pointer: fine)');
  const mqPhone = mq('(max-width: 700px)');
  const reduced = () => mqReduce.matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const onChange = (m, fn) => (m.addEventListener ? m.addEventListener('change', fn) : m.addListener(fn));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  /* ---------------------------------------------------------------
     1. Intro: “hello” in a few languages, then it slides up by itself.
        Click or press a key to skip it.
     --------------------------------------------------------------- */
  const HELLOS = ['hello', 'bonjour', 'مرحبا', 'azul', 'hola', 'ciao', 'olá', 'hallo'];
  const intro = $('#loadingScreen');
  const sleep = ms => new Promise(res => setTimeout(res, ms));
  const holdScroll = e => e.preventDefault();
  let introDone = false;

  function endIntro() {
    if (introDone) return;
    introDone = true;
    window.removeEventListener('wheel', holdScroll);
    window.removeEventListener('touchmove', holdScroll);
    doc.classList.add('is-loaded');
    if (!intro) return;
    intro.classList.add('is-leaving');
    setTimeout(() => intro.classList.add('is-gone'), reduced() ? 500 : 1100);
  }

  async function runIntro() {
    if (!intro) { endIntro(); return; }
    const word = $('.intro-text', intro);
    window.addEventListener('wheel', holdScroll, { passive: false });
    window.addEventListener('touchmove', holdScroll, { passive: false });
    intro.addEventListener('click', endIntro);
    document.addEventListener('keydown', endIntro, { once: true });
    if (!location.hash) {
      try { history.scrollRestoration = 'manual'; } catch (e) { /* ignore */ }
      window.scrollTo(0, 0);
    }
    try { await Promise.race([document.fonts.ready, sleep(700)]); } catch (e) { /* ignore */ }
    if (introDone) return;
    intro.classList.add('is-in');
    if (reduced()) { await sleep(900); endIntro(); return; }
    await sleep(1000);
    for (let i = 1; i < HELLOS.length && !introDone; i++) {
      word.textContent = HELLOS[i];
      await sleep(i === HELLOS.length - 1 ? 450 : 165);
    }
    endIntro();
  }
  runIntro();
  setTimeout(endIntro, 7000); // safety net

  /* ---------------------------------------------------------------
     2. Sidebar + bottom nav: highlight the section in view
     --------------------------------------------------------------- */
  const navLinks = $$('.sidebar-menu a, .mobile-nav a');
  const setActive = id => {
    navLinks.forEach(a => {
      const on = a.hash === '#' + id;
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  };
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -54% 0px' });
    $$('[data-nav-section]').forEach(s => spy.observe(s));
  }

  /* ---------------------------------------------------------------
     3. Background grid lens that trails the mouse
     --------------------------------------------------------------- */
  (() => {
    const lens = $('.bg-lens');
    const lensGrid = $('.bg-lens-grid');
    if (!lens || !lensGrid) return;
    const CELL = 16;
    let R = lens.offsetWidth / 2 || 170;
    let tx = 0, ty = 0, x = 0, y = 0, raf = 0, seen = false;
    const render = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      const lx = Math.round(x - R), ly = Math.round(y - R);
      lens.style.transform = `translate3d(${lx}px, ${ly}px, 0)`;
      const pos = `${-(((lx % CELL) + CELL) % CELL)}px ${-(((ly % CELL) + CELL) % CELL)}px`;
      lensGrid.style.setProperty('-webkit-mask-position', pos);
      lensGrid.style.setProperty('mask-position', pos);
      raf = (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) ? requestAnimationFrame(render) : 0;
    };
    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || !mqFine.matches || reduced()) return;
      tx = e.clientX; ty = e.clientY;
      if (!seen) { R = lens.offsetWidth / 2 || R; x = tx; y = ty; seen = true; }
      lens.classList.add('is-active');
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
    const hide = () => lens.classList.remove('is-active');
    document.addEventListener('mouseout', e => { if (!e.relatedTarget) hide(); });
    window.addEventListener('blur', hide);
  })();

  /* ---------------------------------------------------------------
     4. Hero image: focus view
        closed → "from" (sits on the hero image) → "center" (flies to
        the middle, page blurs) → "open" (slides aside, white panel opens)
     --------------------------------------------------------------- */
  const heroFigure = $('#heroFigure');
  const heroImg = $('#heroImage');
  const focusEl = $('#focus');
  const focusMedia = $('.focus-media', focusEl);
  const focusImg = $('#focusImage');
  const focusPanel = $('.focus-panel', focusEl);
  const closeBtn = $('.focus-close', focusEl);
  const outside = [$('.page'), $('.sidebar'), $('.mobile-nav'), $('.chat-fab')].filter(Boolean);
  let phase = 'closed', seq = 0, lastActive = null;

  $$('.panel-inner > *', focusEl).forEach((el, i) => el.style.setProperty('--i', i));

  function layoutFocus() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const m = vw < 600 ? 16 : 32;
    const set = (k, v) => focusEl.style.setProperty(k, v);
    let mode = 'v', W, H, P, ux, uy;

    if (vw >= 820 && vw / vh >= 0.95) {
      P = clamp(vw * 0.34, 340, 480);
      H = Math.min(vh * 0.82, 780, (vw - 2 * m - P) / 0.75);
      if (H >= 380) mode = 'h';
    }

    if (mode === 'h') {
      W = H * 0.75;
      ux = (vw - (W + P)) / 2;
      uy = (vh - H) / 2;
      set('--uw', `${W + P}px`); set('--uh', `${H}px`);
      set('--px', `${W}px`); set('--py', '0px'); set('--pw', `${P}px`); set('--ph', `${H}px`);
      set('--media-center', `translate(${P / 2}px, 0px) scale(1)`);
      set('--panel-center', `translate(${P / 2}px, 0px)`);
    } else {
      const top = 72;
      H = Math.min((vh - top - m) * 0.52, (vw - 2 * m) / 0.75, 600);
      W = H * 0.75;
      const Hp = clamp(vh - top - m - H, 180, 560);
      ux = (vw - W) / 2;
      uy = Math.max(top, top + (vh - top - m - (H + Hp)) / 2);
      const shift = (vh - H) / 2 - uy;
      set('--uw', `${W}px`); set('--uh', `${H + Hp}px`);
      set('--px', '0px'); set('--py', `${H}px`); set('--pw', `${W}px`); set('--ph', `${Hp}px`);
      set('--media-center', `translate(0px, ${shift}px) scale(1)`);
      set('--panel-center', `translate(0px, ${shift}px)`);
    }

    set('--ux', `${ux}px`); set('--uy', `${uy}px`);
    set('--mw', `${W}px`); set('--mh', `${H}px`);
    focusEl.dataset.mode = mode;

    const r = heroImg.getBoundingClientRect();
    set('--media-from', `translate(${r.left - ux}px, ${r.top - uy}px) scale(${r.width / W})`);
  }

  const nextFrame = () => new Promise(res => requestAnimationFrame(() => requestAnimationFrame(res)));
  const waitFor = (el, prop, ms) => new Promise(resolve => {
    let done = false, timer = 0;
    const end = () => {
      if (done) return;
      done = true;
      el.removeEventListener('transitionend', onEnd);
      clearTimeout(timer);
      resolve();
    };
    const onEnd = e => { if (e.target === el && e.propertyName === prop) end(); };
    el.addEventListener('transitionend', onEnd);
    timer = setTimeout(end, ms);
  });

  function lockPage(lock) {
    if (lock) {
      doc.style.setProperty('--sbw', `${window.innerWidth - doc.clientWidth}px`);
      doc.classList.add('is-locked');
    } else {
      doc.classList.remove('is-locked');
      doc.style.removeProperty('--sbw');
    }
    outside.forEach(el => { if (lock) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
  }

  async function openFocus() {
    if (phase === 'opening' || phase === 'open') return;
    const my = ++seq;
    phase = 'opening';
    lastActive = document.activeElement;
    lockPage(true);
    focusImg.src = heroImg.currentSrc || heroImg.src;
    focusEl.classList.add('no-anim');
    focusEl.hidden = false;
    layoutFocus();
    focusEl.dataset.state = 'from';
    void focusEl.offsetWidth;
    focusEl.classList.remove('no-anim');
    heroFigure.classList.add('is-lifted');
    heroFigure.setAttribute('aria-expanded', 'true');
    await nextFrame();
    if (my !== seq) return;
    focusEl.dataset.state = 'center';
    closeBtn.focus({ preventScroll: true });
    await waitFor(focusMedia, 'transform', reduced() ? 40 : 820);
    if (my !== seq) return;
    focusEl.dataset.state = 'open';
    await waitFor(focusPanel, 'clip-path', reduced() ? 40 : 820);
    if (my !== seq) return;
    phase = 'open';
    focusEl.classList.add('is-settled');
  }

  async function closeFocus(after) {
    if (phase === 'closed' || phase === 'closing') return;
    const my = ++seq;
    phase = 'closing';
    focusEl.classList.remove('is-settled');
    if (focusEl.dataset.state === 'open') {
      focusEl.dataset.state = 'center';
      await waitFor(focusPanel, 'clip-path', reduced() ? 40 : 820);
      if (my !== seq) return;
    }
    layoutFocus();
    focusEl.dataset.state = 'from';
    await waitFor(focusMedia, 'transform', reduced() ? 40 : 760);
    if (my !== seq) return;
    focusEl.hidden = true;
    heroFigure.classList.remove('is-lifted');
    heroFigure.setAttribute('aria-expanded', 'false');
    lockPage(false);
    phase = 'closed';
    if (typeof after === 'function') after();
    else if (lastActive && typeof lastActive.focus === 'function') lastActive.focus({ preventScroll: true });
  }

  heroFigure.addEventListener('click', openFocus);
  focusEl.addEventListener('click', e => {
    const nav = e.target.closest('[data-close-nav]');
    if (nav) {
      e.preventDefault();
      const target = document.querySelector(nav.hash);
      closeFocus(() => target && target.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth' }));
      return;
    }
    if (e.target.closest('[data-close]')) closeFocus();
  });
  document.addEventListener('keydown', e => {
    if (focusEl.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeFocus(); return; }
    if (e.key !== 'Tab') return;
    const items = $$('button, a[href]', focusEl).filter(el => el.getClientRects().length);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (!focusEl.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.addEventListener('resize', () => {
    if (focusEl.hidden) return;
    focusEl.classList.add('no-anim');
    layoutFocus();
    void focusEl.offsetWidth;
    focusEl.classList.remove('no-anim');
  });

  /* ---------------------------------------------------------------
     5. Services: endless strips (cards are duplicated once for the loop)
        The three strips are built from SPOT_VIDEOS, CONTENT_VIDEOS
        and EVENT_VIDEOS: as many cards as
        videos. Each card plays its silent preview while it is on screen;
        a click opens the full spot with sound.
     --------------------------------------------------------------- */
  const setVideoSources = (video, src) => {
    if (!src) return;
    if (typeof src === 'string') { video.setAttribute('src', src); return; }
    [['mp4', 'video/mp4'], ['webm', 'video/webm; codecs="vp9"']].forEach(([key, type]) => {
      if (!src[key]) return;
      const s = document.createElement('source');
      s.setAttribute('src', src[key]);
      s.setAttribute('type', type);
      video.appendChild(s);
    });
  };

  function spotCard(v, i) {
    const li = document.createElement('li');
    li.className = 'clip';
    const a = document.createElement('a');
    a.className = 'clip-link';
    a.href = v.full;
    a.target = '_blank';
    a.rel = 'noopener';
    a.dataset.video = v.full;
    a.setAttribute('data-vertical', '');
    if (v.poster) a.dataset.poster = v.poster;
    a.setAttribute('aria-label', v.title ? `Play video: ${v.title}` : `Play video ${i + 1}`);
    const thumb = document.createElement('div');
    thumb.className = 'clip-thumb';
    thumb.innerHTML = '<span class="clip-play" aria-hidden="true"><svg class="icon"><use href="#i-play"/></svg></span>'
      + '<span class="clip-time"><span class="sr-only">Duration </span></span>';
    thumb.lastChild.append(v.duration || '');
    const video = document.createElement('video');
    video.className = 'clip-video';
    ['muted', 'loop', 'playsinline', 'disablepictureinpicture'].forEach(k => video.setAttribute(k, ''));
    video.setAttribute('preload', 'none');
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    if (v.poster) video.setAttribute('poster', v.poster);
    setVideoSources(video, v.preview);
    thumb.prepend(video);
    a.appendChild(thumb);
    if (v.title) {
      const h = document.createElement('h4');
      h.className = 'clip-title';
      h.textContent = v.title;
      a.appendChild(h);
    }
    if (v.sub) {
      const sub = document.createElement('p');
      sub.className = 'clip-sub';
      sub.textContent = v.sub;
      a.appendChild(sub);
    }
    li.appendChild(a);
    return li;
  }

  [['.reel--spot', window.SPOT_VIDEOS], ['.reel--content', window.CONTENT_VIDEOS], ['.reel--event', window.EVENT_VIDEOS]].forEach(([sel, videos]) => {
    const reel = $(sel);
    const list = reel && $('.marquee-list', reel);
    if (!list) return;
    if (!Array.isArray(videos) || !videos.length) {
      if (!list.children.length) reel.hidden = true;
      return;
    }
    list.textContent = '';
    videos.forEach((v, i) => list.appendChild(spotCard(v, i)));
    // only a few videos: repeat them so the strip stays full
    const originals = Array.from(list.children);
    for (let guard = 0; guard < 12 && list.scrollWidth < window.innerWidth * 1.1; guard++) {
      originals.forEach(li => {
        const copy = li.cloneNode(true);
        copy.setAttribute('aria-hidden', 'true');
        $$('a', copy).forEach(el => el.setAttribute('tabindex', '-1'));
        list.appendChild(copy);
      });
    }
  });

  const marquees = $$('.marquee');
  const PX_PER_SECOND = 42;
  const sizeMarquees = () => marquees.forEach(m => {
    const list = $('.marquee-list', m);
    if (list) m.style.setProperty('--dur', `${Math.max(20, list.scrollWidth / PX_PER_SECOND).toFixed(1)}s`);
  });
  if (!reduced()) {
    marquees.forEach(m => {
      const track = $('.marquee-track', m);
      const list = $('.marquee-list', track);
      const clone = list.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      $$('a, button', clone).forEach(el => el.setAttribute('tabindex', '-1'));
      track.appendChild(clone);
      m.classList.add('is-ready');
    });
  }
  sizeMarquees();

  const clipVideos = $$('.clip-video');
  const onScreen = new Set();
  const previewsAllowed = () => !reduced() && !document.hidden && !(navigator.connection && navigator.connection.saveData);
  const playClip = v => {
    if (!previewsAllowed()) return;
    if (v.getAttribute('preload') !== 'auto') v.setAttribute('preload', 'auto');
    const p = v.play();
    if (p && p.catch) p.catch(() => {});
  };
  if ('IntersectionObserver' in window && clipVideos.length) {
    const clipIO = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { onScreen.add(e.target); playClip(e.target); }
      else { onScreen.delete(e.target); if (!e.target.paused) e.target.pause(); }
    }), { threshold: 0.15 });
    clipVideos.forEach(v => clipIO.observe(v));
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) clipVideos.forEach(v => v.pause());
      else onScreen.forEach(playClip);
    });
  }

  /* ---------------------------------------------------------------
     6. Nos réalisations: the repo’s GridMotion with videos.
        Wide screens: rotated 4×7 grid, rows follow the mouse with inertia.
        Phones (≤ 700px): 3 strips of fixed-size 3:4 tiles driven by scroll.
     --------------------------------------------------------------- */
  const work = $('#my-work');
  const gm = $('#gridMotion-container');
  const POOL = [].concat(window.SPOT_VIDEOS || [], window.CONTENT_VIDEOS || [], window.EVENT_VIDEOS || [])
    .filter(v => v && v.preview)
    .map(v => ({ mp4: typeof v.preview === 'string' ? v.preview : v.preview.mp4, webm: v.preview && v.preview.webm, poster: v.poster, full: v.full }));
  for (let i = POOL.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [POOL[i], POOL[j]] = [POOL[j], POOL[i]]; }
  const GRID_CLIP_COUNT = 12;   // a random handful each visit, enough to fill the grid
  const SRC = POOL.length ? POOL.slice(0, GRID_CLIP_COUNT) : (Array.isArray(window.VIDEO_SOURCES) ? window.VIDEO_SOURCES : []);
  const TILES = [
    ['commercials.', 'violet'], ['rolling?', 'paper'], ['content creation.', 'yellow'],
    ['join us.', 'ink'], ['events.', 'plum'], ['your project here.', 'violet'],
    ['action.', 'yellow'], ['and you?', 'plum']
  ];
  const LAYOUT = {
    desktop: { cols: 7, text: [[1, 5], [3], [0, 4], [2, 6]] },
    phone: { cols: 6, text: [[1], [3], [0, 4]] }
  };
  const MAX_MOVE = 300, BASE_DURATION = 0.8, INERTIA = [0.6, 0.4, 0.3, 0.2];
  let rows = [], workVisible = false, rafWork = 0, lastT = 0, snap = true;
  let mouseX = window.innerWidth / 2;

  function makeVideo(k) {
    const v = document.createElement('video');
    v.className = 'row__item-video';
    v.muted = true; v.defaultMuted = true; v.loop = true; v.playsInline = true;
    ['muted', 'loop', 'playsinline'].forEach(a => v.setAttribute(a, ''));
    v.setAttribute('aria-hidden', 'true');
    v.setAttribute('tabindex', '-1');
    v.disablePictureInPicture = true;
    v.preload = 'none';
    const entry = SRC[k];
    if (typeof entry === 'string') {
      v.addEventListener('error', () => v.remove(), { once: true });
      v.src = entry;
    } else {
      if (entry.poster) v.poster = entry.poster;
      [['mp4', 'video/mp4'], ['webm', 'video/webm; codecs="vp9"']].forEach(([key, type]) => {
        if (!entry[key]) return;
        const s = document.createElement('source');
        s.src = entry[key];
        s.type = type;
        v.appendChild(s);
      });
      const lastSource = v.querySelector('source:last-of-type');
      if (lastSource) lastSource.addEventListener('error', () => v.remove(), { once: true });
    }
    return v;
  }

  function buildWork() {
    const phone = mqPhone.matches;
    const L = phone ? LAYOUT.phone : LAYOUT.desktop;
    work.classList.toggle('is-phone', phone);
    work.classList.toggle('is-desktop', !phone);
    gm.textContent = '';
    rows = [];
    let tile = 0, vid = 0;
    L.text.forEach((textCols, r) => {
      const row = document.createElement('div');
      row.className = 'row';
      for (let c = 0; c < L.cols; c++) {
        const item = document.createElement('div');
        item.className = 'row__item';
        const inner = document.createElement('div');
        inner.className = 'row__item-inner';
        if (textCols.includes(c) || !SRC.length) {
          const [label, tone] = TILES[tile++ % TILES.length];
          inner.classList.add(`tile--${tone}`);
          const t = document.createElement('div');
          t.className = 'row__item-content';
          const end = /^(.*?)([.?!])$/.exec(label);
          if (end) {
            const mark = document.createElement('span');
            mark.className = 'punct';
            mark.textContent = end[2];
            t.append(end[1], mark);
          } else {
            t.textContent = label;
          }
          inner.appendChild(t);
        } else {
          const k = (vid++ + r * 2) % SRC.length;
          const entry = SRC[k];
          if (entry && entry.poster) inner.style.backgroundImage = `url("${entry.poster}")`;
          else inner.classList.add(`vp-${k + 1}`);
          if (entry && entry.full) {
            inner.dataset.video = entry.full;
            inner.setAttribute('data-vertical', '');
            if (entry.poster) inner.dataset.poster = entry.poster;
            inner.classList.add('is-playable');
          }
          inner.appendChild(makeVideo(k));
        }
        item.appendChild(inner);
        row.appendChild(item);
      }
      gm.appendChild(row);
      rows.push({ el: row, x: 0, range: 0 });
    });
    snap = true;
    measureRows();
    syncVideos();
    kickWork();
  }

  function measureRows() {
    const w = work.clientWidth;
    rows.forEach(s => { s.range = Math.max(0, s.el.scrollWidth - w + 56); });
  }

  function syncVideos() {
    const play = workVisible && !document.hidden && !reduced();
    $$('video', gm).forEach(v => {
      if (play) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  }

  function workLoop(now) {
    const dt = Math.min(0.064, (now - (lastT || now)) / 1000);
    lastT = now;
    const phone = work.classList.contains('is-phone');
    let p = 0;
    if (phone) {
      const r = work.getBoundingClientRect();
      p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
    }
    rows.forEach((s, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      const target = phone
        ? (dir === 1 ? -p * s.range : -(1 - p) * s.range)
        : ((mouseX / window.innerWidth) * MAX_MOVE - MAX_MOVE / 2) * dir;
      if (snap) s.x = target;
      else {
        const tau = (BASE_DURATION + INERTIA[i % INERTIA.length]) / 4;
        s.x += (target - s.x) * (1 - Math.exp(-dt / tau));
      }
      s.el.style.transform = `translate3d(${s.x.toFixed(2)}px, 0, 0)`;
    });
    snap = false;
    rafWork = (workVisible && !reduced()) ? requestAnimationFrame(workLoop) : 0;
    if (!rafWork) lastT = 0;
  }
  function kickWork() {
    if (workVisible && !reduced() && !rafWork) rafWork = requestAnimationFrame(workLoop);
  }

  window.addEventListener('mousemove', e => { mouseX = e.clientX; }, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => {
      workVisible = e.isIntersecting;
      syncVideos();
      kickWork();
    }, { rootMargin: '120px 0px' }).observe(work);
  } else {
    workVisible = true;
  }
  document.addEventListener('visibilitychange', syncVideos);
  onChange(mqPhone, buildWork);
  onChange(mqReduce, () => { syncVideos(); kickWork(); });
  window.addEventListener('resize', debounce(() => { measureRows(); sizeMarquees(); }, 150));
  buildWork();

  /* ---------------------------------------------------------------
     7. YouTube: any element with data-youtube="VIDEO_ID" (or a full
        YouTube link) opens the video in a lightbox. Add data-vertical
        for Shorts / 9:16 videos.
     --------------------------------------------------------------- */
  const yt = $('#ytModal');
  const ytBox = $('.yt-box', yt);
  const ytFrame = $('.yt-frame', yt);
  const ytOpen = $('.yt-open', yt);
  const ytClose = $('.yt-close', yt);
  let ytReturn = null, ytTimer = 0;

  const youTubeId = raw => {
    const v = String(raw || '').trim();
    if (/^[\w-]{11}$/.test(v)) return v;
    const m = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/);
    return m ? m[1] : null;
  };

  function showYouTubeFallback(id) {
    ytFrame.innerHTML = '';
    const box = document.createElement('div');
    box.className = 'yt-fallback';
    const p = document.createElement('p');
    p.textContent = 'This video can’t play in this preview.';
    const a = document.createElement('a');
    a.className = 'btn btn-light';
    a.href = `https://www.youtube.com/watch?v=${id}`;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = 'Watch on YouTube';
    box.append(p, a);
    ytFrame.appendChild(box);
  }

  function openYouTube(raw, vertical) {
    const id = youTubeId(raw);
    if (!id) return false;
    clearTimeout(ytTimer);
    ytReturn = document.activeElement;
    ytBox.classList.toggle('is-vertical', !!vertical);
    ytFrame.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = 'YouTube video player';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    ytFrame.appendChild(iframe);
    ytOpen.href = `https://www.youtube.com/watch?v=${id}`;
    ytOpen.hidden = false;
    yt.dataset.video = id;
    lockPage(true);
    yt.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => yt.classList.add('is-open')));
    ytClose.focus({ preventScroll: true });
    return true;
  }

  function openFileVideo(src, vertical, poster) {
    if (!src) return false;
    clearTimeout(ytTimer);
    ytReturn = document.activeElement;
    ytBox.classList.toggle('is-vertical', !!vertical);
    ytFrame.innerHTML = '';
    const v = document.createElement('video');
    v.controls = true;
    v.playsInline = true;
    v.setAttribute('playsinline', '');
    v.preload = 'auto';
    if (poster) v.poster = poster;
    v.src = src;
    ytFrame.appendChild(v);
    ytOpen.hidden = true;
    yt.dataset.video = '';
    lockPage(true);
    yt.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => yt.classList.add('is-open')));
    const p = v.play();   // started by the click, so sound is allowed
    if (p && p.catch) p.catch(() => {});
    ytClose.focus({ preventScroll: true });
    return true;
  }

  function closeYouTube() {
    if (yt.hidden || !yt.classList.contains('is-open')) return;
    yt.classList.remove('is-open');
    ytTimer = setTimeout(() => {
      ytFrame.innerHTML = '';   // removing the player stops the sound
      yt.hidden = true;
      lockPage(false);
      if (ytReturn && typeof ytReturn.focus === 'function') ytReturn.focus({ preventScroll: true });
    }, 400);
  }

  document.addEventListener('click', e => {
    const file = e.target.closest('[data-video]');
    if (file && openFileVideo(file.dataset.video, file.hasAttribute('data-vertical'), file.dataset.poster)) {
      e.preventDefault();
      return;
    }
    const trigger = e.target.closest('[data-youtube]');
    if (trigger && openYouTube(trigger.dataset.youtube, trigger.hasAttribute('data-vertical'))) {
      e.preventDefault();
      return;
    }
    if (e.target.closest('[data-yt-close]')) closeYouTube();
  });
  // Hosts that block other sites (like the claude.ai preview) get a “watch on YouTube” button instead
  document.addEventListener('securitypolicyviolation', e => {
    if (!yt.hidden && /youtube/.test(e.blockedURI || '')) showYouTubeFallback(yt.dataset.video);
  });
  document.addEventListener('keydown', e => {
    if (yt.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); closeYouTube(); return; }
    if (e.key === 'Tab' && !yt.contains(document.activeElement)) { e.preventDefault(); ytClose.focus(); }
  });

  /* ---------------------------------------------------------------
     8. Footer year
     --------------------------------------------------------------- */
  const year = $('#year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
