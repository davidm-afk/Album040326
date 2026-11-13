/* =====================================================================
   RAZONES · CUPONES · CARTA · FINAL
   ===================================================================== */

/* ---------- Razones: cartas que se avientan ---------- */
(function reasons() {
  const deck = $("#deck"), count = $("#deck-count");
  const R = ALBUM.razones || [];
  if (!R.length) { $("#razones").remove(); return; }
  let i = 0;
  const pics = shuffle(ALL_IMAGES);

  function build() {
    deck.innerHTML = "";
    const n = Math.min(3, R.length - i);
    if (n <= 0) {
      deck.innerHTML = `<div class="rcard end"><div><div class="r-num">∞</div><p>Y un millón de razones más que no caben aquí ❤️</p><button class="btn" id="deck-restart">Volver a empezar</button></div></div>`;
      $("#deck-restart").onclick = () => { i = 0; build(); };
      count.textContent = `${R.length} / ${R.length}`;
      return;
    }
    for (let k = n - 1; k >= 0; k--) {
      const idx = i + k, c = document.createElement("div");
      const pic = pics[idx % (pics.length || 1)];
      c.className = "rcard";
      c.style.setProperty("--k", k);
      c.style.setProperty("--rot", (idx % 2 ? 1 : -1) * (2 + (idx % 3)) + "deg");
      c.innerHTML = `
        ${pic ? `<div class="r-pic"></div>` : ""}
        <div class="r-body">
          <div class="r-num">#${idx + 1}</div>
          <p>${esc(R[idx])}</p>
          <span class="r-hint">${isTouch ? "desliza" : "arrastra o usa las flechas"} →</span>
        </div>`;
      if (pic) $(".r-pic", c).appendChild(makeMedia(pic, { thumb: true }));
      deck.appendChild(c);
      if (k === 0) drag(c);
    }
    count.textContent = `${i + 1} / ${R.length}`;
  }

  function fling(c, dir) {
    c.style.transition = "transform .6s cubic-bezier(.22,1,.36,1), opacity .6s";
    c.style.transform = `translate(${dir * 140}%, -10%) rotate(${dir * 30}deg)`;
    c.style.opacity = 0;
    if (dir > 0) burstAt(c, 6);
    buzz(12);
    setTimeout(() => { i++; build(); }, 280);
  }

  function drag(c) {
    let x0 = null, dx = 0;
    c.addEventListener("pointerdown", (e) => { x0 = e.clientX; c.setPointerCapture(e.pointerId); c.style.transition = "none"; });
    c.addEventListener("pointermove", (e) => {
      if (x0 === null) return;
      dx = e.clientX - x0;
      c.style.transform = `translateX(${dx}px) rotate(${dx / 14}deg)`;
    });
    const up = () => {
      if (x0 === null) return;
      x0 = null;
      if (Math.abs(dx) > 90) fling(c, Math.sign(dx));
      else { c.style.transition = "transform .5s cubic-bezier(.22,1,.36,1)"; c.style.transform = ""; }
      dx = 0;
    };
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
  }

  $("#deck-next").onclick = () => { const top = deck.lastElementChild; if (top && !top.classList.contains("end")) fling(top, 1); };
  $("#deck-prev").onclick = () => { if (i > 0) { i--; build(); } };
  build();
})();

/* ---------- Cupones para rascar ---------- */
(function coupons() {
  const grid = $("#coupon-grid");
  const C = ALBUM.cupones || [];
  if (!C.length) { $("#cupones").remove(); return; }
  const done = new Set(store.get("cupones", []));

  C.forEach((c, k) => {
    const el = document.createElement("div");
    el.className = "coupon reveal";
    el.style.transitionDelay = (k % 3) * .08 + "s";
    el.innerHTML = `
      <div class="coupon-inner">
        <span class="coupon-tag">CUPÓN Nº ${String(k + 1).padStart(3, "0")}</span>
        <div class="coupon-emoji">${c.emoji || "🎁"}</div>
        <h4>${esc(c.titulo)}</h4>
        <p>${esc(c.detalle || "")}</p>
        <span class="coupon-foot">Válido para: ${esc(ALBUM.ella)} · Sin fecha de caducidad</span>
      </div>
      <canvas class="scratch"></canvas>`;
    grid.appendChild(el);
    if (done.has(k)) el.classList.add("revealed");
    else requestAnimationFrame(() => scratch(el, k));
  });
  observeReveal($$(".coupon", grid));

  function scratch(el, k) {
    const cv = $(".scratch", el), ctx = cv.getContext("2d", { willReadFrequently: true });
    const dpr = Math.min(2, devicePixelRatio || 1);
    let w, h, down = false, moves = 0, lastP = null;
    function paint() {
      const r = el.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = w * dpr; cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#f6d27a"); g.addColorStop(.35, "#fff1c1"); g.addColorStop(.5, "#e6b85c"); g.addColorStop(.75, "#fbe3a1"); g.addColorStop(1, "#d9a441");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,.35)";
      for (let n = 0; n < 60; n++) { ctx.font = `${8 + Math.random() * 10}px serif`; ctx.fillText(Math.random() < .5 ? "✦" : "♥", Math.random() * w, Math.random() * h); }
      ctx.fillStyle = "#7a4a12"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.font = "600 20px Poppins"; ctx.fillText("Rasca aquí ✨", w / 2, h / 2 - 8);
      ctx.font = "400 13px Poppins"; ctx.fillText(isTouch ? "Pasa el dedo de lado a lado" : `Cupón sorpresa #${k + 1}`, w / 2, h / 2 + 18);
    }
    paint();
    const pos = (e) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    function rub(e) {
      const p = pos(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 46; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo((lastP || p).x, (lastP || p).y); ctx.lineTo(p.x, p.y); ctx.stroke();
      lastP = p;
      if (++moves % 8 === 0) check();
    }
    function check() {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data;
      let clear = 0, total = 0;
      for (let n = 3; n < d.length; n += 64) { total++; if (d[n] < 50) clear++; }
      if (clear / total > .5) finish();
    }
    function finish() {
      el.classList.add("revealed");
      done.add(k); store.set("cupones", [...done]);
      burstAt(el, 18); buzz([20, 40, 80]);
    }
    cv.addEventListener("pointerdown", (e) => { down = true; lastP = null; cv.setPointerCapture(e.pointerId); rub(e); });
    cv.addEventListener("pointermove", (e) => down && rub(e));
    cv.addEventListener("pointerup", () => { down = false; check(); });
    cv.addEventListener("pointercancel", () => { down = false; lastP = null; });
    addEventListener("resize", () => { if (!el.classList.contains("revealed")) paint(); });
  }
})();

/* ---------- Carta: se escribe sola ---------- */
(function letter() {
  const el = $("#letter-text"), sign = $("#letter-sign");
  const full = (ALBUM.carta || []).join("\n\n");
  sign.textContent = "— " + ALBUM.yo;
  let started = false;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || started || document.body.classList.contains("locked")) return;
    started = true;
    let i = 0;
    const type = () => {
      i++;
      el.innerHTML = esc(full.slice(0, i)) + '<span class="cursor"></span>';
      const c = full[i - 1];
      if (i < full.length) setTimeout(type, c === "\n" ? 260 : /[.,!?:]/.test(c) ? 200 : 28 + Math.random() * 30);
      else { el.innerHTML = esc(full); sign.classList.add("show"); $(".wax").classList.add("show"); }
    };
    setTimeout(type, 500);
  }, { threshold: .35 });
  io.observe($("#letter"));
})();

/* ---------- Final: ¿quieres seguir? ---------- */
(function final() {
  const f = ALBUM.final || {};
  const yes = $("#final-yes"), no = $("#final-no"), card = $("#final-card");
  $("#final-q").textContent = f.pregunta || "¿Quieres seguir escribiendo esta historia conmigo?";
  yes.textContent = f.si || "¡Sí! 💖";
  no.textContent = f.no || "No";
  const excuses = ["¿Segura? 🥺", "Piénsalo bien…", "Ese botón no sirve", "Error 404 😜", "Inténtalo otra vez", "Ya, di que sí 🙈", "😢"];
  let n = 0, scale = 1, home = null;
  function dodge(e) {
    e?.preventDefault?.();
    n++;
    scale = Math.min(1.9, scale + .12);
    yes.style.transform = `scale(${scale})`;
    no.textContent = excuses[(n - 1) % excuses.length];
    // Se mueve a un lugar al azar, pero siempre dentro de la tarjeta
    if (!home) { const b0 = no.getBoundingClientRect(), c0 = card.getBoundingClientRect(); home = { x: b0.left - c0.left, y: b0.top - c0.top, w: b0.width, h: b0.height }; }
    const cw = card.clientWidth, chh = card.clientHeight;
    // Nunca debajo del botón "Sí" (en celular quedaría tapado)
    const c0 = card.getBoundingClientRect(), y0 = yes.getBoundingClientRect();
    const ys = { l: y0.left - c0.left - 10, r: y0.right - c0.left + 10, t: y0.top - c0.top - 10, b: y0.bottom - c0.top + 10 };
    let tx, ty, tries = 0;
    do {
      tx = 12 + Math.random() * Math.max(0, cw - home.w - 24);
      ty = 12 + Math.random() * Math.max(0, chh - home.h - 24);
    } while (tries++ < 30 && tx < ys.r && tx + home.w > ys.l && ty < ys.b && ty + home.h > ys.t);
    no.style.transform = `translate(${tx - home.x}px, ${ty - home.y}px) rotate(${(Math.random() - .5) * 24}deg)`;
    if (n > 6) { no.style.opacity = 0; no.style.pointerEvents = "none"; }
  }
  if (!isTouch) no.addEventListener("pointerenter", dodge);
  no.addEventListener("click", dodge);

  function celebrate() {
    card.classList.add("gone");
    const msg = $("#final-msg");
    setTimeout(() => {
      card.hidden = true;
      msg.hidden = false;
      $("#final-text").innerHTML = emojiSafe(f.mensaje || "Sabía que dirías que sí 🥹");
      $("#final-sub").textContent = `${ALBUM.yo} ❤ ${ALBUM.ella} · desde el ${fmtDate(ALBUM.fechaInicio)}`;
      requestAnimationFrame(() => msg.classList.add("show"));
    }, 400);
    FX.fireworks(9000);
    buzz([40, 60, 40, 60, 160]);
    const r = yes.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 50);
    Music.ensure();
  }
  yes.addEventListener("click", celebrate);
  $("#final-again").addEventListener("click", () => { FX.fireworks(6000); burst(innerWidth / 2, innerHeight / 2, 40); });
})();
