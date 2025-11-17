import { useState, useEffect } from 'react';
import api from '../../services/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Booking {
  id: string;
  status: BookingStatus;
  createdAt: string;
  slot: {
    id: string;
    startTime: string;
    endTime: string;
    tutor: {
      id: string;
      hourlyRate: number;
      subjects: string[];
      user: {
        name: string;
      };
    };
  };
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<'all' | BookingStatus | 'upcoming'>('upcoming');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.delete(`/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      if (filter === 'upcoming') {
        return (
          (booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
          new Date(booking.slot.startTime) > new Date()
        );
      }
      if (filter === 'all') return true;
      return booking.status === filter;
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-200 text-green-800';
      case 'PENDING': return 'bg-yellow-200 text-yellow-800';
      case 'CANCELLED': return 'bg-red-200 text-red-800';
      case 'COMPLETED': return 'bg-blue-200 text-blue-800';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const canCancel = (booking: Booking) => {
    return (
      (booking.status === 'CONFIRMED' || booking.status === 'PENDING') &&
      new Date(booking.slot.startTime) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 border-b">
        {(['upcoming', 'all', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 font-medium ${
              filter === f
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {filteredBookings.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => (
            <div key={booking.id} className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    {booking.slot.tutor.subjects.join(', ')} with {booking.slot.tutor.user.name}
                  </h3>
                  <p className="text-gray-600 mb-1">
                    📅 {formatDate(booking.slot.startTime)}
                  </p>
                  <p className="text-gray-600 mb-1">
                    🕐 {formatTime(booking.slot.startTime)} - {formatTime(booking.slot.endTime)}
                  </p>
                  <p className="text-gray-600 mb-2">
                    💰 ${booking.slot.tutor.hourlyRate}/hour
                  </p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <p className="text-sm text-gray-500">
                    Booked on {formatDate(booking.createdAt)}
                  </p>
                  {canCancel(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
