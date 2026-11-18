/* GistAct project page (vanilla JS, no dependencies).
   Data: data.js (paper numbers), real_v2.js (GA_REAL2, one episode per real-robot track), real_baselines.js (GA_REALB),
   real_fr3.js (GA_FR3, real-robot clips per episode and arm; used first when present), episodes.js (GA_EPISODES),
   edit_v2.js (GA_EDIT2), think_overrides.js (GA_THINK, Think states and goal regions), grasp.js (GA_GRASP).
   Every section uses one player: a main clip with a Think bubble on it, and a side panel with the baseline clips.
   A clip whose file cannot be loaded hides its slot. */
(() => {
  'use strict';
  const D = window.GA_DATA, OV = window.GA_THINK || {}, GRASP = Object.assign({}, window.GA_GRASP || {}), REALB = window.GA_REALB || {}, FR3 = window.GA_FR3 || {};
  const R2 = window.GA_REAL2 || [], EPS = window.GA_EPISODES || [], ED2 = window.GA_EDIT2 || [];
  const fr3 = (id, arm) => (FR3[id] || {})[arm] || null;
  // Think states for an id (or "<id>/edit"): the fr3: entry goes with the GA_FR3 clips
  const ovOf = id => (FR3[id.split('/')[0]] && OV['fr3:' + id]) || OV[id] || null;
  [...R2, ...EPS, ...ED2].forEach(e => { const o = ovOf(e.id); if (o) e.think = Object.assign({}, e.think || {}, o); });
  Object.entries(FR3).forEach(([id, x]) => { if (x.ours && x.ours.grasp != null) GRASP[id] = x.ours.grasp; if (x.edit && x.edit.grasp != null) GRASP[id + '/edit'] = x.edit.grasp; });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = x => Math.max(0, Math.min(1, x)), ease = x => 1 - Math.pow(1 - clamp(x), 3);
  const sentence = s => s ? (s[0].toUpperCase() + s.slice(1)).replace(/([^.?!])$/, '$1.') : '';
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // on-video marks (brackets, labels) use the theme's --mark; read again when the theme changes
  let ACC = '#a6dc4a'; const readMark = () => { ACC = getComputedStyle(document.documentElement).getPropertyValue('--mark').trim() || ACC; };
  readMark(); document.addEventListener('themechange', () => { readMark(); PLAYERS.forEach(p => p.tick && p.tick(0)); });
  const byId = (list, id) => list.find(e => e.id === id);
  const clipOf = (ep, arm) => ep && (fr3(ep.id, arm) || ep.clips.find(c => c.arm === arm)) || null;
  const blArm = (id, arm) => { const f = fr3(id, arm); if (f) return f; const x = REALB[id]; return !x ? null : Array.isArray(x) ? x.find(c => c.arm === arm) || null : x[arm] || null; };
  const visible = (node, fn, threshold = .2) => new IntersectionObserver(en => fn(en[0].isIntersecting), { threshold }).observe(node);

  /* ---------------------------------------------------------------- nav highlight, reveal once */
  const navA = $$('.nav .links a');
  const secIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) navA.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => secIO.observe(s));
  const revIO = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); revIO.unobserve(en.target); } }), { rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(e => REDUCED ? e.classList.add('in') : revIO.observe(e));
  setTimeout(() => { if (!scrollY) $$('.rv').forEach(e => e.classList.add('in')); }, 4000);   // page never scrolled (full-page captures): show everything

  /* ---------------------------------------------------------------- video sources
     Chrome cannot seek a video whose server ignores Range (the gallery server answers 200 to everything). Probe once; without Range,
     clips load as blobs, which seek anywhere. On a real static host they stream as usual. */
  const RANGE = fetch(location.href, { headers: { Range: 'bytes=0-0' }, cache: 'no-store' }).then(r => r.status === 206).catch(() => false);
  const setSrc = (v, url) => {
    v.dataset.want = url;
    return RANGE.then(ok => ok ? url : fetch(url).then(r => { if (!r.ok) throw r.status; return r.blob(); }).then(b => URL.createObjectURL(b)).catch(() => url))
      .then(src => { if (v.dataset.want !== url) { if (src.startsWith('blob:')) URL.revokeObjectURL(src); return; } v.src = src; });
  };
  const load = v => { if (!v.getAttribute('src') && !v.dataset.want && v.dataset.src) return setSrc(v, v.dataset.src); return Promise.resolve(); };
  const drop = v => { const s = v.getAttribute('src') || ''; delete v.dataset.want; v.pause(); v.removeAttribute('src'); v.load(); if (s.startsWith('blob:')) URL.revokeObjectURL(s); };
  const play = v => { v.play().catch(() => { }); };

  /* ---------------------------------------------------------------- one clock for every animated block (rAF, timer fallback) */
  const TICKS = new Set();
  let lastT = performance.now(), rafT = 0;
  const step = () => { const t = performance.now(), dt = Math.min(100, t - lastT); lastT = t; TICKS.forEach(f => f(dt)); };
  const frame = () => { rafT = performance.now(); step(); requestAnimationFrame(frame); };
  requestAnimationFrame(frame); setInterval(() => { if (performance.now() - rafT > 120) step(); }, 40);

  /* ---------------------------------------------------------------- overlays (the frame is never darkened)
     Every answer or target is marked the same way: viewfinder corner brackets and the target's name. Vision states show as a crop
     inside the Think bubble, never as a mark on the frame. */
  const fitCanvas = cv => { const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1), w = Math.round(r.width * d), h = Math.round(r.height * d); if (w && (cv.width !== w || cv.height !== h)) { cv.width = w; cv.height = h; } return w > 0; };
  const cssPx = ctx => ctx.canvas.width / (ctx.canvas.clientWidth || ctx.canvas.width);
  // Answer: viewfinder corner brackets that close in on the target's box (a large region such as a tray gets brackets on its own box),
  // with the target's name on a small label.
  function drawMark(ctx, W, H, g, a, bloom = 1, label = '') {
    if (!g || a <= 0) return;
    const d = cssPx(ctx), pad = 7 * d, sc = 1 + .6 * (1 - bloom), bw = Math.max(2 * (g.rx || .04) * W, 18 * d), bh = Math.max(2 * (g.ry || .04) * H, 18 * d);
    const w = (bw + 2 * pad) * sc, h = (bh + 2 * pad) * sc, x0 = g.cx * W - w / 2, y0 = g.cy * H - h / 2, L = Math.min(16 * d, Math.min(w, h) * .38);
    ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const br = () => { ctx.beginPath(); [[x0, y0, 1, 1], [x0 + w, y0, -1, 1], [x0, y0 + h, 1, -1], [x0 + w, y0 + h, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); }); ctx.stroke(); };
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 5.5 * d; br(); ctx.strokeStyle = ACC; ctx.lineWidth = 2.6 * d; br();
    if (label) drawTag(ctx, W, H, x0, y0, h, d, label);
    ctx.restore();
  }
  // the name label: above the box, below it when there is no room
  function drawTag(ctx, W, H, x, top, h, d, text) {
    ctx.font = `600 ${16 * d}px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace`;
    const tw = ctx.measureText(text).width, px = 7 * d, bh = 24 * d, lw = tw + 2 * px, up = top - bh - 5 * d;
    const bx = Math.min(W - lw - 4 * d, Math.max(4 * d, x)), by = up >= 4 * d ? up : Math.min(H - bh - 4 * d, top + h + 5 * d);
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, by, tw + 2 * px, bh, 5 * d) : ctx.rect(bx, by, tw + 2 * px, bh);
    ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#0f1600'; ctx.textBaseline = 'middle'; ctx.fillText(text, bx + px, by + bh / 2 + d);
  }
  // answer over clip time: one segment per goal region ({ t, until } in clip seconds); a single goal stays until the grasp. name: its label.
  const segsOf = (th, grasp, names = []) => !th || !th.goal ? [] : [].concat(th.goal).map((q, i) => ({ t0: i ? q.t || 0 : 0, t1: q.until != null ? q.until : grasp, g: q, name: names[i] || '' }));
  // the name on each answer label, per episode and goal region (in goal order)
  const NAMES = {
    real_sem26_r0: ['strawberry'], real_pos06_r0: ['corn'], real_rank_indist_7390047_r0: ['tangerine', 'tray'], real_sort_indist_7090001_r0: ['grapes', 'lemon', 'eggplant', 'tangerine'],
    edit2_pos02_r0_lemon: ['strawberry'], 'edit2_pos02_r0_lemon/edit': ['lemon'],
    robolab_lb_XrSmallestItemTask_ep1001: ['lychee', 'bowl'], robolab_lb_XrBetweenBinsTask_ep1002: ['can', 'bowl'], robolab_lb_XrSmallerThanTask_ep0: ['lemon', 'lime', 'lychee'],
    robolab_XrBehindBowlTask_ep1: ['orange', 'plate'], robolab_XrExceptOrangeTask_ep2: ['lemon', 'bowl'],
    vlabench_v13: ['apple', 'plate'], vlabench_v05: ['Spider-Man', 'box'], vlabench_v00: ['button'], robospa_r08: ['pink car'], robospa_r15: ['blue soap'], robospa_r06: ['red apple'],
    vlabench_t3_insert_flower_ep0001: ['rose'], robospa_seals_mv_s100027: ['target']
  };
  // gripper position on the first frame (fixed camera per setup). The Think bubble rises from here.
  const gripOf = id => /^robolab/.test(id) ? { x: .655, y: .36 } : /^vlabench/.test(id) ? { x: .62, y: .41 } : /^robospa/.test(id) ? { x: .5, y: .2 } : { x: .67, y: .32 };
  // and over clip time: from the start pose to just above the first answer, reached at the grasp
  const gripAt = (g0, goal, grasp, t) => { if (!goal || !grasp) return g0; const k = ease(t / grasp); return { x: g0.x + (goal.cx - g0.x) * k, y: g0.y + (goal.cy - goal.ry - g0.y) * k }; };
  // a square crop of the poster (= the held first frame) around a region, as inline CSS
  const cropCss = (c, r, pad = 2.3) => {
    const W = c.w || 640, H = c.h || 480, hw = Math.max(r.rx * W, r.ry * H, 14) * pad, s = Math.min(2 * hw, W, H), L = clamp((r.cx * W - s / 2) / (W - s)), T = clamp((r.cy * H - s / 2) / (H - s));
    return `background-image:url('${c.poster}');background-size:${(W / s * 100).toFixed(1)}% ${(H / s * 100).toFixed(1)}%;background-position:${(L * 100).toFixed(1)}% ${(T * 100).toFixed(1)}%`;
  };
  const glowAt = (t, t1) => t1 == null ? 1 : clamp((t1 - t) / .45);

  /* ---------------------------------------------------------------- seekable progress bar (click or drag; arrows when focused) */
  function scrubber(bar, dur, seek, hold, cur) {
    bar.tabIndex = 0; bar.setAttribute('role', 'slider'); bar.setAttribute('aria-label', 'Seek');
    const at = e => { const r = bar.getBoundingClientRect(); return clamp((e.clientX - r.left) / (r.width || 1)) * dur(); };
    bar.addEventListener('pointerdown', e => { if (!dur()) return; e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch (x) { } bar.classList.add('drag'); hold(true); seek(at(e)); });
    bar.addEventListener('pointermove', e => { if (bar.classList.contains('drag')) seek(at(e)); });
    const up = () => { if (!bar.classList.contains('drag')) return; bar.classList.remove('drag'); hold(false); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n => bar.addEventListener(n, up));
    bar.addEventListener('keydown', e => {
      const d = dur(), k = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d || !k) return;
      e.preventDefault(); seek(Math.max(0, Math.min(d - .1, cur() + k)));
    });
  }

  /* ---------------------------------------------------------------- video box: video + overlay canvas + labels; hidden when its clip is missing */
  function vbox(c, { tag = null, me = false, bar = false } = {}) {
    const box = el('div', 'vbox'), v = document.createElement('video'), cv = document.createElement('canvas'), rate = Math.min(2, c && c.rate || 1);
    Object.assign(v, { muted: true, playsInline: true, preload: 'none' }); v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
    v.dataset.rate = rate;
    if (c && c.w && c.h) box.style.setProperty('--ar', `${c.w} / ${c.h}`);
    if (c && c.poster) v.poster = c.poster;
    if (c) v.dataset.src = c.src;
    box.append(v, cv);
    if (tag) box.append(el('span', 'tag' + (me ? ' me' : ''), tag));
    if (rate !== 1) box.append(el('span', 'tag spd', rate + '×'));
    const r = { box, v, cv, missing: false, bar: null };
    if (bar) { r.bar = el('div', 'bar'); box.append(r.bar); }   // an invisible seek area over the whole clip
    const miss = () => { if (r.missing) return; r.missing = true; v.dataset.done = 1; box.classList.add('missing'); v.dispatchEvent(new Event('missing')); };
    if (!c) miss(); else v.addEventListener('error', miss);
    r.miss = miss;
    return r;
  }

  /* ---------------------------------------------------------------- the player: Instruction -> Think -> Answer -> Act
     Instruction: at every loop start the instruction sits large on a soft band over frame 0 (fades in, holds 2 s), then glides up
     into its caption above the clip, which stays at full contrast. Main clip left; the side panel holds the stage buttons and the
     baseline clips. Think: the video holds frame 0 while dots rise from the gripper into a thought bubble, and each latent state
     resolves in it (>= 1.5 s each; a Vision state shows its crop inside the bubble). Fold mode (sim, steering): Think is one
     1.8 s hold, and "Show Think" replays it with the same bubble. Answer: corner brackets close in on the target with its name.
     Act: the clip and the strip play; the brackets fade at the grasp. */
  const T_IN = 350, T_IHOLD = 2000, T_GLIDE = 550, T_STEP = 1500, T_FOLD = 1800, T_BLOOM = 500, T_ANS = 1800, T_GAP = 2000;   // user 11-18: Think felt slow, about 1.7x faster
  // bubble: birth (three dots pop 120 ms apart, then the bubble grows out of the largest), 0.4 s of thinking dots, 0.45 s decode, fly to the answer
  const T_BIRTH = 450, T_DOTS = 250, T_DEC = 300, T_FLY = 450;
  const stepMs = s => Math.max(T_STEP, 800 + 25 * (s.text || '').length) + T_DOTS + T_DEC;   // the decoded line stays >= 1.5 s, longer for long lines
  const backOut = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const diffHtml = (was, now) => {
    const a = was.split(' '), b = now.split(' '); let i = 0, j = 0;
    while (i < a.length && i < b.length && a[i] === b[i]) i++;
    while (j < a.length - i && j < b.length - i && a[a.length - 1 - j] === b[b.length - 1 - j]) j++;
    return `${esc(a.slice(0, i).join(' '))} <s>${esc(a.slice(i, a.length - j).join(' '))}</s> <em>${esc(b.slice(i, b.length - j).join(' '))}</em> ${esc(b.slice(b.length - j).join(' '))}`;
  };
  const PLAYERS = new Set();
  let bindComments = () => { };   // set by the review comments block; re-run after a player rebuilds its DOM
  function seq(host, { clip, think, grasp = null, instr = null, strip = [], fold = false, tag = 'GistAct', score = null, ctx = {}, cid = null, names = [], duo = null }) {
    host.innerHTML = '';
    const th = think || {}, steps = th.steps || [], segs = segsOf(th, grasp, names), g0 = gripOf(ctx.ep || '');
    const tI = instr ? T_IHOLD + T_GLIDE : 0;
    let showT = !fold, at = [], tThink = 0, tPre = 0;
    const plan = () => { at = []; let T = tI; if (!showT) T += duo ? 0 : T_FOLD; else steps.forEach((s, i) => { at.push(T); T += stepMs(s) + (i ? 0 : T_BIRTH); }); tThink = T; tPre = T + (duo && !showT ? 0 : T_ANS); };
    plan();
    const ip = instr ? el('p', 'instr', `<span class="lab">Instruction</span><q>${esc(instr)}</q>`) : null, iq = ip && $('q', ip);
    if (ip) host.append(ip);
    const grid = el('div', 'pgrid' + (duo ? ' duo' : '')), vb = vbox(clip, { tag: esc(tag) + (score != null ? ` <b>${score.toFixed(1)}%</b>` : ''), me: true, bar: true }), pan = el('div', 'panel');
    // duo (simulation): the baseline left, GistAct right, same size and in sync; a control row under both
    const bl = duo ? vbox(duo.clip, { tag: esc(duo.name) }) : null;
    if (duo) {
      const L = el('div', 'dcol'), Rr = el('div', 'dcol');
      L.append(bl.box, el('p', 'dout', `<i>✕</i>${esc(duo.note || '')}`)); Rr.append(vb.box, el('p', 'dout ok', `<i>✓</i>${esc(duo.ok || '')}`));
      grid.append(L, Rr, pan);
    } else grid.append(vb.box, pan);
    host.append(grid); if (cid) pan.dataset.cid = cid + '.think';
    // the instruction beat: one line on a band across the frame (two on a phone), sized to fit
    const ib = instr ? el('div', 'ibeat', `<q>${esc(instr)}</q>`) : null, ibq = ib && $('q', ib); if (ib) grid.append(ib);   // over the clip but outside its clipping box, so the line can glide up to the caption
    let fitW = 0;
    const fitBeat = () => {
      const bx = vb.box, x0 = bl ? bl.box.offsetLeft : bx.offsetLeft; Object.assign(ib.style, { left: x0 + 'px', top: bx.offsetTop + 'px', width: bx.offsetLeft + bx.offsetWidth - x0 + 'px', height: bx.offsetHeight + 'px' });   // duo: across both clips
      const w = bx.clientWidth; if (!w || w === fitW) return; fitW = w; ibq.style.transform = '';
      const phone = w < 600, lines = phone ? [2] : [1, 2], hi = phone ? 24 : 34, lo = phone ? 17 : 28;
      for (const n of lines) for (let f = hi; f >= lo; f--) { ibq.style.fontSize = f + 'px'; if (ibq.offsetHeight <= n * f * 1.3 + 2) return; }
    };
    // the thought bubble and the dots that rise into it from the gripper
    const bub = el('div', 'bub'), bin = el('div', 'in'), typ = el('span', 'typing', '<i></i><i></i><i></i>'); bub.append(bin, typ);
    const dots = [8, 11, 15].map(s => { const d = el('span', 'td'); d.style.width = d.style.height = s + 'px'; vb.box.append(d); return d; });
    vb.box.append(bub);
    const crop = r => clip && clip.poster && r && r.cx != null ? `<span class="crop" style="${cropCss(clip, r)}"></span>` : '';
    const bubHtml = k => { const s = steps[k]; return `${s.kind === 'V' ? crop(s) : ''}<div class="tx"><b>Think · ${s.kind === 'V' ? 'Vision' : 'Language'}</b><p>${s.was ? diffHtml(s.was, s.text) : esc(s.text || '')}</p></div>`; };
    const tiles = strip.map(s => { const m = el('div', 'tile'), t = vbox(s.clip); m.append(t.box, el('div', 'nm', `<b>${esc(s.name)}</b>${s.score != null ? `<span>${s.score.toFixed(1)}%</span>` : ''}`), el('p', '', esc(s.note || ''))); return { m, t }; });
    const st = el('div', 'strip n' + tiles.length); tiles.forEach(x => st.append(x.m)); if (cid && tiles.length) st.dataset.cid = cid + '.others';
    if (!duo && clip && clip.w && clip.h && clip.w / clip.h < 1.2) { vb.box.style.maxWidth = Math.round(560 * clip.w / clip.h) + 'px'; vb.box.style.justifySelf = 'center'; }   // tall clips stay within one screen
    // panel: a title for the baseline clips (when there are any) + replay; fold mode adds "Show Think"; then the baseline clips
    // replay sits at the right end of the instruction line (as in steering)
    const ctl = el('div', 'ctl');
    const rep = el('button', ip ? 'srep' : '', '↺ Replay'); rep.type = 'button'; rep.onclick = () => jump(0); (ip || ctl).append(rep);
    const prow = el('div', 'prow'); if (tiles.length) prow.append(el('span', 'lab', 'Baselines, same instruction')); prow.append(ctl); pan.append(prow);
    if (fold) {
      if (steps.length) {
        const tg = el('button', 'tgl', 'Show Think'); tg.type = 'button'; tg.setAttribute('aria-pressed', 'false');
        tg.onclick = () => { showT = !showT; tg.textContent = showT ? 'Hide Think' : 'Show Think'; tg.setAttribute('aria-pressed', String(showT)); plan(); jump(showT ? 1 : 0); };
        if (duo) ctl.prepend(tg); else pan.append(tg);
      }
    }
    if (tiles.length) pan.append(st);
    const vids = [vb.v, ...(bl ? [bl.v] : []), ...tiles.map(x => x.t.v)];
    const p = { clock: 0, phase: -1, on: false, alive: true, key: '', bkey: '', wait: 0, host, ctx, vids, scrub: false };
    const sync = () => vids.forEach(v => { if (p.on) load(v); v.playbackRate = +v.dataset.rate || 1; p.phase === 2 && p.on && !p.scrub && !v.dataset.done ? play(v) : v.pause(); });
    const allDone = () => vids.every(v => v.dataset.done);
    const finish = () => { if (allDone() && !p.wait && p.alive) p.wait = setTimeout(() => { p.wait = 0; jump(0); }, T_GAP); };
    vids.forEach(v => { v.addEventListener('ended', () => { v.dataset.done = 1; finish(); }); v.addEventListener('missing', finish); v.addEventListener('loadeddata', () => { if (p.phase < 2) try { v.currentTime = 0; } catch (e) { } }); });
    const reset = () => { clearTimeout(p.wait); p.wait = 0; p.clock = 0; p.phase = -1; p.key = ''; fitW = 0; vids.forEach(v => { if (!v.closest('.missing')) delete v.dataset.done; v.pause(); try { v.currentTime = 0; } catch (e) { } }); };
    const startAct = () => { p.phase = 2; p.clock = tPre; sync(); if (vb.missing) p.wait = p.wait || setTimeout(() => { p.wait = 0; jump(0); }, 4000); };
    function jump(i) { reset(); if (i === 1) { p.clock = tI; p.phase = 0; } if (i === 2) { p.clock = tThink; p.phase = 1; } if (i === 3) startAct(); sync(); render(); }
    p.seek = t => { clearTimeout(p.wait); p.wait = 0; p.phase = 2; p.clock = tPre; vids.forEach(v => { if (!v.closest('.missing')) delete v.dataset.done; try { v.currentTime = v.duration ? Math.min(t, v.duration - .05) : t; } catch (e) { } }); sync(); render(); };
    scrubber(vb.bar, () => vb.v.duration, p.seek, on => { p.scrub = on; sync(); }, () => vb.v.currentTime);

    // the bubble, driven by the player clock every frame (no CSS transitions): it follows the gripper with a lag, the dots trail like a string
    const SM = { l: null, t: null, last: 0, d: dots.map(() => ({})) };
    function bubble(t, k) {
      const BW = vb.box.clientWidth, BH = vb.box.clientHeight, u = p.clock - tThink;
      if (!(showT && steps.length && BW && (p.phase === 0 || (p.phase === 1 && u < T_FLY)))) { vb.box.classList.remove('thinking'); bub.style.opacity = 0; dots.forEach(d => { d.style.opacity = 0; }); SM.l = null; return; }
      const now = performance.now(), dt = Math.min(100, now - (SM.last || now)), first = SM.l == null; SM.last = now;
      const lag = ms => first ? 1 : 1 - Math.exp(-dt / ms), tt = p.clock - tI, fly = p.phase === 1 ? (REDUCED ? 1 : ease(u / T_FLY)) : 0;
      const s0 = segs[0], gp = gripAt(g0, s0 && s0.g, grasp || (s0 && s0.t1), 0), gx = gp.x * BW, gy = gp.y * BH;
      // where the bubble wants to be: above the gripper, else to its left
      const bw = bub.offsetWidth, bh = bub.offsetHeight, m = 8, lift = Math.max(40, BH * .09);
      let L = Math.min(BW - bw - m, Math.max(m, gx - bw * .8)), T = Math.max(m, gy - lift - bh);
      if (T + bh > gy - 14 && gx - 28 - bw >= m) L = gx - 28 - bw;
      if (first) { SM.l = L; SM.t = T; } else { SM.l += (L - SM.l) * lag(140); SM.t += (T - SM.t) * lag(140); }
      const side = SM.l + bw <= gx - 20, ex = side ? SM.l + bw + 4 : Math.min(SM.l + bw - 22, Math.max(SM.l + 22, gx)), ey = side ? Math.min(SM.t + bh - 10, gy) : SM.t + bh + 4;
      // dots: pop out one after another (small, medium, large), rise a little; retract into the gripper at the answer
      const back = p.phase === 1 ? clamp(u / 400) : 0;
      dots.forEach((d, i) => {
        const q = (i + 1) / 4, X = gx + (ex - gx) * q * (1 - back), Y = gy + (ey - gy) * q * (1 - back), D = SM.d[i];
        if (first || D.x == null) { D.x = X; D.y = Y; } else { D.x += (X - D.x) * lag(90 + 70 * i); D.y += (Y - D.y) * lag(90 + 70 * i); }
        const pop = REDUCED ? 1 : backOut((tt - i * 120) / 220), sc = Math.max(0, pop) * (1 - back);
        d.style.left = D.x + 'px'; d.style.top = D.y + 'px'; d.style.opacity = sc > .02 ? 1 : 0;
        d.style.transform = `translate(-50%,-50%) translateY(${(1 - clamp(pop)) * 8}px) scale(${sc})`;
      });
      // the bubble grows out of the largest dot (soft overshoot), squashes a little at each new state, floats 2 px, then flies onto the answer
      const grow = REDUCED ? 1 : backOut((tt - 360) / 300), D2 = SM.d[2];
      const lt = k > 0 ? p.clock - at[k] : 1e9, bump = REDUCED || lt > 250 ? 1 : 1 - .04 * Math.sin(Math.PI * lt / 250), float = REDUCED || fly ? 0 : 2 * Math.sin(now / 1600);
      let tx = 0, ty = float, sc = Math.max(0, grow) * bump, ox = D2.x - SM.l, oy = D2.y - SM.t;
      if (p.phase === 1 && s0) { const cx = s0.g.cx * BW, cy = s0.g.cy * BH; tx = (cx - SM.l - bw / 2) * fly; ty = (cy - SM.t - bh / 2) * fly; sc = 1 - .88 * fly; ox = bw / 2; oy = bh / 2; }
      bub.style.left = SM.l + 'px'; bub.style.top = SM.t + 'px'; bub.style.transformOrigin = `${ox}px ${oy}px`;
      bub.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`; vb.box.classList.add('thinking'); bub.style.opacity = p.phase === 1 ? 1 - fly * fly : grow > .02 ? 1 : 0;
      // inside: 0.4 s of thinking dots, then the state decodes (text and crop from blurred to sharp, in place)
      if (p.phase === 0 && k >= 0) {
        const lc = p.clock - at[k] - (k ? 0 : T_BIRTH), dd = REDUCED ? 1 : ease((lc - T_DOTS) / T_DEC), tx2 = $('.tx', bin), cr = $('.crop', bin);
        typ.style.opacity = REDUCED || lc >= T_DOTS ? 0 : clamp(lc / 120);
        if (tx2) { tx2.style.opacity = dd; tx2.style.filter = dd < 1 ? `blur(${(1 - dd) * 7}px)` : ''; }
        if (cr) { cr.style.opacity = dd; cr.style.filter = dd < 1 ? `blur(${(1 - dd) * 5}px)` : ''; cr.style.transform = dd < 1 ? `scale(${.8 + .2 * dd})` : ''; }   // the crop decodes in place, inside the bubble, with the text
      } else typ.style.opacity = 0;
    }
    function render() {
      const t = vb.v.currentTime || 0, u = p.clock - tThink; let k = -1, g = 0, bloom = 1, mk = segs.length ? segs[0] : null;
      if (p.phase === 0 && showT && steps.length) { k = steps.length - 1; while (k > 0 && at[k] > p.clock) k--;  }
      else if (p.phase === 1) g = bloom = REDUCED ? 1 : ease((u - (showT && steps.length ? 450 : 0)) / T_BLOOM);   // after the bubble lands
      else if (p.phase === 2) segs.forEach((sg, i) => { const gl = Math.min(i ? clamp((t - sg.t0) / .4) : 1, glowAt(t, sg.t1)); if (gl > 0) { g = gl; mk = sg; } });
      if (fitCanvas(vb.cv)) {
        const c = vb.cv.getContext('2d'), W = vb.cv.width, H = vb.cv.height; c.clearRect(0, 0, W, H);
        if (g > 0 && mk && (!duo || showT)) drawMark(c, W, H, mk.g, g, bloom, mk.name);   // duo: brackets only with Show Think
      }
      if (ib) {   // band in, hold, then the line glides onto the caption and hands over to it
        const u = p.phase === -1 ? p.clock : 1e9, k = REDUCED ? (u < T_IHOLD ? 0 : 1) : ease((u - T_IHOLD) / T_GLIDE), x = clamp((k - .8) / .2);
        if (u < 1e9) fitBeat();
        ib.style.opacity = u >= 1e9 ? 0 : (REDUCED ? 1 : ease(u / T_IN)) * (1 - x);
        ib.style.setProperty('--band', 1 - k);
        if (u < 1e9 && k > 0) {
          ibq.style.transform = ''; const a = ibq.getBoundingClientRect(), b = iq.getBoundingClientRect(), sc = parseFloat(getComputedStyle(iq).fontSize) / parseFloat(ibq.style.fontSize || 30);
          ibq.style.transform = `translate(${(b.left + b.width / 2 - a.left - a.width / 2) * k}px, ${(b.top + b.height / 2 - a.top - a.height / 2) * k}px) scale(${1 + (sc - 1) * k})`;
        } else ibq.style.transform = '';
        iq.style.opacity = u >= 1e9 ? 1 : x;
      }
      // the bubble: one per Think; the content changes per state, the bubble does not respawn
      if (p.phase === 0 && k >= 0 && 'k' + k !== p.bkey) { p.bkey = 'k' + k; bin.innerHTML = bubHtml(k); }
      if (p.phase < 0) p.bkey = '';
      bubble(t, k);
    }
    p.tick = dt => { if (!p.on || !p.alive) return; if (p.phase < 2) { p.clock += dt; if (p.phase === -1 && p.clock >= tI) p.phase = 0; if (p.phase === 0 && p.clock >= tThink) p.phase = 1; if (p.clock >= tPre) startAct(); } render(); };
    p.dispose = () => { p.alive = false; clearTimeout(p.wait); TICKS.delete(p.tick); PLAYERS.delete(p); io.disconnect(); vids.forEach(drop); };
    const io = new IntersectionObserver(en => { p.on = en[0].isIntersecting; sync(); }, { threshold: .2 }); io.observe(host);
    addEventListener('resize', render);
    TICKS.add(p.tick); PLAYERS.add(p); render(); sync(); bindComments();
    return p;
  }
  // chip tabs: one row of buttons, the selected one outlined in the accent
  function chips(host, labels, onPick, groups = null) {
    if (groups) host.classList.add('grouped');
    let box = host;   // grouped: each benchmark's name and chips stay together on one line
    const bts = labels.map((n, i) => { if (groups && groups[i] !== groups[i - 1]) { box = el('div', 'grp'); box.append(el('span', 'gname', esc(groups[i]))); host.append(box); } const b = el('button', 'tab', n); b.type = 'button'; b.setAttribute('role', 'tab'); b.onclick = () => { pick(i); const sc = b.parentElement, l = b.offsetLeft - sc.offsetLeft, r = l + b.offsetWidth, go = x => sc.scrollTo({ left: x, behavior: REDUCED ? 'auto' : 'smooth' }); if (r > sc.scrollLeft + sc.clientWidth) go(r - sc.clientWidth + 24); else if (l < sc.scrollLeft) go(l < 140 ? 0 : l - 24); }; box.append(b); return b; });
    function pick(i) { bts.forEach((b, j) => b.setAttribute('aria-selected', j === i ? 'true' : 'false')); onPick(i); }
    if (bts.length) pick(0);
  }

  /* ---------------------------------------------------------------- teaser */
  // a thin control bar (play/pause, seek, time) that shows on hover, on focus, or for 3 s after a tap; hidden otherwise
  (() => {
    // the <source> is only the no-script fallback: drop it so the clip loads once, through load() (a blob where the server ignores Range)
    const v = $('#teaser'), box = v.closest('.teaser'), so = $('source', v); v.dataset.src = so.src; so.remove(); v.load();
    const P = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>', Z = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z"/></svg>';
    const ctl = el('div', 'tctl', `<button type="button" class="tpp" aria-label="Pause">${Z}</button><div class="tbar"><b></b></div><span class="ttime">0:00</span>`);
    box.append(ctl);
    const pp = $('.tpp', ctl), bar = $('.tbar', ctl), fill = $('b', bar), tm = $('.ttime', ctl), fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
    let userPaused = REDUCED, seen = false, wasOn = false;
    const want = () => seen && !userPaused;
    const upd = () => { pp.innerHTML = v.paused ? P : Z; pp.setAttribute('aria-label', v.paused ? 'Play' : 'Pause'); };
    ['play', 'pause'].forEach(n => v.addEventListener(n, upd));
    pp.onclick = () => { userPaused = !v.paused; if (userPaused) v.pause(); else load(v).then(() => play(v)); };
    scrubber(bar, () => v.duration, t => { try { v.currentTime = t; } catch (x) { } }, on => { if (on) { wasOn = !v.paused; v.pause(); } else if (wasOn) play(v); }, () => v.currentTime);
    bar.addEventListener('pointerdown', () => load(v), { capture: true });
    TICKS.add(() => { const d = v.duration || 0; if (!d) return; fill.style.width = (100 * v.currentTime / d).toFixed(2) + '%'; const s = fmt(v.currentTime); if (tm.textContent !== s) tm.textContent = s; });
    // touch: a tap on the clip shows the bar for 3 s (a tap on the bar itself keeps it up)
    let hide = 0; box.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') return; box.classList.add('show'); clearTimeout(hide); hide = setTimeout(() => box.classList.remove('show'), 3000); });
    visible(v, on => { seen = on; if (want()) load(v).then(() => play(v)); else v.pause(); }, .3);
    if (REDUCED) load(v);
    upd();
  })();

  /* ---------------------------------------------------------------- display text for an instruction */
  const DISPLAY = { real_sem26_r0: 'Pick up the one you’d dip in chocolate.' };
  const instrOf = e => DISPLAY[e.id] || sentence(e.instruction);

  /* ---------------------------------------------------------------- 3a. analysis: text CoT on one shared clock (2x)
     Left, "CoT VLA" (the ervla_cot clip of real_pos06_r0): it reasons once, for latency_s, on its first frame ("Reasoning…", a bar and
     its one line of reasoning), then moves and finishes. Right, GistAct: Think takes 0.15 s, then it moves and finishes.
     Each lane shows its total time when done (reasoning or Think + its clip). Footage and clock run at 2x. */
  const COT_TEXT = 'From the left: a lemon, then a corn. The second one is the corn.';
  (() => {
    const host = $('#race'), e = byId(R2, 'real_pos06_r0'), cot = blArm('real_pos06_r0', 'ervla_cot'), me = clipOf(e, 'ours');
    const L = cot && cot.latency_s || 15.68, TH = .15, F = 2;
    const clock = el('div', 'clock', '<span class="lab">Shared clock · 2×</span><b>0.0 s</b>');
    const lane = (name, sub, c, mine) => { const l = el('div', 'lane' + (mine ? ' me' : '')), vb = vbox(c); l.append(el('div', 'who', `<b>${name}</b><span class="lab">${sub}</span>`), vb.box, el('p', 'st')); return { l, vb, st: $('.st', l) }; };
    const A = lane('CoT VLA', `reasons once, ${L.toFixed(1)} s`, cot, false), B = lane('GistAct', `thinks in ${TH} s`, me, true);
    const hold = el('div', 'hold', '<span class="hl">Reasoning…</span><p class="cotov"></p><i class="rbar"><b></b></i>'), ov = $('.cotov', hold), rb = $('.rbar b', hold); A.vb.box.append(hold);   // desktop: the text sits on the paused frame
    const flash = el('span', 'tflash', `Think · ${TH} s`); B.vb.box.append(flash);
    const cotline = el('p', 'cotline');   // phone: the same text under both lanes
    host.append(clock, A.l, B.l, cotline);
    const clk = $('b', clock), fmt = s => s.toFixed(1) + ' s';
    const S = { on: false, sim: 0, aDone: null, bDone: null, wait: 0 };
    const reset = () => {
      clearTimeout(S.wait); Object.assign(S, { sim: 0, aDone: null, bDone: null, wait: 0 });
      [A.vb.v, B.vb.v].forEach(v => { v.pause(); try { v.currentTime = 0; } catch (x) { } });
      cotline.textContent = ov.textContent = ''; A.st.textContent = B.st.textContent = '';
    };
    // one lane: wait `pre` seconds on the first frame, then play at 2x to the end; done at pre + clip length
    const run = (ln, pre) => {
      const v = ln.vb.v;
      if (ln.vb.missing) return S.sim;
      if (S.sim < pre) { if (!v.paused) v.pause(); return null; }
      v.playbackRate = F; if (v.paused && !v.ended) play(v);
      return v.ended ? pre + (v.duration || 0) : null;
    };
    TICKS.add(dt => {
      if (!S.on || S.wait || ![A.vb, B.vb].every(q => q.missing || q.v.readyState >= 2)) return;
      if (S.aDone == null || S.bDone == null) S.sim += F * dt / 1000;
      if (S.bDone == null) { S.bDone = run(B, TH); B.st.textContent = S.bDone != null ? 'Done in ' + fmt(S.bDone) : 'Moving'; }
      if (S.aDone == null) { S.aDone = run(A, L); A.st.textContent = S.aDone != null ? 'Done in ' + fmt(S.aDone) : S.sim < L ? 'Reasoning' : 'Moving'; }
      const k = clamp(S.sim / L), txt = k < 1 ? COT_TEXT.slice(0, Math.round(COT_TEXT.length * clamp(k * 3))) : '';
      if (ov.textContent !== txt) ov.textContent = cotline.textContent = txt;
      rb.style.width = 100 * k + '%'; A.vb.box.classList.toggle('frozen', S.sim < L && !A.vb.missing);
      flash.style.opacity = S.sim < 1.2 ? 1 : 0;   // the Think flash stays ~0.6 s on screen at 2x
      [A, B].forEach(x => x.st.classList.toggle('done', /^Done/.test(x.st.textContent)));
      clk.textContent = fmt(S.aDone != null && S.bDone != null ? Math.max(S.aDone, S.bDone) : S.sim);
      if (S.aDone != null && S.bDone != null) S.wait = setTimeout(() => { reset(); S.wait = 0; }, 5000);
    });
    reset();
    visible(host, o => { S.on = o; [A.vb.v, B.vb.v].forEach(v => { if (o) load(v); else v.pause(); }); }, .3);
  })();

  /* ---------------------------------------------------------------- 1. overview: a static figure (pos06 frame)
     Input -> Think (latent states z, each decoded for inspection into a sentence or a region crop) -> Answer (brackets) -> Act (a short
     loop of the real clip around the grasp). Below it, "How the states are trained" opens a diagram of the paper's supervision. */
  // latent glyphs: L = a vector (bars), V = a spatial grid (cells); fixed patterns
  const glyphL = seed => `<svg class="zg" viewBox="0 0 34 20" aria-hidden="true">${[.55, .9, .35, .7, 1, .45, .8, .6].map((h, i) => { const v = .25 + .75 * ((h * 7 + seed * .37 + i * .13) % 1); return `<rect x="${(i * 4.4).toFixed(1)}" y="${(20 - 18 * v).toFixed(1)}" width="3" height="${(18 * v).toFixed(1)}" rx="1"/>`; }).join('')}</svg>`;
  const glyphV = (hot, n = 4) => `<svg class="zg" viewBox="0 0 22 22" aria-hidden="true">${Array.from({ length: n * n }, (_, i) => `<rect x="${((i % n) * 5.6).toFixed(1)}" y="${(Math.floor(i / n) * 5.6).toFixed(1)}" width="4.6" height="4.6" rx="1" opacity="${hot.includes(i) ? 1 : .22}"/>`).join('')}</svg>`;
  const zchip = (kind, i, hot = []) => `<span class="zc ${kind}">${kind === 'L' ? glyphL(i) : glyphV(hot)}<b>z<sub>${i}</sub></b><span class="k">${kind}</span></span>`;
  (() => {
    const host = $('#fig'), e = byId(R2, 'real_pos06_r0'), c = e ? clipOf(e, 'ours') : null, poster = c ? c.poster : '', ans = e && e.think ? [].concat(e.think.goal || [])[0] : null;
    const Z = [{ kind: 'L', text: 'Count the objects from the left.' }, { kind: 'V', cx: .395, cy: .845, rx: .05, ry: .065, text: 'First: the lemon.', hot: [9, 13] }, { kind: 'V', cx: .51, cy: .765, rx: .045, ry: .06, text: 'Second: the corn.', hot: [10, 14] }];
    ((e && e.think && e.think.steps) || []).filter(s => s.kind === 'V').slice(0, 2).forEach((s, i) => Object.assign(Z[i + 1], { cx: s.cx, cy: s.cy, rx: s.rx, ry: s.ry }));
    const col = (cls, lab, html) => el('div', 'col ' + cls, `<div class="lab">${lab}</div>${html}`);
    const img = cls => `<div class="img ${cls}"><img src="${poster}" alt=""><canvas></canvas></div>`;
    const rows = Z.map((s, i) => `<div class="zr" style="grid-row:${i + 1}">${zchip(s.kind, i + 1, s.hot)}</div><i class="dar" style="grid-row:${i + 1}"></i>`
      + `<div class="dz" style="grid-row:${i + 1}">${s.kind === 'V' && c ? `<span class="crop" style="${cropCss(c, s)}"></span>` : ''}<span>${esc(s.text)}</span></div>`).join('');
    const cols = [
      col('cin', 'Input', img('in') + '<p class="q">“Pick up the second object from the left.”</p>'),
      col('cth', 'Think', `<div class="zgrid"><div class="dbox" style="grid-row:1/${Z.length + 1}"><span class="dtag">decoded for inspection</span></div>${rows}</div>`),
      col('cans', 'Answer', img('out') + '<p class="q">The target, marked in the image.</p>'),
      col('cact', 'Act', '<div class="img av"><video muted playsinline preload="none" aria-label="GistAct grasping the corn"></video></div><p class="q">0.15 s per decision</p>')
    ];
    cols.forEach((x, i) => { host.append(x); if (i < 3) host.append(el('div', 'arr', '→')); });
    const paint = () => { const c2 = $('.out canvas', host); if (fitCanvas(c2)) { const x = c2.getContext('2d'); x.clearRect(0, 0, c2.width, c2.height); drawMark(x, c2.width, c2.height, ans, 1, 1, NAMES.real_pos06_r0[0]); } };
    $$('img', host).forEach(im => im.addEventListener('load', paint)); addEventListener('resize', paint); paint();
    // Act: loop the clip from just before the grasp to just after it (the clip's own rate, at most 2x)
    const v = $('.av video', host);
    if (c) {
      const g = c.grasp != null ? c.grasp : GRASP[e.id] || 4, t0 = Math.max(0, g - 2.2), t1 = Math.min(c.dur || g + 2, g + 2);
      v.poster = poster; v.dataset.src = c.src; v.dataset.rate = Math.min(2, c.rate || 1);
      const go = () => { try { v.currentTime = t0; } catch (x) { } };
      v.addEventListener('loadedmetadata', go); v.addEventListener('timeupdate', () => { if (v.currentTime >= t1) go(); }); v.addEventListener('ended', () => { go(); play(v); });
      visible(v, on => { if (on) load(v).then(() => { v.playbackRate = +v.dataset.rate; if (!REDUCED) play(v); }); else v.pause(); }, .3);
    }
  })();
  // "How the states are trained": Think state <-> target <- frozen encoder <- annotation, one row per kind of state (paper Sec. 3.2)
  (() => {
    const host = $('#trainFig'); if (!host) return;
    const e = byId(R2, 'real_pos06_r0'), c = e ? clipOf(e, 'ours') : null, crop = r => c ? `<span class="crop" style="${cropCss(c, r)}"></span>` : '';
    const grid = (hot, n) => `<span class="gm" style="--n:${n}">${Array.from({ length: n * n }, (_, i) => `<i${hot.includes(i) ? ' class="h"' : ''}></i>`).join('')}</span>`;
    const row = (state, target, tname, how, src) => `<div class="tr"><div class="ts">${state}</div><i class="tl">≈</i><div class="tg">${target}<span><b>${tname}</b><small>${how}</small></span></div><i class="tl">←</i><div class="tsrc">${src}</div></div>`;
    host.innerHTML = '<div class="thd"><span>Think state</span><i></i><span>is trained to match</span><i></i><span>built from</span></div>'
      + row(zchip('L', 1), glyphL(9), 'SONAR sentence embedding', 'frozen SONAR encoder', '<q>Count the objects from the left.</q>')
      + row(zchip('V', 2, [9, 13]), grid([9, 13], 4), 'Image region', 'fed back as pooled frozen DINOv2 features', crop({ cx: .383, cy: .776, rx: .045, ry: .06 }) + '<span>the lemon’s region</span>')
      + row('<span class="zc A"><b>END</b><span class="k">answer</span></span>', grid([20, 21, 26, 27], 6), 'Goal map', 'read out by the answer head', crop({ cx: .496, cy: .729, rx: .035, ry: .05 }) + '<span>the target’s cell</span>')
      + '<p class="tfoot">At run time the states stay latent. A frozen SONAR decoder turns L states into sentences, and V states are drawn as regions, only for inspection.</p>';
  })();

  /* ---------------------------------------------------------------- 2. real robot: 4 tracks, the full Think player, three baselines in the strip */
  const TRACK = { Semantic: 'Semantic', Position: 'Position', Rank: 'Size rank', Sort: 'Sort' };
  // one-line failure per baseline tile (by episode id)
  const FAILS = {
    real_sem26_r0: { base: 'Lifts the eggplant.', ervla: 'Lifts the red apple.', lara: 'Knocks the strawberry over, lifts nothing.' },
    real_pos06_r0: { base: 'Lifts the lemon, the first.', ervla: 'Stalls on the corn, lifts nothing.', lara: 'Lifts the grapes.' },
    real_rank_indist_7390047_r0: { base: 'Lifts the biggest fruit, the apple.', ervla: 'Puts the apple on the tray.', lara: 'Puts the tangerine in the bowl.' },
    real_sort_indist_7090001_r0: { base: 'Puts the cup on the tray.', ervla: 'Sorts the lemon, then stops.', lara: 'Puts the lemon on the tray.' }
  };
  (() => {
    const tracks = [2, 0, 1, 3].map(i => R2[i]).filter(Boolean), host = $('#realPlayer'), avg = m => { const r = D.real.rows.find(x => x.m === m); return r ? r.y[4] : null; }; let cur = null;
    chips($('#realTabs'), tracks.map(e => esc(TRACK[e.group] || e.group)), i => {
      const e = tracks[i]; if (cur) cur.dispose();
      const strip = [['π0.5', 'π0.5', clipOf(e, 'base'), 'base'], ['ERVLA', 'ERVLA', blArm(e.id, 'ervla'), 'ervla'], ['LaRA', 'LaRA-VLA', blArm(e.id, 'lara'), 'lara']]
        .map(([name, m, clip, arm]) => ({ name, clip, score: avg(m), note: (FAILS[e.id] || {})[arm] || '' }));
      cur = seq(host, { clip: clipOf(e, 'ours'), think: e.think, grasp: GRASP[e.id], instr: instrOf(e), score: avg('GistAct'), strip,
        ctx: { ep: e.id, task: TRACK[e.group] }, cid: 'real', names: NAMES[e.id] });
    });
  })();

  /* ---------------------------------------------------------------- 4. simulation: RoboSPA, VLABench, RoboLab (two tasks); one player; table */
  (() => {
    const rl = (task, instr, rate, note) => { const d = `static/media/robolab_clean/${task}/`, id = 'robolab_' + task;
      return { id, clip: { src: d + 'gistact.mp4', poster: d + 'gistact.jpg', w: 1280, h: 720, rate }, think: OV[id], grasp: null, instr,
        strip: [{ name: 'π0.5', clip: { src: d + 'pi05.mp4', poster: d + 'pi05.jpg', w: 1280, h: 720 }, note }] }; };
    const seals = byId(EPS, 'robospa_seals_mv_s100027'), flower = byId(EPS, 'vlabench_t3_insert_flower_ep0001');
    // RoboLab from the standard left-back camera (robolab_lb.js, GA_RLB) when present; otherwise the two clips below
    const G0 = window.GA_RLB, RLB = (!G0 ? [] : Array.isArray(G0) ? G0 : Object.entries(G0).map(([id, r]) => Object.assign({ id }, r))).map((r, i) => {
      const C = r.clips || {}, arm = (...k) => { for (const x of k) { const c = C[x] || r[x]; if (c) return typeof c === 'string' ? { src: c } : c; } return null; };
      const ours = arm('gistact', 'ours'), base = arm('pi05', 'base'), o = r.pi05_outcome || r.pi05Outcome || (base && (base.outcome_text || base.note)) || r.outcome || '';
      const think = r.think || (r.steps || r.goal ? { steps: r.steps || [], goal: r.goal } : OV[r.id] || null);
      return ours && { label: r.label || (r.short ? 'RoboLab: ' + r.short : 'RoboLab ' + (i + 1)),
        x: { id: r.id, clip: ours, think, grasp: r.grasp ?? ours.grasp ?? null, instr: sentence(r.instruction || ''), strip: base && !/\bdrops?\b/i.test(o) ? [{ name: 'π0.5', clip: base, note: sentence(o) }] : [] } };   // a baseline that only drops the object is not shown
    }).filter(Boolean);
    // new sim examples (sim_v2.js, GA_SIM2). One chip per example, grouped by benchmark.
    const S2 = (window.GA_SIM2 || []).map(r => [r.bench, r.label, { id: r.id, clip: r.clips.ours, think: { steps: r.steps, goal: r.goal }, grasp: null, instr: r.instruction,
      strip: r.clips.base ? [{ name: r.base_name, clip: r.clips.base, note: r.base_outcome }] : [] }]);
    const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
    // rows RoboSPA, VLABench, RoboLab (USER_FEEDBACK 42); the first chip opens by default. Cameras: RoboSPA r06 is the teaser's clip
    // (record-only sideL camera), VLABench v05 the record-only 3/4 front camera (v34), RoboLab the standard left-back camera.
    const pickS2 = (bench, id) => S2.filter(x => x[0] === bench).sort((p, q) => (q[2].id === id) - (p[2].id === id)).slice(0, 1);
    const SIMS = [
      ...pickS2('RoboSPA', 'robospa_r06'), ...pickS2('VLABench', 'vlabench_v05'),
      ...(S2.length ? [] : [['RoboSPA', 'RoboSPA', { id: 'robospa_seals_mv_s100027', clip: clipOf(seals, 'ours'), think: seals && seals.think, grasp: GRASP['robospa_seals_mv_s100027'], instr: seals && sentence(seals.instruction),
        strip: [{ name: 'Pointing-VLA', clip: clipOf(seals, 'base'), note: 'Lifts nothing.' }] }],
      ['VLABench', 'VLABench', { id: 'vlabench_t3_insert_flower_ep0001', clip: clipOf(flower, 'ours'), think: flower && flower.think, grasp: GRASP['vlabench_t3_insert_flower_ep0001'], instr: 'Put the flower that stands for Valentine’s Day into the vase.', strip: [] }]]),
      ...RLB.filter(r => r.x.strip.length).slice(0, 2).map(r => ['RoboLab', cap(r.label.replace(/^RoboLab:\s*/, '').replace(/^the /, '').replace(' the ', ' ')), r.x]),
      ...(RLB.length ? [] : [['RoboLab', 'Behind the bowl', rl('XrBehindBowlTask_ep1', 'Put the fruit that is behind the bowl onto the plate.', 1, 'Takes the lemon.')],
      ['RoboLab', 'All but the orange', rl('XrExceptOrangeTask_ep2', 'Put all the fruits into the bowl except the orange.', 2, 'Takes the orange.')]])
    ];
    const host = $('#simPlayer'); let cur = null;
    chips($('#simTabs'), SIMS.map(s => esc(s[1])), i => { const x = SIMS[i][2]; if (cur) cur.dispose(); const b0 = x.strip[0], nm = (NAMES[x.id] || [])[0];   // two-up: the baseline left, GistAct right
      cur = seq(host, Object.assign({}, x, { fold: true, ctx: { ep: x.id, task: SIMS[i][0] + ': ' + SIMS[i][1] }, cid: 'sim', names: NAMES[x.id],
        strip: b0 ? [] : x.strip, duo: b0 ? Object.assign({ ok: nm ? `Picks the ${nm}.` : 'Succeeds.' }, b0) : null })); }, SIMS.map(s => s[0]));
    // tables: the paper's full RoboSPA and VLABench tables (supplement), all rows and column groups. Cell "v|b" = best (bold), "v|u" = second (underlined).
    const TABLES = {"RoboSPA spatial-24": {"groups": ["Geometric attribute", "Spatial distance", "Position index", "Referential relation", "Cross-view", "Overall"], "sub": ["SR", "ONTA"], "rows": [{"g": "No reasoning"}, {"m": "MolmoAct2", "v": ["36.2", "8.1", "33.8", "15.8", "36.3", "24.1", "22.8", "−9.5", "30.8", "10.3", "32.0", "9.8"]}, {"m": "π0.5", "v": ["50.6", "30.8", "42.3", "27.3", "28.5", "14.7", "31.5|u", "5.5|u", "48.9", "33.7", "40.4", "22.4"]}, {"m": "X-VLA", "v": ["36.8", "10.8", "37.2", "20.4", "18.9", "3.2", "22.6", "−8.0", "45.6", "29.8", "32.2", "11.2"]}, {"m": "Pointing-VLA", "v": ["52.2|u", "32.4|u", "44.8", "30.8", "29.2", "16.1", "31.1", "4.1", "56.7|u", "43.9|u", "42.8|u", "25.4|u"]}, {"g": "Explicit reasoning"}, {"m": "ECoT-Lite§", "v": ["22.6", "−9.7", "36.7", "20.1", "34.9", "23.8", "14.4", "−20.8", "31.5", "11.3", "28.0", "4.9"]}, {"m": "ECoT-Lite (CoT on)", "v": ["20.0", "−13.1", "38.1", "21.7", "37.9|u", "27.0|u", "15.2", "−20.2", "32.6", "12.6", "28.8", "5.6"]}, {"m": "ERVLA§", "v": ["22.7", "−11.0", "46.2|u", "32.3|u", "34.5", "21.0", "24.1", "−7.0", "41.8", "24.7", "33.9", "12.0"]}, {"m": "ERVLA (CoT on)", "v": ["20.5", "−14.5", "34.6", "17.0", "29.8", "15.3", "16.8", "−18.3", "31.5", "11.5", "26.6", "2.2"]}, {"m": "MolmoAct2-Think", "v": ["30.1", "−0.9", "33.8", "15.9", "34.3", "21.5", "22.2", "−9.6", "20.0", "−3.4", "28.1", "4.7"]}, {"g": "Latent reasoning"}, {"m": "Fast-ThinkAct", "v": ["7.1", "−34.7", "15.9", "−7.2", "10.2", "−8.1", "4.5", "−36.6", "4.4", "−23.4", "8.4", "−22.0"]}, {"m": "LaRA-VLA", "v": ["31.0", "1.8", "44.7", "30.1", "36.3", "23.8", "18.2", "−15.3", "32.1", "12.5", "32.4", "10.6"]}, {"m": "LaST0", "v": ["13.1", "−25.7", "16.6", "−5.8", "12.0", "−6.0", "2.8", "−38.7", "8.3", "−18.4", "10.6", "−18.9"]}, {"m": "GistAct", "v": ["68.6|b", "57.6|b", "60.6|b", "50.5|b", "90.2|b", "88.6|b", "49.3|b", "30.0|b", "70.4|b", "61.5|b", "67.8|b", "57.6|b"], "me": 1}]}, "VLABench": {"groups": ["In-distribution", "Cross-category", "Common sense", "Semantic instruction", "Unseen texture", "Overall"], "sub": ["SR", "PS", "IS"], "rows": [{"g": "No reasoning"}, {"m": "MolmoAct2", "v": ["58.2", "69.0", "76.8", "35.6", "50.4", "61.1|b", "30.4", "44.1", "56.8", "38.2", "49.9", "64.8", "54.4", "67.1", "75.4", "43.4", "56.1", "67.0"]}, {"m": "π0.5", "v": ["43.6", "60.2", "66.6", "29.4", "44.9", "58.0", "26.0", "42.0", "52.2", "28.0", "46.9", "60.5", "37.2", "54.1", "62.7", "32.8", "49.6", "60.0"]}, {"m": "X-VLA", "v": ["53.6", "71.2", "83.4|b", "20.9", "27.2", "34.6", "29.0", "46.3", "62.6|u", "44.2", "63.1", "75.6|b", "44.2", "61.2", "77.2|u", "38.4", "53.8", "66.7"]}, {"m": "Pointing-VLA", "v": ["47.8", "60.7", "66.0", "35.9", "47.1", "57.8", "29.0", "42.8", "49.2", "34.8", "51.2", "60.6", "40.0", "55.9", "65.8", "37.5", "51.5", "59.9"]}, {"g": "Explicit reasoning"}, {"m": "ECoT-Lite§", "v": ["47.2", "65.8", "78.6", "28.8", "43.8", "60.3|u", "28.1", "43.9", "57.9", "35.7", "53.4", "67.5", "46.9", "63.6", "77.2|u", "37.3", "54.1", "68.3"]}, {"m": "ECoT-Lite (CoT on)", "v": ["51.2", "67.2", "77.6", "31.0", "44.7", "57.0", "31.1", "46.8", "56.9", "31.7", "49.6", "68.5", "49.5", "64.3", "76.9", "38.9", "54.5", "67.4"]}, {"m": "ERVLA§", "v": ["63.0", "77.3", "81.4|u", "50.2|u", "60.4|u", "59.8", "34.0", "49.6", "55.4", "47.4", "61.3", "70.2", "57.6", "73.5|u", "78.8|b", "50.4", "64.4", "69.1|b"]}, {"m": "ERVLA (CoT on)", "v": ["62.6", "77.8|u", "80.2", "51.3|b", "62.1|b", "60.2", "36.4", "50.9", "56.0", "52.8|u", "66.2|u", "71.8", "60.4|u", "74.9|b", "77.0", "52.7|u", "66.4|u", "69.0|u"]}, {"m": "MolmoAct2-Think", "v": ["63.4|u", "76.2", "79.2", "27.6", "42.7", "53.7", "39.6|u", "51.3|u", "54.8", "43.8", "57.1", "67.2", "58.8", "72.4", "78.8|b", "46.6", "59.9", "66.7"]}, {"g": "Latent reasoning"}, {"m": "Fast-ThinkAct", "v": ["19.6", "38.3", "64.0", "8.0", "22.5", "37.7", "11.8", "28.9", "53.1", "15.2", "33.8", "58.2", "13.0", "33.0", "58.8", "13.5", "31.3", "54.4"]}, {"m": "LaRA-VLA", "v": ["43.8", "63.1", "77.6", "21.3", "37.5", "48.9", "16.8", "33.5", "47.8", "15.2", "33.1", "54.4", "20.2", "38.1", "58.4", "23.5", "41.1", "57.4"]}, {"m": "LaST0", "v": ["21.2", "44.5", "65.6", "11.7", "27.8", "42.4", "9.2", "27.9", "49.0", "3.0", "13.8", "29.0", "8.2", "23.7", "45.4", "10.7", "27.5", "46.3"]}, {"m": "GistAct", "v": ["70.8|b", "79.7|b", "76.6", "39.0", "45.5", "47.8", "53.6|b", "62.6|b", "64.5|b", "68.0|b", "76.9|b", "73.5|u", "65.6|b", "74.9|b", "74.2", "59.4|b", "67.9|b", "67.3"], "me": 1}]}};
    const cell = (v, ov, gs) => { const [x, m] = v.split('|'); return `<td class="${[m === 'b' ? 'best' : m === 'u' ? 'sec' : '', ov ? 'ov' : '', gs ? 'gs' : ''].join(' ').trim()}">${x ? esc(x) : 'n/a'}</td>`; };
    const ABBR = { SR: 'Success rate (%)', ONTA: 'Object-normalized target accuracy (%)', PS: 'Progress score', IS: 'Intention score' };
    const nm = m => esc(m).replace('§', '<sup>§</sup>').replace('π0.5', 'π<sub>0.5</sub>').replace('LaST0', 'LaST<sub>0</sub>');
    const tableHtml = t => { const n = t.sub.length, N = 1 + n * t.groups.length, ovAt = n * (t.groups.length - 1);
      return `<div class="tscroll"><table class="res big"><thead><tr><th rowspan="2">Method</th>${t.groups.map((g, i) => `<th colspan="${n}" class="gh gs${i === t.groups.length - 1 ? ' ov' : ''}">${esc(g)}</th>`).join('')}</tr>`
        + `<tr>${t.groups.map((g, i) => t.sub.map((x, j) => `<th class="${[i === t.groups.length - 1 ? 'ov' : '', j ? '' : 'gs'].join(' ').trim()}"><abbr title="${ABBR[x] || ''}">${esc(x)}</abbr></th>`).join('')).join('')}</tr></thead><tbody>`
        + t.rows.map(r => r.g ? `<tr class="grp"><td colspan="${N}">${esc(r.g)}</td></tr>` : `<tr class="${r.me ? 'me' : ''}"><td>${nm(r.m)}</td>${r.v.map((v, j) => cell(v, j >= ovAt, j % n === 0)).join('')}</tr>`).join('') + '</tbody></table></div>'; };
    // one benchmark at a time (chip tabs), so the block stays within one screen
    const tw = $('#simTable'); tw.innerHTML = '<div class="tabs ttabs" role="tablist" aria-label="Results table"></div><div class="tbody"></div>' + '<p class="tnote">Overall is the average over categories (tracks). Bold: best. Underlined: second. <sup>§</sup> Reasoning disabled at test time; CoT-on rows reason at every decision.</p>';
    chips($('.ttabs', tw), Object.keys(TABLES).map(esc), i => { $('.tbody', tw).innerHTML = tableHtml(Object.values(TABLES)[i]); });
  })();

  /* ---------------------------------------------------------------- 3b. analysis: steering, two runs side by side
     Same start, same instruction; the only difference is one word in one Think state, shown above each clip at the same position.
     The instruction beat plays once over both, then each answer's brackets close in, then both arms act in sync; the outcome shows
     at each grasp. A click on a clip seeks both. */
  (() => {
    const e = byId(ED2, 'edit2_pos02_r0_lemon'), host = $('#steerPlayer'); if (!e || !host) return;
    const thA = ovOf(e.id) || {}, thB = ovOf(e.id + '/edit') || {}, stB = (thB.steps || []).find(s => s.was); if (!stB) return;
    const a = stB.was.split(' '), b = stB.text.split(' '); let i = 0; while (i < a.length && a[i] === b[i]) i++;   // the edited word
    const pre = esc(a.slice(0, i).join(' ')), post = esc(a.slice(i + 1).join(' '));
    const C = [
      { lab: 'As is', html: `${pre} <mark>${esc(a[i])}</mark> ${post}`, clip: clipOf(e, 'ours'), goal: [].concat(thA.goal || [])[0], name: NAMES[e.id][0], grasp: GRASP[e.id] },
      { lab: 'Edited', html: `${pre} <s>${esc(a[i])}</s> <em>${esc(b[i])}</em> ${post}`, clip: clipOf(e, 'edit'), goal: [].concat(thB.goal || [])[0], name: NAMES[e.id + '/edit'][0], grasp: GRASP[e.id + '/edit'] }
    ];
    const instr = sentence(e.instruction), ip = el('p', 'instr', `<span class="lab">Instruction</span><q>${esc(instr)}</q>`), iq = $('q', ip);
    const rep = el('button', 'srep', '↺ Replay'); rep.type = 'button'; ip.append(rep);
    const duo = el('div', 'duo2'), ib = el('div', 'ibeat', `<q>${esc(instr)}</q>`); duo.dataset.cid = 'analysis.steer.think';
    C.forEach(c => { c.col = el('div', 'col2' + (c.lab === 'Edited' ? ' ed' : '')); c.vb = vbox(c.clip, { tag: c.lab, me: c.lab === 'Edited', bar: true }); c.out = el('p', 'sout', '✓ Picks the ' + esc(c.name) + '.');
      c.col.append(el('p', 'th1', `<span class="lab">Think · ${c.lab}</span><span class="ln">${c.html}</span>`), c.vb.box, c.out); duo.append(c.col); });
    duo.append(ib); host.append(ip, duo);
    const T_A = T_IHOLD + 500, T_P = T_A + 1800, vids = C.map(c => c.vb.v);
    const p = { clock: 0, phase: -1, on: false, wait: 0, host, ctx: { ep: e.id, task: 'Steering' }, vids };
    const sync = () => vids.forEach(v => { if (p.on) load(v); v.playbackRate = +v.dataset.rate || 1; p.phase === 2 && p.on && !v.dataset.done ? play(v) : v.pause(); });
    const restart = () => { clearTimeout(p.wait); p.wait = 0; p.clock = 0; p.phase = -1; vids.forEach(v => { delete v.dataset.done; v.pause(); try { v.currentTime = 0; } catch (x) { } }); sync(); };
    vids.forEach(v => v.addEventListener('ended', () => { v.dataset.done = 1; if (vids.every(q => q.dataset.done) && !p.wait) p.wait = setTimeout(restart, T_GAP); }));
    rep.onclick = restart;
    C.forEach(c => scrubber(c.vb.bar, () => c.vb.v.duration, t => { clearTimeout(p.wait); p.wait = 0; p.phase = 2; p.clock = T_P; vids.forEach(v => { delete v.dataset.done; try { v.currentTime = v.duration ? Math.min(t, v.duration - .05) : t; } catch (x) { } }); sync(); }, on => { p.hold = on; }, () => c.vb.v.currentTime));
    TICKS.add(dt => {
      if (!p.on) return;
      if (p.phase < 2) { p.clock += dt; p.phase = p.clock < T_A ? -1 : p.clock < T_P ? 1 : 2; if (p.phase === 2) sync(); }
      const u = p.clock, band = p.phase === -1 ? (REDUCED ? 1 : ease(u / T_IN)) * (1 - clamp((u - T_IHOLD) / 500)) : 0;
      ib.style.opacity = band; ib.style.setProperty('--band', 1); iq.style.opacity = p.phase === -1 ? clamp((u - T_IHOLD) / 500) : 1;
      if (band > 0) Object.assign(ib.style, { left: 0, top: 0, width: duo.offsetWidth + 'px', height: duo.offsetHeight + 'px' });
      C.forEach(c => {
        const t = c.vb.v.currentTime || 0, g = p.phase === 1 ? (REDUCED ? 1 : ease((u - T_A) / T_BLOOM)) : p.phase === 2 ? glowAt(t, c.grasp) : 0;
        if (fitCanvas(c.vb.cv)) { const x = c.vb.cv.getContext('2d'); x.clearRect(0, 0, c.vb.cv.width, c.vb.cv.height); drawMark(x, c.vb.cv.width, c.vb.cv.height, c.goal, g, p.phase === 1 ? g : 1, c.name); }
        c.out.classList.toggle('on', p.phase === 2 && (t >= c.grasp + .3 || !!c.vb.v.dataset.done));
      });
    });
    PLAYERS.add(p);
    visible(host, o => { p.on = o; sync(); }, .2);
  })();

  /* ---------------------------------------------------------------- bibtex; review mode only with ?review in the URL */
  $('#copyBib').addEventListener('click', ev => { navigator.clipboard && navigator.clipboard.writeText($('#bib').textContent); ev.target.textContent = 'Copied'; setTimeout(() => ev.target.textContent = 'Copy', 1500); });
  const rv = $('#reviewToggle'), setReview = on => { document.body.classList.toggle('review', on); rv.checked = on; };
  if (rv && new URLSearchParams(location.search).has('review')) { rv.closest('.switch').hidden = false; rv.addEventListener('change', () => setReview(rv.checked)); setReview(true); }

  /* ---------------------------------------------------------------- review comments: a 💬 button on every [data-cid] block (Review mode only).
     Kept in localStorage (ga-comments-v1) and, on every change, POSTed as one JSON file to /tmp-upload. */
  (() => {
    const KEY = 'ga-comments-v1', FILE = 'gistact_projpage_comments.json';
    let all = []; try { const a = JSON.parse(localStorage.getItem(KEY) || '[]'); if (Array.isArray(a)) all = a; } catch (z) { }
    const newest = a => a.slice().sort((x, y) => (y.ts || '').localeCompare(x.ts || ''));
    const when = ts => { const d = new Date(ts); return isNaN(d) ? '' : d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); };
    const ctxText = c => [c.task, c.ep && c.ep !== c.task ? c.ep : '', c.stage, c.t != null ? c.t.toFixed(1) + ' s' : ''].filter(Boolean).join(' · ');
    const blockOf = cid => document.querySelector(`[data-cid="${cid}"]`);
    // what the block shows right now: the player in its section (episode, stage, time), else its first video's time
    const ctxOf = b => {
      const sec = b.closest('.sub,section') || b, p = [...PLAYERS].find(q => sec.contains(q.host)), x = {};
      if (p) { Object.assign(x, p.ctx); x.stage = ['Instruction', 'Think', 'Answer', 'Act'][p.phase + 1]; x.t = +(p.vids[0].currentTime || 0).toFixed(2); }
      else { const v = $('video', sec); if (v) x.t = +(v.currentTime || 0).toFixed(2); }
      return x;
    };
    let seq_ = 0;
    const setState = (k, txt) => $$('.cp-state').forEach(n => { n.className = 'cp-state ' + k; n.textContent = txt; });
    const save = () => {
      try { localStorage.setItem(KEY, JSON.stringify(all)); } catch (z) { }
      counts(); const my = ++seq_; setState('', 'saving…');
      const fd = new FormData(), body = JSON.stringify({ page: 'gistact_projpage', url: location.href, saved: new Date().toISOString(), comments: newest(all) }, null, 1);
      fd.append('files', new Blob([body], { type: 'application/json' }), FILE);
      fetch('/tmp-upload', { method: 'POST', body: fd }).then(r => r.json()).then(j => { if (my === seq_) j.ok ? setState('ok', 'saved ✓') : setState('err', 'not saved (offline)'); })
        .catch(() => { if (my === seq_) setState('err', 'not saved (offline)'); });
    };
    const li = (c, go) => {
      const n = el('li', '', `<div class="cm-meta">${go ? `<button type="button" class="cd-go">${esc(c.cid)}</button>` : ''}<time>${esc(when(c.ts))}</time><span>${esc(ctxText(c))}</span><button type="button" class="cm-del">Delete</button></div><p class="cm-text">${esc(c.text)}</p>`);
      $('.cm-del', n).onclick = ev => { ev.stopPropagation(); all = all.filter(q => q.id !== c.id); save(); fillPanel(); fillDrawer(); };
      if (go) $('.cd-go', n).onclick = () => { const b = blockOf(c.cid); if (!b) return; if (innerWidth < 640) drawer.hidden = true; b.scrollIntoView({ block: 'center', behavior: REDUCED ? 'auto' : 'smooth' }); b.classList.add('c-flash'); setTimeout(() => b.classList.remove('c-flash'), 1600); };
      return n;
    };
    const btns = new Map();
    const navBtn = el('button', 'nav-c'); navBtn.type = 'button'; $('.nav .wrap').append(navBtn);
    const counts = () => { btns.forEach((bt, cid) => { const n = all.filter(c => c.cid === cid).length; bt.innerHTML = `💬 <span>${n}</span>`; bt.classList.toggle('has', n > 0); }); navBtn.textContent = `💬 ${all.length}`; };
    // one 💬 per [data-cid] block; players rebuild their DOM on every chip, so this runs again after each build
    const bind = () => { $$('[data-cid]').forEach(b => { if ($(':scope > .cbtn', b)) return; const bt = el('button', 'cbtn'); bt.type = 'button'; bt.setAttribute('aria-label', 'Comments on ' + b.dataset.cid); bt.addEventListener('click', ev => { ev.stopPropagation(); open(b, bt); }); b.append(bt); btns.set(b.dataset.cid, bt); }); counts(); };
    const panel = el('div', 'cpanel', '<div class="cp-head"><b class="cp-title"></b><button type="button" class="cp-x" aria-label="Close">✕</button></div><div class="cp-ctx"></div><textarea rows="3" placeholder="Write a comment. Ctrl+Enter adds it."></textarea><div class="cp-row"><span class="cp-state"></span><button type="button" class="btn2 cp-add">Add comment</button></div><ol class="cp-list"></ol>');
    panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Comments'); document.body.append(panel);
    const ta = $('textarea', panel); let cur = null;
    function fillPanel() { if (!cur) return; const l = $('.cp-list', panel), mine = newest(all.filter(c => c.cid === cur.cid)); l.innerHTML = ''; mine.forEach(c => l.append(li(c, false))); if (!mine.length) l.append(el('li', 'cm-none', 'No comments on this block yet.')); }
    function open(b, bt) {
      cur = { cid: b.dataset.cid, ctx: ctxOf(b) }; drawer.hidden = true;
      $('.cp-title', panel).textContent = cur.cid; $('.cp-ctx', panel).textContent = ctxText(cur.ctx) ? 'At ' + ctxText(cur.ctx) : '';
      fillPanel(); panel.hidden = false; const sheet = innerWidth < 640; panel.classList.toggle('sheet', sheet);
      if (!sheet) { const r = bt.getBoundingClientRect(), w = panel.offsetWidth; panel.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.right - w)) + scrollX + 'px'; panel.style.top = r.bottom + scrollY + 6 + 'px'; } else panel.style.left = panel.style.top = '';
      ta.focus({ preventScroll: true });
    }
    const close = () => { panel.hidden = true; cur = null; };
    const add = () => { const text = ta.value.trim(); if (!text || !cur) return; all.push(Object.assign({ id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), cid: cur.cid, text, ts: new Date().toISOString() }, cur.ctx)); ta.value = ''; save(); fillPanel(); fillDrawer(); };
    $('.cp-add', panel).onclick = add; $('.cp-x', panel).onclick = close;
    ta.addEventListener('keydown', ev => { if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) { ev.preventDefault(); add(); } });
    panel.addEventListener('click', ev => ev.stopPropagation());
    const drawer = el('aside', 'cdrawer', '<div class="cp-head"><b>All comments</b><button type="button" class="cp-x" aria-label="Close">✕</button></div><div class="cd-tools"><button type="button" class="btn2 cd-exp">Export JSON</button><button type="button" class="btn2 cd-copy">Copy as text</button><span class="cp-state"></span></div><ol class="cd-list"></ol>');
    drawer.hidden = true; drawer.setAttribute('aria-label', 'All comments'); document.body.append(drawer);
    function fillDrawer() { const l = $('.cd-list', drawer); l.innerHTML = ''; newest(all).forEach(c => l.append(li(c, true))); if (!all.length) l.append(el('li', 'cm-none', 'No comments yet. Use a 💬 button on any block.')); }
    navBtn.addEventListener('click', ev => { ev.stopPropagation(); close(); fillDrawer(); drawer.hidden = !drawer.hidden; });
    $('.cp-x', drawer).onclick = () => { drawer.hidden = true; };
    drawer.addEventListener('click', ev => ev.stopPropagation());
    const asText = () => { const g = {}; newest(all).forEach(c => (g[c.cid] = g[c.cid] || []).push(c)); return Object.keys(g).sort().map(k => `[${k}]\n` + g[k].map(c => `  ${when(c.ts)}${ctxText(c) ? ' · ' + ctxText(c) : ''}\n    ${c.text.replace(/\n/g, '\n    ')}`).join('\n')).join('\n\n'); };
    $('.cd-exp', drawer).onclick = () => { const a = el('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(newest(all), null, 1)], { type: 'application/json' })); a.download = FILE; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); };
    $('.cd-copy', drawer).onclick = ev => { const b = ev.currentTarget, txt = asText(), done = () => { b.textContent = 'Copied'; setTimeout(() => { b.textContent = 'Copy as text'; }, 1500); }; navigator.clipboard ? navigator.clipboard.writeText(txt).then(done, done) : done(); };
    document.addEventListener('click', () => { if (!panel.hidden) close(); });
    document.addEventListener('keydown', ev => { if (ev.key === 'Escape') { close(); drawer.hidden = true; } });
    bind(); bindComments = bind;
  })();
})();
