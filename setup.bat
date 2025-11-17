@echo off
echo ========================================
echo Railway Asset Manager - First Time Setup
echo ========================================
echo.

echo Checking Node.js installation...
call node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Recommended version: Node.js 18 or higher
    pause
    exit /b 1
)

echo Node.js version:
call node --version
echo.

echo Checking npm installation...
call npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm is not installed!
    pause
    exit /b 1
)

echo npm version:
call npm --version
echo.

echo Installing project dependencies...
echo This may take a few minutes...
echo.
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
echo To start the development server, run:
echo   run.bat
echo.
echo To build for production, run:
echo   build.bat
echo.
pause
