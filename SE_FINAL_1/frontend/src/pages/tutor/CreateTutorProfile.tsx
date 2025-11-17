import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const AVAILABLE_SUBJECTS = [
  'Math', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
  'Computer Science', 'Economics', 'Geography', 'Spanish', 'French', 'Music', 'Art'
];

export default function CreateTutorProfile() {
  const navigate = useNavigate();
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    bio: '',
    subjects: [] as string[],
    hourlyRate: 25
  });

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const response = await api.get('/tutors/profile');
      if (response.data) {
        setExistingProfile(response.data);
        setFormData({
          bio: response.data.bio,
          subjects: response.data.subjects,
          hourlyRate: response.data.hourlyRate
        });
      }
    } catch (err: any) {
      // No profile exists, which is fine
    } finally {
      setLoading(false);
    }
  };

  const toggleSubject = (subject: string) => {
    if (formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: formData.subjects.filter(s => s !== subject)
      });
    } else {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject]
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.bio.trim()) {
      setError('Please provide a bio');
      return;
    }

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    if (formData.hourlyRate < 10 || formData.hourlyRate > 200) {
      setError('Hourly rate must be between $10 and $200');
      return;
    }

    setSubmitting(true);

    try {
      if (existingProfile) {
        await api.put(`/tutors/${existingProfile.id}`, formData);
        alert('Profile updated successfully!');
      } else {
        await api.post('/tutors', formData);
        alert('Profile created successfully!');
      }
      navigate('/tutor/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">
        {existingProfile ? 'Edit Tutor Profile' : 'Create Tutor Profile'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Bio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bio <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell students about your experience, teaching style, qualifications..."
          />
          <p className="text-sm text-gray-500 mt-1">{formData.bio.length} characters</p>
        </div>

        {/* Subjects */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subjects <span className="text-red-500">*</span>
          </label>
          <p className="text-sm text-gray-500 mb-3">Select all subjects you can teach</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_SUBJECTS.map(subject => (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                className={`p-3 border rounded-lg text-sm font-medium ${
                  formData.subjects.includes(subject)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {formData.subjects.length} subject{formData.subjects.length !== 1 ? 's' : ''} selected
          </p>
        </div>

        {/* Hourly Rate */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate (USD) <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-gray-700">$</span>
            <input
              type="number"
              min="10"
              max="200"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value)})}
              className="w-32 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-semibold"
            />
            <span className="text-gray-600">/hour</span>
          </div>
          <input
            type="range"
            min="10"
            max="200"
            value={formData.hourlyRate}
            onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value)})}
            className="w-full mt-2"
          />
          <p className="text-sm text-gray-500 mt-1">Range: $10 - $200 per hour</p>
        </div>

        {/* Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tutor/dashboard')}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded hover:bg-gray-400 font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 px-4 py-3 rounded font-semibold ${
              submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
