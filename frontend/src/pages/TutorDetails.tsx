import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

interface Tutor {
  id: string;
  bio: string;
  subjects: string[];
  hourlyRate: number;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  user: {
    name: string;
    email: string;
  };
}

export default function TutorDetails() {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [tutor, setTutor] = useState<Tutor | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchTutorDetails();
    fetchAvailableSlots();
  }, [tutorId]);

  const fetchTutorDetails = async () => {
    try {
      const response = await api.get(`/tutors/${tutorId}`);
      setTutor(response.data.data?.tutor || response.data.data || response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch tutor details');
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/slots/tutor/${tutorId}`);
      const slotsData = response.data.data?.slots || response.data.data || response.data;
      setSlots(slotsData.filter((slot: Slot) => !slot.isBooked));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch available slots');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = async () => {
    if (!selectedSlot) {
      setError('Please select a slot');
      return;
    }

    setBooking(true);
    setError('');
    setSuccess('');

    try {
      // Get the first subject from tutor's subjects or use a default
      const subject = tutor?.subjects?.[0] || 'General Tutoring';
      await api.post('/bookings', { 
        slotId: selectedSlot, 
        subject,
        notes: 'Booking made through tutor details page'
      });
      setSuccess('Booking successful! Check your email for confirmation.');
      setTimeout(() => {
        navigate('/student/my-bookings');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
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

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: Slot[] } = {};
    slots.forEach(slot => {
      const date = new Date(slot.startTime).toDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(slot);
    });
    return grouped;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Tutor not found</div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByDate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/student/search')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
      >
        ← Back to Search
      </button>

      {/* Tutor Profile */}
      <div className="bg-white shadow rounded-lg p-8 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold">{tutor.user.name}</h1>
            <p className="text-gray-600 text-lg">{tutor.subjects.join(', ')}</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-blue-600">${tutor.hourlyRate}</p>
            <p className="text-gray-600">/hour</p>
            <div className="mt-2 text-yellow-500">
              {'★'.repeat(Math.round(tutor.rating))}{'☆'.repeat(5 - Math.round(tutor.rating))}
              <span className="text-gray-600 ml-2">({tutor.rating.toFixed(1)} - {tutor.totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">About</h2>
          <p className="text-gray-700">{tutor.bio}</p>
        </div>

        <div className="text-sm text-gray-600">
          Total Sessions: {tutor.totalBookings}
        </div>
      </div>

      {/* Available Slots */}
      <div className="bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Available Slots</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {Object.keys(groupedSlots).length === 0 ? (
          <p className="text-center text-gray-500 py-8">No available slots at the moment</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedSlots).map(([date, dateSlots]) => (
              <div key={date}>
                <h3 className="font-semibold text-lg mb-3">{formatDate(dateSlots[0].startTime)}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dateSlots.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot.id)}
                      className={`p-3 border rounded-lg text-sm ${
                        selectedSlot === slot.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {slots.length > 0 && (
          <button
            onClick={handleBookSlot}
            disabled={!selectedSlot || booking}
            className={`w-full mt-6 px-4 py-3 rounded-lg font-semibold ${
              !selectedSlot || booking
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {booking ? 'Booking...' : 'Book Selected Slot'}
          </button>
        )}
      </div>
    </div>
  );
}
