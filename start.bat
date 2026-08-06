@echo off
echo ========================================================
echo   Starting Best Friend Challenge Web App (No Docker)
echo ========================================================
echo.
echo 1. Installing dependencies...
python -m pip install -r backend\requirements.txt
echo.
echo 2. Starting FastAPI Application Server...
echo Open your browser at http://127.0.0.1:8000
echo.
cd backend
python -m uvicorn main:app --reload
pause
