// Sound effects + voice lines. Web Audio (low latency, overlapping) with <audio> fallback.
// Phones block audio until the first tap: we unlock + preload on the first pointer event.
const BASE = "assets/sounds/";
const EXT = "wav";   // 22 kHz mono WAV: plays everywhere incl. iPhone Safari, no codec worries
const SFX = {
  click: ["click1"],
  flip: ["flip"], match: ["match"], correct: ["correct"], wrong: ["wrong"],
  catch: ["catch1", "catch2"], sparkle: ["sparkle"], key: ["key"], unlock: ["unlock"],
  open: ["open"], pop: ["pop"], chime: ["chime"], question: ["question"], type: ["type"],
};
const VOICE = {
  correct: "v_correct", levelup: "v_level_up", congrats: "v_congratulations",
  ready: "v_ready", go: "v_go", win: "v_you_win", timeover: "v_time_over", complete: "v_mission_completed",
};
const VOL = { sfx: 0.55, voice: 0.85, type: 0.12 };
const MUTE_KEY = "mm-sound-muted";

let ctx = null, buffers = {}, unlocked = false, loading = null;
let muted = false;
try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch {}

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}
async function load(name) {
  if (buffers[name]) return buffers[name];
  const c = ensureCtx(); if (!c) return null;
  try {
    const res = await fetch(`${BASE}${name}.${EXT}`);
    const ab = await res.arrayBuffer();
    buffers[name] = await c.decodeAudioData(ab);
  } catch { buffers[name] = null; }
  return buffers[name];
}
function preloadAll() {
  if (loading) return loading;
  const names = [...new Set([...Object.values(SFX).flat(), ...Object.values(VOICE)])];
  loading = Promise.all(names.map(load));
  return loading;
}
export function unlock() {
  const c = ensureCtx();
  if (c && c.state === "suspended") c.resume();
  unlocked = true;
  preloadAll();
}

async function playName(name, vol) {
  if (muted) return;
  const c = ensureCtx();
  if (!c) { try { const a = new Audio(`${BASE}${name}.${EXT}`); a.volume = vol; a.play(); } catch {} return; }
  if (c.state === "suspended") { try { await c.resume(); } catch {} }
  const buf = buffers[name] || (await load(name));
  if (!buf) return;
  const src = c.createBufferSource(); src.buffer = buf;
  const g = c.createGain(); g.gain.value = vol;
  src.connect(g).connect(c.destination); src.start();
}
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export const sfx = (kind, vol) => { const list = SFX[kind]; if (list) playName(pick(list), vol ?? (kind === "type" ? VOL.type : VOL.sfx)); };
export const voice = (kind, delay = 0) => { const n = VOICE[kind]; if (!n) return; delay ? setTimeout(() => playName(n, VOL.voice), delay) : playName(n, VOL.voice); };

export function isMuted() { return muted; }
export function setMuted(v) { muted = v; try { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); } catch {} }

// ---- global wiring: unlock on first gesture, generic taps -----------------
["pointerdown", "touchend", "keydown"].forEach((ev) => addEventListener(ev, () => { if (!unlocked) unlock(); }, { once: false, passive: true }));
addEventListener("pointerdown", (e) => {
  const t = e.target.closest?.("button");
  if (!t || t.disabled) return;
  if (t.classList.contains("btn")) sfx("click");
  else if (t.classList.contains("key")) sfx("key");
  else if (t.classList.contains("jtile")) sfx("pop");
}, { passive: true });

// ---- mute toggle button ----------------------------------------------------
export function mountMuteButton() {
  const b = document.createElement("button");
  b.className = "mute"; b.type = "button"; b.setAttribute("aria-label", "sound");
  const draw = () => (b.textContent = muted ? "🔇" : "🔊");
  b.onclick = (e) => { e.stopPropagation(); setMuted(!muted); draw(); if (!muted) sfx("pop"); };
  draw(); document.body.appendChild(b);
}
