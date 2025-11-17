import { useState, useEffect } from 'react';
import api from '../../services/api';

type Role = 'STUDENT' | 'TUTOR' | 'ADMIN';

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | Role>('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: Role, currentRole: Role) => {
    if (currentRole === newRole) return;

    if (!window.confirm(`Change user role to ${newRole}?`)) {
      return;
    }

    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      alert('Role updated successfully');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Delete user "${userName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-300';
      case 'TUTOR': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'STUDENT': return 'bg-green-100 text-green-800 border-green-300';
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading users...</div>
      </div>
    );
  }

  const filteredUsers = getFilteredUsers();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-lg text-gray-600">
          Total: <span className="font-semibold">{users.length}</span> users
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as 'all' | Role)}
              className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="TUTOR">Tutors</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          <p className="text-xl">No users found</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleUpdate(user.id, e.target.value as Role, user.role)}
                        className={`px-3 py-1 rounded border font-semibold text-sm ${getRoleColor(user.role)} cursor-pointer hover:opacity-80`}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="TUTOR">Tutor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDeleteUser(user.id, user.name)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm hover:bg-red-50 px-3 py-1 rounded"
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-green-700 text-sm font-medium mb-1">Students</p>
          <p className="text-3xl font-bold text-green-600">
            {users.filter(u => u.role === 'STUDENT').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-blue-700 text-sm font-medium mb-1">Tutors</p>
          <p className="text-3xl font-bold text-blue-600">
            {users.filter(u => u.role === 'TUTOR').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700 text-sm font-medium mb-1">Admins</p>
          <p className="text-3xl font-bold text-red-600">
            {users.filter(u => u.role === 'ADMIN').length}
          </p>
        </div>
      </div>
    </div>
  );
}
