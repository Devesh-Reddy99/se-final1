# 🚀 QUICK START GUIDE

## Immediate Next Steps

### 1. Get the Application Running (5 minutes)

**Option A: Automated (Recommended)**
```powershell
# Windows PowerShell
.\scripts\dev.ps1

# This will open two terminal windows:
# - Backend running on http://localhost:3000
# - Frontend running on http://localhost:5173
```

**Option B: Manual**
```powershell
# Terminal 1 - Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

### 2. Test the Application (2 minutes)

1. Open browser: http://localhost:5173
2. Login with sample account:
   - Email: `admin@example.com`
   - Password: `Admin@123`
3. Explore the dashboard

**Other Test Accounts:**
- Tutor: `john.tutor@example.com` / `Tutor@123`
- Student: `student@example.com` / `Student@123`

### 3. Verify API (1 minute)

```powershell
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
# {"status":"OK","timestamp":"...","database":"connected"}
```

## 📋 What's Already Done

✅ **Complete Backend** (100%)
- All API endpoints working
- Database with sample data
- Email service configured
- Authentication & authorization
- Admin dashboard endpoints

✅ **Frontend Core** (60%)
- Login/Register pages
- User dashboard
- Profile management
- Navigation & routing
- API integration

## 🎯 What Needs Implementation

### Priority 1: Complete Frontend Pages

**Student Features** (3-4 hours)
```
frontend/src/pages/student/
├── SearchTutors.tsx      ⏳ Search/filter tutors
├── MyBookings.tsx        ⏳ View/cancel bookings
└── TutorDetails.tsx      ⏳ Book sessions
```

**Tutor Features** (3-4 hours)
```
frontend/src/pages/tutor/
├── CreateTutorProfile.tsx  ⏳ Setup tutor profile
├── ManageSlots.tsx         ⏳ Create/manage availability
└── TutorDashboard.tsx      ⏳ View bookings
```

**Admin Features** (3-4 hours)
```
frontend/src/pages/admin/
├── AdminDashboard.tsx      ⏳ Statistics & charts
├── UserManagement.tsx      ⏳ Manage users
└── BookingManagement.tsx   ⏳ Manage bookings
```

### Priority 2: Testing (6-8 hours)

1. **Backend Unit Tests**
   ```powershell
   cd backend
   npm test
   ```

2. **Backend Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test email service

3. **Frontend E2E Tests**
   ```powershell
   cd frontend
   npm run test:e2e
   ```

4. **Performance Tests**
   - Concurrent booking stress test
   - Response time benchmarks

### Priority 3: Documentation (2-3 hours)

1. API.md - Complete endpoint documentation
2. ARCHITECTURE.md - System design diagrams
3. ERD.md - Database schema diagram
4. DEPLOYMENT.md - Production setup guide

## 🛠️ Development Workflow

### Making Changes

1. **Start Dev Servers**
   ```powershell
   .\scripts\dev.ps1
   ```

2. **Edit Code**
   - Backend: `backend/src/**/*.ts`
   - Frontend: `frontend/src/**/*.tsx`
   - Both auto-reload on save

3. **Test Changes**
   - Backend: http://localhost:3000/api/...
   - Frontend: http://localhost:5173
   - Use browser DevTools Network tab

### Database Changes

```powershell
cd backend

# Create migration
npx prisma migrate dev --name description_of_change

# Reset database (careful!)
npx prisma migrate reset

# Re-seed database
npx prisma db seed

# View database
npx prisma studio
```

### Adding New API Endpoint

1. Create controller method in `backend/src/controllers/`
2. Add route in `backend/src/routes/`
3. Add validation in controller
4. Test with curl or Postman
5. Add frontend API call in `frontend/src/services/api.ts`

### Adding New Frontend Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Add navigation link in `frontend/src/components/Navbar.tsx`
4. Test routing and data flow

## 🐛 Troubleshooting

### Backend Won't Start
```powershell
cd backend
rm -r node_modules
rm package-lock.json
npm install
npx prisma generate
npm run dev
```

### Frontend Won't Start
```powershell
cd frontend
rm -r node_modules
rm package-lock.json
npm install
npm run dev
```

### Database Issues
```powershell
cd backend
rm prisma/dev.db
npx prisma migrate reset
npx prisma db seed
```

### Port Already in Use
```powershell
# Find process on port 3000 (backend)
netstat -ano | findstr :3000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in backend/.env
PORT=3001
```

## 📚 Key Files Reference

### Backend
```
backend/
├── src/
│   ├── server.ts              # App entry point
│   ├── controllers/           # Request handlers
│   │   ├── authController.ts
│   │   ├── bookingController.ts
│   │   └── ...
│   ├── routes/               # API routes
│   ├── middlewares/          # Auth, validation, etc.
│   └── services/             # Email, business logic
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── App.tsx               # Main router
│   ├── main.tsx              # Entry point
│   ├── pages/                # Page components
│   ├── components/           # Reusable components
│   ├── contexts/             # Global state
│   │   └── AuthContext.tsx
│   └── services/             # API calls
│       └── api.ts
└── package.json
```

## 🔐 Sample API Requests

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "name": "Test User",
    "role": "STUDENT"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

### Get Tutors (Requires Auth)
```bash
curl http://localhost:3000/api/tutors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Booking (Requires Auth)
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "SLOT_ID_HERE"
  }'
```

## 📊 Project Status Dashboard

| Component | Status | Time to Complete |
|-----------|--------|------------------|
| Backend API | ✅ 100% | Done |
| Database | ✅ 100% | Done |
| Auth System | ✅ 100% | Done |
| Email Service | ✅ 100% | Done |
| Frontend Core | ✅ 60% | Done |
| Student Pages | ⏳ 0% | 3-4 hours |
| Tutor Pages | ⏳ 0% | 3-4 hours |
| Admin Pages | ⏳ 0% | 3-4 hours |
| Testing | ⏳ 0% | 6-8 hours |
| Documentation | ⏳ 20% | 2-3 hours |

**Total Remaining: ~20-25 hours of development**

## 🎯 Suggested Work Plan

### Week 1
- **Day 1-2:** Implement Student pages
- **Day 3-4:** Implement Tutor pages
- **Day 5:** Implement Admin pages

### Week 2
- **Day 1-2:** Write backend tests
- **Day 3-4:** Write E2E tests
- **Day 5:** Complete documentation

### Week 3
- **Day 1-2:** Bug fixes and polish
- **Day 3:** Performance optimization
- **Day 4:** Security hardening
- **Day 5:** Production deployment

## 📞 Need Help?

1. **Check Existing Docs:**
   - `README.md` - Project overview
   - `PROJECT_SUMMARY.md` - Detailed status
   - `CHECKLIST.md` - Feature tracking
   - `JIRA_MAPPING.md` - User stories

2. **Common Issues:**
   - Port conflicts: Change PORT in `.env`
   - Database errors: Run `npx prisma migrate reset`
   - TypeScript errors: Run `npm install` in both folders
   - CORS errors: Check `FRONTEND_URL` in backend `.env`

3. **Debug Mode:**
   ```powershell
   # Backend with debugging
   cd backend
   npm run dev

   # Check logs in console
   # All API requests/responses logged
   ```

## 🚀 Ready to Deploy?

See `DEPLOYMENT.md` (to be created) for:
- Production environment setup
- Database migration to PostgreSQL
- SSL certificate configuration
- CI/CD pipeline setup
- Monitoring and logging
- Performance optimization

---

**Current Status:** Backend Complete ✅ | Frontend 60% ✅ | Ready for Frontend Development 🚀

**First Command to Run:** `.\scripts\dev.ps1`
