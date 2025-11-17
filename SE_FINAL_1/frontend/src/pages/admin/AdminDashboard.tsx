import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Stats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/stats');
      setStats(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Failed to load statistics'}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg rounded-lg p-6">
          <p className="text-blue-100 text-sm mb-1">Total Users</p>
          <p className="text-4xl font-bold">{stats.totalUsers}</p>
          <p className="text-blue-100 text-xs mt-2">All registered users</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg rounded-lg p-6">
          <p className="text-green-100 text-sm mb-1">Tutors</p>
          <p className="text-4xl font-bold">{stats.totalTutors}</p>
          <p className="text-green-100 text-xs mt-2">Active tutor profiles</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg rounded-lg p-6">
          <p className="text-purple-100 text-sm mb-1">Students</p>
          <p className="text-4xl font-bold">{stats.totalStudents}</p>
          <p className="text-purple-100 text-xs mt-2">Student accounts</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg rounded-lg p-6">
          <p className="text-orange-100 text-sm mb-1">Total Bookings</p>
          <p className="text-4xl font-bold">{stats.totalBookings}</p>
          <p className="text-orange-100 text-xs mt-2">All time bookings</p>
        </div>
      </div>

      {/* Booking Status Breakdown */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Booking Status Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-l-4 border-yellow-500 pl-4">
            <p className="text-gray-600 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <p className="text-gray-600 text-sm">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.confirmedBookings}</p>
          </div>
          <div className="border-l-4 border-blue-500 pl-4">
            <p className="text-gray-600 text-sm">Completed</p>
            <p className="text-2xl font-bold text-blue-600">{stats.completedBookings}</p>
          </div>
          <div className="border-l-4 border-red-500 pl-4">
            <p className="text-gray-600 text-sm">Cancelled</p>
            <p className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/users')}
            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-between"
          >
            <span>Manage Users</span>
            <span className="text-2xl">👥</span>
          </button>
          <button
            onClick={() => navigate('/admin/bookings')}
            className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-between"
          >
            <span>Manage Bookings</span>
            <span className="text-2xl">📅</span>
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 font-semibold flex items-center justify-between"
          >
            <span>Refresh Stats</span>
            <span className="text-2xl">🔄</span>
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-6">System Health</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="font-medium text-gray-700">Database Status</span>
            <span className="text-green-600 font-semibold flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="font-medium text-gray-700">API Status</span>
            <span className="text-green-600 font-semibold flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Operational
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <span className="font-medium text-gray-700">Email Service</span>
            <span className="text-green-600 font-semibold flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Active
            </span>
          </div>
        </div>
      </div>

      {/* Platform Insights */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Platform Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tutor-to-Student Ratio</p>
            <p className="text-2xl font-bold text-blue-600">
              1:{stats.totalStudents > 0 ? Math.round(stats.totalStudents / Math.max(stats.totalTutors, 1)) : 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Bookings per Tutor</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.totalTutors > 0 ? (stats.totalBookings / stats.totalTutors).toFixed(1) : '0'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalBookings > 0 
                ? Math.round(((stats.confirmedBookings + stats.completedBookings) / stats.totalBookings) * 100) 
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
