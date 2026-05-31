import { useState, useEffect } from 'react';
import { getCompanies, getEvents, getAnnouncements, searchStudents } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Calendar, Bell, Users, Award } from 'lucide-react';
import Loader from '../../components/common/Loader';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ companies: 0, events: 0, announcements: 0, students: 0 });
  const [loading, setLoading] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [compRes, eventRes, annRes, studRes] = await Promise.allSettled([
          getCompanies(),
          getEvents(),
          getAnnouncements(),
          searchStudents('')
        ]);

        const totalCompanies = compRes.status === 'fulfilled' ? compRes.value.data.length : 0;
        const eventsData = eventRes.status === 'fulfilled' ? eventRes.value.data : [];
        const annsData = annRes.status === 'fulfilled' ? annRes.value.data : [];
        const totalStudents = studRes.status === 'fulfilled' ? studRes.value.data.length : 0;

        setStats({
          companies: totalCompanies,
          events: eventsData.length,
          announcements: annsData.length,
          students: totalStudents
        });

        setRecentEvents(eventsData.slice(0, 3));
        setRecentAnnouncements(annsData.slice(0, 3));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Dashboard 👋</h1>
        <p>Welcome, {user?.name} | Coordinator Portal</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.students}</h3>
            <p>Registered Students</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Users size={22} color="var(--accent-primary)" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.companies}</h3>
            <p>Recruiting Partners</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <Briefcase size={22} color="var(--accent-success)" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.events}</h3>
            <p>Active Hiring Drives</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.1)' }}>
            <Calendar size={22} color="var(--accent-secondary)" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.announcements}</h3>
            <p>Active Announcements</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
            <Bell size={22} color="var(--accent-warning)" />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Recent Events Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Award size={18} color="var(--accent-secondary)" /> Upcoming Drives
          </h2>
          {recentEvents.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No events scheduled.</p>
          ) : (
            recentEvents.map(event => {
              const badgeType = (event.opportunityType || 'FTE').toLowerCase().replace(/\s+/g, '');
              return (
                <div key={event._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{event.company?.name || 'Hiring Drive'}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {event.jobRole} | CGPA Cutoff: {event.minCGPA || 0}
                    </p>
                  </div>
                  <span className={`badge badge-${badgeType}`}>{event.opportunityType}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Announcements Card */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Bell size={18} color="var(--accent-warning)" /> Latest Bulletins
          </h2>
          {recentAnnouncements.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No bulletins posted.</p>
          ) : (
            recentAnnouncements.map(ann => (
              <div key={ann._id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ann.title}</h4>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{ann.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;