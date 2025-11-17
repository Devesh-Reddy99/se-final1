// Frontend TypeScript Type Definitions
// Use these types throughout the frontend application

export type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export type SlotRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Tutor {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface Slot {
  id: string;
  tutorId: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  recurrence: SlotRecurrence;
  tutor?: Tutor;
  booking?: Booking;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  studentId: string;
  slotId: string;
  status: BookingStatus;
  student?: User;
  slot?: Slot;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: Role;
}

export interface CreateTutorRequest {
  bio: string;
  subjects: string[];
  hourlyRate: number;
}

export interface CreateSlotRequest {
  startTime: string;
  endTime: string;
  recurrence?: SlotRecurrence;
  recurrenceCount?: number;
}

export interface CreateBookingRequest {
  slotId: string;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

// Admin Stats
export interface AdminStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
}

// Filters & Search
export interface TutorFilters {
  subject?: string;
  maxRate?: number;
  minRating?: number;
  sortBy?: 'name' | 'rate-asc' | 'rate-desc' | 'rating';
}

export interface BookingFilters {
  status?: BookingStatus | 'all';
  dateFrom?: string;
  dateTo?: string;
}

export interface UserFilters {
  role?: Role | 'all';
  searchTerm?: string;
}

// Common subjects for tutor profiles
export const COMMON_SUBJECTS = [
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Computer Science',
  'Economics',
  'Geography',
  'Spanish',
  'French',
  'Music',
  'Art'
] as const;

// Utility type helpers
export type ApiError = {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
