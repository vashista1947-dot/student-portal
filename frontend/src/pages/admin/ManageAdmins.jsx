import { useState, useEffect } from 'react';
import { getAdmins, createAdmin, deleteAdmin } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Plus, Trash2, Shield, UserCheck } from 'lucide-react';
import Loader from '../../components/common/Loader';

const ManageAdmins = () => {
  const { addToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    fetchAdminList();
  }, []);

  const fetchAdminList = async () => {
    try {
      const { data } = await getAdmins();
      setAdmins(data);
    } catch {
      addToast('Failed to load coordinators directory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password
      };
      
      const { data } = await createAdmin(payload);
      setAdmins([...admins, data]);
      setFormData({ name: '', email: '', password: '' });
      addToast('T&P Admin coordinator created successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to establish coordinator account', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this T&P administrator coordinate account?")) return;
    try {
      await deleteAdmin(id);
      setAdmins(admins.filter(a => a._id !== id));
      addToast('Coordinator account removed', 'success');
    } catch {
      addToast('Could not delete admin account', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Manage Administrative Board</h1>
        <p>Create and oversee coordinators and training placement officers (TPOs)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '24px' }}>
        {/* Form Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Shield size={18} color="var(--accent-primary)" /> Register Coordinator
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input type="text" className="form-input" placeholder="e.g. Prof. R.K. Sharma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            
            <div className="form-group">
              <label className="form-label">Corporate Coordinator Email</label>
              <input type="email" className="form-input" placeholder="e.g. rksharma@nsut.ac.in" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>

            <div className="form-group">
              <label className="form-label">Account Password</label>
              <input type="password" className="form-input" placeholder="Minimum 6 characters" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Registering board member...' : 'Register Member'}
            </button>
          </form>
        </div>

        {/* Existing Board Listing */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <UserCheck size={18} color="var(--accent-success)" /> Active Placements Board
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Coordinator Name</th>
                  <th>System Email</th>
                  <th>Level Authority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map(adm => (
                  <tr key={adm._id}>
                    <td style={{ fontWeight: 600 }}>{adm.name}</td>
                    <td>{adm.email}</td>
                    <td>
                      <span className={`badge badge-${adm.role === 'super_admin' ? 'ppo' : 'fte'}`}>
                        {adm.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td>
                      {adm.role !== 'super_admin' ? (
                        <button className="btn btn-ghost" style={{ color: 'var(--accent-danger)', padding: '4px 8px' }} onClick={() => handleDelete(adm._id)}>
                          <Trash2 size={14} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>System Protected</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageAdmins;