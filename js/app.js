import { intro, levelIntro, common, TOTAL_LEVELS } from "./content.js";
import { quiz } from "./games/quiz.js";
import { memory } from "./games/memory.js";
import { jigsaw } from "./games/jigsaw.js";
import { hearts } from "./games/hearts.js";
import { lock } from "./games/lock.js";
import { letterScreen, thanksScreen } from "./final.js";

const STORAGE_KEY = "mm-proposal-v1";
const app = document.getElementById("app");
const topbar = document.getElementById("topbar");
const heartsEl = document.getElementById("hearts");

// ---- state ------------------------------------------------------------
export const state = load() || { cleared: 0, skipped: [], startedAt: null, answer: null };
function load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } }
export function save() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {} }
export function reset() { try { localStorage.removeItem(STORAGE_KEY); } catch {} location.reload(); }

// ---- levels registry (order = play order) -----------------------------
const games = { 1: quiz, 2: memory, 3: jigsaw, 4: hearts, 5: lock };

// ---- rendering helpers ------------------------------------------------
export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function show(node) {
  const old = app.firstElementChild;
  let done = false;
  const swap = () => { if (done) return; done = true; app.replaceChildren(node); window.scrollTo({ top: 0 }); };
  if (!old) return swap();
  old.classList.add("leaving");
  old.addEventListener("animationend", swap, { once: true });
  setTimeout(swap, 300); // safety if animationend never fires
}
function renderHearts() {
  heartsEl.replaceChildren(
    ...Array.from({ length: TOTAL_LEVELS }, (_, i) => {
      const s = document.createElement("span");
      s.textContent = i < state.cleared ? "💗" : "🤍";
      if (i < state.cleared) s.classList.add("on");
      return s;
    })
  );
}

// ---- screens ----------------------------------------------------------
function introScreen() {
  topbar.hidden = true;
  const resume = state.cleared > 0;
  const node = el(`
    <section class="screen intro">
      <span class="big-heart">💗</span>
      <h1>${intro.title}</h1>
      ${intro.lines.map((l) => `<p>${l}</p>`).join("")}
      <div style="height:16px"></div>
      <button class="btn" id="start">${resume ? intro.resume : intro.start}</button>
    </section>`);
  node.querySelector("#start").onclick = () => {
    if (!state.startedAt) { state.startedAt = new Date().toISOString(); save(); }
    gotoLevel(state.cleared + 1);
  };
  show(node);
}

function levelIntroScreen(n) {
  topbar.hidden = false; renderHearts();
  const t = levelIntro[n];
  const node = el(`
    <section class="screen level-intro">
      <span class="badge">${t.title}</span>
      <h1>${t.sub}</h1>
      <div style="height:16px"></div>
      <button class="btn" id="go">${t.go}</button>
    </section>`);
  node.querySelector("#go").onclick = () => games[n]({ onClear: (opts) => levelClear(n, opts) });
  show(node);
}

function levelClear(n, { skipped = false, message = "" } = {}) {
  if (state.cleared < n) state.cleared = n;
  if (skipped && !state.skipped.includes(n)) state.skipped.push(n);
  save(); renderHearts();
  const node = el(`
    <section class="screen clear">
      <span class="check">💗</span>
      <h1>${common.levelClear(n)}</h1>
      ${message ? `<p class="reveal">${message}</p>` : ""}
      <div style="height:16px"></div>
      <button class="btn" id="next">${common.continueBtn}</button>
    </section>`);
  node.querySelector("#next").onclick = () => gotoLevel(n + 1);
  show(node);
}

export function gotoLevel(n) {
  if (state.answer) return thanksScreen();          // she already answered
  if (n > TOTAL_LEVELS) { topbar.hidden = true; return letterScreen(); }
  levelIntroScreen(n);
}

// ---- dev helpers: ?reset clears progress, ?level=N jumps ---------------
const params = new URLSearchParams(location.search);
if (params.has("reset")) { try { localStorage.removeItem(STORAGE_KEY); } catch {} history.replaceState(null, "", location.pathname); Object.assign(state, { cleared: 0, skipped: [], startedAt: null, answer: null }); }
if (params.has("level")) { state.cleared = Math.max(0, Number(params.get("level")) - 1); state.answer = null; }

// ---- boot -------------------------------------------------------------
introScreen();
