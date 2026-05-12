import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const TIME_SLOTS = [
  '6:00 AM - 8:00 AM',
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
  '8:00 PM - 10:00 PM',
];

function AddPlan() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await api.post('/api/travel-plans', { source, destination, timeSlot });
      setMessage({ text: '✅ Travel plan added successfully!', type: 'success' });
      setSource('');
      setDestination('');
      setTimeSlot('');
      setTimeout(() => navigate('/my-plans'), 1500);
    } catch (err) {
      setMessage({ text: err.response?.data?.error || 'Failed to add plan.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>➕ Add Travel Plan</h1>
        <p>Enter your route details to find carpool partners</p>
      </div>

      <div className="form-card">
        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="source">📍 Source (From)</label>
            <input
              id="source"
              type="text"
              placeholder="e.g. Hyderabad"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="destination">📍 Destination (To)</label>
            <input
              id="destination"
              type="text"
              placeholder="e.g. Bangalore"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeSlot">🕐 Time Slot</label>
            <select
              id="timeSlot"
              value={timeSlot}
              onChange={(e) => setTimeSlot(e.target.value)}
              required
            >
              <option value="">Select time slot</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>{slot}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Adding…' : 'Add Travel Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddPlan;
