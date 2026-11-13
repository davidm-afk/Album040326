/* ==================================================================
   💞  AQUÍ VA TODO LO TUYO  💞
   ------------------------------------------------------------------
   • Las FOTOS no hace falta escribirlas aquí: con meterlas en
     fotos/2026-03, fotos/2026-04, ... aparecen solas en su mes,
     ordenadas por la fecha en que se tomaron.
   • Aquí escribes los TEXTOS: títulos de cada mes, lo que quieras
     contar de una foto en concreto, el quiz, las razones, los
     cupones y la carta.
   • Reglas básicas: los textos van "entre comillas", y cada
     elemento de una lista termina en coma.
   ================================================================== */

const ALBUM = {
  yo: "David",
  ella: "Mi amor",                 // ← su nombre o como le dices de cariño

  fechaInicio: "2026-03-04",       // día que se conocieron (AAAA-MM-DD)

  // Contraseña de entrada ("" = sin contraseña). Es decorativa, no es seguridad real.
  password: "040326",
  pista: "Nuestra fecha, en formato DDMMAA 💫",

  tituloPortada: "Nuestra historia",
  subtituloPortada: "Cada foto es un pedacito de nosotros. Aquí están todos, juntitos.",

  // Música de fondo: pon un .mp3 en la carpeta musica/ y escribe su nombre ("" = sin música)
  musica: { archivo: "musica/cancion.mp3", titulo: "Nuestra canción" },

  /* ---------------------------------------------------------------
     MESES — el nombre de la carpeta en fotos/ es la clave.
     frase: aparece grande;  descripcion: un párrafo corto.
     --------------------------------------------------------------- */
  meses: {
    "2026-03": { titulo: "Marzo", emoji: "🌱", frase: "Donde empezó todo", descripcion: "Ninguno de los dos sabía lo que venía. Spoiler: algo muy bonito." },
    "2026-04": { titulo: "Abril", emoji: "🌸", frase: "El mes de las primeras veces", descripcion: "Primeras salidas, primeros nervios, primeros 'ya llegué a mi casa'." },
    "2026-05": { titulo: "Mayo", emoji: "☀️", frase: "Más sol, más nosotros", descripcion: "Escribe aquí lo que recuerdas de este mes." },
    "2026-06": { titulo: "Junio", emoji: "🌊", frase: "Verano contigo", descripcion: "Escribe aquí lo que recuerdas de este mes." },
    "2026-07": { titulo: "Julio", emoji: "🍉", frase: "Días largos, risas más largas", descripcion: "Escribe aquí lo que recuerdas de este mes." },
    "2026-08": { titulo: "Agosto", emoji: "🌻", frase: "Lo mejor del verano fuiste tú", descripcion: "Escribe aquí lo que recuerdas de este mes." },
    "2026-09": { titulo: "Septiembre", emoji: "🍂", frase: "Aprendiendo a ser equipo", descripcion: "Escribe aquí lo que recuerdas de este mes." },
    "2026-10": { titulo: "Octubre", emoji: "🎃", frase: "Y seguimos sumando", descripcion: "Escribe aquí lo que recuerdas de este mes." },
  },

  /* ---------------------------------------------------------------
     FOTOS CON HISTORIA (opcional)
     "carpeta/archivo": { titulo, texto, lugar, destacada }
     destacada: true → se ve más grande en el álbum.
     --------------------------------------------------------------- */
  fotos: {
    "2026-03/IMG_0001.jpg": { titulo: "El día que nos conocimos", texto: "Todavía me acuerdo de lo que traías puesto.", lugar: "Ciudad", destacada: true },
  },

  /* ---------------------------------------------------------------
     📸 QUIZ CON FOTOS
     foto: "carpeta/archivo"
     tipo:  "opciones" (normal) o "fecha" (adivinar el día con una barra)
     efecto (opcional): "zoom"  → la foto empieza muy de cerca y se va alejando
                        "borrosa" → empieza borrosa y se aclara
                        "piezas" → se va destapando por cuadritos
                        Con efecto, entre más rápido conteste, más puntos.
     correcta: posición de la respuesta buena, EMPEZANDO EN 0
     comentario: se muestra después de contestar (aquí va el chisme 😂)
     --------------------------------------------------------------- */
  quizFotos: [
    {
      foto: "2026-03/IMG_0001.jpg",
      pregunta: "¿Dónde fue esta foto?",
      opciones: ["En el café de siempre", "En casa de tu mamá", "En el parque", "En la playa"],
      correcta: 0,
      efecto: "zoom",
      comentario: "Ahí donde pediste un café y te lo tomaste frío porque no dejabas de hablar 🥰",
    },
    {
      foto: "2026-04/IMG_0002.jpg",
      pregunta: "¿Qué comimos este día?",
      opciones: ["Tacos al pastor 🌮", "Sushi 🍣", "Pizza 🍕", "Hamburguesas 🍔"],
      correcta: 0,
      comentario: "Y luego dijiste que ya no ibas a comer en toda la semana. Duró dos horas.",
    },
    {
      foto: "2026-05/IMG_0003.jpg",
      pregunta: "¿Quién hizo drama este día?",
      opciones: ["Yo 🙋‍♂️", "Tú 🙋‍♀️", "Los dos 🙃", "Nadie, fue un día perfecto ✨"],
      correcta: 1,
      efecto: "borrosa",
      comentario: "Pero te veías muy bonita haciendo drama, eso sí 😌",
    },
    {
      foto: "2026-06/IMG_0004.jpg",
      tipo: "fecha",
      pregunta: "¿Qué día tomamos esta foto?",
      respuesta: "2026-06-14",
      comentario: "Fue el día que se nos ponchó la llanta 😂",
    },
    {
      foto: "2026-07/IMG_0005.jpg",
      pregunta: "¿Qué estábamos celebrando?",
      opciones: ["Tu cumpleaños", "Nuestro mes", "Nada, solo porque sí", "Que sobrevivimos al tráfico"],
      correcta: 2,
      efecto: "piezas",
      comentario: "Las mejores fiestas son las que no tienen razón.",
    },
    {
      foto: "2026-08/IMG_0006.jpg",
      pregunta: "¿Quién tomó esta foto?",
      opciones: ["Yo", "Tú", "Un desconocido muy amable", "Temporizador y mucha fe"],
      correcta: 3,
      comentario: "Nos tomó 14 intentos. Valió la pena.",
    },
  ],

  /* 💭 QUIZ "¿CUÁNTO ME CONOCES?" (sin fotos) */
  quiz: [
    { pregunta: "¿Cuál es mi comida favorita?", opciones: ["Tacos", "Pizza", "Sushi", "Pozole"], correcta: 0, comentario: "Obvio 🌮" },
    { pregunta: "¿Qué es lo primero que noté de ti?", opciones: ["Tu sonrisa", "Tus ojos", "Tu risa", "Tu forma de hablar"], correcta: 0 },
    { pregunta: "¿Cuál es 'nuestra canción'?", opciones: ["Canción A", "Canción B", "Canción C", "Canción D"], correcta: 2 },
    { pregunta: "¿Quién dijo 'te quiero' primero?", opciones: ["Yo", "Tú", "Al mismo tiempo", "No me acuerdo 🙈"], correcta: 0 },
    { pregunta: "¿Cuál es mi plan perfecto contigo?", opciones: ["Peli y cobija", "Viajar", "Salir a cenar", "Cualquiera, si es contigo"], correcta: 3, comentario: "Respuesta correcta y cursi 💕" },
  ],

  /* 💌 RAZONES POR LAS QUE TE QUIERO (cartas que se deslizan) */
  razones: [
    "Por cómo te ríes cuando algo te da mucha risa y no puedes parar.",
    "Porque contigo hasta el tráfico es divertido.",
    "Por cómo me miras cuando crees que no me doy cuenta.",
    "Porque me haces querer ser mejor cada día.",
    "Por tus abrazos, que arreglan cualquier día malo.",
    "Porque eres mi persona favorita para no hacer nada.",
    "Por tu forma de cuidar a los que quieres.",
    "Porque sí. Y porque no me alcanzan las cartas.",
  ],

  /* 🎟️ CUPONES (se rascan para descubrirlos) */
  cupones: [
    { emoji: "💆‍♀️", titulo: "Masaje de 20 minutos", detalle: "Sin quejas y sin ver el reloj." },
    { emoji: "🍿", titulo: "Noche de peli", detalle: "Tú eliges la película. Yo no me duermo (lo intento)." },
    { emoji: "🌮", titulo: "Cena de tu antojo", detalle: "Lo que quieras, donde quieras." },
    { emoji: "🙊", titulo: "Ganas una discusión", detalle: "Válido una vez. Úsalo con sabiduría." },
    { emoji: "🧁", titulo: "Desayuno en la cama", detalle: "Incluye café como te gusta." },
    { emoji: "🚗", titulo: "Viaje sorpresa", detalle: "Yo planeo todo. Tú solo empacas." },
  ],

  /* ✉️ CARTA — cada línea es un párrafo */
  carta: [
    "Mi amor:",
    "Quise juntar en un solo lugar todo lo que hemos vivido desde aquel día, para que cada vez que lo veas sepas lo mucho que significas para mí.",
    "Cada foto de este álbum es un pedacito de nosotros, y lo mejor es que todavía nos quedan muchísimas páginas por llenar.",
    "Gracias por cada risa, cada abrazo, cada plan y hasta cada drama.",
    "Te quiero. Hoy, mañana y en todos los meses que vienen. ❤️",
  ],

  /* 🎆 FINAL */
  final: {
    pregunta: "¿Quieres seguir escribiendo esta historia conmigo?",
    si: "¡Sí, mil veces! 💖",
    no: "No",
    mensaje: "Sabía que dirías que sí 🥹 Te quiero muchísimo.",
  },
};
