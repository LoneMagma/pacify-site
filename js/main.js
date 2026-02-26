/*
 * pacify.site — main.js
 * ─────────────────────────────────────────────
 * TABLE OF CONTENTS
 *
 *  1. UTILS
 *  2. SECTION-AWARE WORD POOLS
 *     → edit these to change margin words per section
 *  3. ENTRY ANIMATIONS (IntersectionObserver)
 *  4. SESSION CLOCK
 *  5. PROJECT ROW CLICKS
 *  6. MARGIN GEOMETRY
 *  7. CANVAS — GLITCH COLUMNS
 *  8. CANVAS — POPUP WORDS
 *  9. SVG — TENSION LINES
 * 10. HOVER REACTIONS
 * 11. SCROLL HANDLER
 * 12. RESIZE HANDLER
 * 13. MAIN LOOP
 * 14. INIT
 * ─────────────────────────────────────────────
 */


/* ─────────────────────────────────────────────
 * 1. UTILS
 * ───────────────────────────────────────────── */

const rand  = (a, b) => a + Math.random() * (b - a);
const randI = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const pick  = arr => arr[randI(0, arr.length - 1)];


/* ─────────────────────────────────────────────
 * 2. SECTION-AWARE WORD POOLS
 *
 * Each key matches a section detected by scroll.
 * rain  → words that drift down with glitch columns
 * popup → words that flash as fixed-position bursts
 * colors → [r,g,b] tint options for that section
 *
 * TO EDIT: just change the arrays below.
 * ───────────────────────────────────────────── */

const POOLS = {
  hero: {
    rain:   ['boot','init','./run','whoami','> _','~','ping','connect','handshake','hello','0x00','start','load','ready','exec','spawn'],
    popup:  ['INIT','BOOT','> _','HELLO','CONNECT','PING','READY','LOAD','START','HANDSHAKE','./run.sh','SPAWN'],
    colors: [[90,153,96],[100,100,180],[180,180,100]],
  },
  projects: {
    rain:   ['/focused','v1.0','burnlab','shipped','apk','chmod +x','build','adb','deploy','kill -9','git push','rm -rf','diff','merge','compile','link'],
    popup:  ['SHIPPED','DEPLOY','BUILD','APK','CHMOD','GIT PUSH','COMPILE','LIVE','v1.0','BURNLAB','FOCUSED','KEY4CE','MERGE'],
    colors: [[90,153,96],[138,112,64],[90,90,180]],
  },
  about: {
    rain:   ['student','builder','iterate','break it','ship it','learn','repeat','why not','just build','try it','debug','read','write','think'],
    popup:  ['BUILDER','ITERATE','SHIP IT','LEARN','REPEAT','WHY NOT','STUDENT','DEBUG','THINK','BREAK IT','BUILD FIRST'],
    colors: [[120,120,200],[90,153,96],[160,120,80]],
  },
  contact: {
    rain:   ['@lonemagma','mailto:','reach out','open','ping me','ssh','connect','DM open','hey','talk','lonemagma29'],
    popup:  ['@LONEMAGMA','PING ME','REACH OUT','OPEN','CONNECT','SSH','DM OPEN','TALK','HEY','MAILTO:'],
    colors: [[90,153,96],[160,90,90],[90,130,180]],
  },
};

/* section scroll detection map — id must match an element id in index.html */
const SECTION_MAP = [
  { id: 'section-hero', key: 'hero'     },
  { id: 'projects',     key: 'projects' },
  { id: 'about',        key: 'about'    },
  { id: 'contact',      key: 'contact'  },
];

let currentSection = 'hero';

function detectSection() {
  let active = 'hero';
  SECTION_MAP.forEach(s => {
    const el = document.getElementById(s.id);
    if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) active = s.key;
  });
  return active;
}


/* ─────────────────────────────────────────────
 * 3. ENTRY ANIMATIONS
 * ───────────────────────────────────────────── */

const entryIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      entryIO.unobserve(e.target);
    }
  });
}, { threshold: 0.04 });

document.querySelectorAll('.ani').forEach(el => entryIO.observe(el));


/* ─────────────────────────────────────────────
 * 4. SESSION CLOCK
 * ───────────────────────────────────────────── */

const t0  = Date.now();
const pad = n => String(n).padStart(2, '0');

setInterval(() => {
  const e = Math.floor((Date.now() - t0) / 1000);
  const el = document.getElementById('session-time');
  if (el) el.textContent =
    `${pad(Math.floor(e / 3600))}:${pad(Math.floor(e % 3600 / 60))}:${pad(e % 60)}`;
}, 1000);


/* ─────────────────────────────────────────────
 * 5. PROJECT ROW CLICKS
 * whole <a> row is clickable; child <a> links
 * (GitHub, Docs etc.) fire independently.
 * ───────────────────────────────────────────── */

document.querySelectorAll('.project-row').forEach(row => {
  row.addEventListener('click', e => {
    // if a child <a> was clicked, let it handle itself
    const childLink = e.target.closest('a');
    if (childLink && childLink !== row) return;
    const href = row.getAttribute('href');
    if (href) window.location.href = href;
  });
});


/* ─────────────────────────────────────────────
 * 6. MARGIN GEOMETRY
 * recalculated on init + resize
 * ───────────────────────────────────────────── */

let W = 0, H = 0, cL = 0, cR = 0, marginW = 0;

function recalc() {
  W = window.innerWidth;
  H = window.innerHeight;
  const r = document.querySelector('.wrap').getBoundingClientRect();
  cL = r.left;
  cR = r.right;
  marginW = Math.max(0, cL);
}


/* ─────────────────────────────────────────────
 * 7. CANVAS — GLITCH COLUMNS
 * noise characters raining down both margins.
 * rain words from POOLS drift with their column.
 * ───────────────────────────────────────────── */

const canvas = document.getElementById('margin-canvas');
const ctx    = canvas.getContext('2d');

const NOISE = '01アイウエオカキクケコ█▓▒░│┤╣║╗╝┐└┴┬├─┼╠═╬┘┌ΦΨΩ∂∆∇';
const CSIZE = 11;
const CGAP  = CSIZE + 2;

let cols      = [];
let scrollVel = 0;
let hovering  = false;

function resizeCanvas() {
  canvas.width  = W;
  canvas.height = H;
}

function makeCol(x) {
  return {
    x,
    y:        rand(0, H),
    speed:    rand(0.2, 0.9),
    baseOp:   rand(0.03, 0.10),
    excited:  false,
    rainWord: null,
    rainY:    0,
    rainOp:   0,
    rainTimer:0,
    rainColor:[180, 180, 180],
  };
}

function buildCols() {
  cols = [];
  if (marginW < 20) return;
  const leftCount  = Math.floor(marginW / CGAP);
  const rightCount = Math.floor((W - cR) / CGAP);
  for (let i = 0; i < leftCount;  i++) cols.push(makeCol(i * CGAP + CGAP * 0.45));
  for (let i = 0; i < rightCount; i++) cols.push(makeCol(cR + i * CGAP + CGAP * 0.45));
}

function drawCols() {
  ctx.clearRect(0, 0, W, H);
  if (marginW < 20) return;

  const pool = POOLS[currentSection];
  const sf   = 1 + clamp(Math.abs(scrollVel) * 0.003, 0, 1.4);

  cols.forEach(col => {
    const ef = col.excited ? 3.0 : 1;
    col.y += col.speed * sf * ef;
    if (col.y > H + 20) col.y = -20;

    /* spawn a rain word */
    if (!col.rainWord && Math.random() < 0.0014) {
      col.rainWord  = pick(pool.rain);
      col.rainY     = col.y;
      col.rainTimer = randI(55, 130);
      col.rainOp    = 1;
      col.rainColor = pick(pool.colors);
    }

    /* noise trail */
    const trail = col.excited ? 18 : 6;
    ctx.font = `${CSIZE}px 'DM Mono', monospace`;
    for (let t = 0; t < trail; t++) {
      const op = col.baseOp * (1 - t / trail) * (col.excited ? 2.2 : 1);
      ctx.fillStyle = `rgba(190,190,190,${clamp(op, 0, 0.22)})`;
      ctx.fillText(NOISE[randI(0, NOISE.length - 1)], col.x, col.y - t * CSIZE);
    }

    /* rain word drifting with column */
    if (col.rainWord) {
      col.rainTimer--;
      col.rainY += col.speed * sf * ef;
      if (col.rainY > H + 30) { col.rainWord = null; return; }
      col.rainOp = col.rainTimer > 20 ? 0.30 : col.rainOp * 0.93;
      const [r, g, b] = col.rainColor;
      ctx.font = `${CSIZE - 1}px 'DM Mono', monospace`;
      ctx.fillStyle = `rgba(${r},${g},${b},${col.rainOp * 0.38})`;
      ctx.fillText(col.rainWord, col.x - 18, col.rainY);
      if (col.rainTimer <= 0) col.rainWord = null;
    }

    if (col.excited && Math.random() > 0.97) col.excited = false;
  });
}


/* ─────────────────────────────────────────────
 * 8. CANVAS — POPUP WORDS
 * fixed-position flashes, independent of columns.
 * ───────────────────────────────────────────── */

let popups = [];
const MAX_POPUPS = 18;

function spawnPopup() {
  if (marginW < 30 || popups.length >= MAX_POPUPS) return;
  const pool = POOLS[currentSection];
  const side = Math.random() < 0.5 ? 'L' : 'R';
  popups.push({
    x:         side === 'L' ? rand(4, cL - 8) : rand(cR + 4, W - 8),
    y:         rand(H * 0.05, H * 0.92),
    text:      pick(pool.popup),
    op:        0,
    peakOp:    rand(0.10, 0.28),
    fadeIn:    true,
    fadeSpeed: rand(0.008, 0.022),
    color:     pick(pool.colors),
    fontSize:  randI(9, 14),
    drift:     rand(-0.15, 0.15),
    life:      randI(80, 220),
    lifeLeft:  0,
  });
}

function drawPopups() {
  if (Math.random() < (hovering ? 0.12 : 0.045)) spawnPopup();

  popups = popups.filter(p => p.fadeIn || p.op > 0.002);

  popups.forEach(p => {
    if (p.fadeIn) {
      p.op += p.fadeSpeed;
      if (p.op >= p.peakOp) { p.op = p.peakOp; p.fadeIn = false; p.lifeLeft = p.life; }
    } else {
      if (p.lifeLeft > 0) { p.lifeLeft--; }
      else                { p.op -= p.fadeSpeed * 0.6; }
    }
    p.y += p.drift;
    const [r, g, b] = p.color;
    ctx.font = `${p.fontSize}px 'DM Mono', monospace`;
    ctx.fillStyle = `rgba(${r},${g},${b},${clamp(p.op, 0, 0.32)})`;
    ctx.fillText(p.text, p.x, p.y);
  });
}


/* ─────────────────────────────────────────────
 * 9. SVG — TENSION LINES
 * bezier curves through both margins,
 * spring-physics spike on project row hover.
 * ───────────────────────────────────────────── */

const svg = document.getElementById('tension-svg');
const NS  = 'http://www.w3.org/2000/svg';
let lines = [];

function buildLines() {
  svg.setAttribute('width',  W);
  svg.setAttribute('height', H);
  svg.innerHTML = '';
  lines = [];
  if (marginW < 40) return;

  document.querySelectorAll('.project-row').forEach(() => {
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', '0.6');
    path.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.appendChild(path);
    lines.push({
      el:       path,
      baseY:    0,
      spikeX:   0, spikeY:   0,
      tSpikeX:  0, tSpikeY:  0,
      vX:       0, vY:       0,
      opacity:  0, tOpacity: 0.03,
    });
  });
  syncLineBases();
}

function syncLineBases() {
  const rows = document.querySelectorAll('.project-row');
  lines.forEach((ln, i) => {
    if (rows[i]) {
      const r = rows[i].getBoundingClientRect();
      ln.baseY = r.top + r.height * 0.5;
    }
  });
}

function pathForLine(ln) {
  const y    = ln.baseY;
  const sx   = ln.spikeX;
  const sy   = ln.spikeY;
  const lMid = cL * 0.48 + sx * 0.35;
  const rMid = cR + (W - cR) * 0.52 - sx * 0.35;
  return `M 0,${y} C ${lMid},${y+sy} ${lMid},${y+sy} ${cL},${y} `
       + `M ${cR},${y} C ${rMid},${y+sy} ${rMid},${y+sy} ${W},${y}`;
}

function tickLines() {
  const stiff = 0.075, damp = 0.70;
  lines.forEach(ln => {
    ln.vX      = ln.vX * damp + (ln.tSpikeX - ln.spikeX) * stiff;
    ln.vY      = ln.vY * damp + (ln.tSpikeY - ln.spikeY) * stiff;
    ln.spikeX += ln.vX;
    ln.spikeY += ln.vY;
    ln.opacity += (ln.tOpacity - ln.opacity) * 0.055;
    if (ln.el) {
      ln.el.setAttribute('d', pathForLine(ln));
      ln.el.setAttribute('stroke', `rgba(100,100,100,${ln.opacity.toFixed(3)})`);
    }
  });
}


/* ─────────────────────────────────────────────
 * 10. HOVER REACTIONS
 * ───────────────────────────────────────────── */

document.querySelectorAll('.project-row').forEach((row, ri) => {
  row.addEventListener('mouseenter', () => {
    hovering = true;
    cols.forEach(c => { if (Math.random() < 0.6) c.excited = true; });

    /* burst popups */
    for (let i = 0; i < randI(3, 5); i++) spawnPopup();

    /* spike matched line, nudge neighbours */
    if (lines[ri]) {
      lines[ri].tSpikeX = rand(-24, 24);
      lines[ri].tSpikeY = rand(-18, 18);
      lines[ri].tOpacity = rand(0.20, 0.32);
    }
    if (lines[ri - 1]) { lines[ri-1].tSpikeY = rand(-7, 7); lines[ri-1].tOpacity = 0.09; }
    if (lines[ri + 1]) { lines[ri+1].tSpikeY = rand(-7, 7); lines[ri+1].tOpacity = 0.09; }
  });

  row.addEventListener('mouseleave', () => {
    hovering = false;
    cols.forEach(c => c.excited = false);
    lines.forEach(ln => { ln.tSpikeX = 0; ln.tSpikeY = 0; ln.tOpacity = 0.03; });
  });
});


/* ─────────────────────────────────────────────
 * 11. SCROLL HANDLER
 * ───────────────────────────────────────────── */

let lastSY = window.scrollY;

window.addEventListener('scroll', () => {
  scrollVel = window.scrollY - lastSY;
  lastSY    = window.scrollY;
  syncLineBases();

  const next = detectSection();
  if (next !== currentSection) {
    currentSection = next;
    popups = []; /* flush on section change */
    for (let i = 0; i < randI(4, 8); i++) spawnPopup();
  }
}, { passive: true });

/* decay scroll velocity */
setInterval(() => { scrollVel *= 0.78; }, 16);


/* ─────────────────────────────────────────────
 * 12. RESIZE HANDLER
 * ───────────────────────────────────────────── */

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    recalc();
    resizeCanvas();
    buildCols();
    buildLines();
    popups = [];
  }, 100);
});


/* ─────────────────────────────────────────────
 * 13. MAIN LOOP
 * ───────────────────────────────────────────── */

function loop() {
  drawCols();
  drawPopups();
  tickLines();
  requestAnimationFrame(loop);
}


/* ─────────────────────────────────────────────
 * 14. INIT
 * wait for fonts so .wrap has its correct width
 * ───────────────────────────────────────────── */

function init() {
  recalc();
  resizeCanvas();
  buildCols();
  buildLines();
  lines.forEach(ln => ln.tOpacity = 0.03);
  currentSection = detectSection();
  for (let i = 0; i < 6; i++) spawnPopup();
  loop();
}

(document.fonts ? document.fonts.ready : Promise.resolve()).then(init);
