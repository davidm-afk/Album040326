/* ============ Pestañas ============ */
$$(".tab").forEach((t) =>
  t.addEventListener("click", () => {
    $$(".tab").forEach((x) => x.classList.toggle("active", x === t));
    $$(".game-panel").forEach((p) => p.classList.toggle("active", p.id === "game-" + t.dataset.game));
    if (t.dataset.game === "catch") Catch.resize();
  })
);

const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* ============ 1. Memoria (con vuestras fotos) ============ */
(function memory() {
  const grid = $("#memory-grid"), movesEl = $("#mem-moves"), pairsEl = $("#mem-pairs");
  const PAIRS = 8;
  let first = null, lock = false, moves = 0, found = 0;

  function deal() {
    // Usa fotos al azar; si hay menos de 8, completa con índices de relleno
    const pool = shuffle(ALL_PHOTOS.map((p, i) => ({ src: p.foto, seed: i })));
    while (pool.length < PAIRS) pool.push({ src: "", seed: pool.length });
    const chosen = pool.slice(0, PAIRS);
    const cards = shuffle([...chosen, ...chosen].map((c, k) => ({ ...c, key: c.seed, k })));
    grid.innerHTML = "";
    first = null; lock = false; moves = 0; found = 0;
    movesEl.textContent = 0; pairsEl.textContent = `0/${PAIRS}`;
    cards.forEach((c) => {
      const el = document.createElement("div");
      el.className = "mcard";
      el.dataset.key = c.key;
      el.innerHTML = `<div class="mface mfront">💝</div><div class="mface mback"></div>`;
      $(".mback", el).appendChild(makeMedia(c.src, c.seed));
      el.addEventListener("click", () => flip(el));
      grid.appendChild(el);
    });
  }

  function flip(el) {
    if (lock || el === first || el.classList.contains("done")) return;
    el.classList.add("flip");
    if (!first) { first = el; return; }
    moves++; movesEl.textContent = moves;
    if (first.dataset.key === el.dataset.key) {
      first.classList.add("done"); el.classList.add("done");
      found++; pairsEl.textContent = `${found}/${PAIRS}`;
      const r = el.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 10);
      first = null;
      if (found === PAIRS) setTimeout(() => {
        burst(innerWidth / 2, innerHeight / 2, 50);
        movesEl.textContent = `${moves} 🎉 ¡Lo lograste!`;
      }, 600);
    } else {
      lock = true;
      const a = first; first = null;
      setTimeout(() => { a.classList.remove("flip"); el.classList.remove("flip"); lock = false; }, 900);
    }
  }

  $("#mem-reset").addEventListener("click", deal);
  deal();
})();

/* ============ 2. Quiz ============ */
(function quiz() {
  const box = $("#quiz"), Q = ALBUM.quiz;
  let i = 0, score = 0;

  function render() {
    if (i >= Q.length) return result();
    const q = Q[i];
    box.innerHTML = `
      <div class="quiz-progress"><div style="width:${(i / Q.length) * 100}%"></div></div>
      <p style="color:var(--muted);font-size:.85rem;margin-bottom:.5rem">Pregunta ${i + 1} de ${Q.length}</p>
      <h3 class="quiz-q">${q.pregunta}</h3>
      <div class="quiz-opts">${q.opciones.map((o, k) => `<button class="quiz-opt" data-k="${k}">${o}</button>`).join("")}</div>`;
    $$(".quiz-opt", box).forEach((b) => b.addEventListener("click", (e) => answer(+b.dataset.k, b, e)));
  }

  function answer(k, btn, e) {
    const q = Q[i];
    $$(".quiz-opt", box).forEach((b) => (b.disabled = true));
    if (k === q.correcta) { score++; btn.classList.add("ok"); burst(e.clientX, e.clientY, 12); }
    else { btn.classList.add("bad"); $$(".quiz-opt", box)[q.correcta].classList.add("ok"); }
    setTimeout(() => { i++; render(); }, 1200);
  }

  function result() {
    const pct = score / Q.length;
    const [emoji, title, msg] =
      pct === 1 ? ["🏆", "¡Perfecto!", "Me conoces mejor que nadie. Te mereces un premio (pídemelo 😏)."] :
      pct >= 0.6 ? ["🥰", "¡Muy bien!", "Casi perfecto… lo que falla lo repasamos juntos."] :
      ["🙈", "Uy…", "Vale, tendremos que pasar más tiempo juntos para que me conozcas mejor 😜"];
    box.innerHTML = `
      <div class="quiz-result">
        <div class="big">${emoji}</div>
        <h3>${title}</h3>
        <p>Acertaste ${score} de ${Q.length}. ${msg}</p>
        <button class="btn" id="quiz-again">Jugar otra vez</button>
      </div>`;
    if (pct >= 0.6) burst(innerWidth / 2, innerHeight / 2, 40);
    $("#quiz-again").onclick = () => { i = 0; score = 0; render(); };
  }

  render();
})();

/* ============ 3. Atrapa corazones ============ */
const Catch = (function () {
  const cv = $("#catch-canvas"), ctx = cv.getContext("2d"), overlay = $("#catch-overlay");
  const scoreEl = $("#catch-score"), timeEl = $("#catch-time"), startBtn = $("#catch-start");
  const DPR = devicePixelRatio || 1;
  let W = 0, H = 0, basket = { x: 0, w: 90 }, items = [], parts = [], score = 0, time = 30, running = false, last = 0, spawnT = 0, timer;

  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    basket.x = basket.x || W / 2;
    basket.w = Math.max(70, W * 0.14);
    draw();
  }
  addEventListener("resize", resize);

  const move = (clientX) => { const r = cv.getBoundingClientRect(); basket.x = Math.min(W - basket.w / 2, Math.max(basket.w / 2, clientX - r.left)); };
  cv.addEventListener("pointermove", (e) => move(e.clientX));
  cv.addEventListener("touchmove", (e) => { e.preventDefault(); move(e.touches[0].clientX); }, { passive: false });

  function spawn() {
    const r = Math.random();
    const type = r < 0.15 ? "bad" : r < 0.25 ? "gold" : "good";
    items.push({ x: 20 + Math.random() * (W - 40), y: -30, v: 120 + Math.random() * 120 + (30 - time) * 6, s: type === "gold" ? 30 : 26, type, a: Math.random() * 6 });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    // Cesta
    const by = H - 34, bw = basket.w;
    const g = ctx.createLinearGradient(basket.x - bw / 2, 0, basket.x + bw / 2, 0);
    g.addColorStop(0, "#ff6b9d"); g.addColorStop(1, "#c89bff");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(basket.x - bw / 2, by);
    ctx.lineTo(basket.x + bw / 2, by);
    ctx.lineTo(basket.x + bw / 2 - 12, by + 26);
    ctx.lineTo(basket.x - bw / 2 + 12, by + 26);
    ctx.closePath(); ctx.fill();
    ctx.font = "18px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🧺", basket.x, by + 13);
    // Objetos
    for (const it of items) {
      ctx.font = `${it.s}px serif`;
      ctx.fillText(it.type === "bad" ? "💔" : it.type === "gold" ? "💖" : "❤️", it.x + Math.sin(it.a) * 6, it.y);
    }
    // Partículas
    for (const p of parts) {
      ctx.globalAlpha = Math.max(0, p.l);
      ctx.font = "16px Poppins"; ctx.fillStyle = p.c;
      ctx.fillText(p.t, p.x, p.y);
    }
    ctx.globalAlpha = 1;
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    spawnT -= dt;
    if (spawnT <= 0) { spawn(); spawnT = Math.max(0.28, 0.75 - (30 - time) * 0.015); }
    const by = H - 34;
    items = items.filter((it) => {
      it.y += it.v * dt; it.a += dt * 4;
      if (it.y > by - 6 && it.y < by + 20 && Math.abs(it.x - basket.x) < basket.w / 2 + 6) {
        const pts = it.type === "bad" ? -3 : it.type === "gold" ? 3 : 1;
        score = Math.max(0, score + pts);
        scoreEl.textContent = score;
        parts.push({ x: it.x, y: by - 20, l: 1, t: (pts > 0 ? "+" : "") + pts, c: pts > 0 ? "#ff8fab" : "#ff5064" });
        return false;
      }
      return it.y < H + 40;
    });
    parts = parts.filter((p) => { p.y -= 40 * dt; p.l -= dt * 1.4; return p.l > 0; });
    draw();
    requestAnimationFrame(loop);
  }

  function end() {
    running = false; clearInterval(timer);
    items = []; draw();
    const msg = score >= 40 ? "¡Eres una máquina del amor! 😍" : score >= 20 ? "¡Muy bien! Todo mi corazón es tuyo 💘" : "¡Todos mis corazones son tuyos igualmente! 💕";
    overlay.innerHTML = `<div><h3>${score} puntos</h3><p>${msg}</p></div>`;
    overlay.classList.remove("hide");
    startBtn.textContent = "Otra vez";
    if (score >= 20) { const r = cv.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 40); }
  }

  startBtn.addEventListener("click", () => {
    resize();
    score = 0; time = 30; items = []; parts = [];
    scoreEl.textContent = 0; timeEl.textContent = 30;
    overlay.classList.add("hide");
    running = true; last = performance.now(); spawnT = 0;
    clearInterval(timer);
    timer = setInterval(() => { time--; timeEl.textContent = time; if (time <= 0) end(); }, 1000);
    requestAnimationFrame(loop);
  });

  return { resize };
})();
