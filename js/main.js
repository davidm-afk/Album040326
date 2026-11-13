/* ============ Utilidades ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const EMOJIS = ["💖", "🌸", "✨", "🌙", "🦋", "🌷", "💫", "🍓", "🌻", "🎀", "🫶", "☀️"];

// Todas las fotos en una lista plana (para lightbox y juegos)
const ALL = ALBUM.meses.flatMap((m) => m.recuerdos.map((r) => ({ ...r, mes: m.titulo })));

// Crea una imagen; si la foto aún no existe, muestra un degradado bonito
function makeMedia(src, seed = 0, alt = "") {
  const ph = () => {
    const d = document.createElement("div");
    d.className = "ph";
    const h = (seed * 47) % 360;
    d.style.background = `linear-gradient(135deg, hsl(${h} 80% 70%), hsl(${(h + 60) % 360} 70% 55%))`;
    d.style.setProperty("--ar", ["4/5", "1/1", "3/4", "4/3"][seed % 4]);
    d.textContent = EMOJIS[seed % EMOJIS.length];
    return d;
  };
  if (!src) return ph();
  const img = new Image();
  img.src = src;
  img.alt = alt;
  img.loading = "lazy";
  img.decoding = "async";
  img.onerror = () => img.replaceWith(ph());
  return img;
}
window.makeMedia = makeMedia;
window.ALL_PHOTOS = ALL;

/* ============ Pantalla de entrada ============ */
(function gate() {
  const gateEl = $("#gate"), form = $("#gate-form"), input = $("#gate-pass"), hint = $("#gate-hint"), env = $("#envelope");
  const unlock = () => {
    env.classList.add("opened");
    setTimeout(() => {
      gateEl.classList.add("open");
      document.body.classList.remove("locked");
      sessionStorage.setItem("album-ok", "1");
      startHero();
    }, 1100);
  };
  if (!ALBUM.password || sessionStorage.getItem("album-ok")) {
    gateEl.remove();
    document.body.classList.remove("locked");
    startHero();
    return;
  }
  hint.textContent = ALBUM.pista || "";
  setTimeout(() => input.focus(), 600);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim().toLowerCase() === String(ALBUM.password).toLowerCase()) {
      unlock();
    } else {
      const card = $(".gate-card");
      card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
      hint.textContent = "Mmm… casi 😅 " + (ALBUM.pista || "");
      input.select();
    }
  });
})();

/* ============ Portada ============ */
let heroStarted = false;
function startHero() {
  if (heroStarted) return;
  heroStarted = true;
  $("#hero-names").textContent = `${ALBUM.yo} & ${ALBUM.ella}`;
  $("#hero-sub").textContent = ALBUM.subtituloPortada;
  const title = $("#hero-title");
  let n = 0;
  title.innerHTML = ALBUM.tituloPortada
    .split(" ")
    .map((w) => `<span style="white-space:nowrap;display:inline-block">${[...w]
      .map((c) => `<span class="ch" style="animation-delay:${0.3 + n++ * 0.05}s">${c}</span>`)
      .join("")}</span>`)
    .join(" ");
  const m = ALBUM.musica;
  if (m) {
    const audio = $("#music"), btn = $("#music-btn");
    audio.src = m;
    btn.hidden = false;
    btn.onclick = () => {
      if (audio.paused) { audio.play(); btn.classList.add("playing"); }
      else { audio.pause(); btn.classList.remove("playing"); }
    };
    audio.play().then(() => btn.classList.add("playing")).catch(() => {});
  }
}

// Contador de tiempo juntos
(function counter() {
  const start = new Date(ALBUM.fechaInicio + "T00:00:00");
  const pad = (n) => String(n).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600); s %= 3600;
    const mi = Math.floor(s / 60); s %= 60;
    $("#c-days").textContent = d;
    $("#c-hours").textContent = pad(h);
    $("#c-min").textContent = pad(mi);
    $("#c-sec").textContent = pad(s);
  };
  tick();
  setInterval(tick, 1000);
})();

/* ============ Corazones de fondo ============ */
(function heartsBg() {
  const c = $("#hearts-bg"), ctx = c.getContext("2d");
  let W, H, hearts = [];
  const resize = () => { W = c.width = innerWidth * devicePixelRatio; H = c.height = innerHeight * devicePixelRatio; c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px"; };
  resize(); addEventListener("resize", resize);
  const N = innerWidth < 640 ? 14 : 26;
  const spawn = (y) => ({ x: Math.random() * W, y: y ?? H + 40, s: (6 + Math.random() * 14) * devicePixelRatio, v: 0.2 + Math.random() * 0.6, a: Math.random() * Math.PI * 2, o: 0.08 + Math.random() * 0.25, hue: 330 + Math.random() * 40 });
  for (let i = 0; i < N; i++) hearts.push(spawn(Math.random() * H));
  const heart = (x, y, s) => {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.3);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * 0.3);
    ctx.bezierCurveTo(x - s / 2, y + s * 0.6, x, y + s * 0.8, x, y + s);
    ctx.bezierCurveTo(x, y + s * 0.8, x + s / 2, y + s * 0.6, x + s / 2, y + s * 0.3);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * 0.3);
    ctx.fill();
  };
  window.drawHeart = heart;
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const h of hearts) {
      h.y -= h.v * devicePixelRatio; h.a += 0.01;
      const x = h.x + Math.sin(h.a) * 20;
      ctx.fillStyle = `hsla(${h.hue},90%,70%,${h.o})`;
      heart(x, h.y, h.s);
      if (h.y < -40) Object.assign(h, spawn());
    }
    requestAnimationFrame(loop);
  })();
})();

// Brillo que sigue al cursor + barra de progreso
const glow = $(".cursor-glow");
addEventListener("pointermove", (e) => { glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px"; });
addEventListener("scroll", () => {
  const p = scrollY / (document.documentElement.scrollHeight - innerHeight);
  $("#progress").style.width = p * 100 + "%";
}, { passive: true });

/* ============ Álbum ============ */
(function renderAlbum() {
  const tl = $("#timeline"), pills = $("#month-pills");
  let idx = 0;
  ALBUM.meses.forEach((m) => {
    const pill = document.createElement("a");
    pill.className = "pill";
    pill.href = "#m-" + m.id;
    pill.textContent = `${m.emoji} ${m.titulo}`;
    pills.appendChild(pill);

    const sec = document.createElement("article");
    sec.className = "month";
    sec.id = "m-" + m.id;
    sec.innerHTML = `
      <div class="month-dot">${m.emoji}</div>
      <div class="month-head reveal">
        <h3>${m.titulo}</h3>
        <p>${m.descripcion || ""}</p>
        <span class="month-count">${m.recuerdos.length} recuerdo${m.recuerdos.length === 1 ? "" : "s"}</span>
      </div>
      <div class="grid"></div>`;
    const grid = $(".grid", sec);
    m.recuerdos.forEach((r) => {
      const i = idx++;
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.i = i;
      card.style.transitionDelay = (grid.children.length % 3) * 0.08 + "s";
      card.appendChild(makeMedia(r.foto, i, r.titulo));
      card.insertAdjacentHTML("beforeend", `
        <div class="shine"></div>
        <div class="card-info"><span>${r.fecha || ""}</span><h4>${r.titulo || ""}</h4><p>${r.texto || ""}</p></div>`);
      grid.appendChild(card);
    });
    tl.appendChild(sec);
  });

  // Aparición al hacer scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  $$(".reveal, .card").forEach((el) => io.observe(el));

  // Mes activo en las pastillas
  const pillEls = $$(".pill");
  const mo = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const id = e.target.id;
        pillEls.forEach((p) => {
          const on = p.getAttribute("href") === "#" + id;
          p.classList.toggle("active", on);
          if (on) p.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
        });
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$(".month").forEach((s) => mo.observe(s));

  // Efecto 3D al pasar el ratón
  if (matchMedia("(hover: hover)").matches) {
    $$(".card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.transform = `perspective(800px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg)`;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
      });
      card.addEventListener("pointerleave", () => (card.style.transform = ""));
    });
  }

  $$(".card").forEach((c) => c.addEventListener("click", () => openLightbox(+c.dataset.i)));
})();

/* ============ Lightbox ============ */
const lb = $("#lightbox");
let lbIndex = 0;
function showLb(i, animate = true) {
  lbIndex = (i + ALL.length) % ALL.length;
  const r = ALL[lbIndex];
  const wrap = $(".lb-img-wrap", lb);
  wrap.innerHTML = "";
  wrap.appendChild(makeMedia(r.foto, lbIndex, r.titulo));
  if (animate) { wrap.classList.remove("swap"); void wrap.offsetWidth; wrap.classList.add("swap"); }
  $("#lb-title").textContent = r.titulo || "";
  $("#lb-text").textContent = r.texto || "";
  $("#lb-date").textContent = [r.fecha, r.mes].filter(Boolean).join(" · ");
}
function openLightbox(i) { showLb(i, false); lb.classList.add("open"); lb.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden"; }
function closeLightbox() { lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; }
$("#lb-close").onclick = closeLightbox;
$("#lb-prev").onclick = (e) => { e.stopPropagation(); showLb(lbIndex - 1); };
$("#lb-next").onclick = (e) => { e.stopPropagation(); showLb(lbIndex + 1); };
lb.addEventListener("click", (e) => { if (e.target === lb) closeLightbox(); });
addEventListener("keydown", (e) => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showLb(lbIndex - 1);
  if (e.key === "ArrowRight") showLb(lbIndex + 1);
});
let tx = null;
lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
lb.addEventListener("touchend", (e) => {
  if (tx === null) return;
  const dx = e.changedTouches[0].clientX - tx;
  if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
  tx = null;
});

/* ============ Carta (efecto máquina de escribir) ============ */
(function letter() {
  const el = $("#letter-text"), sign = $("#letter-sign");
  const full = ALBUM.carta.join("\n\n");
  sign.textContent = "— " + ALBUM.yo;
  let started = false;
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting || started) return;
    started = true;
    let i = 0;
    const cursor = '<span class="cursor"></span>';
    const type = () => {
      i++;
      el.innerHTML = full.slice(0, i).replace(/</g, "&lt;") + cursor;
      if (i < full.length) setTimeout(type, full[i - 1] === "\n" ? 250 : full[i - 1].match(/[.,!?]/) ? 180 : 32);
      else { el.innerHTML = full.replace(/</g, "&lt;"); sign.classList.add("show"); }
    };
    setTimeout(type, 500);
  }, { threshold: 0.4 });
  io.observe($("#letter"));
})();

/* ============ Explosión de corazones ============ */
function burst(x, y, n = 24, set = ["💖", "💗", "💕", "❤️", "💘", "✨"]) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = set[i % set.length];
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 220;
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d - 80 + "px");
    s.style.setProperty("--r", (Math.random() * 720 - 360) + "deg");
    s.style.fontSize = 1 + Math.random() * 1.4 + "rem";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}
window.burst = burst;
$("#big-heart").addEventListener("click", (e) => burst(e.clientX, e.clientY, 40));
document.addEventListener("dblclick", (e) => burst(e.clientX, e.clientY, 14));
