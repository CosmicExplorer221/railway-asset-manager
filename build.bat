@echo off
echo ========================================
echo Railway Asset Manager - Production Build
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/3] Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        pause
        exit /b 1
    )
) else (
    echo [1/3] Dependencies already installed
)

echo.
echo [2/3] Building for production...
echo.
call npm run build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Starting preview server...
echo.
echo Production build will be served at: http://localhost:4173
echo Press Ctrl+C to stop the server
echo.

call npm run preview

pause
