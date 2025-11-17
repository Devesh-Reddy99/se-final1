# TutorConnect Setup Script
Write-Host "🚀 Starting TutorConnect setup..." -ForegroundColor Cyan

# Backend Setup
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location -Path "backend"
npm install

Write-Host "`n🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

Write-Host "`n🌱 Seeding database..." -ForegroundColor Yellow
npm run seed

# Frontend Setup
Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location -Path "../frontend"
npm install

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the application:" -ForegroundColor Cyan
Write-Host "  Backend:  cd backend && npm run dev" -ForegroundColor White
Write-Host "  Frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "`nDefault Accounts:" -ForegroundColor Cyan
Write-Host "  Admin:   admin@tutorbook.com / Admin123!" -ForegroundColor White
Write-Host "  Tutor:   tutor@tutorbook.com / Tutor123!" -ForegroundColor White
Write-Host "  Student: student@tutorbook.com / Student123!" -ForegroundColor White

Set-Location -Path ".."
