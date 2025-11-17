import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Booking {
  id: string;
  status: string;
  createdAt: string;
  slot: {
    startTime: string;
    endTime: string;
  };
  student: {
    name: string;
    email: string;
  };
}

interface TutorProfile {
  id: string;
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  subjects: string[];
}

export default function TutorDashboard() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, profileRes] = await Promise.all([
        api.get('/bookings/tutor-bookings'),
        api.get('/tutors/profile')
      ]);
      
      // Filter upcoming bookings
      const upcoming = bookingsRes.data.filter((b: Booking) => 
        new Date(b.slot.startTime) > new Date() && 
        (b.status === 'CONFIRMED' || b.status === 'PENDING')
      ).sort((a: Booking, b: Booking) => 
        new Date(a.slot.startTime).getTime() - new Date(b.slot.startTime).getTime()
      );
      
      setBookings(upcoming);
      setProfile(profileRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTotalEarnings = () => {
    if (!profile) return 0;
    return profile.totalBookings * profile.hourlyRate;
  };

  const getUniqueStudents = () => {
    const uniqueEmails = new Set(bookings.map(b => b.student.email));
    return uniqueEmails.size;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">Welcome, Tutor!</h2>
          <p className="mb-4">You need to create your tutor profile first to start accepting bookings.</p>
          <button
            onClick={() => navigate('/tutor/create-profile')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Create Tutor Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Tutor Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-1">Total Bookings</p>
          <p className="text-3xl font-bold text-blue-600">{profile.totalBookings}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-1">Rating</p>
          <p className="text-3xl font-bold text-yellow-500">{profile.rating.toFixed(1)} ★</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-1">Total Earnings</p>
          <p className="text-3xl font-bold text-green-600">${getTotalEarnings()}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-gray-600 text-sm mb-1">Students Taught</p>
          <p className="text-3xl font-bold text-purple-600">{getUniqueStudents()}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tutor/create-profile')}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 font-semibold"
          >
            Edit Profile
          </button>
          <button
            onClick={() => navigate('/tutor/manage-slots')}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 font-semibold"
          >
            Manage Slots
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 font-semibold"
          >
            Account Settings
          </button>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">Upcoming Sessions</h2>

        {bookings.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            <p className="text-lg mb-4">No upcoming sessions</p>
            <button
              onClick={() => navigate('/tutor/manage-slots')}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Create some availability slots to get bookings →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.slice(0, 10).map(booking => (
              <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {booking.status}
                      </span>
                      <span className="text-gray-600">
                        📅 {formatDate(booking.slot.startTime)}
                      </span>
                    </div>
                    <p className="font-semibold text-lg mb-1">
                      Session with {booking.student.name}
                    </p>
                    <p className="text-gray-600 text-sm mb-1">
                      📧 {booking.student.email}
                    </p>
                    <p className="text-gray-600">
                      🕐 {formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">${profile.hourlyRate}</p>
                    <p className="text-sm text-gray-600">per hour</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {bookings.length > 10 && (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Showing 10 of {bookings.length} upcoming sessions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
