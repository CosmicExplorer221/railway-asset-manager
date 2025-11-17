@echo off
echo ========================================
echo Railway Asset Manager - Development
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [1/2] Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install dependencies!
        echo Please make sure Node.js and npm are installed.
        pause
        exit /b 1
    )
) else (
    echo [1/2] Dependencies already installed (skipping npm install)
)

echo.
echo [2/2] Starting development server...
echo.
echo The application will open at: http://localhost:5173
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause
