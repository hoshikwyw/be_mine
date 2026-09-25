import { jigsaw as C } from "../content.js";
import { el, show } from "../app.js";
import { sfx, jingle } from "../sound.js";
import { burst } from "../fx.js";

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function jigsaw({ onClear }) {
  const N = C.size, total = N * N;
  let order;                                   // order[position] = tile index that sits there
  do { order = shuffle([...Array(total).keys()]); } while (order.every((t, p) => t === p));
  let selected = null, moves = 0, skippedFlag = false;

  const node = el(`
    <section class="screen jigsaw">
      <div class="card">
        <p>${C.intro}</p>
        <div class="jboard" id="board" style="--n:${N}">
          <div class="jfull" id="full" style="background-image:url('${C.image}')"></div>
        </div>
        <div class="tools">
          <button class="btn ghost small" id="hint">${C.hintBtn}</button>
          <button class="btn ghost small" id="skip" hidden>${C.skipBtn}</button>
        </div>
      </div>
    </section>`);
  const board = node.querySelector("#board");
  const full = node.querySelector("#full");
  const skipBtn = node.querySelector("#skip");

  node.querySelector("#hint").onclick = () => { full.classList.add("on"); setTimeout(() => full.classList.remove("on"), 1800); };
  skipBtn.onclick = () => { skippedFlag = true; solve(); };

  const tiles = [];
  for (let p = 0; p < total; p++) {
    const t = el(`<button class="jtile" style="background-image:url('${C.image}')"></button>`);
    t.onclick = () => tap(p);
    tiles.push(t); board.appendChild(t);
  }
  render();
  show(node);

  function render() {
    order.forEach((tileIdx, p) => {
      const t = tiles[p];
      const x = tileIdx % N, y = Math.floor(tileIdx / N);
      t.style.backgroundPosition = `${(x / (N - 1)) * 100}% ${(y / (N - 1)) * 100}%`;
      t.classList.toggle("selected", p === selected);
      t.classList.toggle("placed", tileIdx === p);
    });
  }
  function tap(p) {
    if (selected === null) { selected = p; render(); return; }
    if (selected === p) { selected = null; render(); return; }
    [order[selected], order[p]] = [order[p], order[selected]];
    selected = null; moves++;
    render();
    if (moves >= C.skipAfterMoves) skipBtn.hidden = false;
    if (order.every((t, i) => t === i)) solve();
  }
  function solve() {
    order = [...Array(total).keys()]; selected = null; render();
    board.classList.add("solved");
    jingle("complete"); burst(board, { count: 16, spread: 160 });
    setTimeout(() => onClear({ skipped: skippedFlag, message: C.clear }), 1200);
  }
}
