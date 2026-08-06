@echo off
echo ========================================================
echo   Best Friend Challenge - Local Development Server
echo ========================================================
echo.
cd /d "%~dp0\..\backend"

echo [1/2] Installing dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Python packaging error. Trying standard launcher...
)

echo.
echo [2/2] Starting FastAPI Development Server...
echo App running at: http://127.0.0.1:8000
echo API Docs at:    http://127.0.0.1:8000/api/docs
echo.

python run.py
pause
