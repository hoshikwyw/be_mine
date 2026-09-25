// In-page confirm dialog (replaces window.confirm). Returns a Promise<boolean>.
import { sfx } from "./sound.js";

export function confirmDialog(text, { ok = "OK", cancel = "Cancel" } = {}) {
  return new Promise((resolve) => {
    const wrap = document.createElement("div");
    wrap.className = "dlg-wrap";
    wrap.innerHTML = `
      <div class="dlg" role="dialog" aria-modal="true">
        <p class="dlg-text"></p>
        <div class="dlg-btns">
          <button class="btn ghost" data-r="0"></button>
          <button class="btn" data-r="1"></button>
        </div>
      </div>`;
    wrap.querySelector(".dlg-text").textContent = text;
    wrap.querySelector('[data-r="0"]').textContent = cancel;
    wrap.querySelector('[data-r="1"]').textContent = ok;
    const close = (r) => {
      wrap.classList.add("out");
      setTimeout(() => wrap.remove(), 200);
      resolve(r);
    };
    wrap.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-r]");
      if (b) close(b.dataset.r === "1");
      else if (e.target === wrap) close(false);
    });
    document.body.appendChild(wrap);
    sfx("open");
  });
}
