/* =====================================================================
   NÚCLEO: datos, utilidades, entrada, portada, fondo, música, efectos
   ===================================================================== */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const EMOJIS = ["💖", "🌸", "✨", "🌙", "🦋", "🌷", "💫", "🍓", "🌻", "🎀", "🫶", "☀️", "🌊", "🍒", "🌈", "🥂"];
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const isTouch = matchMedia("(hover: none)").matches;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const store = {
  get: (k, d) => { try { return JSON.parse(localStorage.getItem("album:" + k)) ?? d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem("album:" + k, JSON.stringify(v)); } catch {} },
};

/* ---------- Fechas ---------- */
const MESES_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const parseDate = (s) => { if (!s) return null; const [y, m, d] = s.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
const fmtDate = (s, withYear = true) => { const d = typeof s === "string" ? parseDate(s) : s; if (!d || isNaN(d)) return ""; return `${d.getDate()} de ${MESES_ES[d.getMonth()]}${withYear ? " de " + d.getFullYear() : ""}`; };
const fmtLong = (d) => { const w = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"][d.getDay()]; return `${w[0].toUpperCase() + w.slice(1)}, ${fmtDate(d)}`; };
const monthName = (key) => { const [y, m] = key.split("-").map(Number); const n = MESES_ES[m - 1] || key; return { nombre: n[0].toUpperCase() + n.slice(1), year: y }; };
const EMOJI_RE = /(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|[\u{1F3FB}-\u{1F3FF}])*)/gu;
const emojiSafe = (s) => esc(s).replace(EMOJI_RE, '<span class="emo">$1</span>');
const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/* =====================================================================
   DATOS: une las fotos encontradas (js/fotos.js) con tus textos
   ===================================================================== */
const FOTOS = window.FOTOS && Object.keys(window.FOTOS.items || {}).length ? window.FOTOS : null;
const DEMO = !FOTOS;
const INFO = Object.fromEntries(Object.entries(ALBUM.fotos || {}).map(([k, v]) => [k.toLowerCase().replace(/^fotos\//, ""), v]));

function decorate(it, mesKey) {
  const info = INFO[it.key] || {};
  return { ...it, ...info, mesKey: mesKey || it.carpeta, info };
}

// Lista de meses (los de datos/album.js + los que tengan carpeta con fotos)
const MONTHS = (() => {
  const keys = new Set([...Object.keys(ALBUM.meses || {}), ...Object.keys(FOTOS?.meses || {})]);
  let seed = 0;
  return [...keys].filter((k) => /^\d{4}-\d{2}$/.test(k)).sort().map((k) => {
    const cfg = ALBUM.meses?.[k] || {};
    const mn = monthName(k);
    let items;
    if (DEMO) {
      items = Array.from({ length: 5 + (seed % 3) }, (_, i) => ({
        key: `${k}/demo-${i}`, tipo: "ph", seed: seed++, mesKey: k,
        fecha: `${k}-${String(3 + i * 5).padStart(2, "0")}T12:00:00`,
        w: [4, 3, 4, 3, 1][i % 5] * 100, h: [5, 4, 3, 2, 1][i % 5] * 100, destacada: i === 0,
        titulo: i === 0 ? "Aquí irá una foto" : "",
      }));
    } else {
      items = (FOTOS.meses?.[k] || []).map((key) => decorate(FOTOS.items[key], k));
    }
    return { key: k, nombre: cfg.titulo || mn.nombre, year: mn.year, emoji: cfg.emoji || "💗", frase: cfg.frase || "", descripcion: cfg.descripcion || "", items };
  }).filter((m) => m.items.length);
})();
const ALL_ITEMS = MONTHS.flatMap((m) => m.items);
const ALL_IMAGES = ALL_ITEMS.filter((i) => i.tipo !== "video");

// Busca una foto por "carpeta/archivo" (para el quiz). Si no existe, usa un degradado.
function getItem(ref, seed = 0) {
  if (!ref) return { tipo: "ph", seed };
  const k = ref.toLowerCase().replace(/^fotos\//, "");
  if (FOTOS?.items[k]) return decorate(FOTOS.items[k]);
  if (DEMO) return { tipo: "img", src: "fotos/" + ref.replace(/^fotos\//, ""), seed, fallback: true };
  console.warn(`No encontré la foto "${ref}". Revisa el nombre en datos/album.js`);
  return { tipo: "ph", seed };
}

/* ---------- Crear imagen / video / degradado ---------- */
function placeholder(seed = 0) {
  const d = document.createElement("div");
  d.className = "ph";
  const h = (seed * 47 + 320) % 360;
  d.style.background = `radial-gradient(circle at 30% 20%, hsl(${(h + 30) % 360} 90% 80% / .9), transparent 60%), linear-gradient(135deg, hsl(${h} 75% 65%), hsl(${(h + 60) % 360} 65% 45%))`;
  d.innerHTML = `<span>${EMOJIS[seed % EMOJIS.length]}</span>`;
  return d;
}
function makeMedia(it, { thumb = false, autoplay = false, controls = false } = {}) {
  if (!it || it.tipo === "ph") return placeholder(it?.seed || 0);
  if (it.tipo === "video") {
    const v = document.createElement("video");
    v.src = it.src + (controls ? "" : "#t=0.1");
    v.muted = !controls; v.loop = !controls; v.playsInline = true; v.preload = "metadata";
    if (controls) { v.controls = true; v.autoplay = true; }
    if (autoplay) v.dataset.autoplay = "1";
    return v;
  }
  const wrap = document.createElement("div");
  wrap.className = "media";
  if (it.blur) wrap.style.backgroundImage = `url(${it.blur})`;
  const img = new Image();
  img.alt = it.titulo || "";
  img.decoding = "async";
  if (thumb) img.loading = "lazy";
  img.onload = () => wrap.classList.add("loaded");
  img.onerror = () => wrap.replaceWith(placeholder(it.seed || 0));
  img.src = thumb && it.thumb ? it.thumb : it.src;
  wrap.appendChild(img);
  return wrap;
}

/* ---------- Corazones que explotan ---------- */
function burst(x, y, n = 24, set = ["💖", "💗", "💕", "❤️", "💘", "✨"]) {
  if (reduced) return;
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.textContent = set[i % set.length];
    const a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 220;
    s.style.left = x + "px"; s.style.top = y + "px";
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d - 90 + "px");
    s.style.setProperty("--r", Math.random() * 720 - 360 + "deg");
    s.style.fontSize = 0.9 + Math.random() * 1.4 + "rem";
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 1500);
  }
}
const burstAt = (el, n) => { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, n); };
document.addEventListener("dblclick", (e) => { if (!e.target.closest("button, input, .lightbox, .movie")) burst(e.clientX, e.clientY, 14); });

/* ---------- Aparecer al hacer scroll ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); revealIO.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
const observeReveal = (els) => els.forEach((el) => revealIO.observe(el));

/* =====================================================================
   EFECTOS EN CANVAS: chispitas del cursor + fuegos artificiales
   ===================================================================== */
const FX = (() => {
  const c = $("#fx"), ctx = c.getContext("2d");
  let W, H, dpr, parts = [], rockets = [], fireworksUntil = 0, running = false;
  const COLORS = ["#ff6b9d", "#ff8fab", "#c89bff", "#ffc3a0", "#ffe08a", "#ffffff", "#ff4f8b"];
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  resize(); addEventListener("resize", resize);

  function loop() {
    ctx.clearRect(0, 0, W, H);
    const now = performance.now();
    if (now < fireworksUntil && Math.random() < 0.06) launch();
    rockets = rockets.filter((r) => {
      r.x += r.vx; r.y += r.vy; r.vy += 0.05;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(r.x, r.y, 2, 0, 7); ctx.fill();
      parts.push({ x: r.x, y: r.y, vx: (Math.random() - .5) * .5, vy: 0, l: .5, d: .03, s: 1.5, c: "#ffd6e4", g: 0 });
      if (r.vy >= -1) { explode(r.x, r.y); return false; }
      return true;
    });
    ctx.globalCompositeOperation = "lighter";
    parts = parts.filter((p) => {
      p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .985; p.vy *= .985; p.l -= p.d;
      if (p.l <= 0) return false;
      ctx.globalAlpha = Math.min(1, p.l);
      ctx.fillStyle = p.c;
      if (p.heart) { ctx.font = `${p.s * 6}px serif`; ctx.fillText("♥", p.x, p.y); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fill(); }
      return true;
    });
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    if (parts.length || rockets.length || now < fireworksUntil) requestAnimationFrame(loop);
    else { running = false; ctx.clearRect(0, 0, W, H); }
  }
  const kick = () => { if (!running) { running = true; requestAnimationFrame(loop); } };

  function launch() {
    rockets.push({ x: W * (.15 + Math.random() * .7), y: H, vx: (Math.random() - .5) * 2, vy: -(H / 85 + Math.random() * 4) });
  }
  function explode(x, y) {
    const col = COLORS[Math.floor(Math.random() * COLORS.length)], n = 70 + Math.random() * 40, heart = Math.random() < .35;
    for (let i = 0; i < n; i++) {
      let vx, vy;
      if (heart) { const t = (i / n) * Math.PI * 2; vx = 16 * Math.sin(t) ** 3 * .28; vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * .28; }
      else { const a = Math.random() * Math.PI * 2, s = Math.random() * 5 + 1; vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
      parts.push({ x, y, vx, vy, l: 1.2 + Math.random() * .5, d: .012, s: 1.6 + Math.random() * 1.2, c: Math.random() < .2 ? "#fff" : col, g: .04 });
    }
  }
  // Chispitas que siguen al cursor
  let last = 0;
  if (!isTouch && !reduced) addEventListener("pointermove", (e) => {
    const now = performance.now(); if (now - last < 28) return; last = now;
    parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - .5) * 1.2, vy: Math.random() * 1 + .3, l: 1, d: .03, s: 1.5 + Math.random() * 1.5, c: COLORS[Math.floor(Math.random() * COLORS.length)], g: .02, heart: Math.random() < .3 });
    kick();
  });
  return {
    fireworks(ms = 7000) { if (reduced) return; fireworksUntil = performance.now() + ms; for (let i = 0; i < 4; i++) setTimeout(launch, i * 250); kick(); },
    explode(x, y) { explode(x, y); kick(); },
  };
})();

/* ---------- Corazones flotando de fondo ---------- */
(function heartsBg() {
  const c = $("#hearts-bg"), ctx = c.getContext("2d");
  let W, H, dpr;
  const resize = () => { dpr = Math.min(2, devicePixelRatio || 1); W = c.width = innerWidth * dpr; H = c.height = innerHeight * dpr; };
  resize(); addEventListener("resize", resize);
  const N = innerWidth < 640 ? 12 : 24;
  const spawn = (y) => ({ x: Math.random() * W, y: y ?? H + 40, s: (6 + Math.random() * 14) * dpr, v: .2 + Math.random() * .5, a: Math.random() * 6.3, o: .06 + Math.random() * .2, hue: 330 + Math.random() * 40 });
  const hearts = Array.from({ length: N }, () => spawn(Math.random() * H));
  const heart = (x, y, s) => {
    ctx.beginPath(); ctx.moveTo(x, y + s * .3);
    ctx.bezierCurveTo(x, y, x - s / 2, y, x - s / 2, y + s * .3);
    ctx.bezierCurveTo(x - s / 2, y + s * .6, x, y + s * .8, x, y + s);
    ctx.bezierCurveTo(x, y + s * .8, x + s / 2, y + s * .6, x + s / 2, y + s * .3);
    ctx.bezierCurveTo(x + s / 2, y, x, y, x, y + s * .3); ctx.fill();
  };
  (function loop() {
    ctx.clearRect(0, 0, W, H);
    for (const h of hearts) {
      h.y -= h.v * dpr; h.a += .01;
      ctx.fillStyle = `hsla(${h.hue},90%,70%,${h.o})`;
      heart(h.x + Math.sin(h.a) * 20, h.y, h.s);
      if (h.y < -40) Object.assign(h, spawn());
    }
    if (!reduced) requestAnimationFrame(loop);
  })();
})();

/* =====================================================================
   PRECARGA + ENTRADA CON CONTRASEÑA
   ===================================================================== */
const Music = (() => {
  const audio = $("#music"), btn = $("#music-btn");
  const cfg = typeof ALBUM.musica === "string" ? { archivo: ALBUM.musica } : ALBUM.musica || {};
  if (!cfg.archivo) return { play() {}, ensure() {} };
  audio.src = cfg.archivo;
  $("#music-title").textContent = cfg.titulo || "Nuestra canción";
  audio.addEventListener("error", () => (btn.hidden = true));
  audio.addEventListener("canplay", () => (btn.hidden = false), { once: true });
  audio.addEventListener("play", () => btn.classList.add("playing"));
  audio.addEventListener("pause", () => btn.classList.remove("playing"));
  audio.load();
  btn.onclick = () => (audio.paused ? audio.play() : audio.pause());
  return {
    play() { audio.volume = 0; audio.play().then(() => { let v = 0; const t = setInterval(() => { v = Math.min(.6, v + .04); audio.volume = v; if (v >= .6) clearInterval(t); }, 120); }).catch(() => {}); },
    ensure() { if (audio.paused && !btn.hidden) this.play(); },
  };
})();

(function intro() {
  const pre = $("#preloader");
  const minTime = new Promise((r) => setTimeout(r, 1500));
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve();
  Promise.all([minTime, fonts]).then(() => {
    pre.classList.add("done");
    setTimeout(() => pre.remove(), 900);
    gate();
  });

  function gate() {
    const gateEl = $("#gate"), form = $("#gate-form"), input = $("#gate-pass"), hint = $("#gate-hint"), env = $("#envelope");
    if (!ALBUM.password || sessionStorage.getItem("album-ok")) { gateEl.remove(); enter(); return; }
    gateEl.classList.add("show");
    hint.textContent = ALBUM.pista || "";
    setTimeout(() => input.focus(), 700);
    let tries = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (input.value.trim().toLowerCase() === String(ALBUM.password).toLowerCase()) {
        input.blur();
        env.classList.add("opened");
        Music.play();
        sessionStorage.setItem("album-ok", "1");
        setTimeout(() => { gateEl.classList.add("open"); enter(); }, 1300);
        setTimeout(() => gateEl.remove(), 2600);
      } else {
        tries++;
        const card = $(".gate-card");
        card.classList.remove("shake"); void card.offsetWidth; card.classList.add("shake");
        hint.textContent = ["Mmm… casi 😅", "Nop 🙈 piénsalo bien", "Te doy una pista extra: es el día que nos conocimos 💫"][Math.min(tries - 1, 2)] + (tries < 3 ? " " + (ALBUM.pista || "") : "");
        input.select();
      }
    });
  }
})();

function enter() {
  document.body.classList.remove("locked");
  document.body.classList.add("entered");
  hero();
}

/* =====================================================================
   PORTADA
   ===================================================================== */
function hero() {
  $("#hero-names").textContent = `${ALBUM.yo} & ${ALBUM.ella}`;
  $("#hero-sub").textContent = ALBUM.subtituloPortada || "";
  $("#foot-name").textContent = ALBUM.yo;
  let n = 0;
  $("#hero-title").innerHTML = (ALBUM.tituloPortada || "Nuestra historia").split(" ").map((w) =>
    `<span class="word">${[...w].map((c) => `<span class="ch" style="animation-delay:${.25 + n++ * .055}s">${esc(c)}</span>`).join("")}</span>`
  ).join(" ");
  const title = $("#hero-title");
  const fitGrad = () => {
    title.style.setProperty("--tw", title.clientWidth + "px");
    $$(".ch", title).forEach((c) => c.style.setProperty("--ox", c.offsetLeft + "px"));
  };
  fitGrad(); addEventListener("resize", fitGrad);

  // Polaroids flotando alrededor del título
  const box = $("#hero-polaroids");
  const pics = shuffle(ALL_IMAGES).slice(0, innerWidth < 700 ? 4 : 6);
  const spots = [[6, 14], [80, 10], [3, 62], [84, 58], [18, 80], [70, 82]];
  pics.forEach((it, i) => {
    const p = document.createElement("div");
    p.className = "polaroid";
    const [x, y] = spots[i];
    p.style.left = x + "%"; p.style.top = y + "%";
    p.style.setProperty("--rot", (Math.random() * 20 - 10).toFixed(1) + "deg");
    p.style.setProperty("--depth", (0.4 + Math.random() * 0.8).toFixed(2));
    p.style.animationDelay = 1.2 + i * 0.15 + "s";
    p.appendChild(makeMedia(it, { thumb: true }));
    box.appendChild(p);
  });
  if (!isTouch) addEventListener("pointermove", (e) => {
    const dx = e.clientX / innerWidth - .5, dy = e.clientY / innerHeight - .5;
    box.style.setProperty("--mx", dx); box.style.setProperty("--my", dy);
  });

  // Contador
  const start = parseDate(ALBUM.fechaInicio);
  const pad = (v) => String(v).padStart(2, "0");
  const tick = () => {
    let s = Math.max(0, Math.floor((Date.now() - start) / 1000));
    $("#c-days").textContent = Math.floor(s / 86400).toLocaleString("es-MX"); s %= 86400;
    $("#c-hours").textContent = pad(Math.floor(s / 3600)); s %= 3600;
    $("#c-min").textContent = pad(Math.floor(s / 60));
    $("#c-sec").textContent = pad(s % 60);
  };
  tick(); setInterval(tick, 1000);

  // Próximo mesiversario
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = start.getDate();
  const at = (y, m) => new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate()));
  let next = at(today.getFullYear(), today.getMonth());
  if (next < today) next = at(today.getFullYear(), today.getMonth() + 1);
  const months = (next.getFullYear() - start.getFullYear()) * 12 + next.getMonth() - start.getMonth();
  const diff = Math.round((next - today) / 86400000);
  const label = months % 12 === 0 ? `${months / 12} año${months > 12 ? "s" : ""}` : `${months} mes${months === 1 ? "" : "es"}`;
  $("#next-month").innerHTML = diff === 0 ? `¡Hoy cumplimos <b>${label}</b>! 🎉` : `Faltan <b>${diff} día${diff === 1 ? "" : "s"}</b> para nuestros ${label} 💗`;

  observeReveal($$(".reveal"));
}

/* ---------- Navegación y barra de progreso ---------- */
addEventListener("scroll", () => {
  const p = scrollY / (document.documentElement.scrollHeight - innerHeight);
  $("#progress").style.transform = `scaleX(${p})`;
  $("#nav").classList.toggle("scrolled", scrollY > 40);
}, { passive: true });
(() => {
  const links = $$(".nav-links a");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  ["album", "razones", "juegos", "cupones", "carta"].forEach((id) => io.observe(document.getElementById(id)));
})();

/* ---------- Nosotros en números ---------- */
(function stats() {
  const days = Math.floor((Date.now() - parseDate(ALBUM.fechaInicio)) / 86400000);
  const fotos = DEMO ? 0 : ALL_ITEMS.filter((i) => i.tipo === "img").length;
  const videos = DEMO ? 0 : ALL_ITEMS.filter((i) => i.tipo === "video").length;
  const lugares = new Set(Object.values(ALBUM.fotos || {}).map((f) => f.lugar).filter(Boolean)).size;
  const data = [
    { n: days, l: "días juntos", e: "📅" },
    { n: Math.round(days * 24), l: "horas pensándote", e: "💭" },
    { n: fotos, l: "fotos guardadas", e: "📷" },
    ...(videos ? [{ n: videos, l: "videos", e: "🎬" }] : []),
    { n: MONTHS.length, l: "capítulos", e: "📖" },
    ...(lugares ? [{ n: lugares, l: "lugares", e: "📍" }] : []),
    { n: Infinity, l: "veces que te quiero", e: "❤️" },
  ];
  const grid = $("#stats-grid");
  grid.innerHTML = data.map((d, i) => `<div class="stat glass reveal" style="transition-delay:${i * .08}s"><span class="stat-e">${d.e}</span><strong data-n="${d.n}">0</strong><span>${d.l}</span></div>`).join("");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const el = $("strong", e.target), target = +el.dataset.n;
    if (!isFinite(target)) { setTimeout(() => (el.textContent = "∞"), 600); return; }
    const t0 = performance.now(), dur = 1800;
    const step = (t) => { const p = Math.min(1, (t - t0) / dur), v = Math.round(target * (1 - Math.pow(1 - p, 4))); el.textContent = v.toLocaleString("es-MX"); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .5 });
  $$(".stat", grid).forEach((s) => io.observe(s));
})();
