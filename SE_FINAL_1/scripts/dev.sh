#!/bin/bash

echo "🚀 Starting Tutor Booking System Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from env.example..."
    cp env.example .env
    echo "⚠️  Please update .env with your configuration values"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Run migrations
echo "🗄️  Running database migrations..."
npm run migrate:dev

# Seed database
echo "🌱 Seeding database..."
npm run seed

cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "✅ Setup complete! Starting services..."
echo ""
echo "Backend will be available at: http://localhost:3000"
echo "Frontend will be available at: http://localhost:5173"
echo "API Documentation at: http://localhost:3000/docs"
echo ""

# Start backend and frontend in parallel
cd backend && npm run dev &
BACKEND_PID=$!

cd frontend && npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
