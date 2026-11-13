/* =====================================================================
   MINIJUEGOS
   ===================================================================== */
const Games = {};
$$(".tab").forEach((t) => t.addEventListener("click", () => {
  $$(".tab").forEach((x) => x.classList.toggle("active", x === t));
  $$(".game-panel").forEach((p) => p.classList.toggle("active", p.id === "game-" + t.dataset.game));
  if (t.dataset.game === "catch") Games.catch.resize();
}));

/* =====================================================================
   QUIZ (sirve para el de fotos y el de "¿cuánto me conoces?")
   ===================================================================== */
function QuizGame(root, cfg) {
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  let Q = [], i = 0, score = 0, streak = 0, best = 0, log = [], timer = null, tStart = 0, answered = false, roundName = "";

  function intro() {
    const rec = store.get("quiz:" + cfg.id, 0);
    root.innerHTML = `
      <div class="qz-intro">
        <div class="qz-icon">${cfg.icon}</div>
        <h3>${cfg.title}</h3>
        <p>${cfg.desc}</p>
        <ul class="qz-rules"><li>⏱ ${cfg.time} s por pregunta</li><li>⚡ Más rápido = más puntos</li><li>🔥 Racha de aciertos = multiplicador</li></ul>
        <button class="btn" data-go>¡Empezar!</button>
        ${rec ? `<p class="game-record">🏆 Récord: ${rec.toLocaleString("es-MX")} puntos</p>` : ""}
      </div>`;
    $("[data-go]", root).onclick = () => start(cfg.questions(), cfg.title);
  }

  function start(questions, name) {
    Q = questions; i = 0; score = 0; streak = 0; best = 0; log = []; roundName = name;
    if (!Q.length) { root.innerHTML = `<p class="empty">No hay preguntas todavía. Agrégalas en <b>datos/album.js</b> ✏️</p>`; return; }
    render();
  }

  function header() {
    return `
      <div class="qz-top">
        <div class="qz-dots">${Q.map((_, k) => `<i class="${k < i ? (log[k]?.ok ? "ok" : "bad") : k === i ? "cur" : ""}"></i>`).join("")}</div>
        <div class="qz-score"><span class="qz-streak ${streak >= 2 ? "on" : ""}">🔥 x${streak}</span><b id="qz-points">${score.toLocaleString("es-MX")}</b> pts</div>
      </div>`;
  }

  function render() {
    if (i >= Q.length) return results();
    answered = false;
    const q = Q[i];
    const hasPhoto = "foto" in q || q.item;
    const it = q.item || (hasPhoto ? getItem(q.foto, i + 3) : null);
    const isDate = q.tipo === "fecha";
    root.innerHTML = `
      ${header()}
      <div class="qz-body ${hasPhoto ? "with-photo" : ""}">
        ${hasPhoto ? `
        <div class="qz-photo fx-${q.efecto || "none"}">
          <div class="qz-frame"></div>
          ${q.efecto === "piezas" ? `<div class="qz-tiles">${Array.from({ length: 36 }, (_, k) => `<i style="--h:${(k * 37) % 360}"></i>`).join("")}</div>` : ""}
          <svg class="qz-timer" viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="qz-ring" cx="22" cy="22" r="19"/></svg>
          <span class="qz-time" id="qz-time">${cfg.time}</span>
        </div>` : `<div class="qz-timebar"><div id="qz-tbar"></div></div>`}
        <div class="qz-side">
          <p class="qz-n">Pregunta ${i + 1} de ${Q.length}</p>
          <h3 class="qz-q">${esc(q.pregunta)}</h3>
          ${isDate ? dateUI(q) : `<div class="qz-opts">${q.opciones.map((o, k) => `<button class="qz-opt" data-k="${k}" style="--d:${k * .07}s"><b>${LETTERS[k]}</b><span>${esc(o)}</span></button>`).join("")}</div>`}
          <div class="qz-feedback" id="qz-feedback"></div>
        </div>
      </div>`;
    if (hasPhoto) {
      const frame = $(".qz-frame", root);
      frame.appendChild(makeMedia(it));
      // Punto de enfoque aleatorio para el zoom
      frame.style.setProperty("--fx", 25 + Math.random() * 50 + "%");
      frame.style.setProperty("--fy", 25 + Math.random() * 50 + "%");
      frame.style.setProperty("--dur", cfg.time * 0.8 + "s");
      requestAnimationFrame(() => requestAnimationFrame(() => $(".qz-photo", root).classList.add("go")));
      if (q.efecto === "piezas") {
        const tiles = shuffle($$(".qz-tiles i", root));
        tiles.forEach((t, k) => (t.style.transitionDelay = (k / tiles.length) * cfg.time * 0.8 + "s"));
      }
    }
    if (isDate) bindDate(q);
    else $$(".qz-opt", root).forEach((b) => b.addEventListener("click", () => answer(+b.dataset.k, b)));
    startTimer();
  }

  /* ---- Pregunta de fecha: barra deslizante ---- */
  function dateUI(q) {
    const min = parseDate(ALBUM.fechaInicio), ans = parseDate(q.respuesta);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const max = new Date(Math.max(today, ans ? +ans + 30 * 864e5 : 0));
    const span = Math.round((max - min) / 864e5);
    const startVal = Math.round(span / 2);
    q._min = min; q._span = span;
    return `
      <div class="qz-date">
        <div class="qz-date-label" id="qz-dlabel">${fmtLong(new Date(+min + startVal * 864e5))}</div>
        <input type="range" id="qz-range" min="0" max="${span}" value="${startVal}" />
        <div class="qz-date-ends"><span>${fmtDate(min)}</span><span>${fmtDate(max)}</span></div>
        <div class="qz-date-btns">
          <button class="round-btn" data-step="-7">−7</button><button class="round-btn" data-step="-1">−1</button>
          <button class="btn" id="qz-confirm">Confirmar 📅</button>
          <button class="round-btn" data-step="1">+1</button><button class="round-btn" data-step="7">+7</button>
        </div>
      </div>`;
  }
  function bindDate(q) {
    const r = $("#qz-range", root), lab = $("#qz-dlabel", root);
    const upd = () => { lab.textContent = fmtLong(new Date(+q._min + +r.value * 864e5)); lab.classList.remove("tick"); void lab.offsetWidth; lab.classList.add("tick"); };
    r.addEventListener("input", upd);
    $$("[data-step]", root).forEach((b) => b.addEventListener("click", () => { r.value = Math.max(0, Math.min(q._span, +r.value + +b.dataset.step)); upd(); }));
    $("#qz-confirm", root).addEventListener("click", () => answer(+r.value));
  }

  function startTimer() {
    clearInterval(timer);
    tStart = performance.now();
    const ring = $(".qz-ring", root), tEl = $("#qz-time", root), bar = $("#qz-tbar", root);
    timer = setInterval(() => {
      const left = Math.max(0, cfg.time - (performance.now() - tStart) / 1000);
      const p = left / cfg.time;
      if (ring) ring.style.strokeDashoffset = 119.4 * (1 - p);
      if (tEl) { tEl.textContent = Math.ceil(left); tEl.classList.toggle("hurry", left < 5); }
      if (bar) { bar.style.transform = `scaleX(${p})`; bar.classList.toggle("hurry", left < 5); }
      if (left <= 0) { clearInterval(timer); answer(null); }
    }, 100);
  }

  function answer(k, btn) {
    if (answered) return;
    answered = true;
    clearInterval(timer);
    const q = Q[i];
    const elapsed = (performance.now() - tStart) / 1000;
    const speed = Math.max(0, 1 - elapsed / cfg.time);
    const photo = $(".qz-photo", root);
    if (photo) photo.classList.add("revealed");
    let ok = false, pts = 0, msg = "";

    if (q.tipo === "fecha") {
      const ans = parseDate(q.respuesta);
      $$("#qz-range, [data-step], #qz-confirm", root).forEach((e) => (e.disabled = true));
      if (k === null) { msg = `⏰ ¡Se acabó el tiempo! Era el <b>${fmtDate(ans)}</b>.`; }
      else {
        const pick = new Date(+q._min + k * 864e5), d = Math.abs(Math.round((pick - ans) / 864e5));
        ok = d <= 7;
        const base = d === 0 ? 200 : d <= 3 ? 150 : d <= 7 ? 100 : d <= 30 ? 40 : 0;
        pts = base ? Math.round((base + 50 * speed) * mult(ok)) : 0;
        // La barra se desliza sola hasta la fecha correcta
        const r = $("#qz-range", root), lab = $("#qz-dlabel", root), target = Math.round((ans - q._min) / 864e5), from = k, t0 = performance.now();
        if (d) {
          const step = (t) => {
            const p = Math.min(1, (t - t0 - 350) / 900), e = 1 - Math.pow(1 - Math.max(0, p), 3);
            r.value = from + (target - from) * e;
            lab.textContent = fmtLong(new Date(+q._min + Math.round(+r.value) * 864e5));
            if (p < 1) requestAnimationFrame(step); else lab.classList.add("right");
          };
          requestAnimationFrame(step);
        } else lab.classList.add("right");
        msg = d === 0 ? `🎯 <b>¡EXACTO!</b> Fue el ${fmtDate(ans)}.` : `Fue el <b>${fmtDate(ans)}</b>. Te fallaste por ${d} día${d === 1 ? "" : "s"} ${d <= 3 ? "¡casi! 😮" : d <= 7 ? "😊" : "🙈"}`;
      }
    } else {
      const opts = $$(".qz-opt", root);
      opts.forEach((o) => (o.disabled = true));
      ok = k === q.correcta;
      opts[q.correcta]?.classList.add("ok");
      if (!ok && btn) btn.classList.add("bad");
      if (ok) { pts = Math.round((100 + 100 * speed) * mult(true)); msg = ["¡Correcto! 🎉", "¡Eso! 💖", "¡Me conoces! 🥰", "¡Bien! ✨"][Math.floor(Math.random() * 4)]; }
      else msg = k === null ? "⏰ ¡Se acabó el tiempo!" : ["Nooo 🙈", "Casi… 😅", "¡Error! 😜"][Math.floor(Math.random() * 3)];
    }
    streak = ok ? streak + 1 : 0;
    best = Math.max(best, streak);
    score += pts;
    log.push({ q, ok, pts });

    buzz(ok ? 35 : [50, 40, 50]);
    if (ok) { const el = btn || $(".qz-date-label", root) || root; burstAt(el, 14); }
    else root.querySelector(".qz-body")?.classList.add("shake-soft");
    animatePoints(score - pts, score);
    const st = $(".qz-streak", root); st.textContent = "🔥 x" + streak; st.classList.toggle("on", streak >= 2);

    const fb = $("#qz-feedback", root);
    fb.innerHTML = `
      <div class="qz-msg ${ok ? "ok" : "bad"}">${msg}${pts ? ` <span class="qz-pts">+${pts}</span>` : ""}</div>
      ${q.comentario ? `<div class="qz-bubble">💬 ${esc(q.comentario)}</div>` : ""}
      <button class="btn" id="qz-next">${i === Q.length - 1 ? "Ver resultado 🏁" : "Siguiente →"}</button>`;
    fb.classList.add("show");
    // En celular la respuesta queda abajo: la acercamos a la vista
    setTimeout(() => {
      const r = fb.getBoundingClientRect(), extra = r.bottom - (innerHeight - 24);
      if (extra > 0) scrollBy({ top: extra, behavior: "smooth" });
    }, 200);
    $("#qz-next", root).onclick = () => { i++; render(); root.closest(".game-panel").scrollIntoView({ behavior: "smooth", block: "start" }); };
  }
  const mult = (ok) => (ok ? 1 + 0.25 * Math.min(streak, 4) : 1);

  function animatePoints(from, to) {
    const el = $("#qz-points", root); if (!el) return;
    const t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 700); el.textContent = Math.round(from + (to - from) * p).toLocaleString("es-MX"); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    el.parentElement.classList.remove("pop"); void el.offsetWidth; el.parentElement.classList.add("pop");
  }

  function results() {
    const right = log.filter((l) => l.ok).length, pct = right / Q.length;
    const stars = pct >= .9 ? 3 : pct >= .6 ? 2 : pct > 0 ? 1 : 0;
    const prev = store.get("quiz:" + cfg.id, 0), record = score > prev;
    if (record) store.set("quiz:" + cfg.id, score);
    const [title, msg] = pct === 1 ? ["¡PERFECTO! 🏆", "Me conoces mejor que nadie. Te ganaste un premio (pídemelo 😏)."]
      : pct >= .6 ? ["¡Muy bien! 🥰", "Casi perfecto… lo que fallaste lo repasamos juntos."]
      : pct > 0 ? ["Uy… 🙈", "Vamos a tener que pasar más tiempo juntos para que me conozcas mejor 😜"]
      : ["¿Neta? 😂", "Cero de cero. Te perdono porque te quiero."];
    const canBonus = cfg.bonus && bonusQuestions().length >= 3;
    root.innerHTML = `
      <div class="qz-result">
        <div class="qz-stars">${[0, 1, 2].map((s) => `<span class="${s < stars ? "on" : ""}" style="--d:${.3 + s * .25}s">★</span>`).join("")}</div>
        <h3>${title}</h3>
        <div class="qz-final"><b id="qz-final">0</b> puntos</div>
        ${record && score ? `<div class="qz-record">🏆 ¡Nuevo récord!</div>` : prev ? `<p class="game-record">Récord: ${prev.toLocaleString("es-MX")}</p>` : ""}
        <p>${right} de ${Q.length} correctas · mejor racha 🔥${best}. ${msg}</p>
        <div class="qz-recap">${log.map((l, k) => `<div class="${l.ok ? "ok" : "bad"}"><span>${l.ok ? "✓" : "✗"}</span>${esc(l.q.pregunta)}<em>${l.pts ? "+" + l.pts : ""}</em></div>`).join("")}</div>
        <div class="qz-actions">
          <button class="btn" data-again>Jugar otra vez</button>
          ${canBonus ? `<button class="btn btn-alt" data-bonus>🎲 Ronda sorpresa</button>` : ""}
        </div>
        ${canBonus ? `<p class="game-record">La ronda sorpresa elige fotos al azar del álbum: ¿de qué mes son?</p>` : ""}
      </div>`;
    const el = $("#qz-final", root), t0 = performance.now();
    const step = (t) => { const p = Math.min(1, (t - t0) / 1400); el.textContent = Math.round(score * (1 - Math.pow(1 - p, 3))).toLocaleString("es-MX"); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
    if (pct >= .6) { setTimeout(() => burstAt($(".qz-stars", root), 40), 900); if (pct === 1) FX.fireworks(3000); }
    $("[data-again]", root).onclick = () => start(cfg.questions(), roundName);
    const b = $("[data-bonus]", root); if (b) b.onclick = () => start(bonusQuestions(), "Ronda sorpresa");
  }

  intro();
  return { start };
}

// Preguntas automáticas: "¿De qué mes es esta foto?" usando las fotos del álbum
function bonusQuestions() {
  if (DEMO || MONTHS.length < 2) return [];
  const efectos = ["zoom", "borrosa", "piezas", ""];
  return shuffle(ALL_IMAGES).slice(0, 6).map((it, k) => {
    const right = MONTHS.find((m) => m.key === it.mesKey);
    const others = shuffle(MONTHS.filter((m) => m !== right)).slice(0, 3);
    const opts = shuffle([right, ...others]);
    return {
      item: it, foto: it.key,
      pregunta: ["¿De qué mes es esta foto?", "¿Cuándo fue esto?", "¿En qué capítulo pasó esto?"][k % 3],
      opciones: opts.map((m) => `${m.emoji} ${m.nombre} ${m.year}`),
      correcta: opts.indexOf(right),
      efecto: efectos[k % efectos.length],
      comentario: it.titulo ? `Era: "${it.titulo}"${it.fecha ? ` (${fmtDate(it.fecha)})` : ""}` : it.fecha ? `Fue el ${fmtDate(it.fecha)}` : "",
    };
  });
}

Games.fotoquiz = QuizGame($("#fotoquiz"), {
  id: "fotos", icon: "📸", time: 25, bonus: true,
  title: "Quiz de fotos",
  desc: "Te enseño una foto y tú me dices dónde fue, qué comimos, quién hizo drama… Algunas fotos empiezan muy de cerca o borrosas: entre más rápido adivines, más puntos.",
  questions: () => ALBUM.quizFotos || [],
});
Games.quiz = QuizGame($("#quiz"), {
  id: "conoces", icon: "💭", time: 20,
  title: "¿Cuánto me conoces?",
  desc: "Preguntas sobre mí, sobre nosotros y sobre cosas que solo tú deberías saber.",
  questions: () => ALBUM.quiz || [],
});

/* =====================================================================
   MEMORIA con nuestras fotos
   ===================================================================== */
Games.memory = (function memory() {
  const grid = $("#memory-grid"), movesEl = $("#mem-moves"), pairsEl = $("#mem-pairs"), timeEl = $("#mem-time"), recEl = $("#mem-record");
  const PAIRS = 8;
  let first = null, lock = false, moves = 0, found = 0, t0 = 0, timer = null;
  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const showRec = () => { const r = store.get("memory", null); recEl.textContent = r ? `🏆 Récord: ${r.moves} movimientos en ${fmt(r.time)}` : ""; };

  function deal() {
    let pool = shuffle(ALL_IMAGES).slice(0, PAIRS).map((it, k) => ({ it, key: it.key || "p" + k }));
    for (let k = pool.length; k < PAIRS; k++) pool.push({ it: { tipo: "ph", seed: k * 3 + 1 }, key: "ph" + k });
    const cards = shuffle([...pool, ...pool]);
    grid.innerHTML = "";
    first = null; lock = false; moves = 0; found = 0; t0 = 0;
    clearInterval(timer); timeEl.textContent = "0:00";
    movesEl.textContent = 0; pairsEl.textContent = `0/${PAIRS}`;
    cards.forEach((c, k) => {
      const el = document.createElement("button");
      el.className = "mcard";
      el.dataset.key = c.key;
      el.style.setProperty("--d", k * .03 + "s");
      el.innerHTML = `<div class="mface mfront"><span>💝</span></div><div class="mface mback"></div>`;
      $(".mback", el).appendChild(makeMedia({ ...c.it, src: c.it.thumb || c.it.src }));
      el.addEventListener("click", () => flip(el));
      grid.appendChild(el);
    });
    showRec();
  }

  function flip(el) {
    if (lock || el === first || el.classList.contains("done")) return;
    if (!t0) { t0 = Date.now(); timer = setInterval(() => (timeEl.textContent = fmt(Math.floor((Date.now() - t0) / 1000))), 500); }
    el.classList.add("flip");
    if (!first) { first = el; return; }
    moves++; movesEl.textContent = moves;
    if (first.dataset.key === el.dataset.key) {
      first.classList.add("done"); el.classList.add("done");
      found++; pairsEl.textContent = `${found}/${PAIRS}`;
      burstAt(el, 8); buzz(25);
      first = null;
      if (found === PAIRS) {
        clearInterval(timer);
        const time = Math.floor((Date.now() - t0) / 1000), r = store.get("memory", null);
        const rec = !r || moves < r.moves || (moves === r.moves && time < r.time);
        if (rec) store.set("memory", { moves, time });
        setTimeout(() => {
          FX.fireworks(2500);
          recEl.innerHTML = `🎉 ¡Lo lograste en <b>${moves}</b> movimientos y <b>${fmt(time)}</b>!${rec ? " ¡Nuevo récord! 🏆" : ""}`;
        }, 500);
      }
    } else {
      lock = true;
      const a = first; first = null;
      setTimeout(() => { a.classList.add("nope"); el.classList.add("nope"); }, 400);
      setTimeout(() => { a.classList.remove("flip", "nope"); el.classList.remove("flip", "nope"); lock = false; }, 950);
    }
  }
  $("#mem-reset").addEventListener("click", deal);
  deal();
  return { deal };
})();

/* =====================================================================
   ATRAPA CORAZONES
   ===================================================================== */
Games.catch = (function () {
  const cv = $("#catch-canvas"), ctx = cv.getContext("2d"), overlay = $("#catch-overlay");
  const scoreEl = $("#catch-score"), timeEl = $("#catch-time"), startBtn = $("#catch-start"), recEl = $("#catch-record");
  const DPR = Math.min(2, devicePixelRatio || 1);
  let W = 0, H = 0, basket = { x: 0, w: 90, tx: 0 }, items = [], parts = [], score = 0, time = 30, running = false, last = 0, spawnT = 0, timer, combo = 0, shake = 0;
  const showRec = () => { const r = store.get("catch", 0); recEl.textContent = r ? `🏆 Récord: ${r} puntos` : ""; };
  showRec();

  function resize() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    W = r.width; H = r.height;
    cv.width = W * DPR; cv.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    basket.w = Math.max(80, W * .15);
    basket.x = basket.tx = basket.x || W / 2;
    draw();
  }
  addEventListener("resize", resize);
  const move = (cx) => { const r = cv.getBoundingClientRect(); basket.tx = Math.min(W - basket.w / 2, Math.max(basket.w / 2, cx - r.left)); };
  cv.addEventListener("pointermove", (e) => move(e.clientX));
  cv.addEventListener("pointerdown", (e) => move(e.clientX));
  cv.addEventListener("touchmove", (e) => { e.preventDefault(); move(e.touches[0].clientX); }, { passive: false });

  function spawn() {
    const r = Math.random();
    const type = r < .17 ? "bad" : r < .27 ? "gold" : r < .30 ? "clock" : "good";
    items.push({ x: 20 + Math.random() * (W - 40), y: -30, v: 130 + Math.random() * 120 + (30 - time) * 7, s: type === "gold" ? 32 : 28, type, a: Math.random() * 6 });
  }

  function draw() {
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - .5) * shake, (Math.random() - .5) * shake);
    ctx.clearRect(-20, -20, W + 40, H + 40);
    const by = H - 36, bw = basket.w;
    const g = ctx.createLinearGradient(basket.x - bw / 2, 0, basket.x + bw / 2, 0);
    g.addColorStop(0, "#ff6b9d"); g.addColorStop(1, "#c89bff");
    ctx.fillStyle = g; ctx.shadowColor = "#ff6b9d"; ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(basket.x - bw / 2, by); ctx.lineTo(basket.x + bw / 2, by);
    ctx.lineTo(basket.x + bw / 2 - 12, by + 28); ctx.lineTo(basket.x - bw / 2 + 12, by + 28);
    ctx.closePath(); ctx.fill(); ctx.shadowBlur = 0;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "18px serif"; ctx.fillText("🧺", basket.x, by + 14);
    for (const it of items) {
      ctx.font = `${it.s}px serif`;
      ctx.fillText({ bad: "💔", gold: "💖", clock: "⏰", good: "❤️" }[it.type], it.x + Math.sin(it.a) * 6, it.y);
    }
    for (const p of parts) {
      ctx.globalAlpha = Math.max(0, p.l);
      ctx.font = `600 ${p.big ? 22 : 16}px Poppins`; ctx.fillStyle = p.c;
      ctx.fillText(p.t, p.x, p.y);
    }
    ctx.globalAlpha = 1;
    if (combo >= 5) { ctx.font = "600 15px Poppins"; ctx.fillStyle = "#ffe08a"; ctx.fillText(`🔥 Combo x${combo}`, W / 2, 24); }
    ctx.restore();
  }

  function loop(t) {
    if (!running) return;
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    basket.x += (basket.tx - basket.x) * Math.min(1, dt * 18);
    spawnT -= dt; shake = Math.max(0, shake - dt * 30);
    if (spawnT <= 0) { spawn(); spawnT = Math.max(.25, .72 - (30 - time) * .016); }
    const by = H - 36;
    items = items.filter((it) => {
      it.y += it.v * dt; it.a += dt * 4;
      if (it.y > by - 8 && it.y < by + 22 && Math.abs(it.x - basket.x) < basket.w / 2 + 6) {
        let pts = 0, label;
        if (it.type === "bad") { pts = -3; combo = 0; shake = 10; label = "-3 💔"; buzz(70); }
        else if (it.type === "clock") { time += 5; timeEl.textContent = time; label = "+5 s ⏰"; }
        else { combo++; pts = (it.type === "gold" ? 3 : 1) * (combo >= 10 ? 2 : 1); label = "+" + pts; }
        score = Math.max(0, score + pts);
        scoreEl.textContent = score;
        parts.push({ x: it.x, y: by - 20, l: 1, t: label, c: pts < 0 ? "#ff5064" : it.type === "clock" ? "#9be7ff" : "#ff8fab", big: it.type !== "good" });
        return false;
      }
      if (it.y >= H + 30 && it.type !== "bad") combo = 0;
      return it.y < H + 30;
    });
    parts = parts.filter((p) => { p.y -= 45 * dt; p.l -= dt * 1.3; return p.l > 0; });
    draw();
    requestAnimationFrame(loop);
  }

  function end() {
    running = false; clearInterval(timer);
    items = []; draw();
    const prev = store.get("catch", 0), rec = score > prev;
    if (rec) store.set("catch", score);
    const msg = score >= 50 ? "¡Eres una máquina del amor! 😍" : score >= 25 ? "¡Muy bien! Todo mi corazón es tuyo 💘" : "¡Todos mis corazones son tuyos igual! 💕";
    overlay.innerHTML = `<div><h3>${score} puntos</h3><p>${msg}${rec && score ? "<br>🏆 ¡Nuevo récord!" : ""}</p></div>`;
    overlay.classList.remove("hide");
    startBtn.textContent = "Otra vez";
    showRec();
    if (score >= 25) { const r = cv.getBoundingClientRect(); FX.explode(r.left + r.width / 2, r.top + r.height / 2); }
  }

  startBtn.addEventListener("click", () => {
    resize();
    score = 0; time = 30; items = []; parts = []; combo = 0;
    scoreEl.textContent = 0; timeEl.textContent = 30;
    overlay.classList.add("hide");
    running = true; last = performance.now(); spawnT = 0;
    clearInterval(timer);
    timer = setInterval(() => { time--; timeEl.textContent = time; if (time <= 0) end(); }, 1000);
    requestAnimationFrame(loop);
  });
  return { resize };
})();
