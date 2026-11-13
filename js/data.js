/* =========================================================
   ✏️  ESTE ES EL ÚNICO ARCHIVO QUE NECESITAS EDITAR
   ---------------------------------------------------------
   1. Sube tus fotos a la carpeta /fotos (por ejemplo
      fotos/2026-03/primera-cita.jpg)
   2. Escribe aquí la ruta, un título y lo que quieras decir.
   3. Si una foto no existe todavía, se mostrará un
      degradado bonito en su lugar (así puedes probar la web).
   ========================================================= */

const ALBUM = {
  // Vuestros nombres
  yo: "David",
  ella: "Mi amor",

  // Día en que os conocisteis (AAAA-MM-DD) → contador de días juntos
  fechaInicio: "2026-03-04",

  // Contraseña para entrar (déjalo en "" para quitarla).
  // Pista que se muestra en la pantalla de entrada.
  // Ojo: es una protección "de broma", no seguridad real.
  password: "040326",
  pista: "Nuestra fecha, en formato DDMMAA 💫",

  // Texto grande de la portada
  tituloPortada: "Nuestra historia",
  subtituloPortada: "Un álbum de todos los momentos que nos han hecho ser nosotros",

  // Canción de fondo opcional (pon un .mp3 en /fotos o deja "")
  musica: "",

  /* ---------- MESES ----------
     Cada mes tiene: id (AAAA-MM), titulo, emoji, descripcion
     y una lista de recuerdos { foto, titulo, texto, fecha } */
  meses: [
    {
      id: "2026-03",
      titulo: "Marzo 2026",
      emoji: "🌱",
      descripcion: "Donde empezó todo. Ninguno de los dos sabía lo que venía.",
      recuerdos: [
        { foto: "fotos/2026-03/1.jpg", titulo: "El día que nos conocimos", texto: "4 de marzo. Todavía me acuerdo de lo que llevabas puesto.", fecha: "04/03/2026" },
        { foto: "fotos/2026-03/2.jpg", titulo: "Primera cita", texto: "Hablamos tanto que nos cerraron el sitio.", fecha: "12/03/2026" },
        { foto: "fotos/2026-03/3.jpg", titulo: "Primer selfie", texto: "Salimos fatal y aun así es mi foto favorita.", fecha: "20/03/2026" }
      ]
    },
    {
      id: "2026-04",
      titulo: "Abril 2026",
      emoji: "🌸",
      descripcion: "El mes de las primeras veces.",
      recuerdos: [
        { foto: "fotos/2026-04/1.jpg", titulo: "Paseo de primavera", texto: "Escribe aquí tu recuerdo.", fecha: "05/04/2026" },
        { foto: "fotos/2026-04/2.jpg", titulo: "Cena en casa", texto: "Escribe aquí tu recuerdo.", fecha: "18/04/2026" }
      ]
    },
    {
      id: "2026-05",
      titulo: "Mayo 2026",
      emoji: "☀️",
      descripcion: "Más sol, más planes, más nosotros.",
      recuerdos: [
        { foto: "fotos/2026-05/1.jpg", titulo: "Escapada", texto: "Escribe aquí tu recuerdo.", fecha: "10/05/2026" },
        { foto: "fotos/2026-05/2.jpg", titulo: "Atardecer", texto: "Escribe aquí tu recuerdo.", fecha: "24/05/2026" },
        { foto: "fotos/2026-05/3.jpg", titulo: "Helado de los dos", texto: "Escribe aquí tu recuerdo.", fecha: "30/05/2026" },
        { foto: "fotos/2026-05/4.jpg", titulo: "Sin razón", texto: "Escribe aquí tu recuerdo.", fecha: "31/05/2026" }
      ]
    },
    {
      id: "2026-06",
      titulo: "Junio 2026",
      emoji: "🌊",
      descripcion: "Verano contigo.",
      recuerdos: [
        { foto: "fotos/2026-06/1.jpg", titulo: "Playa", texto: "Escribe aquí tu recuerdo.", fecha: "21/06/2026" },
        { foto: "fotos/2026-06/2.jpg", titulo: "San Juan", texto: "Escribe aquí tu recuerdo.", fecha: "23/06/2026" }
      ]
    }
  ],

  /* ---------- QUIZ "¿Cuánto me conoces?" ----------
     correcta = posición de la respuesta buena (empieza en 0) */
  quiz: [
    { pregunta: "¿Dónde nos conocimos?", opciones: ["En una fiesta", "Por amigos", "En la uni", "Por una app"], correcta: 1 },
    { pregunta: "¿Cuál es mi comida favorita?", opciones: ["Pizza", "Sushi", "Tacos", "Pasta"], correcta: 0 },
    { pregunta: "¿Qué canción es 'nuestra canción'?", opciones: ["Opción A", "Opción B", "Opción C", "Opción D"], correcta: 2 },
    { pregunta: "¿Quién dijo 'te quiero' primero?", opciones: ["Yo", "Tú", "A la vez", "Nadie se acuerda 🙈"], correcta: 0 },
    { pregunta: "¿Cuál es nuestro plan perfecto?", opciones: ["Peli y manta", "Viajar", "Cenar fuera", "Todas"], correcta: 3 }
  ],

  /* ---------- CARTA FINAL ---------- */
  carta: [
    "Mi amor:",
    "He querido guardar aquí todo lo que hemos vivido desde aquel día, para que cuando lo mires sepas lo mucho que significas para mí.",
    "Cada foto de este álbum es un pedacito de nosotros, y lo mejor es que todavía nos quedan muchísimas páginas por llenar.",
    "Gracias por cada risa, cada abrazo y cada momento.",
    "Te quiero. ❤️"
  ]
};
