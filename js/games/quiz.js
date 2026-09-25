import { quiz as C } from "../content.js";
import { el, show } from "../app.js";
import { sfx, jingle } from "../sound.js";
import { burst } from "../fx.js";

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function quiz({ onClear }) {
  let i = 0, skippedAny = false;

  const introNode = el(`
    <section class="screen quiz">
      <div class="card"><p>${C.intro}</p></div>
      <button class="btn" id="go">${C.introBtn}</button>
    </section>`);
  introNode.querySelector("#go").onclick = () => question();
  show(introNode);

  function question() {
    const q = C.questions[i];
    let misses = 0, hintShown = false;
    const options = shuffle([q.answer, ...q.wrong]);

    const node = el(`
      <section class="screen quiz">
        <div class="card">
          <div class="qnum">${i + 1} / ${C.questions.length}</div>
          <div class="question">${q.q}</div>
          <div class="stack" id="opts"></div>
          <div class="toast" id="toast"></div>
          <div class="hintbox" id="hintbox" hidden>💡 ${q.hint}</div>
          <div class="tools">
            <button class="btn ghost small" id="hint">${C.hintBtn}</button>
            <button class="btn ghost small" id="skip" hidden>${C.skipBtn}</button>
          </div>
        </div>
      </section>`);

    const opts = node.querySelector("#opts");
    const toast = node.querySelector("#toast");
    const hintBtn = node.querySelector("#hint");
    const skipBtn = node.querySelector("#skip");

    hintBtn.onclick = () => { node.querySelector("#hintbox").hidden = false; hintBtn.classList.remove("glow"); hintShown = true; };
    skipBtn.onclick = () => { skippedAny = true; reveal(q, true); };

    for (const o of options) {
      const btn = document.createElement("button");
      btn.className = "option";
      btn.textContent = o;               // textContent: safe for quotes/emoji in options
      btn.onclick = () => {
        if (o === q.answer) {
          btn.classList.add("correct");
          opts.querySelectorAll(".option").forEach((b) => (b.disabled = true));
          toast.textContent = pick(C.correct);
          jingle("correct"); burst(btn, { count: 8 });
          setTimeout(() => reveal(q, false), 900);
        } else {
          misses++;
          btn.classList.add("wrong");
          btn.disabled = true;
          burst(btn, { count: 3, emojis: ["🥺", "💭"], spread: 40 });
          toast.textContent = C.wrong;
          sfx("wrong");
          if (misses >= 2 && !hintShown) hintBtn.classList.add("glow");
          if (misses >= 3) skipBtn.hidden = false;
        }
      };
      opts.appendChild(btn);
    }
    show(node);
  }

  function reveal(q, skipped) {
    const lines = Array.isArray(q.reveal) ? q.reveal : [q.reveal];
    const node = el(`
      <section class="screen quiz">
        <div class="card">
          ${skipped ? "" : `<p class="accent">✔ ${q.answer}</p>`}
          ${q.image ? `<img class="photo" src="${q.image}" alt="">` : ""}
          <div class="reveal">${lines.map((l) => `<p>${l}</p>`).join("")}</div>
        </div>
        <button class="btn" id="next">${C.next}</button>
      </section>`);
    const img = node.querySelector("img");
    if (img) img.onerror = () => img.remove();
    sfx("sparkle");
    node.querySelector("#next").onclick = () => {
      i++;
      if (i < C.questions.length) question();
      else onClear({ skipped: skippedAny, message: C.clear });
    };
    show(node);
  }
}
