import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getProfile, getAnnouncements, getMyApplications } from '../../services/api';
import { Briefcase, Bell, FileCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/common/Loader';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, annRes, appRes] = await Promise.allSettled([
          getProfile(),
          getAnnouncements(),
          getMyApplications()
        ]);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data);
        if (appRes.status === 'fulfilled') setApplications(appRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
        <p>NSUT Training & Placement Portal</p>
      </div>

      {!profile && (
        <div className="card" style={{ marginBottom: 20, borderColor: 'var(--accent-warning)', background: 'rgba(245,158,11,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <AlertTriangle size={22} color="var(--accent-warning)" />
            <div>
              <h3 style={{ fontSize: '0.95rem', marginBottom: 2 }}>Complete Your Profile</h3>
              <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                You need to complete your profile before applying to any opportunities.
              </p>
            </div>
            <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => navigate('/profile-setup')}>
              Setup Profile
            </button>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{applications.length}</h3>
            <p>Applications Submitted</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <FileCheck size={22} color="var(--accent-primary)" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{profile?.cgpa || 'N/A'}</h3>
            <p>Your CGPA</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
            <Briefcase size={22} color="var(--accent-success)" />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{announcements.length}</h3>
            <p>Announcements</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
            <Bell size={22} color="var(--accent-warning)" />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>📢 Recent Announcements</h2>
        {announcements.length === 0 ? (
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No announcements yet.</p>
        ) : (
          announcements.slice(0, 5).map((ann) => (
            <div key={ann._id} style={{
              padding: '12px 0',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12
            }}>
              <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority}</span>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600 }}>{ann.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{ann.content}</p>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
                  {new Date(ann.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;