import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Proxied automatically by Vite to port 5000
});

// Interceptor to automatically attach JWT token on all outgoing calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth Endpoints
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const verifyOtp = (payload) => api.post('/auth/verify-otp', payload);
export const registerStudent = (userData) => api.post('/auth/register', userData);

// Student Profile & Applications
export const getProfile = () => api.get('/student/profile');
export const createProfile = (profileData) => api.post('/student/profile', profileData);
export const updateProfile = (profileData) => api.put('/student/profile', profileData);
export const applyToEvent = (eventId) => api.post(`/student/events/${eventId}/apply`);
export const getMyApplications = () => api.get('/student/applications');

// Event Management
export const getEvents = () => api.get('/events');
export const getEvent = (id) => api.get(`/events/${id}`);
export const createEvent = (eventData) => api.post('/events', eventData);
export const updateEvent = (id, eventData) => api.put(`/events/${id}`, eventData);
export const deleteEvent = (id) => api.delete(`/events/${id}`);
export const getRegistrations = (id) => api.get(`/events/${id}/registrations`);
export const getEmailPreview = (id) => api.get(`/events/${id}/email-preview`);

// Announcement Board
export const getAnnouncements = () => api.get('/announcements');
export const createAnnouncement = (annData) => api.post('/announcements', annData);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// Company Directory
export const getCompanies = () => api.get('/companies');
export const addCompany = (companyData) => api.post('/companies', companyData);
export const updateCompany = (id, companyData) => api.put(`/companies/${id}`, companyData);
export const deleteCompany = (id) => api.delete(`/companies/${id}`);

// Administrative Actions
export const createAdmin = (adminData) => api.post('/admin/create-admin', adminData);
export const getAdmins = () => api.get('/admin/admins');
export const deleteAdmin = (id) => api.delete(`/admin/admins/${id}`);
export const searchStudents = (query) => api.get(`/admin/students/search?q=${query}`);
export const banStudent = (id) => api.put(`/admin/students/${id}/ban`);
export const unbanStudent = (id) => api.put(`/admin/students/${id}/unban`);

// Dispatch Module (Bulk Emails)
export const sendBulkEmail = (dispatchData) => api.post('/dispatch/send', dispatchData);
export const sendInvitation = (inviteData) => api.post('/dispatch/send-invitation', inviteData);

export default api;