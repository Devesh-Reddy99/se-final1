import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

// Student Pages
import SearchTutors from './pages/student/SearchTutors';
import MyBookings from './pages/student/MyBookings';
import TutorDetails from './pages/TutorDetails';

// Tutor Pages
import TutorDashboard from './pages/tutor/TutorDashboard';
import CreateTutorProfile from './pages/tutor/CreateTutorProfile';
import ManageSlots from './pages/tutor/ManageSlots';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import BookingManagement from './pages/admin/BookingManagement';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Common Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student/search"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <SearchTutors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/:tutorId"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <TutorDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyBookings />
                </ProtectedRoute>
              }
            />

            {/* Tutor Routes */}
            <Route
              path="/tutor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['TUTOR']}>
                  <TutorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/create-profile"
              element={
                <ProtectedRoute allowedRoles={['TUTOR']}>
                  <CreateTutorProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor/manage-slots"
              element={
                <ProtectedRoute allowedRoles={['TUTOR']}>
                  <ManageSlots />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <BookingManagement />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </AuthProvider>
    </Router>
  );
}

export default App;
