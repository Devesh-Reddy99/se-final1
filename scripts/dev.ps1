# PowerShell script for Windows

Write-Host "🚀 Starting Tutor Booking System Development Environment..." -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from env.example..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  Please update .env with your configuration values" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install

# Generate Prisma client
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
npm run prisma:generate

# Run migrations
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
npm run migrate:dev

# Seed database
Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
npm run seed

Set-Location ..

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "`n✅ Setup complete! Starting services..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:3000" -ForegroundColor Magenta
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Magenta
Write-Host "API Documentation at: http://localhost:3000/docs" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop all services" -ForegroundColor Yellow
Write-Host ""

# Start backend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

# Start frontend in new window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "Services started in separate windows!" -ForegroundColor Green
