import { useState, useEffect } from 'react';
import { getCompanies, addCompany, deleteCompany } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Plus, Trash2, Globe, Building2, MapPin, CheckCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';

const AddCompany = () => {
  const { addToast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({ name: '', season: `${currentYear}` });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await getCompanies();
      setCompanies(data);
    } catch {
      addToast('Failed to load companies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await addCompany(formData);
      // Backend returns { message, company: { _id, name, season } }
      const newCompany = data.company || data;
      setCompanies([newCompany, ...companies]);
      setFormData({ name: '', season: `${currentYear}` });
      setShowSuccessModal(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to add company', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await deleteCompany(id);
      setCompanies(companies.filter(c => c._id !== id));
      addToast('Company removed successfully', 'success');
    } catch {
      addToast('Failed to delete company', 'error');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Manage Companies</h1>
        <p>Register and oversee industry recruiting partners</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        {/* Form Card */}
        <div className="card" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Add New Partner</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input type="text" className="form-input" placeholder="e.g. Google India" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Placement Season</label>
              <input type="text" className="form-input" placeholder="e.g. 2026" value={formData.season} onChange={(e) => setFormData({...formData, season: e.target.value})} required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
              <Plus size={16} /> {submitting ? 'Registering...' : 'Register Company'}
            </button>
          </form>
        </div>

        {/* Directory Listing */}
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Company Directory</h2>
          {companies.length === 0 ? (
            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>No companies registered yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {companies.map(company => (
                <div key={company._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={{ background: 'rgba(99,102,241,0.1)', height: '44px', width: '44px', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Building2 size={20} color="var(--accent-primary)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{company.name}</h4>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Globe size={12} /> Season: {company.season}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ color: 'var(--accent-danger)' }} onClick={() => handleDelete(company._id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showSuccessModal && (
        <div className="modal-overlay" style={{ background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)' }}>
          <div className="modal-content text-center animate-scale-up" style={{
            maxWidth: '400px',
            textAlign: 'center',
            padding: '40px 30px',
            borderRadius: 'var(--radius-xl)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-glow-success)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            animation: 'scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(16, 185, 129, 0.3)',
              boxShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
              marginBottom: '10px',
              animation: 'scaleUp 0.5s ease-out'
            }}>
              <CheckCircle size={48} color="var(--accent-success)" style={{ strokeWidth: 2.5 }} />
            </div>
            
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Company Added Successfully!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                The recruiting partner has been successfully registered under the placement season directory.
              </p>
            </div>

            <button 
              className="btn" 
              onClick={handleSuccessClose}
              style={{
                width: '100%',
                background: 'var(--gradient-success)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
                marginTop: '10px'
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCompany;