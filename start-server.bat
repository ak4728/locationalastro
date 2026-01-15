@echo off
echo Starting local development server...
echo.
echo This will serve your website locally to avoid CORS issues.
echo Open your browser to: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Try different methods to start a local server
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP server...
    python -m http.server 8000
    goto :end
)

py --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Python HTTP server...
    py -m http.server 8000
    goto :end
)

node --version >nul 2>&1
if %errorlevel% == 0 (
    echo Starting Node.js HTTP server...
    npx http-server -p 8000
    goto :end
)

echo.
echo No suitable server found. Please install:
echo - Python 3.x or
echo - Node.js
echo.
echo Or try opening the files directly in your browser with a different browser or
echo use a browser extension that allows local file access.
echo.
pause

:end