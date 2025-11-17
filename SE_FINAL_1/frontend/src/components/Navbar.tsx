import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  // Don't show navbar if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600">
            Tutor Booking
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
              Dashboard
            </Link>

            {user?.role === 'STUDENT' && (
              <>
                <Link to="/search-tutors" className="text-gray-700 hover:text-primary-600">
                  Find Tutors
                </Link>
                <Link to="/my-bookings" className="text-gray-700 hover:text-primary-600">
                  My Bookings
                </Link>
              </>
            )}

            {user?.role === 'TUTOR' && (
              <>
                <Link to="/tutor/dashboard" className="text-gray-700 hover:text-primary-600">
                  My Sessions
                </Link>
                <Link to="/tutor/manage-slots" className="text-gray-700 hover:text-primary-600">
                  Manage Slots
                </Link>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <>
                <Link to="/admin/users" className="text-gray-700 hover:text-primary-600">
                  Users
                </Link>
                <Link to="/admin/bookings" className="text-gray-700 hover:text-primary-600">
                  Bookings
                </Link>
              </>
            )}

            <Link to="/profile" className="text-gray-700 hover:text-primary-600">
              Profile
            </Link>

            <button
              onClick={logout}
              className="btn btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
