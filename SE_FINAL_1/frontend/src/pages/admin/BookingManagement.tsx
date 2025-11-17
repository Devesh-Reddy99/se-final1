import { useState, useEffect } from 'react';
import api from '../../services/api';

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Booking {
  id: string;
  status: BookingStatus;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
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
        email: string;
      };
    };
  };
}

export default function BookingManagement() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/bookings');
      setBookings(response.data.sort((a: Booking, b: Booking) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get('/admin/bookings/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Cancel this booking? Both student and tutor will be notified.')) {
      return;
    }

    try {
      await api.delete(`/admin/bookings/${bookingId}/cancel`);
      alert('Booking cancelled successfully');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getFilteredBookings = () => {
    return bookings.filter(booking => {
      // Status filter
      if (filters.status !== 'all' && booking.status !== filters.status) {
        return false;
      }

      // Date from filter
      if (filters.dateFrom) {
        const bookingDate = new Date(booking.slot.startTime);
        const fromDate = new Date(filters.dateFrom);
        if (bookingDate < fromDate) return false;
      }

      // Date to filter
      if (filters.dateTo) {
        const bookingDate = new Date(booking.slot.startTime);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (bookingDate > toDate) return false;
      }

      return true;
    });
  };

  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-300';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-300';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading bookings...</div>
      </div>
    );
  }

  const filteredBookings = getFilteredBookings();
  const statusCounts = {
    all: bookings.length,
    PENDING: bookings.filter(b => b.status === 'PENDING').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <button
          onClick={handleExportCSV}
          disabled={exporting || bookings.length === 0}
          className={`px-6 py-2 rounded font-semibold flex items-center space-x-2 ${
            exporting || bookings.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          <span>{exporting ? 'Exporting...' : '📥 Export CSV'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-gray-500">
          <p className="text-gray-600 text-sm">Total</p>
          <p className="text-2xl font-bold text-gray-700">{statusCounts.all}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{statusCounts.PENDING}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Confirmed</p>
          <p className="text-2xl font-bold text-green-600">{statusCounts.CONFIRMED}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-blue-600">{statusCounts.COMPLETED}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-4 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{statusCounts.CANCELLED}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          <p className="text-xl">No bookings found</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map(booking => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      #{booking.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.student.name}</p>
                        <p className="text-sm text-gray-600">{booking.student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.slot.tutor.user.name}</p>
                        <p className="text-sm text-gray-600">{booking.slot.tutor.subjects.join(', ')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div>
                        <p>{formatDate(booking.slot.startTime)}</p>
                        <p>{formatDateTime(booking.slot.startTime)}</p>
                        <p className="font-semibold text-green-600">${booking.slot.tutor.hourlyRate}/hr</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded border font-semibold text-sm ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm hover:bg-red-50 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
