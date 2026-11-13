# 💞 Nuestro álbum

Web-regalo con nuestras fotos y recuerdos organizados por meses, minijuegos y una carta.

## Cómo añadir fotos
1. Sube las fotos a `fotos/AAAA-MM/` (ej. `fotos/2026-03/1.jpg`). Mejor en `.jpg` y de menos de ~1 MB cada una.
2. Edita `js/data.js`: meses, títulos, textos, fechas, preguntas del quiz, la carta y la contraseña.
3. Haz commit y push a `main` → se publica sola con GitHub Actions.

## Activar GitHub Pages
Settings → Pages → *Build and deployment* → Source: **GitHub Actions**.

> Nota: GitHub Pages en repositorios **privados** requiere GitHub Pro (o similar). Con cuenta gratuita, el repo tiene que ser público para usar Pages.

## Probar en local
```bash
python3 -m http.server 8000
```
y abre http://localhost:8000
