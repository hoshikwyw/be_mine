// Tiny dependency-free confetti. confetti(durationMs)
export function confetti(duration = 3500) {
  const cv = document.createElement("canvas");
  cv.className = "confetti";
  document.body.appendChild(cv);
  const ctx = cv.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const resize = () => { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener("resize", resize);

  const colors = ["#e0566e", "#f39aa9", "#ffd166", "#ffffff", "#ff7d95", "#c8f7dc"];
  const P = Array.from({ length: 160 }, () => ({
    x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.5,
    r: 4 + Math.random() * 5, c: colors[Math.floor(Math.random() * colors.length)],
    vx: -1.5 + Math.random() * 3, vy: 2 + Math.random() * 3,
    rot: Math.random() * Math.PI, vr: -0.1 + Math.random() * 0.2, heart: Math.random() < 0.3,
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of P) {
      p.x += p.vx + Math.sin(t / 300 + p.r) * 0.6; p.y += p.vy; p.rot += p.vr;
      if (p.y > innerHeight + 20) { p.y = -20; p.x = Math.random() * innerWidth; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c;
      if (p.heart) { ctx.font = `${p.r * 3}px serif`; ctx.fillText("💗", -p.r, p.r); }
      else ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2);
      ctx.restore();
    }
    if (t - t0 < duration) requestAnimationFrame(frame);
    else { cv.classList.add("fade"); setTimeout(() => { cv.remove(); removeEventListener("resize", resize); }, 800); }
  })(t0);
}
