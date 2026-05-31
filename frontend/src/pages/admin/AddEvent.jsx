import { useState, useEffect } from 'react';
import { getCompanies, createEvent } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus, CheckCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';

const AddEvent = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const yearsList = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(String);

  const [formData, setFormData] = useState({
    company: '',
    allowedDegrees: ['BTech'], // Multi-select degrees array
    role: '',
    description: '',
    type: 'FTE Only',
    ctc: '',
    stipend: 'N/A',
    minCgpa: '7.00',
    allowedBranches: [],
    deadline: '',
    season: currentYear.toString(),
    batch: currentYear + 1,
    category: 'Tech',
    placeOfPosting: 'Delhi NCR',
    companyBond: 'None',
    personOfContact: ''
  });

  const coursesList = ['BTech', 'MTech', 'BBA', 'MBA', 'BDes', 'MSc', 'PhD', 'BArch'];
  const btechBranches = ['CSAI', 'CSDS', 'CIOT', 'CSDA', 'CSE', 'MAC', 'IT', 'ITNS', 'ECE', 'EIOT', 'ECAM', 'EE', 'ICE', 'ME', 'MEEV', 'BT', 'GI', 'CIVIL'];
  const mtechBranches = ['PIS', 'PEE', 'PSE', 'PVLSI', 'Bioinformatics', 'PME', 'PIT', 'Artificial Intelligence'];

  const categories = ['Tech', 'Non-Tech', 'Core', 'Sales'];
  const opportunityTypes = [
    'Internship',
    'Internship + PPO',
    'FTE Only',
    'Intern + FTE',
    '2-Month Intern',
    '6-Month Intern',
    '6-Month Intern + PPO'
  ];

  useEffect(() => {
    const fetchCompaniesList = async () => {
      try {
        const { data } = await getCompanies();
        setCompanies(data);
      } catch {
        addToast('Unable to pull active companies', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchCompaniesList();
  }, []);

  const handleCourseToggle = (course) => {
    let updatedDegrees;
    if (formData.allowedDegrees.includes(course)) {
      updatedDegrees = formData.allowedDegrees.filter(d => d !== course);
    } else {
      updatedDegrees = [...formData.allowedDegrees, course];
    }
    
    // Clear allowedBranches that belong to deselected courses
    let updatedBranches = [...formData.allowedBranches];
    if (!updatedDegrees.includes('BTech')) {
      updatedBranches = updatedBranches.filter(b => !btechBranches.includes(b));
    }
    if (!updatedDegrees.includes('MTech')) {
      updatedBranches = updatedBranches.filter(b => !mtechBranches.includes(b));
    }

    setFormData({
      ...formData,
      allowedDegrees: updatedDegrees,
      allowedBranches: updatedBranches
    });
  };

  const handleBranchChange = (branch) => {
    if (formData.allowedBranches.includes(branch)) {
      setFormData({
        ...formData,
        allowedBranches: formData.allowedBranches.filter(b => b !== branch)
      });
    } else {
      setFormData({
        ...formData,
        allowedBranches: [...formData.allowedBranches, branch]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company) {
      addToast('Please select a recruiting partner company', 'error');
      return;
    }
    if (!formData.allowedDegrees || formData.allowedDegrees.length === 0) {
      addToast('Please select at least one Allowed Course/Degree', 'error');
      return;
    }
    if (!formData.role || !formData.role.trim()) {
      addToast('Please enter the Job Role Title', 'error');
      return;
    }
    if (!formData.batch) {
      addToast('Please enter the Target Batch (Passing Year)', 'error');
      return;
    }
    if (!formData.ctc || !formData.ctc.trim()) {
      addToast('Please enter the CTC Package (Annual)', 'error');
      return;
    }
    if (!formData.minCgpa) {
      addToast('Please enter the Minimum CGPA Cutoff', 'error');
      return;
    }
    if (!formData.deadline) {
      addToast('Please select the Application Registration Deadline', 'error');
      return;
    }
    if (!formData.description || !formData.description.trim()) {
      addToast('Please enter the Job Specs & Description', 'error');
      return;
    }
    setSubmitting(true);
    try {
      // Determine eligible branches based on selected courses
      let selectedEligibleBranches = [];
      if (formData.allowedBranches.length > 0) {
        selectedEligibleBranches = formData.allowedBranches;
      } else {
        // If no branches are explicitly checked, default to allowing all branches for the selected degrees
        if (formData.allowedDegrees.includes('BTech')) {
          selectedEligibleBranches = [...selectedEligibleBranches, ...btechBranches];
        }
        if (formData.allowedDegrees.includes('MTech')) {
          selectedEligibleBranches = [...selectedEligibleBranches, ...mtechBranches];
        }
      }

      const payload = {
        companyId: formData.company,
        season: formData.season,
        jobRole: formData.role,
        category: formData.category,
        opportunityType: formData.type,
        batch: Number(formData.batch),
        deadline: formData.deadline,
        allowedDegrees: formData.allowedDegrees,
        eligibleBranches: selectedEligibleBranches,
        minCGPA: parseFloat(formData.minCgpa),
        ctc: formData.ctc,
        stipend: formData.stipend,
        placeOfPosting: formData.placeOfPosting,
        companyBond: formData.companyBond,
        personOfContact: formData.personOfContact,
        additionalInfo: formData.description
      };

      await createEvent(payload);
      setShowSuccessModal(true);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to establish event', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/admin/events');
  };

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Schedule Hiring Drive</h1>
        <p>Set cutoffs, details, package CTC, and branch limits for recruiting visits</p>
      </div>

      <div className="card" style={{ maxWidth: '750px' }}>
        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Placement Season & Select Company */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Placement Season</label>
              <select 
                className="form-select" 
                value={formData.season} 
                onChange={(e) => setFormData({...formData, season: e.target.value, company: ''})} 
                required
              >
                {yearsList.map(y => <option key={y} value={y}>{y} Season</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Company</label>
              <select className="form-select" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required>
                <option value="">-- Select Recruiting Partner --</option>
                {companies.filter(c => c.season === formData.season).map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 1.5: Allowed Courses / Degrees Checkboxes */}
          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label">Allowed Courses / Degrees (Select multiple)</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {coursesList.map(course => (
                <label key={course} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: formData.allowedDegrees.includes(course) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: formData.allowedDegrees.includes(course) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={formData.allowedDegrees.includes(course)} onChange={() => handleCourseToggle(course)} style={{ display: 'none' }} />
                  {course}
                </label>
              ))}
            </div>
          </div>

          {/* Row 2: Job Role, Target Batch, and Domain Category */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Job Role Title</label>
              <input type="text" className="form-input" placeholder="e.g. Software Development Engineer" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Target Batch (Passing Year)</label>
              <input type="number" className="form-input" placeholder="e.g. 2027" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Domain Category</label>
              <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Row 3: Opportunity Type, CTC, and CGPA Limit */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Opportunity Type</label>
              <select className="form-select" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} required>
                {opportunityTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">CTC Package (Annual)</label>
              <input type="text" className="form-input" placeholder="e.g. 24.5 LPA" value={formData.ctc} onChange={(e) => setFormData({...formData, ctc: e.target.value})} required />
            </div>
            <div className="form-group">
              <label className="form-label">Min CGPA Cutoff</label>
              <input type="number" step="0.01" min="0" max="10" className="form-input" placeholder="e.g. 7.50" value={formData.minCgpa} onChange={(e) => setFormData({...formData, minCgpa: e.target.value})} required />
            </div>
          </div>

          {/* Row 4: Stipend, Posting Location, and Bond */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Monthly Stipend</label>
              <input type="text" className="form-input" placeholder="e.g. 80,000 / month" value={formData.stipend} onChange={(e) => setFormData({...formData, stipend: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Place of Posting</label>
              <input type="text" className="form-input" placeholder="e.g. Gurgaon, India" value={formData.placeOfPosting} onChange={(e) => setFormData({...formData, placeOfPosting: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Service Bond details</label>
              <input type="text" className="form-input" placeholder="e.g. 2 Years or None" value={formData.companyBond} onChange={(e) => setFormData({...formData, companyBond: e.target.value})} />
            </div>
          </div>

          {/* Row 5: POC and Deadline */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Person of Contact (POC)</label>
              <input type="text" className="form-input" placeholder="e.g. HR Manager / Coordinator" value={formData.personOfContact} onChange={(e) => setFormData({...formData, personOfContact: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Application Registration Deadline</label>
              <input type="datetime-local" className="form-input" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} required />
            </div>
          </div>

          {formData.allowedDegrees.includes('BTech') && (
            <div className="form-group animate-slide-down" style={{ marginBottom: '18px' }}>
              <label className="form-label">Allowed BTech Streams (Select multiple)</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                {btechBranches.map(branch => (
                  <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: formData.allowedBranches.includes(branch) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: formData.allowedBranches.includes(branch) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={formData.allowedBranches.includes(branch)} onChange={() => handleBranchChange(branch)} style={{ display: 'none' }} />
                    {branch}
                  </label>
                ))}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>* Leaving all fields blank allows all BTech streams to apply.</span>
            </div>
          )}

          {formData.allowedDegrees.includes('MTech') && (
            <div className="form-group animate-slide-down" style={{ marginBottom: '18px' }}>
              <label className="form-label">Allowed MTech Streams (Select multiple)</label>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                {mtechBranches.map(branch => (
                  <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: formData.allowedBranches.includes(branch) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: formData.allowedBranches.includes(branch) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                    <input type="checkbox" checked={formData.allowedBranches.includes(branch)} onChange={() => handleBranchChange(branch)} style={{ display: 'none' }} />
                    {branch}
                  </label>
                ))}
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>* Leaving all fields blank allows all MTech streams to apply.</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Job Specs & Description</label>
            <textarea className="form-textarea" style={{ minHeight: '120px' }} placeholder="Detail coding requirements, role responsibilities, tech stacks, and rounds detail..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required></textarea>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={submitting}>
            <Plus size={16} /> {submitting ? 'Scheduling...' : 'Launch Drive'}
          </button>
        </form>
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
                Event Added Successfully!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                The corporate hiring drive has been scheduled and is now active for eligible students.
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
              Continue to Events List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddEvent;