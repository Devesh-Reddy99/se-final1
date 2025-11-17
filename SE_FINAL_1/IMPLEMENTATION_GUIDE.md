# 📝 Frontend Implementation Guide

## Overview

This guide provides detailed specifications for implementing the 9 pending frontend pages. Each section includes:
- Component purpose and user flow
- Required state management
- API integrations needed
- UI/UX specifications
- Sample code patterns

---

## 🎓 Student Pages

### 1. SearchTutors.tsx

**Purpose:** Allow students to search and filter tutors

**Location:** `frontend/src/pages/student/SearchTutors.tsx`

**Features:**
- Display all tutors in card grid
- Filter by subject (dropdown)
- Filter by hourly rate (range slider)
- Filter by rating (minimum star rating)
- Sort by: name, rate (low-high, high-low), rating
- Click tutor card to navigate to details

**State:**
```typescript
const [tutors, setTutors] = useState<Tutor[]>([]);
const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
const [filters, setFilters] = useState({
  subject: '',
  maxRate: 100,
  minRating: 0,
  sortBy: 'name'
});
const [loading, setLoading] = useState(true);
```

**API Calls:**
```typescript
// GET /api/tutors - Fetch all tutors
const fetchTutors = async () => {
  const response = await api.get('/tutors');
  setTutors(response.data);
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Search Tutors                       │
├─────────────────────────────────────┤
│ Filters:                            │
│ [Subject ▼] [Max Rate: $50 ━━○━━]  │
│ [Min Rating: ★★★☆☆] [Sort ▼]       │
├─────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ John │ │ Jane │ │ Mike │         │
│ │ Math │ │ Chem │ │ Phys │         │
│ │ $30  │ │ $35  │ │ $28  │         │
│ │★★★★★│ │★★★★☆│ │★★★☆☆│         │
│ └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

**Implementation Pattern:**
```typescript
// Filter logic
useEffect(() => {
  let result = tutors;
  
  if (filters.subject) {
    result = result.filter(t => 
      t.subjects.includes(filters.subject)
    );
  }
  
  if (filters.maxRate) {
    result = result.filter(t => t.hourlyRate <= filters.maxRate);
  }
  
  if (filters.minRating) {
    result = result.filter(t => t.rating >= filters.minRating);
  }
  
  // Sort
  result.sort((a, b) => {
    if (filters.sortBy === 'rate-asc') return a.hourlyRate - b.hourlyRate;
    if (filters.sortBy === 'rate-desc') return b.hourlyRate - a.hourlyRate;
    if (filters.sortBy === 'rating') return b.rating - a.rating;
    return a.user.name.localeCompare(b.user.name);
  });
  
  setFilteredTutors(result);
}, [tutors, filters]);
```

---

### 2. TutorDetails.tsx

**Purpose:** View tutor profile and book available slots

**Location:** `frontend/src/pages/TutorDetails.tsx`

**URL Parameter:** `/tutor/:tutorId`

**Features:**
- Display tutor bio, subjects, hourly rate, rating
- Show available slots grouped by date
- Book slot button
- Success/error messages
- Navigate back to search

**State:**
```typescript
const { tutorId } = useParams();
const [tutor, setTutor] = useState<Tutor | null>(null);
const [slots, setSlots] = useState<Slot[]>([]);
const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
const [booking, setBooking] = useState(false);
```

**API Calls:**
```typescript
// GET /api/tutors/:id - Fetch tutor details
// GET /api/slots/tutor/:tutorId - Fetch available slots
// POST /api/bookings - Create booking

const bookSlot = async () => {
  setBooking(true);
  try {
    await api.post('/bookings', { slotId: selectedSlot });
    alert('Booking successful! Check email for confirmation.');
    navigate('/student/my-bookings');
  } catch (error) {
    alert(error.response?.data?.message || 'Booking failed');
  } finally {
    setBooking(false);
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ ← Back to Search                    │
├─────────────────────────────────────┤
│ John Doe                            │
│ Math, Physics                       │
│ $30/hour | ★★★★★ (15 reviews)      │
│                                     │
│ About:                              │
│ Experienced math tutor with 5 years │
│ of teaching high school students... │
├─────────────────────────────────────┤
│ Available Slots:                    │
│                                     │
│ Monday, Dec 18, 2024                │
│ ○ 9:00 AM - 10:00 AM                │
│ ○ 2:00 PM - 3:00 PM                 │
│                                     │
│ Tuesday, Dec 19, 2024               │
│ ○ 10:00 AM - 11:00 AM               │
│                                     │
│ [Book Selected Slot]                │
└─────────────────────────────────────┘
```

---

### 3. MyBookings.tsx

**Purpose:** View and manage student's bookings

**Location:** `frontend/src/pages/student/MyBookings.tsx`

**Features:**
- List all bookings (upcoming, past, cancelled)
- Filter by status (tabs or dropdown)
- Show tutor name, subject, date/time, status
- Cancel booking button (only for future bookings)
- Color-coded status badges

**State:**
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);
const [filter, setFilter] = useState<'all' | 'upcoming' | 'past' | 'cancelled'>('upcoming');
const [loading, setLoading] = useState(true);
```

**API Calls:**
```typescript
// GET /api/bookings/my-bookings - Fetch user's bookings
// DELETE /api/bookings/:id/cancel - Cancel booking

const cancelBooking = async (bookingId: string) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return;
  
  try {
    await api.delete(`/bookings/${bookingId}/cancel`);
    alert('Booking cancelled. Refund email sent.');
    fetchBookings(); // Refresh list
  } catch (error) {
    alert(error.response?.data?.message || 'Cancellation failed');
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ My Bookings                         │
├─────────────────────────────────────┤
│ [All] [Upcoming] [Past] [Cancelled] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Math with John Doe              │ │
│ │ Dec 18, 2024 | 9:00 AM - 10:00  │ │
│ │ Status: CONFIRMED ✓             │ │
│ │                   [Cancel]      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Physics with John Doe           │ │
│ │ Dec 20, 2024 | 2:00 PM - 3:00   │ │
│ │ Status: PENDING ⏱               │ │
│ │                   [Cancel]      │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Filter Logic:**
```typescript
const filteredBookings = bookings.filter(booking => {
  if (filter === 'upcoming') {
    return booking.status === 'CONFIRMED' && 
           new Date(booking.slot.startTime) > new Date();
  }
  if (filter === 'past') {
    return booking.status === 'COMPLETED';
  }
  if (filter === 'cancelled') {
    return booking.status === 'CANCELLED';
  }
  return true; // all
});
```

---

## 👨‍🏫 Tutor Pages

### 4. CreateTutorProfile.tsx

**Purpose:** Create or edit tutor profile

**Location:** `frontend/src/pages/tutor/CreateTutorProfile.tsx`

**Features:**
- Form with bio (textarea), subjects (multi-select), hourly rate (number)
- Validate all fields
- Submit to create/update profile
- Redirect to tutor dashboard on success

**State:**
```typescript
const [formData, setFormData] = useState({
  bio: '',
  subjects: [] as string[],
  hourlyRate: 25
});
const [existingProfile, setExistingProfile] = useState<Tutor | null>(null);
const [submitting, setSubmitting] = useState(false);
```

**API Calls:**
```typescript
// GET /api/tutors/profile - Check if profile exists
// POST /api/tutors - Create tutor profile
// PUT /api/tutors/:id - Update tutor profile

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    if (existingProfile) {
      await api.put(`/tutors/${existingProfile.id}`, formData);
    } else {
      await api.post('/tutors', formData);
    }
    alert('Profile saved successfully!');
    navigate('/tutor/dashboard');
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to save profile');
  } finally {
    setSubmitting(false);
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Create Tutor Profile                │
├─────────────────────────────────────┤
│ Bio:                                │
│ ┌─────────────────────────────────┐ │
│ │ Tell students about yourself... │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Subjects (select multiple):         │
│ ☑ Math  ☑ Physics  ☐ Chemistry     │
│ ☐ Biology  ☐ English  ☐ History    │
│                                     │
│ Hourly Rate: $[30]                  │
│                                     │
│ [Cancel] [Save Profile]             │
└─────────────────────────────────────┘
```

---

### 5. ManageSlots.tsx

**Purpose:** Create and manage availability slots

**Location:** `frontend/src/pages/tutor/ManageSlots.tsx`

**Features:**
- Form to create one-time slot (date, start time, end time)
- Form to create recurring slots (daily/weekly/monthly, count)
- List existing slots with delete button (only unbooked)
- Group slots by date
- Indicate booked vs available

**State:**
```typescript
const [slots, setSlots] = useState<Slot[]>([]);
const [createMode, setCreateMode] = useState<'single' | 'recurring'>('single');
const [slotForm, setSlotForm] = useState({
  startTime: '',
  endTime: '',
  recurrence: 'NONE',
  recurrenceCount: 1
});
```

**API Calls:**
```typescript
// GET /api/slots/my-slots - Fetch tutor's slots
// POST /api/slots - Create slot(s)
// DELETE /api/slots/:id - Delete slot (if not booked)

const createSlot = async () => {
  try {
    await api.post('/slots', slotForm);
    alert('Slot(s) created successfully!');
    fetchSlots();
    resetForm();
  } catch (error) {
    alert(error.response?.data?.message || 'Failed to create slot');
  }
};

const deleteSlot = async (slotId: string, isBooked: boolean) => {
  if (isBooked) {
    alert('Cannot delete booked slot');
    return;
  }
  
  if (!confirm('Delete this slot?')) return;
  
  try {
    await api.delete(`/slots/${slotId}`);
    fetchSlots();
  } catch (error) {
    alert('Failed to delete slot');
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Manage Availability                 │
├─────────────────────────────────────┤
│ Create Slot:                        │
│ [Single] [Recurring]                │
│                                     │
│ Date: [Dec 18, 2024 📅]             │
│ Start: [09:00 AM] End: [10:00 AM]   │
│                                     │
│ [+ Add Slot]                        │
├─────────────────────────────────────┤
│ Your Slots:                         │
│                                     │
│ Monday, Dec 18, 2024                │
│ • 9:00 AM - 10:00 AM [Booked]       │
│ • 2:00 PM - 3:00 PM [Available] [×] │
│                                     │
│ Tuesday, Dec 19, 2024               │
│ • 10:00 AM - 11:00 AM [Available][×]│
└─────────────────────────────────────┘
```

**Recurring Slot Form:**
```typescript
// When createMode === 'recurring'
<select value={slotForm.recurrence} onChange={...}>
  <option value="DAILY">Daily</option>
  <option value="WEEKLY">Weekly</option>
  <option value="MONTHLY">Monthly</option>
</select>

<input 
  type="number" 
  min="1" 
  max="30"
  value={slotForm.recurrenceCount}
  placeholder="How many?"
/>
```

---

### 6. TutorDashboard.tsx

**Purpose:** View upcoming bookings and statistics

**Location:** `frontend/src/pages/tutor/TutorDashboard.tsx`

**Features:**
- Display upcoming bookings (next 7 days)
- Show total earnings (if tracked)
- Quick stats: total bookings, rating, students taught
- Links to manage slots and profile

**State:**
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);
const [stats, setStats] = useState({
  totalBookings: 0,
  totalEarnings: 0,
  rating: 0,
  totalStudents: 0
});
```

**API Calls:**
```typescript
// GET /api/bookings/tutor-bookings - Fetch tutor's bookings
// GET /api/tutors/profile - Fetch tutor profile for stats
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Tutor Dashboard                     │
├─────────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐ ┌────┐        │
│ │ 24 │ │4.8 │ │$720│ │ 12 │        │
│ │Book│ │Rate│ │Earn│ │Std │        │
│ └────┘ └────┘ └────┘ └────┘        │
├─────────────────────────────────────┤
│ Upcoming Sessions:                  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Dec 18, 9:00 AM - 10:00 AM      │ │
│ │ Student: Alice Smith            │ │
│ │ Subject: Math                   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Dec 19, 2:00 PM - 3:00 PM       │ │
│ │ Student: Bob Johnson            │ │
│ │ Subject: Physics                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Manage Slots] [Edit Profile]       │
└─────────────────────────────────────┘
```

---

## 👨‍💼 Admin Pages

### 7. AdminDashboard.tsx

**Purpose:** Overview of system statistics

**Location:** `frontend/src/pages/admin/AdminDashboard.tsx`

**Features:**
- Total users, tutors, students, bookings
- Recent activity feed
- Charts (optional): bookings over time, revenue
- Quick links to management pages

**State:**
```typescript
const [stats, setStats] = useState({
  totalUsers: 0,
  totalTutors: 0,
  totalStudents: 0,
  totalBookings: 0,
  totalRevenue: 0,
  pendingBookings: 0
});
const [recentActivity, setRecentActivity] = useState([]);
```

**API Calls:**
```typescript
// GET /api/admin/stats - Fetch system statistics
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Admin Dashboard                     │
├─────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 156 │ │  45 │ │ 111 │ │ 342 │    │
│ │Users│ │Tutrs│ │Stdnt│ │Books│    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
├─────────────────────────────────────┤
│ Recent Activity:                    │
│ • User "alice@x.com" registered     │
│ • Booking #123 confirmed            │
│ • Tutor "John" created profile      │
│ • Booking #124 cancelled            │
├─────────────────────────────────────┤
│ [Manage Users] [Manage Bookings]    │
└─────────────────────────────────────┘
```

---

### 8. UserManagement.tsx

**Purpose:** Manage all users (CRUD operations)

**Location:** `frontend/src/pages/admin/UserManagement.tsx`

**Features:**
- List all users with search/filter
- Show email, name, role, status
- Update user role (Student ↔ Tutor ↔ Admin)
- Delete user (with confirmation)
- Pagination (if many users)

**State:**
```typescript
const [users, setUsers] = useState<User[]>([]);
const [searchTerm, setSearchTerm] = useState('');
const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');
```

**API Calls:**
```typescript
// GET /api/admin/users - Fetch all users
// PUT /api/admin/users/:id/role - Update user role
// DELETE /api/admin/users/:id - Delete user

const updateRole = async (userId: string, newRole: Role) => {
  if (!confirm(`Change user role to ${newRole}?`)) return;
  
  try {
    await api.put(`/admin/users/${userId}/role`, { role: newRole });
    alert('Role updated');
    fetchUsers();
  } catch (error) {
    alert('Failed to update role');
  }
};

const deleteUser = async (userId: string) => {
  if (!confirm('Delete this user? This cannot be undone!')) return;
  
  try {
    await api.delete(`/admin/users/${userId}`);
    alert('User deleted');
    fetchUsers();
  } catch (error) {
    alert('Failed to delete user');
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ User Management                     │
├─────────────────────────────────────┤
│ Search: [_________] Role: [All ▼]   │
├─────────────────────────────────────┤
│ Email            │ Name  │ Role  │  │
│──────────────────┼───────┼───────┼──│
│ alice@x.com      │ Alice │[Stdnt]│🗑│
│ john.t@x.com     │ John  │[Tutor]│🗑│
│ admin@x.com      │ Admin │[Admin]│🗑│
└─────────────────────────────────────┘
```

**Role Update Dropdown:**
```typescript
<select 
  value={user.role} 
  onChange={(e) => updateRole(user.id, e.target.value as Role)}
>
  <option value="STUDENT">Student</option>
  <option value="TUTOR">Tutor</option>
  <option value="ADMIN">Admin</option>
</select>
```

---

### 9. BookingManagement.tsx

**Purpose:** View and manage all bookings

**Location:** `frontend/src/pages/admin/BookingManagement.tsx`

**Features:**
- List all bookings with filters (status, date range)
- Show student, tutor, slot time, status
- Export to CSV button
- Cancel booking (admin override)
- Pagination

**State:**
```typescript
const [bookings, setBookings] = useState<Booking[]>([]);
const [filters, setFilters] = useState({
  status: 'all',
  dateFrom: '',
  dateTo: ''
});
const [exporting, setExporting] = useState(false);
```

**API Calls:**
```typescript
// GET /api/admin/bookings - Fetch all bookings with filters
// GET /api/admin/bookings/export - Download CSV
// DELETE /api/admin/bookings/:id/cancel - Cancel booking

const exportCSV = async () => {
  setExporting(true);
  try {
    const response = await api.get('/admin/bookings/export', {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `bookings-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    alert('Export failed');
  } finally {
    setExporting(false);
  }
};
```

**UI Layout:**
```
┌─────────────────────────────────────┐
│ Booking Management                  │
├─────────────────────────────────────┤
│ Status: [All ▼]                     │
│ From: [📅] To: [📅]    [Export CSV] │
├─────────────────────────────────────┤
│ ID  │ Student │ Tutor │ Date │ Sts │
│─────┼─────────┼───────┼──────┼─────│
│ 001 │ Alice   │ John  │12/18 │ ✓  │
│ 002 │ Bob     │ Jane  │12/19 │ ⏱  │
│ 003 │ Carol   │ Mike  │12/20 │ ✗  │
└─────────────────────────────────────┘
```

**Filters Implementation:**
```typescript
const filteredBookings = bookings.filter(booking => {
  // Status filter
  if (filters.status !== 'all' && booking.status !== filters.status) {
    return false;
  }
  
  // Date range filter
  if (filters.dateFrom) {
    const bookingDate = new Date(booking.slot.startTime);
    const fromDate = new Date(filters.dateFrom);
    if (bookingDate < fromDate) return false;
  }
  
  if (filters.dateTo) {
    const bookingDate = new Date(booking.slot.startTime);
    const toDate = new Date(filters.dateTo);
    if (bookingDate > toDate) return false;
  }
  
  return true;
});
```

---

## 🎨 Common UI Patterns

### Loading State
```typescript
if (loading) {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-xl">Loading...</div>
    </div>
  );
}
```

### Error Handling
```typescript
const [error, setError] = useState<string | null>(null);

// In API call
catch (error) {
  setError(error.response?.data?.message || 'Something went wrong');
}

// In JSX
{error && (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
    {error}
  </div>
)}
```

### Empty State
```typescript
{filteredItems.length === 0 && (
  <div className="text-center text-gray-500 py-10">
    <p>No items found</p>
  </div>
)}
```

### Confirm Dialog
```typescript
const handleDelete = (id: string) => {
  if (window.confirm('Are you sure?')) {
    deleteItem(id);
  }
};
```

### Date Formatting
```typescript
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
```

### Status Badge Component
```typescript
const StatusBadge = ({ status }: { status: BookingStatus }) => {
  const colors = {
    PENDING: 'bg-yellow-200 text-yellow-800',
    CONFIRMED: 'bg-green-200 text-green-800',
    CANCELLED: 'bg-red-200 text-red-800',
    COMPLETED: 'bg-blue-200 text-blue-800'
  };
  
  return (
    <span className={`px-2 py-1 rounded text-sm ${colors[status]}`}>
      {status}
    </span>
  );
};
```

---

## 🧪 Testing Each Page

### Manual Testing Checklist

**For Each Page:**
1. ✅ Page loads without errors
2. ✅ Data fetches from API correctly
3. ✅ Loading state displays
4. ✅ Empty state handles no data
5. ✅ Forms validate input
6. ✅ Success messages display
7. ✅ Error handling works
8. ✅ Navigation links work
9. ✅ Responsive on mobile
10. ✅ Protected by auth (redirects if logged out)

**Student Pages:**
- Search: Filters work, navigation to details works
- Details: Booking creates successfully, email sent
- Bookings: Cancel works, status updates reflected

**Tutor Pages:**
- Profile: Create and edit both work
- Slots: Create single/recurring works, delete works
- Dashboard: Shows correct upcoming bookings

**Admin Pages:**
- Dashboard: Stats load correctly
- Users: Role update and delete work
- Bookings: Filters work, CSV exports

---

## 🚀 Implementation Order

**Recommended sequence:**

1. **Start with Student Pages** (Easiest, most common use case)
   - SearchTutors.tsx
   - TutorDetails.tsx
   - MyBookings.tsx

2. **Then Tutor Pages** (Medium complexity)
   - CreateTutorProfile.tsx
   - ManageSlots.tsx
   - TutorDashboard.tsx

3. **Finally Admin Pages** (Most complex)
   - AdminDashboard.tsx
   - UserManagement.tsx
   - BookingManagement.tsx

**Time Estimate:** 2-3 hours per page = 18-27 hours total

---

## 📚 Helpful Resources

### API Reference
See backend route files for exact endpoint specs:
- `backend/src/routes/tutorRoutes.ts`
- `backend/src/routes/slotRoutes.ts`
- `backend/src/routes/bookingRoutes.ts`
- `backend/src/routes/adminRoutes.ts`

### TypeScript Types
Define in `frontend/src/types/index.ts`:
```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

export interface Tutor {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  user: User;
}

export interface Slot {
  id: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  recurrence: string;
  tutor?: Tutor;
}

export interface Booking {
  id: string;
  studentId: string;
  slotId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  student: User;
  slot: Slot;
  createdAt: string;
}
```

### TailwindCSS Classes
Common patterns used:
- Container: `max-w-7xl mx-auto px-4`
- Card: `bg-white shadow rounded-lg p-6`
- Button: `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700`
- Input: `w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

---

**Ready to Start?** Pick a page and follow this guide. Good luck! 🚀
