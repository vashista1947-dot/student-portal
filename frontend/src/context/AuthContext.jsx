import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const loginRole = localStorage.getItem('loginRole');
          let parsedUser = JSON.parse(savedUser);
          if (loginRole === 'student' && parsedUser.role !== 'student') {
            parsedUser = { ...parsedUser, role: 'student' };
          }
          setUser(parsedUser);

          // Optionally verify token freshness against server
          const { data } = await api.get('/auth/me');
          let updatedUser = data;
          if (loginRole === 'student' && updatedUser.role !== 'student') {
            updatedUser = { ...updatedUser, role: 'student' };
          }
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = (userData, token, loginRole) => {
    localStorage.setItem('token', token);
    localStorage.setItem('loginRole', loginRole || userData.role);
    let activeUser = userData;
    if (loginRole === 'student' && activeUser.role !== 'student') {
      activeUser = { ...activeUser, role: 'student' };
    }
    localStorage.setItem('user', JSON.stringify(activeUser));
    setUser(activeUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginRole');
    setUser(null);
  };

  const isStudent = () => user?.role === 'student' || (user?.role === 'admin' && user?.rollNumber) || (user?.role === 'super_admin' && user?.rollNumber);
  const isAdmin = () => user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = () => user?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isStudent, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};