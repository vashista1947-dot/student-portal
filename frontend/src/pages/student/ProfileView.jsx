import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { User, Mail, Phone, BookOpen, GraduationCap, FileText, ExternalLink, Edit3, Save, X } from 'lucide-react';
import Loader from '../../components/common/Loader';

const BTECH_BRANCHES = [
  'CSAI', 'CSDS', 'CIOT', 'CSDA', 'CSE', 'MAC', 'IT', 'ITNS', 'ECE', 'EIOT', 'ECAM', 'EE', 'ICE', 'ME', 'MEEV', 'BT', 'GI', 'CIVIL'
];

const MTECH_BRANCHES = [
  'CSAI', 'CSDS', 'CIOT', 'CSDA', 'CSE', 'MAC', 'IT', 'ITNS', 'ECE', 'EIOT', 'ECAM', 'EE', 'ICE', 'ME', 'MEEV', 'BT', 'GI', 'CIVIL'
];

const DEGREES = ['BTech', 'MTech', 'BBA', 'MBA', 'MSc', 'PhD', 'BDes', 'BArch'];

const Section = ({ title, icon, children }) => (
  <div className="card" style={{ marginBottom: 18 }}>
    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
      {icon} {title}
    </h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px 24px' }}>
      {children}
    </div>
  </div>
);

const Field = ({ label, value, style }) => (
  <div style={style}>
    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{label}</span>
    <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: 2 }}>{value || 'N/A'}</p>
  </div>
);

const ProfileView = () => {
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const navigate = useNavigate();

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i - 3);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await getProfile();
        setProfile(data);
      } catch {
        navigate('/profile-setup');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const startEditing = () => {
    setEditForm({
      name: profile.name || '',
      dob: profile.dob || '',
      gender: profile.gender || '',
      category: profile.category || '',
      address: profile.address || '',
      fathersName: profile.fathersName || '',
      mothersName: profile.mothersName || '',
      degree: profile.degree || 'BTech',
      branch: profile.branch || '',
      yearOfPassing: profile.yearOfPassing || currentYear + 1,
      class10Percentage: profile.class10Percentage || '',
      class12Percentage: profile.class12Percentage || '',
      sem1Sgpa: profile.sem1Sgpa !== null && profile.sem1Sgpa !== undefined ? profile.sem1Sgpa : 'NA',
      sem2Sgpa: profile.sem2Sgpa !== null && profile.sem2Sgpa !== undefined ? profile.sem2Sgpa : 'NA',
      sem3Sgpa: profile.sem3Sgpa !== null && profile.sem3Sgpa !== undefined ? profile.sem3Sgpa : 'NA',
      sem4Sgpa: profile.sem4Sgpa !== null && profile.sem4Sgpa !== undefined ? profile.sem4Sgpa : 'NA',
      sem5Sgpa: profile.sem5Sgpa !== null && profile.sem5Sgpa !== undefined ? profile.sem5Sgpa : 'NA',
      sem6Sgpa: profile.sem6Sgpa !== null && profile.sem6Sgpa !== undefined ? profile.sem6Sgpa : 'NA',
      sem7Sgpa: profile.sem7Sgpa !== null && profile.sem7Sgpa !== undefined ? profile.sem7Sgpa : 'NA',
      sem8Sgpa: profile.sem8Sgpa !== null && profile.sem8Sgpa !== undefined ? profile.sem8Sgpa : 'NA',
      cgpa: profile.cgpa || '',
      cgpaAfter1Drop: profile.cgpaAfter1Drop !== null && profile.cgpaAfter1Drop !== undefined ? profile.cgpaAfter1Drop : '',
      cgpaAfter2Drops: profile.cgpaAfter2Drops !== null && profile.cgpaAfter2Drops !== undefined ? profile.cgpaAfter2Drops : '',
      personalMail: profile.personalMail || '',
      phone: profile.phone || '',
      resumeDriveLink: profile.resumeDriveLink || ''
    });
    setEditError('');
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const isPrefinal = () => {
    if (!editForm) return false;
    const diff = editForm.yearOfPassing - currentYear;
    return diff > 1;
  };

  const isFinal = () => {
    if (!editForm) return false;
    const diff = editForm.yearOfPassing - currentYear;
    return diff <= 1;
  };

  const branches = editForm?.degree === 'MTech' ? MTECH_BRANCHES :
    editForm?.degree === 'BTech' ? BTECH_BRANCHES : BTECH_BRANCHES;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setEditError('');

    try {
      const payload = { ...editForm };
      
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

      const { data } = await updateProfile(payload);
      setProfile(data);
      setIsEditing(false);
      addToast('Profile updated successfully!', 'success');
    } catch (err) {
      const errMsg = err.response?.data?.errors 
        ? err.response.data.errors.join(', ') 
        : err.response?.data?.message;
      setEditError(errMsg || 'Failed to update profile');
      addToast(errMsg || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!profile) return null;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>{isEditing ? 'Edit Profile' : 'My Profile'}</h1>
        <p>{isEditing ? 'Modify your placement profile details' : 'Your placement profile details'}</p>
      </div>

      {profile.isBanned && (
        <div className="card" style={{ marginBottom: 18, borderColor: 'var(--accent-danger)', background: 'rgba(239,68,68,0.06)' }}>
          <p style={{ color: '#f87171', fontWeight: 600, fontSize: '0.9rem' }}>⚠️ Your account has been banned. You cannot apply to opportunities.</p>
          {profile.banReason && <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: 4 }}>Reason: {profile.banReason}</p>}
        </div>
      )}

      {editError && <div className="auth-error" style={{ marginBottom: 18 }}>{editError}</div>}

      <form onSubmit={handleSave}>
        {/* Section 1: Personal Info */}
        <Section title="Personal Information" icon={<User size={18} color="var(--accent-primary)" />}>
          {isEditing ? (
            <>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" name="name" className="form-input" value={editForm.name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Roll Number (auto-filled)</label>
                <input type="text" className="form-input" value={profile.rollNumber} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input type="date" name="dob" className="form-input" value={editForm.dob} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-select" value={editForm.gender} onChange={handleChange} required>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input type="text" name="category" className="form-input" value={editForm.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Father's Name</label>
                <input type="text" name="fathersName" className="form-input" value={editForm.fathersName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Mother's Name</label>
                <input type="text" name="mothersName" className="form-input" value={editForm.mothersName} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <textarea name="address" className="form-textarea" value={editForm.address} onChange={handleChange} />
              </div>
            </>
          ) : (
            <>
              <Field label="Name" value={profile.name} />
              <Field label="Roll Number" value={profile.rollNumber} />
              <Field label="Date of Birth" value={profile.dob} />
              <Field label="Gender" value={profile.gender} />
              <Field label="Category" value={profile.category} />
              <Field label="Father's Name" value={profile.fathersName} />
              <Field label="Mother's Name" value={profile.mothersName} />
              <Field label="Address" value={profile.address} style={{ gridColumn: '1 / -1' }} />
            </>
          )}
        </Section>

        {/* Section 2: Academic Info */}
        <Section title="Academic Information" icon={<GraduationCap size={18} color="var(--accent-success)" />}>
          {isEditing ? (
            <>
              <div className="form-group">
                <label className="form-label">Degree</label>
                <select name="degree" className="form-select" value={editForm.degree} onChange={handleChange} required>
                  {DEGREES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Branch</label>
                <select name="branch" className="form-select" value={editForm.branch} onChange={handleChange} required>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Passing</label>
                <select name="yearOfPassing" className="form-select" value={editForm.yearOfPassing} onChange={handleChange} required>
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Class 10th %</label>
                <input type="number" step="0.01" name="class10Percentage" className="form-input" value={editForm.class10Percentage} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Class 12th %</label>
                <input type="number" step="0.01" name="class12Percentage" className="form-input" value={editForm.class12Percentage} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Total CGPA</label>
                <input type="number" step="0.01" name="cgpa" className="form-input" value={editForm.cgpa} onChange={handleChange} required />
              </div>
              {isPrefinal() && (
                <div className="form-group">
                  <label className="form-label">CGPA After 1 Drop</label>
                  <input type="number" step="0.01" name="cgpaAfter1Drop" className="form-input" value={editForm.cgpaAfter1Drop} onChange={handleChange} />
                </div>
              )}
              {isFinal() && (
                <div className="form-group">
                  <label className="form-label">CGPA After 2 Drops</label>
                  <input type="number" step="0.01" name="cgpaAfter2Drops" className="form-input" value={editForm.cgpaAfter2Drops} onChange={handleChange} />
                </div>
              )}
            </>
          ) : (
            <>
              <Field label="Degree" value={profile.degree} />
              <Field label="Branch" value={profile.branch} />
              <Field label="Year of Passing" value={profile.yearOfPassing} />
              <Field label="Class 10th %" value={profile.class10Percentage} />
              <Field label="Class 12th %" value={profile.class12Percentage} />
              <Field label="Total CGPA" value={profile.cgpa} />
              {profile.cgpaAfter1Drop && <Field label="CGPA After 1 Drop" value={profile.cgpaAfter1Drop} />}
              {profile.cgpaAfter2Drops && <Field label="CGPA After 2 Drops" value={profile.cgpaAfter2Drops} />}
            </>
          )}
        </Section>

        {/* Section 3: Semester SGPAs */}
        <Section title="Semester SGPAs" icon={<BookOpen size={18} color="var(--accent-warning)" />}>
          {isEditing ? (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <div className="form-group" key={s}>
                  <label className="form-label">Sem {s} SGPA</label>
                  <input type="text" name={`sem${s}Sgpa`} className="form-input" placeholder="e.g. 9.2 or NA" value={editForm[`sem${s}Sgpa`]} onChange={handleChange} />
                </div>
              ))}
            </>
          ) : (
            <>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <Field key={s} label={`Semester ${s}`} value={profile[`sem${s}Sgpa`] !== null && profile[`sem${s}Sgpa`] !== undefined ? profile[`sem${s}Sgpa`] : 'N/A'} />
              ))}
            </>
          )}
        </Section>

        {/* Section 4: Contact */}
        <Section title="Contact" icon={<Mail size={18} color="var(--accent-info)" />}>
          {isEditing ? (
            <>
              <div className="form-group">
                <label className="form-label">College Email (auto-filled)</label>
                <input type="email" className="form-input" value={profile.collegeMail} disabled style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Personal Email</label>
                <input type="email" name="personalMail" className="form-input" value={editForm.personalMail} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input type="tel" name="phone" className="form-input" value={editForm.phone} onChange={handleChange} required />
              </div>
            </>
          ) : (
            <>
              <Field label="College Email" value={profile.collegeMail} />
              <Field label="Personal Email" value={profile.personalMail} />
              <Field label="Phone" value={profile.phone} />
            </>
          )}
        </Section>

        {/* Section 5: Resume */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color="var(--accent-secondary)" /> Resume
          </h3>
          {isEditing ? (
            <div className="form-group">
              <label className="form-label">Resume Google Drive Link</label>
              <input type="url" name="resumeDriveLink" className="form-input" value={editForm.resumeDriveLink} onChange={handleChange} required style={{ width: '100%' }} />
            </div>
          ) : (
            <a href={profile.resumeDriveLink} target="_blank" rel="noopener noreferrer"
              className="btn btn-outline" style={{ display: 'inline-flex' }}>
              <ExternalLink size={16} /> View Resume on Drive
            </a>
          )}
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          {isEditing ? (
            <>
              <button type="button" className="btn btn-outline" onClick={() => { setIsEditing(false); setEditError(''); }} disabled={saving}>
                <X size={16} /> Cancel
              </button>
              <button type="submit" className="btn btn-success" disabled={saving}>
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button type="button" className="btn btn-primary" onClick={startEditing}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileView;