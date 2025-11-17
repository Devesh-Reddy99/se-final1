import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Tutor {
  id: string;
  userId: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function SearchTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<Tutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    subject: '',
    maxRate: 100,
    minRating: 0,
    sortBy: 'name'
  });

  useEffect(() => {
    fetchTutors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tutors, filters]);

  const fetchTutors = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tutors');
      setTutors(response.data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tutors');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...tutors];

    // Filter by subject
    if (filters.subject) {
      result = result.filter(t => t.subjects.includes(filters.subject));
    }

    // Filter by max rate
    if (filters.maxRate) {
      result = result.filter(t => t.hourlyRate <= filters.maxRate);
    }

    // Filter by min rating
    if (filters.minRating) {
      result = result.filter(t => t.rating >= filters.minRating);
    }

    // Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'rate-asc') return a.hourlyRate - b.hourlyRate;
      if (filters.sortBy === 'rate-desc') return b.hourlyRate - a.hourlyRate;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      return a.user.name.localeCompare(b.user.name);
    });

    setFilteredTutors(result);
  };

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading tutors...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Tutors</h1>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              <option value="Math">Math</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
              <option value="English">English</option>
              <option value="History">History</option>
              <option value="Computer Science">Computer Science</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Rate: ${filters.maxRate}/hr
            </label>
            <input
              type="range"
              min="10"
              max="100"
              value={filters.maxRate}
              onChange={(e) => setFilters({...filters, maxRate: parseInt(e.target.value)})}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="rate-asc">Price: Low to High</option>
              <option value="rate-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tutors Grid */}
      {filteredTutors.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p className="text-xl">No tutors found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => navigate(`/tutor/${tutor.id}`)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{tutor.user.name}</h3>
                  <p className="text-gray-600 text-sm">{tutor.subjects.join(', ')}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${tutor.hourlyRate}</p>
                  <p className="text-sm text-gray-600">/hour</p>
                </div>
              </div>

              <p className="text-gray-700 text-sm mb-4 line-clamp-3">{tutor.bio}</p>

              <div className="flex justify-between items-center">
                <div className="text-yellow-500 text-lg">
                  {renderStars(tutor.rating)}
                  <span className="text-gray-600 text-sm ml-2">({tutor.rating.toFixed(1)})</span>
                </div>
                <div className="text-sm text-gray-600">
                  {tutor.totalBookings} sessions
                </div>
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
