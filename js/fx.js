// Cute visual effects: emoji bursts, floating hearts background, heart rain.
const HEARTS = ["💗", "💖", "💓", "💕", "🩷", "✨"];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];

function layer() {
  let l = document.getElementById("fx");
  if (!l) { l = document.createElement("div"); l.id = "fx"; document.body.appendChild(l); }
  return l;
}

// Burst of emoji flying out from a point (px, page coords) or from an element's center.
export function burst(target, { count = 10, emojis = HEARTS, spread = 90 } = {}) {
  let x, y;
  if (target instanceof Element) { const r = target.getBoundingClientRect(); x = r.left + r.width / 2; y = r.top + r.height / 2; }
  else ({ x, y } = target);
  const l = layer();
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "fx-burst"; s.textContent = pick(emojis);
    const a = rnd(0, Math.PI * 2), d = rnd(spread * 0.4, spread);
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d - 30 + "px");
    s.style.setProperty("--r", rnd(-60, 60) + "deg");
    s.style.setProperty("--s", rnd(0.7, 1.3));
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.animationDuration = rnd(0.6, 1.0) + "s";
    s.addEventListener("animationend", () => s.remove());
    l.appendChild(s);
  }
}

// Gentle hearts rising from the bottom while a screen is shown.
let floatTimer = null;
export function floatHearts({ every = 700, big = false } = {}) {
  stopFloat();
  const l = layer();
  const spawn = () => {
    const s = document.createElement("span");
    s.className = "fx-float"; s.textContent = pick(HEARTS);
    s.style.left = rnd(2, 96) + "vw";
    s.style.fontSize = rnd(big ? 22 : 14, big ? 40 : 26) + "px";
    s.style.animationDuration = rnd(5, 9) + "s";
    s.style.setProperty("--sway", rnd(-40, 40) + "px");
    s.addEventListener("animationend", () => s.remove());
    l.appendChild(s);
  };
  spawn(); floatTimer = setInterval(spawn, every);
}
export function stopFloat() { if (floatTimer) { clearInterval(floatTimer); floatTimer = null; } }

// Heart rain from the top for a few seconds (the "yes" moment).
export function heartRain(duration = 5000) {
  const l = layer(); const t0 = Date.now();
  const iv = setInterval(() => {
    if (Date.now() - t0 > duration) return clearInterval(iv);
    for (let i = 0; i < 2; i++) {
      const s = document.createElement("span");
      s.className = "fx-rain"; s.textContent = pick(HEARTS);
      s.style.left = rnd(0, 98) + "vw"; s.style.fontSize = rnd(18, 42) + "px";
      s.style.animationDuration = rnd(2.2, 4) + "s";
      s.style.setProperty("--sway", rnd(-60, 60) + "px");
      s.addEventListener("animationend", () => s.remove());
      l.appendChild(s);
    }
  }, 120);
}
