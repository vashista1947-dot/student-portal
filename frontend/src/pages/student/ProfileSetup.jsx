import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createProfile, getProfile } from '../../services/api';
import { Save, CheckCircle } from 'lucide-react';

const BTECH_BRANCHES = [
  'CSAI', 'CSDS', 'CIOT', 'CSDA', 'CSE', 'MAC', 'IT', 'ITNS', 'ECE', 'EIOT', 'ECAM', 'EE', 'ICE', 'ME', 'MEEV', 'BT', 'GI', 'CIVIL'
];

const MTECH_BRANCHES = [
  'CSAI', 'CSDS', 'CIOT', 'CSDA', 'CSE', 'MAC', 'IT', 'ITNS', 'ECE', 'EIOT', 'ECAM', 'EE', 'ICE', 'ME', 'MEEV', 'BT', 'GI', 'CIVIL'
];

const DEGREES = ['BTech', 'MTech', 'BBA', 'MBA', 'MSc', 'PhD', 'BDes', 'BArch'];

const ProfileSetup = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i - 3);

  const [form, setForm] = useState({
    name: user?.name || '',
    dob: '',
    gender: '',
    category: '',
    address: '',
    fathersName: '',
    mothersName: '',
    degree: 'BTech',
    branch: '',
    yearOfPassing: currentYear + 1,
    class10Percentage: '',
    class12Percentage: '',
    sem1Sgpa: '', sem2Sgpa: '', sem3Sgpa: '', sem4Sgpa: '',
    sem5Sgpa: '', sem6Sgpa: '', sem7Sgpa: '', sem8Sgpa: '',
    cgpa: '',
    cgpaAfter1Drop: '',
    cgpaAfter2Drops: '',
    personalMail: '',
    phone: '',
    resumeDriveLink: ''
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data } = await getProfile();
        if (data) {
          setAlreadyExists(true);
          navigate('/student/profile');
        }
      } catch {}
    };
    checkProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const branches = form.degree === 'MTech' ? MTECH_BRANCHES :
    form.degree === 'BTech' ? BTECH_BRANCHES : BTECH_BRANCHES;

  const isPrefinal = () => {
    const diff = form.yearOfPassing - currentYear;
    return diff > 1;
  };

  const isFinal = () => {
    const diff = form.yearOfPassing - currentYear;
    return diff <= 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = { ...form };
      // Convert general numeric fields
      ['class10Percentage', 'class12Percentage', 'cgpa', 'cgpaAfter1Drop', 'cgpaAfter2Drops', 'yearOfPassing'].forEach(field => {
        if (payload[field] !== '' && payload[field] !== null && payload[field] !== undefined) {
          payload[field] = Number(payload[field]);
        } else {
          payload[field] = null;
        }
      });

      // Convert semester SGPA fields allowing 'NA' / 'N/A' as null
      ['sem1Sgpa', 'sem2Sgpa', 'sem3Sgpa', 'sem4Sgpa', 'sem5Sgpa', 'sem6Sgpa', 'sem7Sgpa', 'sem8Sgpa'].forEach(field => {
        const val = payload[field];
        if (val === undefined || val === null || String(val).trim() === '') {
          payload[field] = null;
        } else {
          const str = String(val).trim().toUpperCase();
          if (str === 'NA' || str === 'N/A') {
            payload[field] = null;
          } else {
            const num = Number(val);
            payload[field] = isNaN(num) ? null : num;
          }
        }
      });

      await createProfile(payload);
      navigate('/student/dashboard');
    } catch (err) {
      const errMsg = err.response?.data?.errors 
        ? err.response.data.errors.join(', ') 
        : err.response?.data?.message;
      setError(errMsg || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  if (alreadyExists) return null;

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div className="page-header">
        <h1>Complete Your Profile</h1>
        <p>One-time setup — fill all details to start applying</p>
      </div>

      {/* Progress Steps */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2, 3].map(s => (
          <div key={s} style={{
            flex: 1, height: 4, borderRadius: 4,
            background: s <= step ? 'var(--accent-primary)' : 'var(--border-color)',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      <div style={{
        display: 'flex', gap: 16, marginBottom: 24, justifyContent: 'center'
      }}>
        {['Personal Info', 'Academic Info', 'Contact & Resume'].map((label, i) => (
          <button key={i} onClick={() => setStep(i + 1)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: step === i + 1 ? 'var(--accent-primary)' : 'var(--text-tertiary)',
            fontWeight: step === i + 1 ? 700 : 500, fontSize: '0.82rem',
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            {step > i + 1 ? <CheckCircle size={14} color="var(--accent-success)" /> : null}
            {label}
          </button>
        ))}
      </div>

      {error && <div className="auth-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="card">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input type="text" name="name" className="form-input" value={form.name} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" name="dob" className="form-input" value={form.dob} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input type="text" name="category" className="form-input" placeholder="e.g., General, OBC, SC, ST" value={form.category} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input type="text" name="fathersName" className="form-input" placeholder="Enter father's name" value={form.fathersName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Mother's Name</label>
                  <input type="text" name="mothersName" className="form-input" placeholder="Enter mother's name" value={form.mothersName} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <textarea name="address" className="form-textarea" placeholder="Enter your address" value={form.address} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Next →</button>
              </div>
            </>
          )}

          {/* STEP 2: Academic Info */}
          {step === 2 && (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Academic Information</h3>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Degree</label>
                  <select name="degree" className="form-select" value={form.degree} onChange={handleChange} required>
                    {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Branch</label>
                  <select name="branch" className="form-select" value={form.branch} onChange={handleChange} required>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Year of Passing</label>
                  <select name="yearOfPassing" className="form-select" value={form.yearOfPassing} onChange={handleChange} required>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Class 10th Percentage</label>
                  <input type="number" step="0.01" name="class10Percentage" className="form-input" placeholder="e.g., 92.5" value={form.class10Percentage} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Class 12th Percentage</label>
                  <input type="number" step="0.01" name="class12Percentage" className="form-input" placeholder="e.g., 88.0" value={form.class12Percentage} onChange={handleChange} required />
                </div>
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '20px 0 12px', color: 'var(--text-secondary)' }}>SEMESTER-WISE SGPA</h4>
              <div className="form-row" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <div className="form-group" key={sem}>
                    <label className="form-label">Sem {sem}</label>
                    <input type="text" name={`sem${sem}Sgpa`} className="form-input" placeholder="e.g. 9.0 or NA" value={form[`sem${sem}Sgpa`]} onChange={handleChange} />
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, margin: '16px 0 12px', color: 'var(--text-secondary)' }}>CGPA</h4>
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Total CGPA</label>
                  <input type="number" step="0.01" name="cgpa" className="form-input" placeholder="e.g., 8.50" value={form.cgpa} onChange={handleChange} required />
                </div>
                {isPrefinal() && (
                  <div className="form-group">
                    <label className="form-label">CGPA After 1 Drop</label>
                    <input type="number" step="0.01" name="cgpaAfter1Drop" className="form-input" placeholder="e.g., 8.80" value={form.cgpaAfter1Drop} onChange={handleChange} />
                  </div>
                )}
                {isFinal() && (
                  <div className="form-group">
                    <label className="form-label">CGPA After 2 Drops</label>
                    <input type="number" step="0.01" name="cgpaAfter2Drops" className="form-input" placeholder="e.g., 9.00" value={form.cgpaAfter2Drops} onChange={handleChange} />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Next →</button>
              </div>
            </>
          )}

          {/* STEP 3: Contact & Resume */}
          {step === 3 && (
            <>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>Contact & Resume</h3>
              <div className="form-group">
                <label className="form-label">College Email (auto-filled)</label>
                <input type="email" className="form-input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Personal Email</label>
                  <input type="email" name="personalMail" className="form-input" placeholder="your.email@gmail.com" value={form.personalMail} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-input" placeholder="e.g., 9876543210" value={form.phone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Resume Google Drive Link</label>
                <input type="url" name="resumeDriveLink" className="form-input" placeholder="https://drive.google.com/file/d/..." value={form.resumeDriveLink} onChange={handleChange} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;