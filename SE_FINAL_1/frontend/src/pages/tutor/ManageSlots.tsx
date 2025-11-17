import { useState, useEffect } from 'react';
import api from '../../services/api';

type SlotRecurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  recurrence: SlotRecurrence;
  booking?: any;
}

export default function ManageSlots() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [createMode, setCreateMode] = useState<'single' | 'recurring'>('single');
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    recurrence: 'NONE' as SlotRecurrence,
    recurrenceCount: 1
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const response = await api.get('/slots/my-slots');
      const slotsData = response.data.data || response.data;
      setSlots(slotsData.sort((a: Slot, b: Slot) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch slots');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setError('Please fill in all fields');
      return;
    }

    const startDateTime = new Date(`${slotForm.date}T${slotForm.startTime}`);
    const endDateTime = new Date(`${slotForm.date}T${slotForm.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      const payload: any = {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      };

      if (createMode === 'recurring') {
        payload.recurrence = slotForm.recurrence;
        payload.recurrenceCount = slotForm.recurrenceCount;
      }

      await api.post('/slots', payload);
      setSuccess(
        createMode === 'recurring'
          ? `${slotForm.recurrenceCount} recurring slots created successfully!`
          : 'Slot created successfully!'
      );
      fetchSlots();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create slot');
    }
  };

  const handleEditSlot = (slot: Slot) => {
    const startDate = new Date(slot.startTime);
    const endDate = new Date(slot.endTime);
    
    setEditingSlot(slot.id);
    setSlotForm({
      date: startDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      recurrence: 'NONE',
      recurrenceCount: 1
    });
    setCreateMode('single');
    setError('');
    setSuccess('');
  };

  const handleUpdateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!slotForm.date || !slotForm.startTime || !slotForm.endTime) {
      setError('Please fill in all fields');
      return;
    }

    const startDateTime = new Date(`${slotForm.date}T${slotForm.startTime}`);
    const endDateTime = new Date(`${slotForm.date}T${slotForm.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    try {
      await api.put(`/slots/${editingSlot}`, {
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      });
      setSuccess('Slot updated successfully!');
      setEditingSlot(null);
      fetchSlots();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update slot');
    }
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    resetForm();
    setError('');
    setSuccess('');
  };

  const handleDeleteSlot = async (slotId: string, isBooked: boolean) => {
    if (isBooked) {
      alert('Cannot delete a booked slot');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this slot?')) {
      return;
    }

    try {
      await api.delete(`/slots/${slotId}`);
      setSuccess('Slot deleted successfully');
      fetchSlots();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete slot');
    }
  };

  const resetForm = () => {
    setSlotForm({
      date: '',
      startTime: '',
      endTime: '',
      recurrence: 'NONE',
      recurrenceCount: 1
    });
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

  const groupedSlots = groupSlotsByDate();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Availability</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create/Edit Slot Form */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {editingSlot ? 'Edit Slot' : 'Create Slot'}
          </h2>

          {/* Mode Toggle - Only show when creating */}
          {!editingSlot && (
            <div className="flex space-x-2 mb-6">
              <button
                type="button"
                onClick={() => setCreateMode('single')}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  createMode === 'single'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Single Slot
              </button>
              <button
                type="button"
                onClick={() => setCreateMode('recurring')}
                className={`flex-1 py-2 px-4 rounded font-medium ${
                  createMode === 'recurring'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Recurring
              </button>
            </div>
          )}

          <form onSubmit={editingSlot ? handleUpdateSlot : handleCreateSlot} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={slotForm.date}
                onChange={(e) => setSlotForm({...slotForm, date: e.target.value})}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  value={slotForm.startTime}
                  onChange={(e) => setSlotForm({...slotForm, startTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  value={slotForm.endTime}
                  onChange={(e) => setSlotForm({...slotForm, endTime: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {!editingSlot && createMode === 'recurring' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recurrence Pattern</label>
                  <select
                    value={slotForm.recurrence}
                    onChange={(e) => setSlotForm({...slotForm, recurrence: e.target.value as SlotRecurrence})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Occurrences (max 30)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={slotForm.recurrenceCount}
                    onChange={(e) => setSlotForm({...slotForm, recurrenceCount: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-2">
              {editingSlot && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="flex-1 bg-gray-500 text-white px-4 py-3 rounded hover:bg-gray-600 font-semibold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className={`${editingSlot ? 'flex-1' : 'w-full'} bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 font-semibold`}
              >
                {editingSlot ? 'Update Slot' : (createMode === 'recurring' ? '+ Add Recurring Slots' : '+ Add Slot')}
              </button>
            </div>
          </form>
        </div>

        {/* Slots List */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Slots</h2>

          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading...</p>
          ) : Object.keys(groupedSlots).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No slots created yet</p>
          ) : (
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                <div key={date}>
                  <h3 className="font-semibold text-lg mb-3 sticky top-0 bg-white">
                    {formatDate(dateSlots[0].startTime)}
                  </h3>
                  <div className="space-y-2">
                    {dateSlots.map(slot => (
                      <div
                        key={slot.id}
                        className={`flex justify-between items-center p-3 border rounded ${
                          slot.isBooked ? 'bg-gray-50 border-gray-300' : 'bg-white border-gray-200'
                        } ${editingSlot === slot.id ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div>
                          <p className="font-medium">
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </p>
                          <p className={`text-sm ${slot.isBooked ? 'text-green-600' : 'text-gray-600'}`}>
                            {slot.isBooked ? '✓ Booked' : 'Available'}
                          </p>
                        </div>
                        {!slot.isBooked && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditSlot(slot)}
                              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlot(slot.id, slot.isBooked)}
                              className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
