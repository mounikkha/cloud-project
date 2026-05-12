import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ myPlans: 0, totalPlans: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const [myRes, allRes] = await Promise.all([
          api.get('/api/my-plans'),
          api.get('/api/travel-plans-list'),
        ]);
        setStats({
          myPlans: myRes.data.plans.length,
          totalPlans: allRes.data.count,
        });
      } catch {
        // Stats are non-critical
      }
    }
    loadStats();
  }, []);

  return (
    <div className="page dashboard-page">
      <div className="welcome-banner">
        <h1>Welcome, <span className="gradient-text">{user?.name}</span> 👋</h1>
        <p>Discover carpool partners and save on your daily commute.</p>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-number">{stats.myPlans}</div>
          <div className="stat-label">My Plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-number">{stats.totalPlans}</div>
          <div className="stat-label">Total Plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">☁️</div>
          <div className="stat-number">Azure</div>
          <div className="stat-label">Cloud Powered</div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-grid">
          <Link to="/add-plan" className="action-card">
            <span className="action-emoji">➕</span>
            <h3>Add Travel Plan</h3>
            <p>Post your route and time</p>
          </Link>
          <Link to="/matches" className="action-card">
            <span className="action-emoji">🔍</span>
            <h3>Find Matches</h3>
            <p>Discover carpool partners</p>
          </Link>
          <Link to="/my-plans" className="action-card">
            <span className="action-emoji">📋</span>
            <h3>My Plans</h3>
            <p>View & manage your plans</p>
          </Link>
        </div>
      </div>

      <div className="cloud-badge">
        <p>⚡ Powered by <strong>Azure Cosmos DB</strong> · <strong>Azure Functions</strong> · <strong>Azure Static Web Apps</strong></p>
      </div>
    </div>
  );
}

export default Dashboard;
