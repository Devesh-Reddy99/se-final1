import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>

      <div className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Account Information</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
          <p className="text-gray-600">Role: {user?.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="label">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="label">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="input"
            />
          </div>

          <div>
            <label htmlFor="phone" className="label">Phone</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
