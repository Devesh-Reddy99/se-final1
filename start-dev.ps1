# TutorConnect Development Server Launcher
Write-Host "🚀 Starting TutorConnect in development mode..." -ForegroundColor Cyan

# Start backend in new terminal
Write-Host "📡 Starting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; npm run dev"

# Wait a bit for backend to start
Start-Sleep -Seconds 3

# Start frontend in new terminal  
Write-Host "🌐 Starting frontend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`n✅ Development servers starting!" -ForegroundColor Green
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "`nDefault Accounts:" -ForegroundColor Yellow
Write-Host "  Admin:   admin@tutorbook.com / Admin123!" -ForegroundColor White
Write-Host "  Tutor:   tutor@tutorbook.com / Tutor123!" -ForegroundColor White
Write-Host "  Student: student@tutorbook.com / Student123!" -ForegroundColor White
