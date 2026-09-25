import { memory as C } from "../content.js";
import { el, show } from "../app.js";

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

export function memory({ onClear }) {
  const deck = shuffle(C.cards.flatMap((c) => [{ ...c, key: c.id + "-a" }, { ...c, key: c.id + "-b" }]));
  let open = [], matched = 0, moves = 0, locked = false;

  const node = el(`
    <section class="screen memory">
      <div class="card">
        <p class="muted center" id="status">0 / ${C.cards.length}</p>
        <div class="mgrid" id="grid"></div>
      </div>
    </section>`);
  const grid = node.querySelector("#grid");
  const status = node.querySelector("#status");

  for (const c of deck) {
    const card = el(`
      <button class="mcard" aria-label="card">
        <div class="inner">
          <div class="face front">💗</div>
          <div class="face back"><img src="${c.src}" alt="${c.label}" draggable="false"></div>
        </div>
      </button>`);
    card.onclick = () => flip(card, c);
    grid.appendChild(card);
  }
  show(node);

  function flip(card, c) {
    if (locked || card.classList.contains("flipped") || card.classList.contains("matched")) return;
    card.classList.add("flipped");
    open.push({ card, c });
    if (open.length < 2) return;
    moves++;
    locked = true;
    const [a, b] = open;
    if (a.c.id === b.c.id) {
      matched++;
      status.textContent = `${matched} / ${C.cards.length}`;
      setTimeout(() => {
        a.card.classList.add("matched"); b.card.classList.add("matched");
        open = []; locked = false;
        if (matched === C.cards.length) setTimeout(() => onClear({ message: C.clear }), 600);
      }, 350);
    } else {
      setTimeout(() => {
        a.card.classList.remove("flipped"); b.card.classList.remove("flipped");
        open = []; locked = false;
      }, 800);
    }
  }
}
