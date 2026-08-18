import { useState, useEffect } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Plus, Trash2, Megaphone, BellRing } from 'lucide-react';
import Loader from '../../components/common/Loader';

const Announcements = () => {
  const { addToast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', priority: 'Normal' });

  useEffect(() => {
    fetchAnnouncementsList();
  }, []);

  const fetchAnnouncementsList = async () => {
    try {
      const { data } = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      addToast('Failed to pull announcements', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await createAnnouncement(formData);
      setAnnouncements([data, ...announcements]);
      setFormData({ title: '', content: '', priority: 'Normal' });
      addToast('Announcement posted successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch bulletin', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a._id !== id));
      addToast('Bulletin removed', 'success');
    } catch {
      addToast('Failed to delete announcement', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Placement Notice Board</h1>
        <p>Post college wide placements news, drives schedulers, and urgent warnings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
        {/* Form to Post */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Megaphone size={18} color="var(--accent-primary)" /> Post Bulletin
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title Header</label>
              <input type="text" className="form-input" placeholder="e.g. Capgemini PPT Rescheduled" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Priority Warning Level</label>
              <select className="form-select" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Normal">Normal Notification</option>
                <option value="Important">Important Alert</option>
                <option value="Urgent">Urgent Warning</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Details / Content</label>
              <textarea className="form-textarea" style={{ minHeight: '120px' }} placeholder="Specify details regarding dates, room allocations, batch schedules..." value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required></textarea>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Posting drive bulletin...' : 'Post Notice'}
            </button>
          </form>
        </div>

        {/* Existing Notices */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <BellRing size={18} color="var(--accent-warning)" /> Active Bulletins
          </h2>
          {announcements.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No bulletins posted.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {announcements.map(ann => (
                <div key={ann._id} style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span className={`badge badge-${ann.priority.toLowerCase()}`}>{ann.priority}</span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>{ann.title}</h4>
                    </div>
                    <button className="btn btn-ghost" style={{ color: 'var(--accent-danger)', padding: '4px 8px' }} onClick={() => handleDelete(ann._id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{ann.content}</p>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', display: 'block', marginTop: '8px' }}>
                    Posted on: {new Date(ann.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;