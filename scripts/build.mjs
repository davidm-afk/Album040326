/* =========================================================
   Genera la web lista para publicar en la carpeta _site/
   - Copia el código (index.html, css, js, datos, musica)
   - Busca TODAS las fotos y videos dentro de fotos/
   - Las optimiza (WebP, tamaño web, miniatura y vista previa borrosa)
   - Lee la fecha de cada foto (EXIF o nombre del archivo)
   - Crea _site/js/fotos.js con la lista completa
   No hace falta tocar este archivo.
   ========================================================= */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import sharp from "sharp";
import exifr from "exifr";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const FOTOS = path.join(ROOT, "fotos");

const IMG = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tif", ".tiff"]);
const VID = new Set([".mp4", ".webm", ".mov", ".m4v"]);
const HEIC = new Set([".heic", ".heif"]);
const COPY = ["index.html", "css", "js", "datos", "musica"];

const log = (...a) => console.log(...a);
const warn = (...a) => console.warn("⚠️ ", ...a);

async function exists(p) { try { await fs.access(p); return true; } catch { return false; } }

async function copyDir(src, dst) {
  await fs.mkdir(dst, { recursive: true });
  for (const e of await fs.readdir(src, { withFileTypes: true })) {
    if (e.name === ".gitkeep") continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    if (e.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}

const slug = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "foto";

// "2026:03:12 18:22:00" → "2026-03-12T18:22:00"
function exifToIso(v) {
  if (!v) return null;
  if (v instanceof Date) return isNaN(v) ? null : v.toISOString().slice(0, 19);
  const m = String(v).match(/(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):?(\d{2})?/);
  if (!m || m[1] === "0000") return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6] || "00"}`;
}
// IMG_20260312_182200.jpg, IMG-20260312-WA0001.jpg, PXL_20260312..., Screenshot_2026-03-12...
function dateFromName(name) {
  const m = name.match(/(20\d{2})[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])(?:[-_ ]?(\d{2})[-_.]?(\d{2})[-_.]?(\d{2}))?/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${m[4] || "12"}:${m[5] || "00"}:${m[6] || "00"}`;
}

async function listMedia(dir, rel = "") {
  const out = [];
  if (!(await exists(dir))) return out;
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.name.startsWith(".")) continue;
    const full = path.join(dir, e.name), r = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await listMedia(full, r)));
    else out.push({ full, rel: r, ext: path.extname(e.name).toLowerCase(), name: e.name });
  }
  return out;
}

async function processImage(f, outDir, base) {
  const img = sharp(f.full, { failOn: "none", animated: false }).rotate();
  const full = await img.clone().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(outDir, base + ".webp"));
  await img.clone().resize({ width: 800, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 74 }).toFile(path.join(outDir, base + "-t.webp"));
  const tiny = await img.clone().resize(24, 24, { fit: "inside" }).webp({ quality: 40 }).toBuffer();
  let fecha = null;
  try {
    const ex = await exifr.parse(f.full, { pick: ["DateTimeOriginal", "CreateDate", "DateTimeDigitized"], reviveValues: false });
    fecha = exifToIso(ex?.DateTimeOriginal || ex?.CreateDate || ex?.DateTimeDigitized);
  } catch {}
  return { w: full.width, h: full.height, fecha: fecha || dateFromName(f.name), blur: "data:image/webp;base64," + tiny.toString("base64") };
}

async function main() {
  const t0 = Date.now();
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });
  for (const c of COPY) {
    const s = path.join(ROOT, c);
    if (!(await exists(s))) continue;
    if ((await fs.stat(s)).isDirectory()) await copyDir(s, path.join(OUT, c));
    else await fs.copyFile(s, path.join(OUT, c));
  }
  await fs.writeFile(path.join(OUT, ".nojekyll"), "");

  const files = await listMedia(FOTOS);
  const items = {}, meses = {};
  let n = 0, skipped = 0;
  const queue = [...files];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      const f = queue.shift();
      const folder = f.rel.includes("/") ? f.rel.split("/")[0] : "";
      const key = f.rel.toLowerCase();
      const hash = crypto.createHash("md5").update(f.rel).digest("hex").slice(0, 6);
      const base = `${slug(path.parse(f.name).name)}-${hash}`;
      const outDir = path.join(OUT, "media", folder || "_");
      const urlDir = `media/${folder || "_"}`;
      await fs.mkdir(outDir, { recursive: true });
      try {
        let item;
        if (IMG.has(f.ext)) {
          const r = await processImage(f, outDir, base);
          item = { tipo: "img", src: `${urlDir}/${base}.webp`, thumb: `${urlDir}/${base}-t.webp`, ...r };
        } else if (VID.has(f.ext)) {
          const name = base + f.ext;
          await fs.copyFile(f.full, path.join(outDir, name));
          const size = (await fs.stat(f.full)).size;
          if (size > 50 * 1024 * 1024) warn(`El video ${f.rel} pesa ${(size / 1048576).toFixed(0)} MB. GitHub no acepta archivos de más de 100 MB; mejor comprímelo.`);
          item = { tipo: "video", src: `${urlDir}/${name}`, fecha: dateFromName(f.name) };
        } else if (HEIC.has(f.ext)) {
          warn(`${f.rel}: las fotos .HEIC (iPhone) no se ven en los navegadores. Conviértela a .jpg (en el iPhone: Ajustes → Cámara → Formatos → "Más compatible").`);
          skipped++; continue;
        } else continue;
        items[key] = { key, archivo: f.rel, carpeta: folder, ...item };
        n++;
        if (n % 20 === 0) log(`  …${n} archivos procesados`);
      } catch (e) {
        warn(`No se pudo procesar ${f.rel}: ${e.message}`);
        skipped++;
      }
    }
  });
  await Promise.all(workers);

  for (const it of Object.values(items)) {
    if (!/^\d{4}-\d{2}$/.test(it.carpeta)) continue;
    (meses[it.carpeta] ||= []).push(it.key);
  }
  for (const k in meses) {
    meses[k].sort((a, b) => (items[a].fecha || "9999").localeCompare(items[b].fecha || "9999") || a.localeCompare(b, "es", { numeric: true }));
  }

  const manifest = { generado: new Date().toISOString(), items, meses };
  await fs.mkdir(path.join(OUT, "js"), { recursive: true });
  await fs.writeFile(path.join(OUT, "js", "fotos.js"), "window.FOTOS = " + JSON.stringify(manifest) + ";\n");

  log(`\n✅ Listo en ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  log(`   ${n} fotos/videos procesados${skipped ? `, ${skipped} omitidos (mira los avisos de arriba)` : ""}`);
  for (const k of Object.keys(meses).sort()) log(`   ${k}: ${meses[k].length}`);
  if (!n) log("   (Todavía no hay fotos: la web se mostrará en modo demostración)");
}

main().catch((e) => { console.error(e); process.exit(1); });
