import { useState } from 'react';
import { sendInvitation } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Mail, Plus, Trash2, Eye, Send, Users, Building2, UserPlus, Calendar, Clock } from 'lucide-react';

const SendInvitation = () => {
  const { addToast } = useToast();
  const [sending, setSending] = useState(false);

  // Form states
  const [receiverEmail, setReceiverEmail] = useState('');
  const [ccEmail, setCcEmail] = useState('');
  const [bccEmail, setBccEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [coordinators, setCoordinators] = useState([{ name: '', phone: '' }]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledFor, setScheduledFor] = useState('');

  const addCoordinator = () => {
    setCoordinators(prev => [...prev, { name: '', phone: '' }]);
  };

  const removeCoordinator = (index) => {
    if (coordinators.length <= 1) return;
    setCoordinators(prev => prev.filter((_, i) => i !== index));
  };

  const updateCoordinator = (index, field, value) => {
    setCoordinators(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const getSubjectPreview = () => {
    if (!companyName.trim()) return 'NSUT: Invitation for Full Time and Intern Hiring 2026-27 | Company Name';
    return `NSUT: Invitation for Full Time and Intern Hiring 2026-27 | ${companyName.trim()}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!receiverEmail.trim()) {
      addToast('Please enter at least one receiver email', 'error');
      return;
    }
    if (!companyName.trim()) {
      addToast('Please enter the company name', 'error');
      return;
    }

    const validCoordinators = coordinators.filter(c => c.name.trim());
    if (validCoordinators.length === 0) {
      addToast('Please add at least one coordinator name', 'error');
      return;
    }

    if (isScheduled && !scheduledFor) {
      addToast('Please specify a valid future date and time for scheduling', 'error');
      return;
    }
    if (isScheduled && new Date(scheduledFor) <= new Date()) {
      addToast('Scheduled time must be in the future', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        receiverEmails: receiverEmail.trim(),
        ccEmails: ccEmail.trim() || undefined,
        bccEmails: bccEmail.trim() || undefined,
        companyName: companyName.trim(),
        coordinators: validCoordinators.map(c => ({
          name: c.name.trim(),
          phone: c.phone.trim() || undefined
        })),
        scheduledFor: isScheduled ? new Date(scheduledFor).toISOString() : undefined
      };

      const response = await sendInvitation(payload);
      addToast(response.data?.message || 'Placement invitation processed successfully!', 'success');

      // Reset form
      setReceiverEmail('');
      setCcEmail('');
      setBccEmail('');
      setCompanyName('');
      setCoordinators([{ name: '', phone: '' }]);
      setIsScheduled(false);
      setScheduledFor('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to process invitation email', 'error');
    } finally {
      setSending(false);
    }
  };

  // Inline style objects
  const sectionLabel = {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '1.2px',
    color: 'var(--text-tertiary)',
    fontWeight: 700,
    marginBottom: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: '0.88rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit'
  };

  const hintStyle = {
    fontSize: '0.72rem',
    color: 'var(--text-tertiary)',
    marginTop: '4px',
    fontStyle: 'italic'
  };

  const coordinatorRowStyle = {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'var(--bg-input)',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
    transition: 'all 0.2s ease'
  };

  const previewFieldStyle = {
    background: 'var(--bg-input)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)'
  };

  const previewLabelStyle = {
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    color: 'var(--text-tertiary)',
    display: 'block',
    marginBottom: '2px',
    letterSpacing: '0.8px',
    fontWeight: 600
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Send Placement Invitation</h1>
        <p>Compose and dispatch official NSUT hiring invitation to companies with brochure and CRF attachments</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* ─── LEFT: Invitation Form ──────────────────────── */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <h2 style={{ fontSize: '1.08rem', marginBottom: '0', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text-primary)' }}>
            <Mail size={18} color="var(--accent-primary)" /> Invitation Composer
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

            {/* ── Email Recipients Section ── */}
            <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={sectionLabel}>
                <Send size={13} /> Email Recipients
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.82rem' }}>Receiver Email(s) <span style={{ color: 'var(--accent-error)' }}>*</span></label>
                  <input
                    type="text"
                    style={inputStyle}
                    value={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    placeholder="hr@company.com"
                    required
                  />
                  <div style={hintStyle}>For multiple emails, separate with commas</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>CC</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={ccEmail}
                      onChange={(e) => setCcEmail(e.target.value)}
                      placeholder="cc@company.com"
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>BCC</label>
                    <input
                      type="text"
                      style={inputStyle}
                      value={bccEmail}
                      onChange={(e) => setBccEmail(e.target.value)}
                      placeholder="bcc@company.com"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Company Name ── */}
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                <Building2 size={14} /> Company Name <span style={{ color: 'var(--accent-error)' }}>*</span>
              </label>
              <input
                type="text"
                style={inputStyle}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Google, Microsoft, Tower Research Capital"
                required
              />
            </div>

            {/* ── Coordinators Section ── */}
            <div style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.12)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={{ ...sectionLabel, marginBottom: '12px' }}>
                <Users size={13} /> Placement Coordinators
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {coordinators.map((coord, index) => (
                  <div key={index} style={coordinatorRowStyle}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', fontWeight: 700, minWidth: '18px' }}>
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', flex: 1.2 }}
                      value={coord.name}
                      onChange={(e) => updateCoordinator(index, 'name', e.target.value)}
                      placeholder="Coordinator Name"
                    />
                    <span style={{ color: 'var(--border-color)', fontSize: '1.1rem', fontWeight: 300 }}>|</span>
                    <input
                      type="text"
                      style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '4px 0', flex: 0.8 }}
                      value={coord.phone}
                      onChange={(e) => updateCoordinator(index, 'phone', e.target.value)}
                      placeholder="Phone Number"
                    />
                    {coordinators.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCoordinator(index)}
                        style={{
                          background: 'rgba(239,68,68,0.08)',
                          border: '1px solid rgba(239,68,68,0.2)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          flexShrink: 0
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                        onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCoordinator}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    border: '1px dashed rgba(16,185,129,0.3)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(16,185,129,0.04)',
                    color: 'var(--accent-success)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(16,185,129,0.04)'; }}
                >
                  <UserPlus size={15} /> Add Another Coordinator
                </button>
              </div>
            </div>

            {/* ── Scheduling Options Section ── */}
            <div style={{ background: 'rgba(99,102,241,0.03)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', padding: '18px' }}>
              <div style={sectionLabel}>
                <Calendar size={13} /> Scheduling Options
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.86rem', color: 'var(--text-primary)', userSelect: 'none' }}>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                  Schedule this invitation for later
                </label>

                {isScheduled && (
                  <div className="form-group" style={{ margin: 0, marginTop: '4px' }}>
                    <label className="form-label" style={{ fontSize: '0.82rem' }}>Date & Time <span style={{ color: 'var(--accent-error)' }}>*</span></label>
                    <input
                      type="datetime-local"
                      style={inputStyle}
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      required={isScheduled}
                      min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                    />
                    <div style={hintStyle}>Specify the date and time to automatically send this email</div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Submit Button ── */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '12px',
                fontSize: '0.92rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              disabled={sending}
            >
              {isScheduled ? <Clock size={16} /> : <Send size={16} />}
              {sending
                ? (isScheduled ? 'Scheduling invitation...' : 'Dispatching invitation...')
                : (isScheduled ? 'Schedule Invitation' : 'Send Invitation')
              }
            </button>
          </form>
        </div>

        {/* ─── RIGHT: Live Preview Panel ──────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '30px' }}>

          {/* Live Preview Card */}
          <div className="card" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--text-primary)' }}>
              <Eye size={18} color="var(--accent-primary)" /> Live Invitation Preview
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Scheduled Status Badge */}
              {isScheduled && scheduledFor && (
                <div style={{
                  background: 'rgba(99,102,241,0.08)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-primary)',
                  fontSize: '0.82rem'
                }}>
                  <Clock size={14} />
                  <span>
                    Scheduled to send: <strong>{new Date(scheduledFor).toLocaleString()}</strong>
                  </span>
                </div>
              )}

              {/* Sender */}
              <div style={previewFieldStyle}>
                <span style={previewLabelStyle}>From</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  T&P Cell &lt;upparapally.vasista.ug23@nsut.ac.in&gt;
                </strong>
              </div>

              {/* Recipient */}
              <div style={previewFieldStyle}>
                <span style={previewLabelStyle}>To</span>
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                  {receiverEmail.trim() || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No recipient specified</span>}
                </strong>
              </div>

              {/* CC / BCC Row */}
              {(ccEmail.trim() || bccEmail.trim()) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {ccEmail.trim() && (
                    <div style={previewFieldStyle}>
                      <span style={previewLabelStyle}>CC</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{ccEmail.trim()}</span>
                    </div>
                  )}
                  {bccEmail.trim() && (
                    <div style={previewFieldStyle}>
                      <span style={previewLabelStyle}>BCC</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{bccEmail.trim()}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Subject */}
              <div style={{ ...previewFieldStyle, borderLeft: '3px solid var(--accent-primary)' }}>
                <span style={previewLabelStyle}>Subject</span>
                <strong style={{ fontSize: '0.88rem', color: 'var(--accent-primary)', lineHeight: 1.4, display: 'block' }}>
                  {getSubjectPreview()}
                </strong>
              </div>

              {/* Body Snippet */}
              <div style={previewFieldStyle}>
                <span style={previewLabelStyle}>Body Preview</span>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginTop: '6px' }}>
                  <p style={{ margin: '0 0 6px' }}>Dear Team,</p>
                  <p style={{ margin: '0 0 6px', fontWeight: 600, color: 'var(--text-primary)' }}>Warm Greetings from NSUT!</p>
                  <p style={{ margin: '0 0 6px' }}>
                    We would like to extend an official invitation to your esteemed organisation to participate in the <strong>Placement Season 2026-27</strong>...
                  </p>
                  <p style={{ margin: '8px 0 0', color: 'var(--text-tertiary)', fontSize: '0.76rem', fontStyle: 'italic' }}>
                    (includes academic programs table, notable recruiters, placement season details, and confidentiality notice)
                  </p>
                </div>
              </div>

              {/* Coordinators Preview */}
              {coordinators.some(c => c.name.trim()) && (
                <div style={{ ...previewFieldStyle, borderLeft: '3px solid var(--accent-success)' }}>
                  <span style={previewLabelStyle}>Coordinators in Signature</span>
                  <div style={{ marginTop: '6px' }}>
                    {coordinators.filter(c => c.name.trim()).map((c, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{c.name}</strong>
                        {c.phone && <span> &nbsp;|&nbsp; +91-{c.phone}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                background: 'rgba(16,185,129,0.04)',
                border: '1px dashed rgba(16,185,129,0.25)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)'
              }}>
                <span style={{ ...previewLabelStyle, color: 'var(--accent-success)' }}>Auto-Attached Files</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>📄</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>NSUT Placement Brochure 2025-26.pdf</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>📋</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>NSUT Campus Recruitment Form.docx</strong>
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem' }}>🏛️</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <strong>NSUT Logo</strong> <span style={{ color: 'var(--text-tertiary)' }}>(inline in email header)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent-warning)', background: 'rgba(245,158,11,0.03)' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Mail size={16} color="var(--accent-warning)" /> Invitation Details
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This sends the <strong>official NSUT placement invitation</strong> with full academic programs, notable recruiters, seasonal access table, and placement officer contacts. The <strong>Brochure (PDF)</strong> and <strong>CRF (DOCX)</strong> are automatically attached to every email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendInvitation;
