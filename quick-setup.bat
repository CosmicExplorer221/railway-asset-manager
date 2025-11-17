@echo off
echo ========================================
echo Railway Asset Manager - Quick Setup
echo ========================================
echo.

echo This script will:
echo 1. Checkout the development branch with the code
echo 2. Create a clean 'main' branch
echo 3. Install dependencies
echo 4. You're ready to run!
echo.
pause

echo.
echo [1/4] Checking out development branch...
git checkout claude/railway-asset-manager-01YXJiJmDZGHUuaUgyLVWh1d
if errorlevel 1 (
    echo ERROR: Failed to checkout development branch!
    echo Make sure you cloned the repository correctly.
    pause
    exit /b 1
)

echo.
echo [2/4] Creating main branch...
git checkout -b main
if errorlevel 1 (
    echo Note: main branch may already exist, continuing...
    git checkout main
)

echo.
echo [3/4] Removing development branch...
git branch -D claude/railway-asset-manager-01YXJiJmDZGHUuaUgyLVWh1d
if errorlevel 1 (
    echo Note: Branch already removed or doesn't exist.
)

echo.
echo [4/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo You are now on the 'main' branch with all the code.
echo.
echo To start the app, simply run: run.bat
echo.
pause
