@echo off
chcp 65001 >nul
title Vista previa del album
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  Necesitas instalar Node.js una sola vez: https://nodejs.org  ^(boton LTS^)
  echo  Despues vuelve a abrir este archivo.
  echo.
  start "" https://nodejs.org
  pause
  exit /b
)
if not exist node_modules (
  echo Instalando herramientas ^(solo la primera vez^)...
  call npm install
)
echo.
echo Procesando fotos...
call npm run build
if errorlevel 1 (
  pause
  exit /b
)
start "" http://localhost:8080
node scripts/serve.mjs
pause
