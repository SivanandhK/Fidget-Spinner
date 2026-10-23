'use strict';

// Tuning: coasting slowdown, speed cap, and Spacebar kick.
const FRICTION = 0.985; // per 60fps frame (scaled by dt below)
const MAX_VEL = 52;     // rad/s — clamp so spinning never looks broken
const STOP_VEL = 0.025; // slower than this counts as stopped
const KICK = 24;        // Spacebar spin strength (rad/s)

const rotor = document.getElementById('rotor');
const svg = document.getElementById('spinner');
const rpmEl = document.getElementById('rpm');
const rotsEl = document.getElementById('rots');
const hint = document.getElementById('hint');
const muteBtn = document.getElementById('mute');

let angle = 0, vel = 0, dragging = false;
let lastPtr = 0, lastMoveT = 0, total = 0, lastSector = 0;
let muted = true, audioCtx = null, hinted = false;

// Pointer angle around the spinner centre (0 = right, like a clock math-wise).
function pointerAngle(e) {
  const r = svg.getBoundingClientRect();
  return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
}

// Shortest signed turn — this is what makes dragging across +/-180° work.
function wrapDelta(from, to) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function applyTransform() {
  rotor.style.transform = 'rotate(' + (angle * 180 / Math.PI) + 'deg)';
}

// Browsers only allow sound after a click or keypress, so we wait until then.
function ensureAudio() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) audioCtx = new AC();
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}

function playTick() {
  if (muted || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 1700;
  g.gain.setValueAtTime(0.028, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.028);
  osc.connect(g); g.connect(audioCtx.destination);
  osc.start(t); osc.stop(t + 0.03);
}

// Two wings — a tick each time a wing sweeps past the top (every 180°).
function maybeTick() {
  const sector = Math.floor(angle / Math.PI);
  if (sector !== lastSector) { lastSector = sector; playTick(); }
}

function firstGesture() {
  ensureAudio();
  if (!hinted) { hinted = true; hint.classList.add('gone'); }
}

svg.addEventListener('pointerdown', function (e) {
  firstGesture();
  dragging = true; vel = 0;
  lastPtr = pointerAngle(e); lastMoveT = performance.now();
  try { svg.setPointerCapture(e.pointerId); } catch (err) {}
});

svg.addEventListener('pointermove', function (e) {
  if (!dragging) return;
  const now = performance.now();
  const a = pointerAngle(e);
  const d = wrapDelta(lastPtr, a);
  angle += d; total += Math.abs(d);
  const dt = Math.max((now - lastMoveT) / 1000, 0.001);
  vel = Math.max(-MAX_VEL, Math.min(MAX_VEL, d / dt));
  lastPtr = a; lastMoveT = now;
  applyTransform(); maybeTick();
});

function endDrag() {
  if (!dragging) return;
  dragging = false;
  if (performance.now() - lastMoveT > 80) vel = 0; // paused = no coast
}
svg.addEventListener('pointerup', endDrag);
svg.addEventListener('pointercancel', endDrag);

window.addEventListener('keydown', function (e) {
  if (e.code !== 'Space') return;
  e.preventDefault();
  firstGesture();
  vel = (Math.random() < 0.5 ? -1 : 1) * (KICK + Math.random() * 8);
});

muteBtn.addEventListener('click', function () {
  firstGesture();
  muted = !muted;
  muteBtn.textContent = muted ? 'Sound off' : 'Sound on';
  muteBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
});

// Each frame: spin by velocity, then apply friction so it slowly coasts to a stop.
let prev = performance.now();
function loop(now) {
  const dt = Math.min((now - prev) / 1000, 0.05);
  prev = now;
  if (!dragging) {
    if (Math.abs(vel) > STOP_VEL) {
      angle += vel * dt; total += Math.abs(vel * dt);
      vel *= Math.pow(FRICTION, dt * 60); // 0.985 per 1/60s, scaled to real dt
      vel = Math.max(-MAX_VEL, Math.min(MAX_VEL, vel));
    } else vel = 0;
  }
  applyTransform(); maybeTick();
  rpmEl.textContent = String(Math.round(Math.abs(vel) * 60 / (Math.PI * 2)));
  rotsEl.textContent = String(Math.floor(total / (Math.PI * 2)));
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
