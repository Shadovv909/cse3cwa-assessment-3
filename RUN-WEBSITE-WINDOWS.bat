@echo off
setlocal
cd /d "%~dp0"
title Phoneme Studio - Development Server

echo ================================================
echo   CSE3CWA Assessment 1 - Phoneme Studio
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not on PATH.
  echo Install Node.js 20.9 or newer, reopen VS Code, and run this file again.
  pause
  exit /b 1
)

if not exist "package.json" (
  echo ERROR: This launcher must remain in the project folder beside package.json.
  pause
  exit /b 1
)

set NEED_INSTALL=0
if not exist "node_modules\next\package.json" set NEED_INSTALL=1
if not exist "node_modules\react\package.json" set NEED_INSTALL=1
if not exist "node_modules\react-dom\package.json" set NEED_INSTALL=1
if not exist "node_modules\eslint\package.json" set NEED_INSTALL=1
if not exist "node_modules\eslint-config-next\package.json" set NEED_INSTALL=1
if not exist "node_modules\typescript\package.json" set NEED_INSTALL=1

if "%NEED_INSTALL%"=="1" (
  echo Installing the local project dependencies, including development tools...
  echo This is required once after extracting the ZIP.
  echo.
  call npm ci --include=dev
  if errorlevel 1 (
    echo.
    echo ERROR: Dependency installation failed. Read the first npm error above.
    echo Do not continue with VS Code Live Server.
    pause
    exit /b 1
  )
)

echo.
echo Starting the Next.js development server...
echo Open the Local address printed below, normally http://localhost:3000
echo Do NOT click Go Live and do NOT use port 5500.
echo Press Ctrl+C in this window when you are finished.
echo.
call npm run dev

if errorlevel 1 (
  echo.
  echo The development server stopped with an error. Review the message above.
  pause
)
