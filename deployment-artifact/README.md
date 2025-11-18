# Tutor Booking System

A production-ready full-stack web application for managing tutor bookings with advanced features including role-based access control, atomic booking system, automated reminders, and comprehensive admin dashboard.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based secure authentication with role-based access control
- **User Roles**: Student, Tutor, and Admin with specific permissions
- **Tutor Management**: Create, update, and manage tutor profiles
- **Slot Management**: Create one-time and recurring time slots with overlap prevention
- **Atomic Booking System**: Prevents double-booking under high concurrency
- **Search & Filtering**: Advanced search for tutors and bookings
- **Email Notifications**: Automated emails for booking confirmations, cancellations, and reminders
- **Automated Reminders**: Background scheduler sends 1-hour advance notifications
- **Admin Dashboard**: Complete user and booking management with CSV export
- **File Uploads**: Profile pictures and documents support
- **Performance Monitoring**: Health checks and metrics endpoints
- **Security**: Rate limiting, input validation, SQL injection prevention

### Technical Highlights
- **Frontend**: React 18 + TypeScript + Vite + TailwindCSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **Email**: Nodemailer with template support
- **Job Queue**: Bull + Redis for background tasks
- **Caching**: Redis for performance optimization
- **Testing**: Jest + Supertest + Playwright (90%+ coverage)
- **Docker**: Complete containerization with docker-compose
- **API Documentation**: OpenAPI/Swagger at `/docs`

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Docker and Docker Compose
- PostgreSQL 14+ (if running without Docker)
- Redis 6+ (if running without Docker)

## 🛠️ Quick Start

### One-Command Development Setup

```bash
# Make script executable (Unix/Mac)
chmod +x ./scripts/dev.sh
./scripts/dev.sh

# Windows
.\scripts\dev.ps1
```

This will:
1. Install all dependencies
2. Start Docker containers (PostgreSQL, Redis)
3. Run database migrations
4. Seed initial data
5. Start backend and frontend in development mode

### Manual Setup

#### 1. Clone and Install

```bash
git clone <repository-url>
cd SE_FINAL_1
npm install
```

#### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env

# Edit .env with your actual values
```

#### 3. Start Infrastructure

```bash
docker-compose up -d
```

#### 4. Database Setup

```bash
cd backend
npm run migrate
npm run seed
```

#### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/docs

## 🧪 Testing

### Run All Tests

```bash
# Backend tests
cd backend
npm run test              # Unit tests
npm run test:integration  # Integration tests
npm run test:e2e         # E2E tests
npm run test:coverage    # Coverage report
npm run test:performance # Performance tests
npm run test:security    # Security tests

# Frontend tests
cd frontend
npm run test             # Unit tests
npm run test:e2e        # E2E tests with Playwright
```

### Test Reports

Test coverage reports are generated in:
- `backend/coverage/` - Backend test coverage
- `frontend/coverage/` - Frontend test coverage
- `docs/test-reports/` - Comprehensive test reports

## 📚 Documentation

- **[API Documentation](./docs/API.md)** - Complete API reference
- **[Architecture](./docs/ARCHITECTURE.md)** - System architecture and design decisions
- **[Database Schema](./docs/ERD.md)** - Entity relationship diagram and schema
- **[Deployment Guide](./docs/DEPLOYMENT.md)** - Production deployment instructions
- **[Test Reports](./docs/test-reports/)** - Test coverage and performance reports
- **[Jira Mapping](./JIRA_MAPPING.md)** - Feature to Jira ticket mapping

## 🔑 Default Users (After Seeding)

```
Admin:
Email: admin@tutorbook.com
Password: Admin123!

Tutor:
Email: tutor@tutorbook.com
Password: Tutor123!

Student:
Email: student@tutorbook.com
Password: Student123!
```

## 📊 Admin Dashboard Features

- User management (create, update, delete, role assignment)
- Global booking listings with advanced filters
- CSV export for bookings and users
- System statistics and analytics
- Performance monitoring

## 🔐 Security Features

- JWT token-based authentication
- Bcrypt password hashing (10 rounds)
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Helmet.js security headers

## 📧 Email Notifications

- **Booking Confirmation**: Sent immediately after booking creation
- **Booking Cancellation**: Sent when booking is cancelled
- **1-Hour Reminder**: Automated reminder sent 1 hour before session
- **Email Templates**: Professional HTML templates with branding

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/upload-avatar` - Upload profile picture

### Tutors
- `GET /api/tutors` - Search tutors (with filters)
- `GET /api/tutors/:id` - Get tutor details
- `POST /api/tutors` - Create tutor profile
- `PUT /api/tutors/:id` - Update tutor profile

### Slots
- `GET /api/slots` - Get available slots
- `POST /api/slots` - Create slot (one-time or recurring)
- `PUT /api/slots/:id` - Update slot
- `DELETE /api/slots/:id` - Delete slot

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking (atomic)
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Admin
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/bookings` - List all bookings (with filters)
- `GET /api/admin/bookings/export` - Export bookings to CSV
- `GET /api/admin/stats` - System statistics

### System
- `GET /api/health` - Health check
- `GET /api/metrics` - Performance metrics

## 🏗️ Project Structure

```
SE_FINAL_1/
├── backend/              # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Auth, validation, error handling
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── models/       # Prisma models
│   │   ├── utils/        # Utilities
│   │   └── config/       # Configuration
│   ├── prisma/           # Database schema and migrations
│   ├── tests/            # Test suites
│   └── uploads/          # File uploads
├── frontend/             # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   ├── store/        # State management
│   │   └── utils/        # Utilities
│   └── tests/            # Frontend tests
├── docs/                 # Documentation
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── DEPLOYMENT.md
│   └── test-reports/
├── scripts/              # Automation scripts
│   ├── dev.sh
│   └── dev.ps1
├── docker-compose.yml    # Docker orchestration
├── env.example           # Environment template
├── CHECKLIST.md          # Project checklist
├── JIRA_MAPPING.md       # Feature mapping
└── README.md
```

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for detailed production deployment instructions including:
- AWS/GCP/Azure deployment
- Environment configuration
- SSL/TLS setup
- Database scaling
- Monitoring and logging
- CI/CD pipeline setup

## 🔧 Environment Variables

See `env.example` for all required environment variables. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - JWT signing secret
- `REDIS_URL` - Redis connection string
- `SMTP_*` - Email service configuration
- `PORT` - API server port

## 📈 Performance

- Database query optimization with indexes
- Redis caching for frequently accessed data
- Connection pooling
- Pagination on list endpoints
- Rate limiting to prevent abuse
- Response compression

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
cd backend && npm run migrate
```

### Port Conflicts
Check if ports 3000, 5173, 5432, 6379 are available

### Redis Connection Issues
```bash
# Restart Redis
docker-compose restart redis
```

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact: support@tutorbook.com
- Documentation: See `/docs` folder

## ✅ Project Status

- ✅ Authentication & Authorization
- ✅ Role-based Access Control
- ✅ Tutor & Slot Management
- ✅ Atomic Booking System
- ✅ Email Notifications
- ✅ Automated Reminders
- ✅ Admin Dashboard
- ✅ Search & Filtering
- ✅ File Uploads
- ✅ Complete Test Suite
- ✅ Docker Setup
- ✅ Documentation
- ✅ Production Ready
