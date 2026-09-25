import { hearts as C } from "../content.js";
import { el, show } from "../app.js";
import { sfx, voice, jingle } from "../sound.js";
import { burst } from "../fx.js";

const EMOJI = ["💗", "💖", "💓", "💕", "🩷"];

export function hearts({ onClear }) {
  let fails = 0;

  function lobby(msg) {
    const node = el(`
      <section class="screen catch">
        <div class="card center">
          <p>${msg || C.intro}</p>
          <p class="muted">${C.target} 💗 · ${C.seconds}s</p>
          <div class="stack">
            <button class="btn" id="start">${fails ? C.retryBtn : C.startBtn}</button>
            <button class="btn ghost" id="skip" ${fails >= C.skipAfterFails ? "" : "hidden"}>${C.skipBtn}</button>
          </div>
        </div>
      </section>`);
    node.querySelector("#start").onclick = play;
    node.querySelector("#skip").onclick = () => onClear({ skipped: true, message: C.clear });
    show(node);
  }

  function play() {
    let score = 0, left = C.seconds, over = false;
    const node = el(`
      <section class="screen catch">
        <div class="hud"><span id="score">0 / ${C.target}</span><span id="time">${left}s</span></div>
        <div class="harea" id="area"></div>
      </section>`);
    const area = node.querySelector("#area");
    const scoreEl = node.querySelector("#score");
    const timeEl = node.querySelector("#time");
    show(node);
    voice("ready"); voice("go", 900);

    const timer = setInterval(() => {
      left--; timeEl.textContent = `${left}s`;
      if (left <= 0) end(false);
    }, 1000);

    const spawner = setInterval(spawn, 620);

    function spawn() {
      if (over) return;
      const h = document.createElement("button");
      h.className = "heart";
      h.textContent = EMOJI[Math.floor(Math.random() * EMOJI.length)];
      const size = 30 + Math.random() * 22;
      h.style.fontSize = size + "px";
      h.style.left = Math.random() * (area.clientWidth - size - 8) + 4 + "px";
      h.style.animationDuration = 2.4 + Math.random() * 1.4 + "s";
      h.style.setProperty("--fall", area.clientHeight + 100 + "px");
      const catchIt = (e) => {
        e.preventDefault();
        if (over || h.classList.contains("caught")) return;
        h.classList.add("caught");
        sfx("catch"); burst({ x: e.clientX, y: e.clientY }, { count: 4, spread: 45, emojis: ["✨", "💖"] });
        score++; scoreEl.textContent = `${score} / ${C.target}`;
        setTimeout(() => h.remove(), 250);
        if (score >= C.target) end(true);
      };
      h.addEventListener("pointerdown", catchIt);
      h.addEventListener("animationend", () => h.remove());
      area.appendChild(h);
    }

    function end(won) {
      if (over) return;
      over = true; clearInterval(timer); clearInterval(spawner);
      if (won) { jingle("complete"); setTimeout(() => onClear({ message: C.clear }), 700); }
      else { fails++; voice("timeover"); setTimeout(() => lobby(C.timeUp), 500); }
    }
  }

  lobby();
}
