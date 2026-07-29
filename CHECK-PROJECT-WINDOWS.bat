@echo off
setlocal
cd /d "%~dp0"
title Phoneme Studio - Assessment Checks

echo ================================================
echo   CSE3CWA Assessment 1 - Complete Project Check
echo ================================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo ERROR: Node.js is not installed or is not on PATH.
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
  echo.
  call npm ci --include=dev
  if errorlevel 1 (
    echo.
    echo ERROR: Dependency installation failed. Read the first npm error above.
    pause
    exit /b 1
  )
)

echo.
echo Running ESLint, TypeScript, unit tests, and the production build...
echo.
call npm run check

if errorlevel 1 (
  echo.
  echo CHECK FAILED. Review the first error above.
  pause
  exit /b 1
)

echo.
echo ALL PROJECT CHECKS PASSED.
echo You can now run RUN-WEBSITE-WINDOWS.bat and record the application.
echo.
pause
