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
import { music } from "./music.js";

const VOICE = {
  ready: "v_ready", go: "v_go", timeover: "v_time_over",
};
// Synthesized cute jingles (bell-like arpeggios), no files needed. Frequencies in Hz.
const JINGLES = {
  levelup:  { notes: [523.25, 659.25, 783.99, 1046.5], step: 0.09, len: 0.4, wave: "triangle", vol: 0.22 },                 // C E G C  quick rise
  complete: { notes: [659.25, 783.99, 987.77, 1318.5, 1567.98, 1975.5], step: 0.1, len: 0.55, wave: "sine", vol: 0.2 },    // sparkle up
  win:      { notes: [523.25, 659.25, 783.99, 1046.5, 987.77, 1046.5, 1318.5, 1567.98], step: 0.14, len: 0.7, wave: "triangle", vol: 0.22 }, // little fanfare
  twinkle:  { notes: [1567.98, 2093, 2637], step: 0.07, len: 0.3, wave: "sine", vol: 0.12 },
  correct:  { notes: [1318.5, 1760], step: 0.09, len: 0.45, wave: "sine", vol: 0.2 },                                  // "ding-ding" (E6 A6)
  yes:      { notes: [523.25, 659.25, 783.99, 1046.5, 1318.5], step: 0, len: 2.4, wave: "sine", vol: 0.13 },           // warm bell chord, all at once
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

export async function jingle(kind, delay = 0) {
  const cfg = JINGLES[kind]; if (!cfg || muted) return;
  const c = ensureCtx(); if (!c) return;
  if (c.state === "suspended") { try { await c.resume(); } catch {} }
  const t0 = c.currentTime + 0.02 + delay / 1000;
  cfg.notes.forEach((f, i) => {
    const t = t0 + i * cfg.step;
    for (const [mult, g] of [[1, 1], [2, 0.22], [3, 0.06]]) {      // fundamental + soft overtones = bell
      const o = c.createOscillator(); o.type = cfg.wave; o.frequency.value = f * mult;
      const gn = c.createGain();
      gn.gain.setValueAtTime(0.0001, t);
      gn.gain.exponentialRampToValueAtTime(cfg.vol * g, t + 0.012);
      gn.gain.exponentialRampToValueAtTime(0.0001, t + cfg.len);
      o.connect(gn).connect(c.destination); o.start(t); o.stop(t + cfg.len + 0.05);
    }
  });
}

export function getCtx() { return ensureCtx(); }
export function isMuted() { return muted; }
export function setMuted(v) { muted = v; try { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); } catch {} music.onMute(v); }

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
