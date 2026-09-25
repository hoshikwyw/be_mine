import { letter as L, question as Q, thanks as T } from "./content.js";
import { el, show, state, save } from "./app.js";
import { sendAnswer } from "./email.js";
import { confetti } from "./confetti.js";

// Split Burmese text into grapheme clusters so diacritics never appear alone mid-typing.
const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter("my", { granularity: "grapheme" }) : null;
const graphemes = (s) => (seg ? [...seg.segment(s)].map((x) => x.segment) : s.split(""));

export function letterScreen() {
  const node = el(`
    <section class="screen letter">
      <div class="card"><div class="typed" id="typed"></div></div>
      <button class="btn" id="next" disabled>${L.next}</button>
    </section>`);
  const box = node.querySelector("#typed");
  const next = node.querySelector("#next");
  let cancelled = false;
  show(node);

  (async () => {
    for (const line of L.lines) {
      const p = document.createElement("p"); box.appendChild(p);
      for (const g of graphemes(line)) {
        if (cancelled) break;
        p.textContent += g;
        await new Promise((r) => setTimeout(r, g === " " ? 90 : 45));
      }
      if (cancelled) break;
      await new Promise((r) => setTimeout(r, 550));
    }
    box.replaceChildren(...L.lines.map((l) => { const p = document.createElement("p"); p.textContent = l; return p; }));
    next.disabled = false;
  })();
  box.onclick = () => { cancelled = true; };            // tap to reveal all
  next.onclick = () => questionScreen();
}

export function questionScreen() {
  const node = el(`
    <section class="screen question">
      <div class="card center">
        <h1 class="accent">${Q.text}</h1>
        <p class="muted">${Q.sub}</p>
        <label class="muted" for="msg">${Q.messageLabel}</label>
        <textarea id="msg" rows="3"></textarea>
        <div class="stack">
          <button class="btn" id="yes">${Q.yes}</button>
          <button class="btn ghost" id="later">${Q.later}</button>
        </div>
        <div class="toast" id="toast"></div>
      </div>
    </section>`);
  const msg = node.querySelector("#msg");
  const toast = node.querySelector("#toast");
  const btns = [node.querySelector("#yes"), node.querySelector("#later")];

  const submit = async (answer) => {
    btns.forEach((b) => (b.disabled = true));
    toast.textContent = Q.sending;
    const res = await sendAnswer({
      answer, message: msg.value.trim(), cleared: state.cleared, skipped: state.skipped, startedAt: state.startedAt,
    });
    state.answer = { answer, message: msg.value.trim(), sent: !!(res && res.success), at: new Date().toISOString() };
    save();
    thanksScreen();
  };
  btns[0].onclick = () => submit("yes");
  btns[1].onclick = () => submit("need-time");
  show(node);
}

export function thanksScreen() {
  const a = state.answer;
  const t = a.answer === "yes" ? T.yes : T.later;
  const node = el(`
    <section class="screen thanks center">
      <div class="card">
        <h1>${t.title}</h1>
        ${t.lines.map((l) => `<p>${l}</p>`).join("")}
        <p class="muted ${a.sent ? "" : "warn"}">${a.sent ? T.sent : T.failed}</p>
        ${a.sent ? "" : `<p class="muted">answer: ${a.answer}${a.message ? " · " + a.message : ""}</p>`}
      </div>
    </section>`);
  show(node);
  if (a.answer === "yes") confetti(4500);
}
