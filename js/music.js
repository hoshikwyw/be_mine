// Background music: a soft, original music-box loop synthesized with Web Audio.
// No file, no license, loops forever, starts on the first tap (phone autoplay rules).
import { getCtx, isMuted } from "./sound.js";

const BPM = 92;
const STEP = 60 / BPM / 2;                 // one eighth note, seconds
const VOL = 0.16;

// Chord tones as MIDI numbers (C major, cosy progression: C - Am - F - G, then C - Am - Dm - G)
const CHORDS = [
  [48, 52, 55, 60], [45, 48, 52, 57], [41, 45, 48, 53], [43, 47, 50, 55],
  [48, 52, 55, 60], [45, 48, 52, 57], [38, 41, 45, 50], [43, 47, 50, 55],
];
const ARP = [0, 2, 3, 1, 0, 2, 3, 2];    // arpeggio pattern over chord tones, one bar = 8 eighths
// Melody: one bar per chord, 8 eighth-notes per bar, MIDI number or 0 = rest
const MELODY = [
  [76, 0, 79, 0, 84, 0, 79, 0],
  [76, 0, 72, 0, 81, 0, 0, 0],
  [77, 0, 81, 0, 84, 0, 81, 0],
  [79, 0, 83, 0, 86, 0, 83, 0],
  [84, 0, 79, 0, 76, 0, 79, 0],
  [81, 0, 76, 0, 72, 0, 76, 0],
  [77, 0, 81, 0, 84, 0, 86, 0],
  [83, 0, 86, 0, 79, 0, 0, 0],
];
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

let ctx, master, delay, timer = null, nextTime = 0, step = 0, started = false, wanted = false;

function setup() {
  ctx = getCtx(); if (!ctx) return false;
  if (master) return true;
  master = ctx.createGain(); master.gain.value = 0;
  // soft echo for warmth
  delay = ctx.createDelay(1); delay.delayTime.value = STEP * 1.5;
  const fb = ctx.createGain(); fb.gain.value = 0.28;
  const wet = ctx.createGain(); wet.gain.value = 0.35;
  master.connect(ctx.destination);
  master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
  return true;
}
function pluck(freq, t, vol, len) {          // music-box / kalimba style note
  for (const [mult, g] of [[1, 1], [2, 0.35], [4, 0.08]]) {
    const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = freq * mult;
    const gn = ctx.createGain();
    gn.gain.setValueAtTime(0.0001, t);
    gn.gain.exponentialRampToValueAtTime(vol * g, t + 0.008);
    gn.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(gn).connect(master); o.start(t); o.stop(t + len + 0.05);
  }
}
function schedule() {
  while (nextTime < ctx.currentTime + 0.3) {
    const bar = Math.floor(step / 8) % CHORDS.length, i = step % 8;
    const chord = CHORDS[bar];
    pluck(hz(chord[ARP[i]]), nextTime, 0.5, 0.9);                       // arpeggio
    const m = MELODY[bar][i]; if (m) pluck(hz(m), nextTime, 0.9, 1.4);  // melody
    if (i === 0) pluck(hz(chord[0] - 12), nextTime, 0.35, 1.8);         // soft bass on the downbeat
    nextTime += STEP; step++;
  }
}

export const music = {
  start() {
    wanted = true;
    if (isMuted() || !setup()) return;
    if (ctx.state === "suspended") ctx.resume();
    if (started) return;
    started = true; step = 0; nextTime = ctx.currentTime + 0.1;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0.0001, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(VOL, ctx.currentTime + 2.5);   // fade in
    timer = setInterval(schedule, 100);
  },
  stop(fade = 1.2) {
    wanted = false;
    if (!started) return;
    started = false; clearInterval(timer); timer = null;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
    master.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + fade);
  },
  // called by the mute button
  onMute(muted) { if (muted) { const w = wanted; music.stop(0.3); wanted = w; } else if (wanted) music.start(); },
  isPlaying: () => started,
};
