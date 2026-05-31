import { useState, useEffect } from 'react';
import { getEvents, sendBulkEmail } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Mail, AlertCircle, FileSpreadsheet, Eye } from 'lucide-react';
import Loader from '../../components/common/Loader';

const SendData = () => {
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Selection states
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedTypeId, setSelectedTypeId] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const { data } = await getEvents();
        setEvents(data);
      } catch {
        addToast('Failed to load active drives', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  // Filter calculations
  const getUniqueCompanies = () => {
    const list = [];
    const seen = new Set();
    events.forEach(e => {
      if (e.company && !seen.has(e.company._id)) {
        seen.add(e.company._id);
        list.push(e.company);
      }
    });
    return list;
  };

  const getFilteredRoles = () => {
    if (!selectedCompanyId) return [];
    const filtered = events.filter(e => e.company?._id === selectedCompanyId);
    return [...new Set(filtered.map(e => e.jobRole))];
  };

  const getFilteredTypes = () => {
    if (!selectedCompanyId || !selectedRoleId) return [];
    const filtered = events.filter(
      e => e.company?._id === selectedCompanyId && e.jobRole === selectedRoleId
    );
    return [...new Set(filtered.map(e => e.opportunityType))];
  };

  // Reset dependent fields on company change
  const handleCompanyChange = (e) => {
    setSelectedCompanyId(e.target.value);
    setSelectedRoleId('');
    setSelectedTypeId('');
  };

  // Reset dependent field on role change
  const handleRoleChange = (e) => {
    setSelectedRoleId(e.target.value);
    setSelectedTypeId('');
  };

  const getSubjectPreview = () => {
    if (!selectedCompanyId || !selectedTypeId) return 'Data Verification - COMPANY | OPPORTUNITY_TYPE';
    const company = getUniqueCompanies().find(c => c._id === selectedCompanyId);
    return `Data Verification - ${company?.name || 'COMPANY NAME'} | ${selectedTypeId}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      addToast('Please select a company', 'error');
      return;
    }
    if (!selectedRoleId) {
      addToast('Please select the job role', 'error');
      return;
    }
    if (!selectedTypeId) {
      addToast('Please select the opportunity type', 'error');
      return;
    }

    const matchingEvent = events.find(
      ev => ev.company?._id === selectedCompanyId &&
            ev.jobRole === selectedRoleId &&
            ev.opportunityType === selectedTypeId
    );

    if (!matchingEvent) {
      addToast('No active hiring event matches these criteria', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        companyId: selectedCompanyId,
        jobRole: selectedRoleId,
        opportunityType: selectedTypeId,
        season: matchingEvent.season
      };
      
      await sendBulkEmail(payload);
      addToast('Student verification spreadsheet successfully sent to vasista1947@gmail.com!', 'success');
      
      // Reset forms
      setSelectedCompanyId('');
      setSelectedRoleId('');
      setSelectedTypeId('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch email communications', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader />;

  const uniqueCompanies = getUniqueCompanies();
  const filteredRoles = getFilteredRoles();
  const filteredTypes = getFilteredTypes();

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Send Verification Data</h1>
        <p>Compile and email student applicant rosters to administrative receivers</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px' }}>
        {/* Email Selection Form */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '4px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
            <Mail size={18} color="var(--accent-primary)" /> Dispatch Form
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">1. Select Company</label>
              <select className="form-select" value={selectedCompanyId} onChange={handleCompanyChange} required>
                <option value="">-- Choose Company --</option>
                {uniqueCompanies.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">2. Select Job Role</label>
              <select 
                className="form-select" 
                value={selectedRoleId} 
                onChange={handleRoleChange} 
                disabled={!selectedCompanyId}
                required
              >
                <option value="">-- Choose Job Role --</option>
                {filteredRoles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">3. Select Opportunity Type</label>
              <select 
                className="form-select" 
                value={selectedTypeId} 
                onChange={(e) => setSelectedTypeId(e.target.value)} 
                disabled={!selectedRoleId}
                required
              >
                <option value="">-- Choose Opportunity Type --</option>
                {filteredTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={sending}>
              <Mail size={16} /> {sending ? 'Compiling and dispatching data...' : 'Send Data'}
            </button>
          </form>
        </div>

        {/* Live Email Dispatch Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: 'var(--text-primary)' }}>
              <Eye size={18} color="var(--accent-primary)" /> Live Dispatch Preview
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '2px' }}>Recipient Receiver</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>vasista1947@gmail.com</strong>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '2px' }}>Email Subject</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--accent-primary)' }}>{getSubjectPreview()}</strong>
              </div>

              <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>Email Body Content</span>
                <pre style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)', fontFamily: 'inherit', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  {"Dear Team,\n\nKindly Verify the date,\n\nRegards."}
                </pre>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.06)', border: '1px dashed rgba(16,185,129,0.3)', padding: '10px 14px', borderRadius: 'var(--radius-sm)' }}>
                <FileSpreadsheet size={16} color="var(--accent-success)" />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Auto-generates and attaches <strong>XLSX Applicant Sheet</strong>.
                </span>
              </div>
            </div>
          </div>

          <div className="card" style={{ borderLeft: '4px solid var(--accent-info)', background: 'rgba(59,130,246,0.03)' }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <AlertCircle size={18} color="var(--accent-info)" /> Verification Policy
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Pressing the <strong>Send Data</strong> button compiles the spreadsheet containing all registered student profiles for the selected pool, automatically maps their credentials, and dispatches it in real-time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendData;