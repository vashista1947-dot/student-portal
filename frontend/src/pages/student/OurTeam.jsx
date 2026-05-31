import { Heart, GitBranch, UserCheck, Mail } from 'lucide-react';
import vasistaImg from '../../assets/vasista.jpg';

const OurTeam = () => {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Our Team</h1>
        <p>The man behind the portal</p>
      </div>

      {/* Developer Section */}
      <div className="card" style={{ textAlign: 'center', padding: '40px 24px', marginBottom: 24 }}>
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '3px solid var(--accent-primary)',
          margin: '0 auto 16px',
          boxShadow: '0 0 30px rgba(99,102,241,0.3)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img 
            src={vasistaImg} 
            alt="Upparapally Vasista" 
            style={{
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scale(1.3)',
              objectPosition: 'center 25%'
            }} 
          />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>Upparapally Vasista</h2>
        <p style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>
          Developer & Creator
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
          Designed and developed the NSUT T&P Placement Portal to streamline campus hiring for students and administrators.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
          <a href="mailto:vashista1947@gmail.com" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Mail size={15} /> Contact
          </a>
          <a href="https://github.com/vashista1947-dot" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <GitBranch size={15} /> GitHub
          </a>
          <a href="https://www.linkedin.com/in/vasista-upparapally-433a6b303/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <UserCheck size={15} /> LinkedIn
          </a>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.82rem', marginTop: 20 }}>
        <p>Made with <Heart size={13} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--accent-danger)' }} /> for NSUT</p>
      </div>
    </div>
  );
};

export default OurTeam;