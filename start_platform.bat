@echo off
echo ===================================================
echo   Starting BioWaste Neural-Grid Platform (Local)
echo ===================================================

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "BioWaste Backend" cmd /k "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend on http://localhost:5173 ...
cd frontend
start "BioWaste Frontend" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Platform is active!
echo - Web Application: http://localhost:5173/
echo - Interactive API Docs: http://127.0.0.1:8000/docs
echo ===================================================
