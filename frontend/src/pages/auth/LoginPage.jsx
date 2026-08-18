import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser } from '../../services/api';
import { LogIn, Sun, Moon } from 'lucide-react';
import nsutLogo from '../../assets/nsut-logo.png';
import './AuthPages.css';

const LoginPage = () => {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectMessage = location.state?.message || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await loginUser({ email, password });

      // Verify role matches
      const isDualRole = (data.role === 'admin' || data.role === 'super_admin') && data.rollNumber;

      if (role === 'student' && data.role !== 'student' && !isDualRole) {
        setError('This is not a student account');
        setLoading(false);
        return;
      }
      if (role === 'admin' && !['admin', 'super_admin'].includes(data.role)) {
        setError('This is not an admin account');
        setLoading(false);
        return;
      }

      login(data, data.token, role);

      if (role === 'student') {
        navigate('/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button 
        onClick={toggleTheme} 
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s ease',
          zIndex: 10
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
        }}
        title="Toggle Theme"
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <div className="auth-card">
        <div className="auth-header">
          <img src={nsutLogo} alt="NSUT Logo" className="auth-logo" style={{ objectFit: 'cover', borderRadius: '50%', padding: '0px', background: 'transparent', border: 'none' }} />
          <h1>Welcome Back</h1>
          <p>NSUT Training & Placement Portal</p>
        </div>

        <div className="auth-role-tabs">
          <button
            className={`auth-role-tab ${role === 'student' ? 'active' : ''}`}
            onClick={() => { setRole('student'); setError(''); }}
          >
            Student
          </button>
          <button
            className={`auth-role-tab ${role === 'admin' ? 'active' : ''}`}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        {redirectMessage && (
          <div className="auth-success" style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '0.83rem',
            color: '#34d399',
            marginBottom: '12px',
            animation: 'fadeIn 0.3s ease',
            textAlign: 'center'
          }}>
            {redirectMessage}
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {role === 'student' ? 'Institutional Email' : 'Admin Email'}
            </label>
            <input
              type="email"
              className="form-input"
              placeholder={role === 'student' ? 'yourname@nsut.ac.in' : 'admin@nsut.ac.in'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
                />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <LogIn size={18} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {role === 'student' && (
          <div className="auth-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;