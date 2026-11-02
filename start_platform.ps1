Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting BioWaste Neural-Grid Platform (Local)   " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

# Start FastAPI Backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload"

# Start Vite Frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host ""
Write-Host "Platform is active!" -ForegroundColor Green
Write-Host "  ➜ Web App UI:        http://localhost:5173/" -ForegroundColor Yellow
Write-Host "  ➜ API Swagger Docs:  http://127.0.0.1:8000/docs" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
