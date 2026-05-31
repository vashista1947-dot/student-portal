import { useState, useEffect } from 'react';
import { getEvents, deleteEvent, getRegistrations, updateEvent } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Trash2, ArrowUpRight, X, ChevronDown, ChevronUp, Edit, User } from 'lucide-react';
import Loader from '../../components/common/Loader';

const AllEvents = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [expandedEventId, setExpandedEventId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Edit Event state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [updating, setUpdating] = useState(false);

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

  const canModifyEvent = (event) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    const creatorId = typeof event.createdBy === 'object' ? event.createdBy?._id : event.createdBy;
    return creatorId === user._id;
  };

  const handleEditEvent = (event) => {
    setEditForm({
      id: event._id,
      companyName: event.company?.name || 'Recruiting Partner',
      season: event.season || '',
      role: event.jobRole || '',
      batch: event.batch || '',
      category: event.category || 'Tech',
      type: event.opportunityType || 'FTE Only',
      ctc: event.ctc || '',
      stipend: event.stipend || 'N/A',
      minCgpa: event.minCGPA !== undefined ? event.minCGPA : '7.00',
      placeOfPosting: event.placeOfPosting || 'Delhi NCR',
      companyBond: event.companyBond || 'None',
      personOfContact: event.personOfContact || '',
      deadline: event.deadline || '',
      allowedDegrees: event.allowedDegrees || ['BTech'],
      allowedBranches: event.eligibleBranches || [],
      description: event.additionalInfo || ''
    });
    setEditModalOpen(true);
  };

  const handleCourseToggle = (course) => {
    let updatedDegrees;
    if (editForm.allowedDegrees.includes(course)) {
      updatedDegrees = editForm.allowedDegrees.filter(d => d !== course);
    } else {
      updatedDegrees = [...editForm.allowedDegrees, course];
    }
    
    let updatedBranches = [...editForm.allowedBranches];
    if (!updatedDegrees.includes('BTech')) {
      updatedBranches = updatedBranches.filter(b => !btechBranches.includes(b));
    }
    if (!updatedDegrees.includes('MTech')) {
      updatedBranches = updatedBranches.filter(b => !mtechBranches.includes(b));
    }

    setEditForm({
      ...editForm,
      allowedDegrees: updatedDegrees,
      allowedBranches: updatedBranches
    });
  };

  const handleBranchChange = (branch) => {
    if (editForm.allowedBranches.includes(branch)) {
      setEditForm({
        ...editForm,
        allowedBranches: editForm.allowedBranches.filter(b => b !== branch)
      });
    } else {
      setEditForm({
        ...editForm,
        allowedBranches: [...editForm.allowedBranches, branch]
      });
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.role || !editForm.role.trim()) {
      addToast('Please enter the Job Role Title', 'error');
      return;
    }
    if (!editForm.batch) {
      addToast('Please enter the Target Batch (Passing Year)', 'error');
      return;
    }
    if (!editForm.ctc || !editForm.ctc.trim()) {
      addToast('Please enter the CTC Package (Annual)', 'error');
      return;
    }
    if (!editForm.minCgpa) {
      addToast('Please enter the Minimum CGPA Cutoff', 'error');
      return;
    }
    if (!editForm.deadline) {
      addToast('Please select the Application Registration Deadline', 'error');
      return;
    }
    if (!editForm.description || !editForm.description.trim()) {
      addToast('Please enter the Job Specs & Description', 'error');
      return;
    }

    setUpdating(true);
    try {
      let selectedEligibleBranches = [];
      if (editForm.allowedBranches.length > 0) {
        selectedEligibleBranches = editForm.allowedBranches;
      } else {
        if (editForm.allowedDegrees.includes('BTech')) {
          selectedEligibleBranches = [...selectedEligibleBranches, ...btechBranches];
        }
        if (editForm.allowedDegrees.includes('MTech')) {
          selectedEligibleBranches = [...selectedEligibleBranches, ...mtechBranches];
        }
      }

      const payload = {
        jobRole: editForm.role,
        category: editForm.category,
        opportunityType: editForm.type,
        batch: Number(editForm.batch),
        deadline: editForm.deadline,
        allowedDegrees: editForm.allowedDegrees,
        eligibleBranches: selectedEligibleBranches,
        minCGPA: parseFloat(editForm.minCgpa),
        ctc: editForm.ctc,
        stipend: editForm.stipend,
        placeOfPosting: editForm.placeOfPosting,
        companyBond: editForm.companyBond,
        personOfContact: editForm.personOfContact,
        additionalInfo: editForm.description
      };

      const { data } = await updateEvent(editForm.id, payload);
      
      // Update local events list with updated event
      setEvents(events.map(ev => ev._id === editForm.id ? { ...ev, ...data.event } : ev));
      setEditModalOpen(false);
      addToast('Hiring drive updated successfully!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update hiring drive', 'error');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await getEvents();
      setEvents(data);

      // Extract unique seasons (years) from fetched events and filter to 4-digit single years only
      const uniqueSeasons = [...new Set(data.map(e => e.season))]
        .filter(s => s && /^\d{4}$/.test(s.toString()))
        .sort()
        .reverse();
      setSeasons(uniqueSeasons);

      // Initialize with empty selected season so interface is empty by default
      setSelectedSeason('');
    } catch {
      addToast('Failed to load hiring events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this event? All application mappings will be destroyed.")) return;
    try {
      await deleteEvent(id);
      const remainingEvents = events.filter(e => e._id !== id);
      setEvents(remainingEvents);

      const uniqueSeasons = [...new Set(remainingEvents.map(e => e.season))]
        .filter(s => s && /^\d{4}$/.test(s.toString()))
        .sort()
        .reverse();
      setSeasons(uniqueSeasons);
      if (uniqueSeasons.length > 0 && !uniqueSeasons.includes(selectedSeason)) {
        setSelectedSeason('');
      }

      addToast('Hiring drive removed', 'success');
    } catch {
      addToast('Failed to delete event', 'error');
    }
  };

  const handleOpenRegistrations = async (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
    setModalLoading(true);
    try {
      const { data } = await getRegistrations(event._id);
      setRegistrations(data.applications || []);
    } catch {
      addToast('Could not fetch registered applicants', 'error');
      setModalOpen(false);
    } finally {
      setModalLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  if (loading) return <Loader />;

  // Filter events based on selected season (single year string, e.g. 2026)
  const filteredEvents = events.filter(e => e.season === selectedSeason);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>All Hiring Drives</h1>
        <p>Review criteria, applications, and scheduling of placement drives</p>
      </div>

      {events.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <Calendar size={48} color="var(--text-tertiary)" style={{ opacity: 0.3, marginBottom: '12px' }} />
          <h3>No Active Hiring Drives</h3>
          <p>Schedule your first corporate visiting schedule inside Add Event page.</p>
        </div>
      ) : (
        <>
          {/* Season Selector Filter Dropdown */}
          <div className="card" style={{ maxWidth: '320px', padding: '16px 20px', marginBottom: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Select Placement Year
              </label>
              <select 
                className="form-select" 
                value={selectedSeason} 
                onChange={(e) => { setSelectedSeason(e.target.value); setExpandedEventId(null); }}
                style={{ background: 'var(--bg-input)', fontSize: '0.86rem', padding: '8px 12px' }}
              >
                <option value="">-- Select Placement Year --</option>
                {seasons.map(s => <option key={s} value={s}>{s} Season</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!selectedSeason ? null : filteredEvents.length === 0 ? (
              <div className="card text-center" style={{ padding: '40px', border: '1px dashed var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No opportunities listed under placement season <strong>{selectedSeason}</strong>.
                </p>
              </div>
            ) : (
              filteredEvents.map(event => (
                <div 
                  key={event._id} 
                  className="card hover-glow" 
                  style={{ 
                    cursor: 'pointer', 
                    transition: 'all 0.25s ease',
                    padding: '20px 24px',
                    border: expandedEventId === event._id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    background: expandedEventId === event._id ? 'rgba(99, 102, 241, 0.02)' : 'var(--bg-card)'
                  }}
                  onClick={() => toggleExpand(event._id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {event.company?.name || 'Recruiting Partner'}
                      </h3>
                      <span 
                        style={{ 
                          fontSize: '0.74rem', 
                          color: 'var(--accent-warning)', 
                          background: 'rgba(245, 158, 11, 0.08)', 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(245, 158, 11, 0.25)', 
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        {event.opportunityType}
                      </span>
                      <span 
                        style={{ 
                          fontSize: '0.74rem', 
                          color: 'var(--accent-success)', 
                          background: 'rgba(16, 185, 129, 0.08)', 
                          padding: '3px 10px', 
                          borderRadius: '20px', 
                          border: '1px solid rgba(16, 185, 129, 0.25)', 
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <User size={11} style={{ opacity: 0.9 }} />
                        {event.createdBy?.name || 'System Admin'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
                        {event.jobRole}
                      </span>
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {expandedEventId === event._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </span>
                    </div>
                  </div>

                  {/* Expandable details container */}
                  {expandedEventId === event._id && (
                    <div 
                      style={{ 
                        marginTop: '20px', 
                        borderTop: '1px solid var(--border-color)', 
                        paddingTop: '20px', 
                        animation: 'fadeIn 0.3s ease' 
                      }}
                      onClick={(e) => e.stopPropagation()} // Stop click propagation so clicking inside details doesn't close it
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>CTC Package (Annual)</span>
                          <strong style={{ color: 'var(--accent-success)', fontSize: '1.1rem' }}>{event.ctc || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Monthly Stipend</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.stipend || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Min CGPA Cutoff</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.minCGPA || '0.00'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Allowed Degrees</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.allowedDegrees?.join(', ') || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Posting Location</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.placeOfPosting || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Service Bond Details</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.companyBond || 'None'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>POC / Coordinator</span>
                          <strong style={{ color: 'var(--text-primary)' }}>{event.personOfContact || 'N/A'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Application Deadline</span>
                          <strong style={{ color: 'var(--accent-danger)' }}>{new Date(event.deadline).toLocaleString()}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Scheduled By</span>
                          <strong style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{event.createdBy?.name || 'System Admin'}</strong>
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Eligible Academic Streams</span>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {event.eligibleBranches?.map(b => (
                            <span key={b} style={{ fontSize: '0.74rem', fontWeight: 600, background: 'var(--bg-input)', border: '1px solid var(--border-color)', padding: '4px 10px', borderRadius: '4px', color: 'var(--text-primary)' }}>{b}</span>
                          )) || <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All Open</span>}
                        </div>
                      </div>

                      {event.additionalInfo && (
                        <div style={{ marginBottom: '24px', background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Job Specifications & Description</span>
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{event.additionalInfo}</p>
                        </div>
                      )}

                      {/* Action buttons inside expanded card */}
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <button className="btn btn-outline btn-sm" onClick={() => handleOpenRegistrations(event)}>
                          <Users size={14} /> View Applicants
                        </button>
                        {canModifyEvent(event) && (
                          <>
                            <button className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleEditEvent(event)}>
                              <Edit size={14} /> Edit Event
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)', display: 'inline-flex', alignItems: 'center', gap: '4px' }} onClick={() => handleDelete(event._id)}>
                              <Trash2 size={15} /> Delete Event
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Applicants List Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="modal-header">
              <h2>Registered Applicants: {selectedEvent?.company?.name}</h2>
              <button className="modal-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            {modalLoading ? (
              <Loader />
            ) : registrations.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <p>No student applications submitted yet for this drive.</p>
              </div>
            ) : (
              <div className="table-container" style={{ marginTop: '10px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll Number</th>
                      <th>CGPA</th>
                      <th>Email</th>
                      <th>Resume</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map(app => (
                      <tr key={app._id}>
                        <td style={{ fontWeight: 600 }}>{app.studentName}</td>
                        <td>{app.rollNumber}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{app.cgpa}</td>
                        <td>{app.collegeMail}</td>
                        <td>
                          {app.resumeDriveLink ? (
                            <a href={app.resumeDriveLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              View <ArrowUpRight size={12} />
                            </a>
                          ) : 'No file'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Edit Event Modal */}
      {editModalOpen && editForm && (
        <div className="modal-overlay" style={{ background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto', padding: '30px' }}>
            <div className="modal-header" style={{ marginBottom: '22px' }}>
              <h2>Edit Hiring Drive: {editForm.companyName}</h2>
              <button className="modal-close" onClick={() => setEditModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} noValidate>
              {/* Row 2: Job Role, Target Batch, and Domain Category */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Job Role Title</label>
                  <input type="text" className="form-input" placeholder="e.g. Software Development Engineer" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Batch (Passing Year)</label>
                  <input type="number" className="form-input" placeholder="e.g. 2027" value={editForm.batch} onChange={(e) => setEditForm({...editForm, batch: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Domain Category</label>
                  <select className="form-select" value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} required>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 3: Opportunity Type, CTC, and CGPA Limit */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Opportunity Type</label>
                  <select className="form-select" value={editForm.type} onChange={(e) => setEditForm({...editForm, type: e.target.value})} required>
                    {opportunityTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">CTC Package (Annual)</label>
                  <input type="text" className="form-input" placeholder="e.g. 24.5 LPA" value={editForm.ctc} onChange={(e) => setEditForm({...editForm, ctc: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Min CGPA Cutoff</label>
                  <input type="number" step="0.01" min="0" max="10" className="form-input" placeholder="e.g. 7.50" value={editForm.minCgpa} onChange={(e) => setEditForm({...editForm, minCgpa: e.target.value})} required />
                </div>
              </div>

              {/* Row 4: Stipend, Posting Location, and Bond */}
              <div className="form-row-3">
                <div className="form-group">
                  <label className="form-label">Monthly Stipend</label>
                  <input type="text" className="form-input" placeholder="e.g. 80,000 / month" value={editForm.stipend} onChange={(e) => setEditForm({...editForm, stipend: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Place of Posting</label>
                  <input type="text" className="form-input" placeholder="e.g. Gurgaon, India" value={editForm.placeOfPosting} onChange={(e) => setEditForm({...editForm, placeOfPosting: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Service Bond details</label>
                  <input type="text" className="form-input" placeholder="e.g. 2 Years or None" value={editForm.companyBond} onChange={(e) => setEditForm({...editForm, companyBond: e.target.value})} />
                </div>
              </div>

              {/* Row 5: POC and Deadline */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Person of Contact (POC)</label>
                  <input type="text" className="form-input" placeholder="e.g. HR Manager / Coordinator" value={editForm.personOfContact} onChange={(e) => setEditForm({...editForm, personOfContact: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Application Registration Deadline</label>
                  <input type="datetime-local" className="form-input" value={editForm.deadline} onChange={(e) => setEditForm({...editForm, deadline: e.target.value})} required />
                </div>
              </div>

              {/* Allowed Degrees Checkboxes */}
              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label">Allowed Courses / Degrees (Select multiple)</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {coursesList.map(course => (
                    <label key={course} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: editForm.allowedDegrees.includes(course) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: editForm.allowedDegrees.includes(course) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                      <input type="checkbox" checked={editForm.allowedDegrees.includes(course)} onChange={() => handleCourseToggle(course)} style={{ display: 'none' }} />
                      {course}
                    </label>
                  ))}
                </div>
              </div>

              {editForm.allowedDegrees.includes('BTech') && (
                <div className="form-group animate-slide-down" style={{ marginBottom: '18px' }}>
                  <label className="form-label">Allowed BTech Streams (Select multiple)</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {btechBranches.map(branch => (
                      <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: editForm.allowedBranches.includes(branch) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: editForm.allowedBranches.includes(branch) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <input type="checkbox" checked={editForm.allowedBranches.includes(branch)} onChange={() => handleBranchChange(branch)} style={{ display: 'none' }} />
                        {branch}
                      </label>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>* Leaving all fields blank allows all BTech streams to apply.</span>
                </div>
              )}

              {editForm.allowedDegrees.includes('MTech') && (
                <div className="form-group animate-slide-down" style={{ marginBottom: '18px' }}>
                  <label className="form-label">Allowed MTech Streams (Select multiple)</label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {mtechBranches.map(branch => (
                      <label key={branch} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: editForm.allowedBranches.includes(branch) ? 'rgba(99,102,241,0.08)' : 'var(--bg-input)', border: editForm.allowedBranches.includes(branch) ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', transition: 'all var(--transition-fast)', fontSize: '0.8rem', fontWeight: 600 }}>
                        <input type="checkbox" checked={editForm.allowedBranches.includes(branch)} onChange={() => handleBranchChange(branch)} style={{ display: 'none' }} />
                        {branch}
                      </label>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>* Leaving all fields blank allows all MTech streams to apply.</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Job Specs & Description</label>
                <textarea className="form-textarea" style={{ minHeight: '120px' }} placeholder="Detail coding requirements, role responsibilities, tech stacks, and rounds detail..." value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})} required></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditModalOpen(false)} disabled={updating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllEvents;