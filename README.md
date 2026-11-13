# 💞 Nuestra historia — álbum de recuerdos

Web-regalo con nuestras fotos organizadas por mes, un modo película, razones por las que te quiero, minijuegos (quiz con fotos, quiz de pareja, memoria y atrapa corazones), cupones para rascar, una carta y una sorpresa al final.

🌐 **En línea:** https://davidm-afk.github.io/Album040326/

---

## 📁 Qué hay en cada carpeta

```
Album/
├── fotos/            ← 📷 AQUÍ VAN LAS FOTOS Y VIDEOS
│   ├── 2026-03/          marzo
│   ├── 2026-04/          abril
│   ├── …
│   └── 2026-10/          octubre
├── musica/           ← 🎵 la canción de fondo (cancion.mp3)
├── datos/
│   └── album.js      ← ✏️ TODOS LOS TEXTOS: meses, quiz, razones, cupones, carta
├── vista-previa.bat  ← doble clic para ver la web en tu compu
├── publicar.bat      ← doble clic para subir los cambios a internet
│
├── index.html, css/, js/, scripts/   ← el código (no hace falta tocarlo)
```

## 📷 1. Poner las fotos

1. Copia las fotos de cada mes a su carpeta: `fotos/2026-03`, `fotos/2026-04`, etc.
2. **No hace falta renombrarlas ni escribirlas en ningún lado.** Aparecen solas en su mes, ordenadas por la fecha en que se tomaron.
3. También puedes poner **videos cortos** (`.mp4`).
4. Si quieres otro mes (por ejemplo noviembre), crea la carpeta `fotos/2026-11` y listo.

> ⚠️ **Fotos de iPhone (.HEIC):** los navegadores no las pueden mostrar. Pásalas a `.jpg` antes (en el iPhone: *Ajustes → Cámara → Formatos → Más compatible*; o al pasarlas a Windows elige "Más compatible").
> ⚠️ GitHub no acepta archivos de más de **100 MB**, así que los videos largos hay que comprimirlos.

No te preocupes por el tamaño de las fotos: al publicar se optimizan solas para que la web cargue rápido.

## ✏️ 2. Escribir los textos — `datos/album.js`

Ábrelo con el Bloc de notas o VS Code. Ahí cambias:

| Qué | Para qué |
|---|---|
| `ella`, `fechaInicio`, `password`, `pista` | Su nombre, el día que se conocieron, la contraseña de entrada |
| `meses` | Título, emoji, frase y descripción de cada mes |
| `fotos` | *(Opcional)* título, texto y lugar de fotos concretas. `destacada: true` la hace más grande |
| `quizFotos` | 📸 El quiz con fotos: "¿dónde fue?", "¿qué comimos?", "¿quién hizo drama?", "¿qué día fue?"… |
| `quiz` | 💭 El quiz "¿Cuánto me conoces?" |
| `razones` | 💌 Las cartas de "Razones por las que te quiero" |
| `cupones` | 🎟️ Los cupones para rascar |
| `carta` | ✉️ La carta del final |
| `final` | 💍 La pregunta del final y el mensaje |

Para referirte a una foto se usa `"carpeta/nombre del archivo"`, por ejemplo `"2026-03/IMG_1234.jpg"`.

### Tipos de pregunta en el quiz de fotos

```js
// Opciones normales (correcta: 0 = la primera, 1 = la segunda…)
{ foto: "2026-04/IMG_1234.jpg", pregunta: "¿Qué comimos este día?",
  opciones: ["Tacos", "Sushi", "Pizza", "Pozole"], correcta: 0,
  efecto: "zoom", comentario: "Y pediste otra orden 😂" },

// Adivinar el día con una barra deslizante (más cerca = más puntos)
{ foto: "2026-06/IMG_5678.jpg", tipo: "fecha", pregunta: "¿Qué día tomamos esta foto?",
  respuesta: "2026-06-14", comentario: "El día de la llanta ponchada" },
```

**Efectos** (opcionales): `"zoom"` (empieza muy de cerca y se va alejando), `"borrosa"` (se va aclarando) y `"piezas"` (se destapa por cuadritos). Con efecto, entre más rápido conteste, más puntos.

Además, al terminar el quiz aparece una **🎲 Ronda sorpresa** que se arma sola con fotos al azar del álbum: *"¿De qué mes es esta foto?"*.

## 🎵 3. Música (opcional)

Pon un `.mp3` en `musica/` con el nombre `cancion.mp3` (o cambia el nombre en `datos/album.js`). Empieza a sonar cuando ella abre el sobre.

## 👀 4. Verla en tu compu antes de publicar

Doble clic en **`vista-previa.bat`**. La primera vez te pedirá instalar [Node.js](https://nodejs.org) (botón LTS) si no lo tienes. Se abre en http://localhost:8080.

## 🚀 5. Publicar

Doble clic en **`publicar.bat`** (o usa GitHub Desktop / VS Code: *commit* + *push*).
En 1–2 minutos está en línea. Puedes ver el progreso en la pestaña **Actions** del repositorio.

---

### 💡 Detalles

- **Hecha para el celular primero:** menú tipo app abajo que se esconde al bajar, fotos en cuadrícula, el visor se cierra deslizando hacia abajo, los cupones se rascan de lado a lado y los juegos se controlan con el dedo. También se adapta a laptop, tablet y celular acostado.

- La contraseña es decorativa: el repositorio es público, así que **cualquiera con el enlace puede ver las fotos**. No subas nada que no quieras que se vea.
- Los récords de los juegos y los cupones ya rascados se guardan en el navegador de ella.
- Atajos: en el visor de fotos y en el modo película funcionan las flechas ← → y `Esc`. Doble clic en cualquier parte = lluvia de corazones.
