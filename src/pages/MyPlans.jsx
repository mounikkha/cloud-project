import { useEffect, useState } from 'react';
import api from '../services/api';

function MyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/my-plans');
      setPlans(res.data.plans);
    } catch {
      // handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this travel plan?')) return;
    try {
      await api.delete(`/api/travel-plans/${id}`);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>📋 My Travel Plans</h1>
        <p>Manage your posted travel plans</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading…</div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🗺️</span>
          <h3>No travel plans yet</h3>
          <p>Add your first travel plan to get started!</p>
        </div>
      ) : (
        <div className="plans-grid">
          {plans.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-route">
                <span className="route-point source">📍 {plan.source}</span>
                <span className="route-arrow">→</span>
                <span className="route-point dest">📍 {plan.destination}</span>
              </div>
              <div className="plan-meta">
                <span className="plan-time">🕐 {plan.timeSlot}</span>
                <span className="plan-date">{new Date(plan.createdAt).toLocaleDateString()}</span>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(plan.id)}>
                🗑️ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyPlans;
