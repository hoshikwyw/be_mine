import { lock as C } from "../content.js";
import { el, show } from "../app.js";

export function lock({ onClear }) {
  let entry = "", fails = 0;

  const node = el(`
    <section class="screen lock">
      <div class="card center">
        <p>${C.intro}</p>
        <p class="accent">${C.clue}</p>
        <div class="slots" id="slots">${"<span></span>".repeat(C.code.length)}</div>
        <div class="toast" id="toast"></div>
        <div class="hintbox" id="hintbox" hidden>💡 ${C.hint}</div>
        <div class="keypad" id="pad">
          ${[1,2,3,4,5,6,7,8,9].map((d) => `<button class="key" data-k="${d}">${d}</button>`).join("")}
          <button class="key ghost" data-k="del">⌫</button>
          <button class="key" data-k="0">0</button>
          <button class="key ghost" data-k="clr">✕</button>
        </div>
        <div class="tools">
          <button class="btn ghost small" id="hint">${C.hintBtn}</button>
          <button class="btn ghost small" id="skip" hidden>${C.skipBtn}</button>
        </div>
      </div>
    </section>`);
  const slots = node.querySelector("#slots");
  const toast = node.querySelector("#toast");
  const hintBtn = node.querySelector("#hint");
  const skipBtn = node.querySelector("#skip");
  let locked = false;

  hintBtn.onclick = () => { node.querySelector("#hintbox").hidden = false; hintBtn.classList.remove("glow"); };
  skipBtn.onclick = () => onClear({ skipped: true, message: C.clear });

  node.querySelector("#pad").onclick = (e) => {
    const k = e.target.closest(".key")?.dataset.k;
    if (!k || locked) return;
    if (k === "del") entry = entry.slice(0, -1);
    else if (k === "clr") entry = "";
    else if (entry.length < C.code.length) entry += k;
    draw();
    if (entry.length === C.code.length) check();
  };

  function draw() {
    [...slots.children].forEach((s, i) => { s.textContent = entry[i] || ""; s.classList.toggle("filled", i < entry.length); });
  }
  function check() {
    locked = true;
    if (entry === C.code) {
      slots.classList.add("open");
      toast.textContent = "🔓";
      setTimeout(() => onClear({ message: C.clear }), 900);
      return;
    }
    fails++;
    slots.classList.add("shake");
    toast.textContent = C.wrong;
    if (fails >= C.hintAfterFails) hintBtn.classList.add("glow");
    if (fails >= C.skipAfterFails) skipBtn.hidden = false;
    setTimeout(() => { slots.classList.remove("shake"); entry = ""; draw(); locked = false; }, 600);
  }
  show(node);
}
