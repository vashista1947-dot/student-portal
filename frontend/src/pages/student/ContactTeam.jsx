import { Mail, Phone, MapPin } from 'lucide-react';
import mpsImg from '../../assets/mpsbhatia.png';
import rajeshImg from '../../assets/rajeshrawat.jpg';
import vasistaImg from '../../assets/vasista.jpg';

const team = [
  { name: 'Prof. MPS Bhatia', role: 'Training & Placement Officer', email: 'tnp@nsut.ac.in', image: mpsImg },
  { name: 'Mr. Rajesh Rawat', role: 'Assistant Coordinator', email: 'coordinator.tnp@nsut.ac.in', image: rajeshImg },
  { name: 'Upparapally Vasista', role: 'Student Coordinator', email: 'student.tnp@nsut.ac.in', image: vasistaImg },
];

const ContactTeam = () => {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Contact T&P Cell</h1>
        <p>Reach out to the Training & Placement team</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <MapPin size={20} color="var(--accent-primary)" />
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Training & Placement Cell</h3>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
              Netaji Subhas University of Technology, Dwarka, New Delhi - 110078
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {team.map((member, i) => (
          <div key={i} className="card" style={{ textAlign: 'center', padding: '28px 20px' }}>
            {member.image ? (
              <div style={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                border: '3px solid var(--accent-primary)',
                margin: '0 auto 14px',
                boxShadow: '0 6px 20px rgba(99,102,241,0.18)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src={member.image} 
                  alt={member.name} 
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover',
                    transform: member.name.includes('Bhatia') ? 'scale(1.15)' :
                               member.name.includes('Rawat') ? 'scale(1.4)' : 'scale(1.3)',
                    objectPosition: member.name.includes('Bhatia') ? 'center 20%' :
                                    member.name.includes('Rawat') ? 'center 25%' : 'center 25%'
                  }} 
                />
              </div>
            ) : (
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: `linear-gradient(135deg, ${['#6366f1', '#8b5cf6', '#10b981'][i]}, ${['#8b5cf6', '#a78bfa', '#059669'][i]})`,
                margin: '0 auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', fontWeight: 700, color: 'white'
              }}>
                {member.name.charAt(0)}
              </div>
            )}
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>{member.name}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 12 }}>{member.role}</p>
            <a href={`mailto:${member.email}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.78rem' }}>
              <Mail size={14} /> {member.email}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactTeam;