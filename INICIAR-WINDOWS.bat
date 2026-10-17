@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Instale o Node.js 22.13 ou superior e abra este arquivo novamente.
  pause
  exit /b 1
)
node -e "var v=process.versions.node.split('.').map(Number); if(v[0]<22 || (v[0]===22 && v[1]<13)) process.exit(1)"
if errorlevel 1 (
  echo Atualize o Node.js para 22.13 ou superior.
  pause
  exit /b 1
)
if not exist "node_modules\.modules.yaml" (
  echo Instalando as bibliotecas originais. A primeira execucao precisa de internet.
  call npx --yes --package pnpm@11.25.0 pnpm install --frozen-lockfile
  if errorlevel 1 (
    echo A instalacao falhou. Confira a mensagem acima e sua conexao.
    pause
    exit /b 1
  )
)
echo.
echo Quando o servidor estiver pronto, abra http://localhost:5173
echo Mantenha esta janela aberta enquanto joga. Ctrl+C encerra o servidor.
echo.
call npx --yes --package pnpm@11.25.0 pnpm dev
if errorlevel 1 pause
