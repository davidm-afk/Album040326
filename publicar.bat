@echo off
chcp 65001 >nul
title Publicar album
cd /d "%~dp0"
echo.
echo  Subiendo cambios a GitHub...
echo.
git add -A
git commit -m "Actualizar album" || echo  ^(No habia cambios nuevos^)
git pull --rebase --autostash
git push
if errorlevel 1 (
  echo.
  echo  Algo fallo al subir. Revisa el mensaje de arriba.
) else (
  echo.
  echo  Listo. En 1-2 minutos estara en linea:
  echo  https://davidm-afk.github.io/Album040326/
)
echo.
pause
