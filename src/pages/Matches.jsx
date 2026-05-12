import { useState } from 'react';
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

function Matches() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [matches, setMatches] = useState(null);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ source, destination });
      if (timeSlot) params.set('timeSlot', timeSlot);
      const res = await api.get(`/api/matches?${params.toString()}`);
      setMatches(res.data.matches);
      setCount(res.data.count);
    } catch (err) {
      setMatches([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>🔍 Find Carpool Matches</h1>
        <p>Search for people traveling the same route</p>
      </div>

      <div className="form-card">
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="match-source">📍 Source</label>
              <input
                id="match-source"
                type="text"
                placeholder="e.g. Hyderabad"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="match-dest">📍 Destination</label>
              <input
                id="match-dest"
                type="text"
                placeholder="e.g. Bangalore"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="match-time">🕐 Time Slot (optional)</label>
              <select
                id="match-time"
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
              >
                <option value="">Any time</option>
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Searching…' : '🔍 Search Matches'}
          </button>
        </form>
      </div>

      {searched && !loading && (
        <div className="matches-results">
          <div className="match-count-badge">
            <span className="match-count">{count}</span>
            <span>{count === 1 ? 'match' : 'matches'} found</span>
          </div>

          {matches && matches.length > 0 ? (
            <div className="plans-grid">
              {matches.map((m) => (
                <div key={m.id} className="plan-card match-card">
                  <div className="match-user">
                    <span className="user-avatar">👤</span>
                    <div>
                      <strong>{m.userName}</strong>
                      <span className="user-email">{m.userEmail}</span>
                    </div>
                  </div>
                  <div className="plan-route">
                    <span className="route-point source">📍 {m.source}</span>
                    <span className="route-arrow">→</span>
                    <span className="route-point dest">📍 {m.destination}</span>
                  </div>
                  <div className="plan-meta">
                    <span className="plan-time">🕐 {m.timeSlot}</span>
                    <span className="plan-date">{new Date(m.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span className="empty-icon">😔</span>
              <h3>No matches found</h3>
              <p>Try a different route or time slot</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Matches;
