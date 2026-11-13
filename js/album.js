/* =====================================================================
   ÁLBUM POR MESES + VISOR + MODO PELÍCULA
   ===================================================================== */
(function album() {
  const pills = $("#month-pills"), wrap = $("#chapters");
  let gi = 0;

  MONTHS.forEach((m, mi) => {
    const nFotos = m.items.filter((i) => i.tipo !== "video").length, nVid = m.items.length - nFotos;
    pills.insertAdjacentHTML("beforeend", `<a class="pill" href="#m-${m.key}">${m.emoji} ${esc(m.nombre)}</a>`);

    const ch = document.createElement("article");
    ch.className = "chapter";
    ch.id = "m-" + m.key;
    ch.innerHTML = `
      <div class="chapter-head">
        <span class="chapter-num reveal">Capítulo ${String(mi + 1).padStart(2, "0")} · ${m.emoji}</span>
        <h3 class="chapter-title reveal"><span class="big-outline" data-parallax>${esc(m.nombre)}</span><span class="chapter-year">${m.year}</span></h3>
        ${m.frase ? `<p class="chapter-frase reveal">${esc(m.frase)}</p>` : ""}
        ${m.descripcion ? `<p class="chapter-desc reveal">${esc(m.descripcion)}</p>` : ""}
        <div class="chapter-meta reveal">
          <span>📷 ${nFotos} foto${nFotos === 1 ? "" : "s"}${nVid ? ` · 🎬 ${nVid} video${nVid === 1 ? "" : "s"}` : ""}</span>
          ${nFotos > 1 ? `<button class="btn-ghost" data-movie="${m.key}">▶ Ver el mes como película</button>` : ""}
        </div>
      </div>
      <div class="bento"></div>`;
    const grid = $(".bento", ch);
    m.items.forEach((it, k) => {
      const i = gi++;
      const ar = it.w && it.h ? it.w / it.h : 1;
      const card = document.createElement("div");
      card.className = "card" + (it.destacada ? " big" : ar > 1.25 ? " wide" : ar < 0.85 ? " tall" : "");
      card.dataset.i = i;
      card.style.setProperty("--d", (k % 4) * 0.07 + "s");
      card.appendChild(makeMedia(it, { thumb: true, autoplay: true }));
      const date = it.fecha ? fmtDate(it.fecha, false) : "";
      card.insertAdjacentHTML("beforeend", `
        <div class="shine"></div>
        ${it.tipo === "video" ? '<span class="badge">▶ video</span>' : ""}
        <div class="card-info">
          ${date || it.lugar ? `<span>${[date, it.lugar && "📍 " + esc(it.lugar)].filter(Boolean).join(" · ")}</span>` : ""}
          ${it.titulo ? `<h4>${esc(it.titulo)}</h4>` : ""}
        </div>`);
      grid.appendChild(card);
    });
    wrap.appendChild(ch);
  });
  if (!MONTHS.length) wrap.innerHTML = `<p class="empty">Todavía no hay fotos. Mételas en la carpeta <b>fotos/</b> 📷</p>`;
  if (ALL_IMAGES.length < 2) $("#play-all").hidden = true;

  observeReveal($$(".card", wrap));

  // Mes activo en las pastillas
  const pillEls = $$(".pill");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    pillEls.forEach((p) => {
      const on = p.getAttribute("href") === "#" + e.target.id;
      if (on && !p.classList.contains("active")) pills.scrollTo({ left: p.offsetLeft - pills.clientWidth / 2 + p.clientWidth / 2, behavior: "smooth" });
      p.classList.toggle("active", on);
    });
  }), { rootMargin: "-40% 0px -55% 0px" });
  $$(".chapter").forEach((c) => io.observe(c));

  // Parallax del nombre gigante del mes
  const outlines = $$("[data-parallax]");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking || reduced) return; ticking = true;
    requestAnimationFrame(() => {
      outlines.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        el.style.transform = `translateX(${(r.top / innerHeight - .5) * -60}px)`;
      });
      ticking = false;
    });
  }, { passive: true });

  // Videos: se reproducen solos (sin sonido) cuando se ven
  const vio = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())), { threshold: .4 });
  $$("video[data-autoplay]").forEach((v) => vio.observe(v));

  // Efecto 3D + brillo al pasar el mouse
  if (!isTouch) $$(".card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(900px) rotateY(${(x - .5) * 8}deg) rotateX(${(.5 - y) * 8}deg) scale(1.02)`;
      card.style.setProperty("--mx", x * 100 + "%"); card.style.setProperty("--my", y * 100 + "%");
    });
    card.addEventListener("pointerleave", () => (card.style.transform = ""));
  });

  $$(".card").forEach((c) => c.addEventListener("click", () => Lightbox.open(+c.dataset.i)));
  $$("[data-movie]").forEach((b) => b.addEventListener("click", () => Movie.open(MONTHS.find((m) => m.key === b.dataset.movie).items.filter((i) => i.tipo !== "video"))));
  $("#play-all").addEventListener("click", () => Movie.open(ALL_IMAGES));
})();

/* ---------- Visor de fotos ---------- */
const Lightbox = (() => {
  const lb = $("#lightbox"), media = $("#lb-media");
  let idx = 0, tx = null;
  function show(i, dir = 0) {
    idx = (i + ALL_ITEMS.length) % ALL_ITEMS.length;
    const it = ALL_ITEMS[idx];
    $$("video", media).forEach((v) => v.pause());
    media.innerHTML = "";
    const el = makeMedia(it, { controls: true });
    media.appendChild(el);
    media.style.setProperty("--from", dir * 60 + "px");
    media.classList.remove("swap"); void media.offsetWidth; media.classList.add("swap");
    const m = MONTHS.find((x) => x.key === it.mesKey);
    $("#lb-title").textContent = it.titulo || (m ? `${m.nombre} ${m.year}` : "");
    $("#lb-text").textContent = it.texto || "";
    $("#lb-date").textContent = [it.fecha && fmtDate(it.fecha), it.lugar && "📍 " + it.lugar].filter(Boolean).join("  ·  ");
    $("#lb-counter").textContent = `${idx + 1} / ${ALL_ITEMS.length}`;
    [1, -1].forEach((d) => { const n = ALL_ITEMS[(idx + d + ALL_ITEMS.length) % ALL_ITEMS.length]; if (n?.tipo === "img") new Image().src = n.src; });
  }
  function open(i) { show(i); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
  function close() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; $$("video", media).forEach((v) => v.pause()); }
  $("#lb-close").onclick = close;
  $("#lb-prev").onclick = () => show(idx - 1, -1);
  $("#lb-next").onclick = () => show(idx + 1, 1);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-figure")) close(); });
  addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1, -1);
    if (e.key === "ArrowRight") show(idx + 1, 1);
  });
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    tx = null;
  });
  return { open };
})();

/* ---------- Modo película (presentación con efecto Ken Burns) ---------- */
const Movie = (() => {
  const mv = $("#movie"), stage = $("#movie-stage"), cap = $("#movie-caption"), bar = $("#movie-progress");
  const DUR = 5200;
  let list = [], i = 0, timer = null, playing = true, t0 = 0, raf = 0;

  function slide() {
    const it = list[i];
    const layer = document.createElement("div");
    layer.className = "mv-layer";
    const origins = ["20% 30%", "80% 20%", "50% 50%", "30% 80%", "70% 70%"];
    layer.style.setProperty("--o", origins[Math.floor(Math.random() * origins.length)]);
    layer.style.setProperty("--s0", Math.random() < .5 ? 1 : 1.18);
    layer.style.setProperty("--s1", layer.style.getPropertyValue("--s0") == 1 ? 1.18 : 1);
    layer.style.animationDuration = DUR + 1600 + "ms";
    const bg = makeMedia(it); bg.classList.add("mv-bg");
    layer.append(bg, makeMedia(it));
    stage.appendChild(layer);
    requestAnimationFrame(() => layer.classList.add("on"));
    const old = $$(".mv-layer", stage).slice(0, -1);
    setTimeout(() => old.forEach((o) => o.remove()), 1600);
    const m = MONTHS.find((x) => x.key === it.mesKey);
    cap.classList.remove("show"); void cap.offsetWidth;
    cap.innerHTML = `<span>${m ? `${m.emoji} ${esc(m.nombre)} ${m.year}` : ""}${it.fecha ? " · " + fmtDate(it.fecha, false) : ""}</span>${it.titulo ? `<h3>${esc(it.titulo)}</h3>` : ""}${it.texto ? `<p>${esc(it.texto)}</p>` : ""}`;
    cap.classList.add("show");
    const n = list[(i + 1) % list.length]; if (n?.src) new Image().src = n.src;
    t0 = performance.now();
  }
  function tick() {
    if (!mv.classList.contains("open")) return;
    if (playing) {
      const p = (performance.now() - t0) / DUR;
      bar.style.transform = `scaleX(${(i + Math.min(1, p)) / list.length})`;
      if (p >= 1) { if (i === list.length - 1) { finish(); return; } i++; slide(); }
    }
    raf = requestAnimationFrame(tick);
  }
  function finish() {
    cap.classList.remove("show"); void cap.offsetWidth;
    cap.innerHTML = `<h3>Y esto apenas empieza…</h3><p>Continuará 💞</p>`;
    cap.classList.add("show", "end");
    setTimeout(() => FX.fireworks(3500), 300);
    setTimeout(close, 6000);
  }
  function open(items) {
    if (!items.length) return;
    list = items; i = 0; playing = true;
    stage.innerHTML = ""; cap.classList.remove("end");
    $("#mv-play").textContent = "⏸";
    mv.classList.add("open"); mv.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    Music.ensure();
    mv.requestFullscreen?.().catch(() => {});
    slide(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function close() {
    mv.classList.remove("open"); mv.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    cancelAnimationFrame(raf);
  }
  const go = (d) => { i = (i + d + list.length) % list.length; slide(); };
  $("#mv-close").onclick = close;
  $("#mv-next").onclick = () => go(1);
  $("#mv-prev").onclick = () => go(-1);
  $("#mv-play").onclick = () => {
    playing = !playing;
    $("#mv-play").textContent = playing ? "⏸" : "▶";
    mv.classList.toggle("paused", !playing);
    if (playing) t0 = performance.now() - ((parseFloat(bar.style.transform.slice(7)) * list.length - i) || 0) * DUR;
  };
  addEventListener("keydown", (e) => {
    if (!mv.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") go(1);
    if (e.key === "ArrowLeft") go(-1);
    if (e.key === " ") { e.preventDefault(); $("#mv-play").click(); }
  });
  document.addEventListener("fullscreenchange", () => { if (!document.fullscreenElement && mv.classList.contains("open")) close(); });
  return { open };
})();
