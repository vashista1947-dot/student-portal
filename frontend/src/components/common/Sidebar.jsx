import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Building2, CalendarCheck, UserPlus,
  Send, Megaphone, Users, ShieldBan, UserCog, Mail,
  Briefcase, User, Heart, Phone, LogOut, Sun, Moon
} from 'lucide-react';
import nsutLogo from '../../assets/nsut-logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isStudent, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const isDualRole = (user?.role === 'admin' || user?.role === 'super_admin') && user?.rollNumber;

  const [viewMode, setViewMode] = useState(() => {
    if (isDualRole) {
      return location.pathname.startsWith('/admin') ? 'admin' : 'student';
    }
    return '';
  });

  useEffect(() => {
    if (isDualRole) {
      setViewMode(location.pathname.startsWith('/admin') ? 'admin' : 'student');
    }
  }, [location.pathname, isDualRole]);

  const toggleViewMode = () => {
    const targetMode = viewMode === 'student' ? 'admin' : 'student';
    setViewMode(targetMode);
    if (targetMode === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: '/events', icon: <Briefcase size={19} />, label: 'Company Events' },
    { to: '/profile', icon: <User size={19} />, label: 'My Profile' },
    { to: '/our-team', icon: <Heart size={19} />, label: 'Our Team' },
    { to: '/contact', icon: <Phone size={19} />, label: 'Contact T&P' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: '/admin/announcements', icon: <Megaphone size={19} />, label: 'Announcements' },
    { to: '/admin/add-company', icon: <Building2 size={19} />, label: 'Add Company' },
    { to: '/admin/events', icon: <CalendarCheck size={19} />, label: 'All Events' },
    { to: '/admin/add-event', icon: <UserPlus size={19} />, label: 'Add Event' },
    { to: '/admin/send-data', icon: <Send size={19} />, label: 'Send Data' },
    { to: '/admin/send-invitation', icon: <Mail size={19} />, label: 'Send Invitation' },
    { to: '/admin/ban-students', icon: <ShieldBan size={19} />, label: 'Ban Students' },
    { to: '/admin/students', icon: <Users size={19} />, label: 'Students' },
  ];

  const superAdminLinks = [
    { to: '/admin/manage-admins', icon: <UserCog size={19} />, label: 'Manage Admins' },
  ];

  const links = isDualRole
    ? (viewMode === 'admin' ? [...adminLinks, ...(isSuperAdmin() ? superAdminLinks : [])] : studentLinks)
    : (isStudent() ? studentLinks : [...adminLinks, ...(isSuperAdmin() ? superAdminLinks : [])]);

  const subtitle = isDualRole
    ? (viewMode === 'student' ? 'Student Portal' : 'Admin Portal')
    : (isStudent() ? 'Student Portal' : 'Admin Portal');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src={nsutLogo} alt="NSUT Logo" className="logo-icon" style={{ objectFit: 'cover', borderRadius: '50%', padding: '0px', background: 'transparent' }} />
          <div className="logo-text">
            <span className="logo-title">NSUT</span>
            <span className="logo-subtitle">{subtitle}</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </div>
        {isDualRole && (
          <button 
            className="sidebar-theme-toggle animate-fade-in" 
            onClick={toggleViewMode}
            style={{ 
              background: 'rgba(99, 102, 241, 0.08)', 
              borderColor: 'var(--accent-primary)', 
              color: 'var(--accent-primary)',
              marginBottom: '8px'
            }}
          >
            <UserCog size={18} />
            <span>{viewMode === 'student' ? 'Switch to Admin View' : 'Switch to Student View'}</span>
          </button>
        )}
        <button className="sidebar-theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
        <button className="sidebar-logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;