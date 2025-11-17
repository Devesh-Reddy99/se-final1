# 📚 Tutor Booking System - Documentation Index

Welcome to the Tutor Booking System! This is your central hub for all project documentation.

## 🎯 Quick Navigation

### 🚀 **Start Here**
1. **[QUICKSTART.md](./QUICKSTART.md)** - Get the app running in 5 minutes
   - Automated setup scripts
   - Test accounts
   - Troubleshooting guide

2. **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview
   - What's implemented vs pending
   - Technology stack
   - Architecture overview
   - Development roadmap

3. **[README.md](./README.md)** - Project introduction
   - Features overview
   - Setup instructions
   - Usage guide

---

## 📋 Planning & Tracking

### **[CHECKLIST.md](./CHECKLIST.md)**
Feature implementation checklist organized by priority:
- ✅ Authentication & Authorization
- ✅ User Management
- ✅ Tutor Profiles
- ✅ Availability Slots
- ✅ Booking System
- ✅ Email Notifications
- ✅ Admin Dashboard
- 🚧 Frontend Pages
- 🚧 Testing Suite
- 🚧 Documentation

### **[JIRA_MAPPING.md](./JIRA_MAPPING.md)**
User stories mapped to implementation files:
- Backend API endpoints
- Frontend components
- Database models
- Services & middleware

---

## 💻 Development Guides

### **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** ⭐ **Most Important for Development**
Detailed specifications for implementing the 9 pending frontend pages:
- **Student Pages:** SearchTutors, TutorDetails, MyBookings
- **Tutor Pages:** CreateProfile, ManageSlots, Dashboard
- **Admin Pages:** AdminDashboard, UserManagement, BookingManagement
- Includes: API calls, state management, UI layouts, code patterns

### **Development Scripts**
- **Windows:** `scripts/dev.ps1` - PowerShell setup script
- **Unix/Linux:** `scripts/dev.sh` - Bash setup script

---

## 🏗️ Architecture & Code

### Backend Structure
```
backend/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── controllers/           # Request handlers (8 files)
│   ├── routes/               # API route definitions (8 files)
│   ├── middlewares/          # Auth, RBAC, validation, etc. (6 files)
│   ├── services/             # Email service
│   ├── jobs/                 # Reminder scheduler
│   └── utils/                # Logger
├── prisma/
│   ├── schema.prisma         # Database schema (SQLite)
│   └── seed.ts               # Sample data
└── tests/                    # Test files (to be created)
```

### Frontend Structure
```
frontend/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Router & route protection
│   ├── pages/
│   │   ├── Login.tsx         ✅ Complete
│   │   ├── Register.tsx      ✅ Complete
│   │   ├── Dashboard.tsx     ✅ Complete
│   │   ├── Profile.tsx       ✅ Complete
│   │   ├── student/          🚧 3 stub pages
│   │   ├── tutor/            🚧 3 stub pages
│   │   └── admin/            🚧 3 stub pages
│   ├── components/
│   │   └── Navbar.tsx        ✅ Complete
│   ├── contexts/
│   │   └── AuthContext.tsx   ✅ Complete
│   └── services/
│       └── api.ts            ✅ Complete
└── tests/                    # E2E tests (to be created)
```

---

## 🔧 Configuration Files

### Environment Setup
- **`.env.example`** - Template for environment variables
- Copy to `.env` in both `backend/` and `frontend/` directories

### Docker
- **`docker-compose.yml`** - Multi-container orchestration
- **`backend/Dockerfile`** - Backend container config
- **`frontend/Dockerfile`** - Frontend container config

### TypeScript
- **`backend/tsconfig.json`** - Backend TS config
- **`frontend/tsconfig.json`** - Frontend TS config
- **`frontend/tsconfig.node.json`** - Vite config types

### Build Tools
- **`backend/package.json`** - Backend dependencies & scripts
- **`frontend/package.json`** - Frontend dependencies & scripts
- **`frontend/vite.config.ts`** - Vite build configuration
- **`frontend/tailwind.config.js`** - TailwindCSS config

---

## 📊 Database

### Prisma Schema
**File:** `backend/prisma/schema.prisma`

**Models:**
- **User** - Authentication & profile (id, email, password, name, role)
- **Tutor** - Tutor-specific data (bio, subjects, hourlyRate, rating)
- **Slot** - Availability slots (startTime, endTime, isBooked, recurrence)
- **Booking** - Session bookings (studentId, slotId, status)

**Enums:**
- Role: STUDENT, TUTOR, ADMIN
- BookingStatus: PENDING, CONFIRMED, CANCELLED, COMPLETED
- SlotRecurrence: NONE, DAILY, WEEKLY, MONTHLY

### Database Commands
```powershell
cd backend

# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Apply migrations
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Seed database
npx prisma db seed

# Open Prisma Studio (database GUI)
npx prisma studio
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
1. User registers → Password hashed with bcrypt (10 rounds)
2. User logs in → JWT token issued (7-day expiry)
3. Token stored in localStorage
4. Token sent in Authorization header: `Bearer <token>`
5. Backend validates token in `auth.middleware.ts`

### Role-Based Access Control (RBAC)
**Middleware:** `backend/src/middlewares/rbac.middleware.ts`

**Roles:**
- **STUDENT** - Can search tutors, book sessions, manage bookings
- **TUTOR** - Can create profile, manage slots, view bookings
- **ADMIN** - Can manage users, bookings, view analytics

**Protected Routes:**
```typescript
// Example: Only tutors can create slots
router.post('/slots', authenticate, requireRole(['TUTOR']), createSlot);

// Example: Only admins can delete users
router.delete('/users/:id', authenticate, requireRole(['ADMIN']), deleteUser);
```

---

## 📧 Email Notifications

### Email Service
**File:** `backend/src/services/emailService.ts`

**Uses:** Nodemailer with SMTP

**Email Types:**
1. **Booking Confirmation** - Sent to student when booking confirmed
2. **Booking Cancellation** - Sent to both student & tutor
3. **1-Hour Reminder** - Automated reminder sent by cron job

### Configuration
Set in `.env`:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@tutorbooking.com
```

### Reminder Job
**File:** `backend/src/jobs/reminderJob.ts`

**Schedule:** Runs every 5 minutes

**Logic:** Finds bookings starting in 55-65 minutes, sends reminder if not already sent

---

## 🧪 Testing Strategy

### Test Types (To Be Implemented)

#### 1. Unit Tests (Jest)
**Files:** `backend/tests/unit/**/*.test.ts`

**Coverage:**
- Services (emailService, auth logic)
- Utilities (logger, helpers)
- Middleware (validation, error handling)

**Run:** `cd backend && npm test`

#### 2. Integration Tests (Supertest)
**Files:** `backend/tests/integration/**/*.test.ts`

**Coverage:**
- API endpoints with real database
- Authentication flows
- Booking creation & cancellation
- Admin operations

**Run:** `cd backend && npm run test:integration`

#### 3. E2E Tests (Playwright)
**Files:** `frontend/tests/e2e/**/*.spec.ts`

**Coverage:**
- Complete user journeys
- Student: Register → Search → Book → Cancel
- Tutor: Register → Create Profile → Add Slots
- Admin: Login → Manage Users → Export Data

**Run:** `cd frontend && npm run test:e2e`

#### 4. Performance Tests
**Tools:** Artillery, k6, or custom scripts

**Scenarios:**
- Concurrent booking attempts (race condition test)
- API response time benchmarks
- Database query optimization

#### 5. Security Tests
**Coverage:**
- Authentication bypass attempts
- SQL injection prevention
- XSS/CSRF protection
- Rate limiting validation
- Password strength enforcement

---

## 📖 API Documentation

### Endpoint Reference (To Be Created)
**File:** `docs/API.md`

**Sections:**
- Authentication endpoints
- User management
- Tutor operations
- Slot management
- Booking operations
- Admin dashboard

### Swagger/OpenAPI
**Endpoint:** http://localhost:3000/docs (when implemented)

**File:** `backend/swagger.json` (to be created)

---

## 🚀 Deployment

### Development
```powershell
# Automated
.\scripts\dev.ps1

# Manual
cd backend && npm run dev
cd frontend && npm run dev
```

### Docker
```powershell
# Build and start all services
docker-compose up --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

### Production (To Be Documented)
**File:** `docs/DEPLOYMENT.md` (to be created)

**Topics:**
- Environment setup
- Database migration to PostgreSQL
- SSL/TLS configuration
- Reverse proxy (Nginx)
- Process management (PM2)
- Monitoring & logging
- Backup strategy

---

## 📈 Project Status

### ✅ Completed (70%)
- Backend API (100%)
- Database schema & migrations (100%)
- Authentication & authorization (100%)
- Email notifications (100%)
- Admin dashboard backend (100%)
- Frontend core (60%)

### 🚧 In Progress (0%)
- Frontend student pages (0/3)
- Frontend tutor pages (0/3)
- Frontend admin pages (0/3)

### ⏳ Pending (30%)
- Testing suite (0%)
- Complete documentation (20%)
- Production deployment setup (0%)

---

## 🎓 Sample Accounts

After running `npx prisma db seed`:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Admin | admin@example.com | Admin@123 | Full system access |
| Tutor | john.tutor@example.com | Tutor@123 | Math, Physics - $30/hr |
| Tutor | jane.tutor@example.com | Tutor@123 | Chemistry, Biology - $35/hr |
| Student | student@example.com | Student@123 | Can book sessions |

---

## 🔗 Quick Links

### Start Development
1. [Quick Start Guide](./QUICKSTART.md) - **START HERE**
2. [Implementation Guide](./IMPLEMENTATION_GUIDE.md) - **For coding pages**
3. [Project Summary](./PROJECT_SUMMARY.md) - **For overview**

### Track Progress
1. [Checklist](./CHECKLIST.md) - Feature completion
2. [JIRA Mapping](./JIRA_MAPPING.md) - User stories

### Reference
1. [README](./README.md) - Project intro
2. [Environment Template](./.env.example) - Config reference

---

## 📝 Development Workflow

### Daily Workflow
```
1. Start dev servers: .\scripts\dev.ps1
2. Check what's pending: CHECKLIST.md
3. Pick a task: IMPLEMENTATION_GUIDE.md
4. Code the feature
5. Test manually
6. Update CHECKLIST.md
7. Commit changes
```

### Before Committing
```
1. Test the feature works
2. Check for console errors
3. Verify API calls succeed
4. Update relevant documentation
5. Mark completed in CHECKLIST.md
```

---

## 🤝 Contributing

### Code Style
- **TypeScript** - Strict mode enabled
- **Prettier** - Auto-format on save
- **ESLint** - Follow Airbnb style guide
- **Comments** - Document complex logic

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/student-search-page

# Make changes
git add .
git commit -m "feat: implement student search page with filters"

# Push
git push origin feature/student-search-page
```

### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Testing
- `refactor:` - Code restructuring
- `style:` - Formatting

---

## 📞 Support & Resources

### Documentation
- All docs in root directory
- Backend API: `backend/src/routes/**/*.ts`
- Frontend components: `frontend/src/**/*.tsx`

### Common Issues
See [QUICKSTART.md - Troubleshooting](./QUICKSTART.md#-troubleshooting)

### Learning Resources
- [Prisma Docs](https://www.prisma.io/docs)
- [React + TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Express.js](https://expressjs.com/)

---

## 🎯 Next Steps

### Immediate (This Week)
1. ✅ Read QUICKSTART.md
2. ✅ Run `.\scripts\dev.ps1`
3. ✅ Test login with sample accounts
4. 🚧 Implement student pages (IMPLEMENTATION_GUIDE.md)

### Short Term (Next 2 Weeks)
1. Complete all 9 frontend pages
2. Write comprehensive test suite
3. Complete API documentation

### Long Term (Next Month)
1. Production deployment
2. CI/CD pipeline
3. Performance optimization
4. Advanced features (payments, video calls)

---

**Last Updated:** December 2024

**Project Status:** 🟢 Active Development | Backend Complete | Frontend In Progress

**Next Milestone:** Complete Frontend Pages (9 remaining)

---

**Happy Coding! 🚀**

For questions, check the relevant documentation file above or review the implementation guides.
