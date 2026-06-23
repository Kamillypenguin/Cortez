@echo off
setlocal
set ROOT=%~dp0
set BACKEND=%ROOT%backend

title OrganizerAgend — Iniciando...
color 0A

echo.
echo  OrganizerAgend ^| Dev Server
echo  ─────────────────────────────────────────────────────
echo.

:: ── Node.js check ─────────────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
  echo  [ERRO] Node.js nao encontrado. Instale em: https://nodejs.org
  pause & exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do set NODEVER=%%v
echo  Node.js %NODEVER% detectado.
echo.

:: ── Backend: instalar dependencias ────────────────────────────────────────────
echo  [1/4] Instalando dependencias do backend...
cd /d "%BACKEND%"
call npm install --silent
if %ERRORLEVEL% neq 0 (
  echo  [ERRO] npm install falhou no backend.
  pause & exit /b 1
)
echo  OK

:: ── Backend: configurar banco SQLite ──────────────────────────────────────────
echo  [2/4] Configurando banco de dados SQLite...
if exist "prisma\dev.db" (
  echo  Banco existente encontrado — mantendo dados.
) else (
  echo  Criando banco novo...
)
call npx prisma db push --accept-data-loss
if %ERRORLEVEL% neq 0 (
  echo  [ERRO] Falha ao configurar banco. Verifique prisma/schema.prisma
  pause & exit /b 1
)
call npx prisma generate >nul 2>&1
echo  OK

:: ── Backend: iniciar em nova janela ───────────────────────────────────────────
echo  [3/4] Iniciando backend (porta 3001)...
start "Backend :3001" cmd /k "cd /d "%BACKEND%" && npx ts-node src/index.ts"
timeout /t 3 /nobreak >nul
echo  OK

:: ── Frontend: instalar e iniciar ──────────────────────────────────────────────
echo  [4/4] Iniciando frontend (porta 5173)...
cd /d "%ROOT%"
call npm install --silent
start "Frontend :5173" cmd /k "cd /d "%ROOT%" && npm run dev"
timeout /t 4 /nobreak >nul

:: ── Abrir navegador ────────────────────────────────────────────────────────────
start "" "http://localhost:5173"

echo.
echo  ─────────────────────────────────────────────────────
echo  Backend:   http://localhost:3001/health
echo  Frontend:  http://localhost:5173
echo  ─────────────────────────────────────────────────────
echo.
echo  Duas janelas de terminal foram abertas (backend e frontend).
echo  Feche-as para encerrar os servidores.
echo.
echo  DADOS DE DEMO (opcional):
echo  Execute no terminal do backend para popular o banco:
echo    npx ts-node src/seed.ts
echo  Login: kamil@organizeragend.com  /  Senha: Demo@123
echo.
pause
endlocal
