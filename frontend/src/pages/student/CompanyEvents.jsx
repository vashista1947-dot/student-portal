import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, applyToEvent, getProfile, getMyApplications } from '../../services/api';
import { Briefcase, MapPin, Calendar, IndianRupee, GraduationCap, CheckCircle, XCircle } from 'lucide-react';
import Loader from '../../components/common/Loader';
import Modal from '../../components/common/Modal';

const CompanyEvents = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, profileRes, appsRes] = await Promise.allSettled([
          getEvents(),
          getProfile(),
          getMyApplications()
        ]);
        if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data);
        if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);
        if (appsRes.status === 'fulfilled') setApplications(appsRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (eventId) => {
    if (!profile) {
      setMessage({ text: 'Please complete your profile first!', type: 'error' });
      return;
    }
    setApplying(eventId);
    setMessage({ text: '', type: '' });
    try {
      await applyToEvent(eventId);
      setMessage({ text: 'Application submitted successfully! ✅', type: 'success' });
      
      // Update applications state immediately after successful submission
      const apps = await getMyApplications();
      setApplications(apps.data);
      setSelectedEvent(null);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to apply', type: 'error' });
    } finally {
      setApplying(null);
    }
  };

  const getCategoryBadge = (cat) => {
    const map = { 'Tech': 'badge-tech', 'Non-Tech': 'badge-nontech', 'Core': 'badge-core', 'Sales': 'badge-sales' };
    return map[cat] || 'badge-tech';
  };

  const getTypeBadge = (type) => {
    if (type?.includes('FTE')) return 'badge-fte';
    if (type?.includes('PPO')) return 'badge-ppo';
    return 'badge-internship';
  };

  const hasApplied = (eventId) => {
    return applications.some(app => app.jobEvent?._id === eventId);
  };

  const isDeadlinePassed = (deadlineStr) => {
    if (!deadlineStr) return false;
    const deadline = new Date(deadlineStr);
    return new Date() > deadline;
  };

  const getEligibilityStatus = (event) => {
    if (!profile) return { eligible: true };

    // Check degree
    if (event.allowedDegrees && event.allowedDegrees.length > 0) {
      if (!event.allowedDegrees.includes(profile.degree)) {
        return { eligible: false, reason: `Degree '${profile.degree}' is not eligible for this opportunity.` };
      }
    }

    // Check branch
    if (event.eligibleBranches && event.eligibleBranches.length > 0) {
      if (!event.eligibleBranches.includes(profile.branch)) {
        return { eligible: false, reason: `Branch '${profile.branch}' is not eligible for this opportunity.` };
      }
    }

    // Check CGPA
    if (event.minCGPA && profile.cgpa < event.minCGPA) {
      return { eligible: false, reason: `CGPA requirement unmet (Minimum required: ${event.minCGPA}, Your CGPA: ${profile.cgpa})` };
    }

    // Check batch
    if (event.batch && profile.yearOfPassing !== event.batch) {
      return { eligible: false, reason: `Batch requirement mismatch (Event target: ${event.batch}, Your batch: ${profile.yearOfPassing})` };
    }

    return { eligible: true };
  };

  const renderActionButton = (event, isModal = false) => {
    if (!profile) {
      return (
        <button 
          className="btn btn-warning btn-sm" 
          onClick={(e) => { e.stopPropagation(); navigate('/profile-setup'); }}
          style={isModal ? { width: '100%', marginTop: 20 } : {}}
        >
          Complete Profile
        </button>
      );
    }

    if (hasApplied(event._id)) {
      return (
        <button 
          className="btn btn-sm" 
          disabled 
          style={{ 
            background: 'rgba(16,185,129,0.1)', 
            color: '#34d399', 
            borderColor: 'rgba(16,185,129,0.2)', 
            cursor: 'not-allowed', 
            opacity: 0.8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
            width: isModal ? '100%' : 'auto',
            marginTop: isModal ? 20 : 0
          }}
        >
          <CheckCircle size={14} /> Already Applied
        </button>
      );
    }

    if (isDeadlinePassed(event.deadline)) {
      return (
        <button 
          className="btn btn-outline btn-sm" 
          disabled 
          style={{ 
            color: 'var(--text-tertiary)',
            borderColor: 'var(--border-color)',
            background: 'rgba(255,255,255,0.02)',
            opacity: 0.5, 
            cursor: 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'center',
            width: isModal ? '100%' : 'auto',
            marginTop: isModal ? 20 : 0
          }}
        >
          <XCircle size={14} /> Deadline Passed
        </button>
      );
    }

    const eligibility = getEligibilityStatus(event);
    if (!eligibility.eligible) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isModal ? 'stretch' : 'flex-end', gap: 6 }}>
          <button 
            className="btn btn-outline btn-sm" 
            disabled 
            style={{ 
              color: '#ef4444', 
              borderColor: 'rgba(239,68,68,0.2)', 
              background: 'rgba(239,68,68,0.04)',
              opacity: 0.7, 
              cursor: 'not-allowed',
              width: isModal ? '100%' : 'auto',
              marginTop: isModal ? 20 : 0
            }} 
            title={eligibility.reason}
          >
            Cannot Apply
          </button>
          {isModal && (
            <div style={{ 
              background: 'rgba(239,68,68,0.06)', 
              border: '1px solid rgba(239,68,68,0.15)', 
              borderRadius: 'var(--radius-md)', 
              padding: '10px 14px', 
              marginTop: 10,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              color: '#f87171',
              fontSize: '0.8rem',
              fontWeight: 500,
              lineHeight: 1.3
            }}>
              <span style={{ fontSize: '1rem', marginTop: -2 }}>⚠️</span>
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#ef4444', display: 'block', fontSize: '0.82rem', marginBottom: 2 }}>Ineligibility Reason</strong>
                {eligibility.reason}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        className={isModal ? "btn btn-primary" : "btn btn-primary btn-sm"}
        style={isModal ? { width: '100%', marginTop: 20 } : {}}
        onClick={(e) => { e.stopPropagation(); handleApply(event._id); }}
        disabled={applying === event._id}
      >
        {applying === event._id ? 'Applying...' : (isModal ? 'Apply to this Role' : 'Apply Now')}
      </button>
    );
  };

  const filteredEvents = events.filter(e => {
    if (e.status !== 'Open') return false;
    if (profile && profile.yearOfPassing) {
      return Number(e.batch) === Number(profile.yearOfPassing);
    }
    return true;
  });

  if (loading) return <Loader />;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Company Events</h1>
        <p>Browse and apply to placement opportunities</p>
      </div>

      {message.text && (
        <div className={`auth-error`} style={{
          background: message.type === 'success' ? 'rgba(16,185,129,0.1)' : undefined,
          borderColor: message.type === 'success' ? 'rgba(16,185,129,0.2)' : undefined,
          color: message.type === 'success' ? '#34d399' : undefined,
          marginBottom: 16
        }}>
          {message.text}
        </div>
      )}

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <Briefcase size={48} />
          <h3>No opportunities available</h3>
          <p>
            {profile && profile.yearOfPassing 
              ? `There are currently no active drives scheduled for Batch ${profile.yearOfPassing}.`
              : 'Check back later for new opportunities.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filteredEvents.map(event => (
            <div key={event._id} className="card" style={{ cursor: 'pointer' }}
              onClick={() => setSelectedEvent(event)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{event.company?.name}</h3>
                    <span className={`badge ${getCategoryBadge(event.category)}`}>{event.category}</span>
                    <span className={`badge ${getTypeBadge(event.opportunityType)}`}>{event.opportunityType}</span>
                  </div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 10 }}>
                    <Briefcase size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                    {event.jobRole}
                  </p>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                    {event.placeOfPosting && <span><MapPin size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {event.placeOfPosting}</span>}
                    {event.ctc && <span><IndianRupee size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {event.ctc}</span>}
                    {event.deadline && <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Deadline: {event.deadline}</span>}
                    <span><GraduationCap size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Batch {event.batch}</span>
                  </div>
                </div>
                {renderActionButton(event)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title={selectedEvent?.company?.name}>
        {selectedEvent && (
          <div style={{ fontSize: '0.88rem' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <span className={`badge ${getCategoryBadge(selectedEvent.category)}`}>{selectedEvent.category}</span>
              <span className={`badge ${getTypeBadge(selectedEvent.opportunityType)}`}>{selectedEvent.opportunityType}</span>
            </div>
            {[
              ['Role', selectedEvent.jobRole],
              ['CTC', selectedEvent.ctc],
              ['Stipend', selectedEvent.stipend],
              ['Location', selectedEvent.placeOfPosting],
              ['Deadline', selectedEvent.deadline],
              ['Batch', selectedEvent.batch],
              ['Min CGPA', selectedEvent.minCGPA],
              ['Backlogs Allowed', selectedEvent.backlogs],
              ['Degrees', selectedEvent.allowedDegrees?.join(', ')],
              ['Bond', selectedEvent.companyBond],
              ['Contact', selectedEvent.personOfContact],
              ['Additional Info', selectedEvent.additionalInfo],
            ].map(([label, val]) => val ? (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{val}</span>
              </div>
            ) : null)}
            {renderActionButton(selectedEvent, true)}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompanyEvents;