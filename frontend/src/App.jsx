import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastProvider } from './components/common/Toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Sidebar from './components/common/Sidebar';
import Loader from './components/common/Loader';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProfileSetup from './pages/student/ProfileSetup';
import CompanyEvents from './pages/student/CompanyEvents';
import ProfileView from './pages/student/ProfileView';
import OurTeam from './pages/student/OurTeam';
import ContactTeam from './pages/student/ContactTeam';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddCompany from './pages/admin/AddCompany';
import AllEvents from './pages/admin/AllEvents';
import AddEvent from './pages/admin/AddEvent';
import SendData from './pages/admin/SendData';
import SendInvitation from './pages/admin/SendInvitation';
import BanStudents from './pages/admin/BanStudents';
import Students from './pages/admin/Students';
import Announcements from './pages/admin/Announcements';
import ManageAdmins from './pages/admin/ManageAdmins';

// Layout component to wrap authenticated pages with a Sidebar
const DashboardLayout = ({ children }) => {
  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <main className="dashboard-main" style={{ flex: 1, padding: '30px', marginLeft: 'var(--sidebar-width)', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

function App() {
  const { user, loading } = useAuth();

  // Show a premium global loader while authentication state is resolving
  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <ToastProvider>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route 
          path="/login" 
          element={
            !user ? (
              <LoginPage />
            ) : user.role === 'student' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            !user ? (
              <RegisterPage />
            ) : user.role === 'student' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          } 
        />

        {/* --- STUDENT ROUTES --- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <StudentDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-setup"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <ProfileSetup />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <ProfileView />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <CompanyEvents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/our-team"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <OurTeam />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <DashboardLayout>
                <ContactTeam />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* --- ADMIN & SUPER ADMIN ROUTES --- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AdminDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-company"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AddCompany />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AllEvents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/add-event"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <AddEvent />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-data"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <SendData />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-invitation"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <SendInvitation />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ban-students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <BanStudents />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <Students />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
              <DashboardLayout>
                <Announcements />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        
        {/* --- SUPER ADMIN ONLY ROUTES --- */}
        <Route
          path="/admin/manage-admins"
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
              <DashboardLayout>
                <ManageAdmins />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* --- DEFAULT REDIRECTS --- */}
        <Route
          path="/"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role === 'student' ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/admin/dashboard" replace />
            )
          }
        />
        
        {/* Fallback wildcard to prevent broken pages */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;