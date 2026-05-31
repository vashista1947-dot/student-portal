import { useState } from 'react';
import { searchStudents, banStudent, unbanStudent } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import Loader from '../../components/common/Loader';

const BanStudents = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const { data } = await searchStudents(searchQuery);
      setStudents(data);
    } catch {
      addToast('Search query yielded an issue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (studentId, isBanned) => {
    const promptMsg = isBanned 
      ? "Allow student to resume placement processes?" 
      : "Revoke student from applying to active placement processes?";
    if (!window.confirm(promptMsg)) return;

    try {
      if (isBanned) {
        await unbanStudent(studentId);
        addToast('Student unbanned successfully', 'success');
      } else {
        await banStudent(studentId);
        addToast('Student profile banned from placement drive system', 'warning');
      }
      
      // Update local state list
      setStudents(students.map(s => {
        if (s._id === studentId) {
          return { ...s, isBanned: !isBanned };
        }
        return s;
      }));
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to modify student permissions';
      addToast(errMsg, 'error');
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Revoke Student access</h1>
        <p>Suspend student application eligibility or reactivate profiles</p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <input type="text" className="form-input" style={{ paddingLeft: '40px' }} placeholder="Search student by Name, Roll Number, or Stream Branch..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} required />
            <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <ShieldAlert size={36} color="var(--text-tertiary)" style={{ opacity: 0.3, marginBottom: '8px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Enter a search parameter to list student files.</p>
        </div>
      ) : (
        <div className="card">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Search Results</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch</th>
                  <th>CGPA</th>
                  <th>Current status</th>
                  <th>Action Control</th>
                </tr>
              </thead>
              <tbody>
                {students.map(stud => (
                  <tr key={stud._id}>
                    <td style={{ fontWeight: 600 }}>{stud.user?.name}</td>
                    <td>{stud.rollNumber}</td>
                    <td>{stud.branch}</td>
                    <td style={{ fontWeight: 700 }}>{stud.cgpa}</td>
                    <td>
                      <span className={`badge badge-${stud.isBanned ? 'banned' : 'active'}`}>
                        {stud.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      {stud.isBanned ? (
                        <button className="btn btn-success btn-sm" style={{ display: 'inline-flex', gap: '4px' }} onClick={() => handleBanToggle(stud._id, stud.isBanned)}>
                          <ShieldCheck size={12} /> Reactivate
                        </button>
                      ) : (
                        <button className="btn btn-danger btn-sm" style={{ display: 'inline-flex', gap: '4px' }} onClick={() => handleBanToggle(stud._id, stud.isBanned)}>
                          <ShieldAlert size={12} /> Ban Student
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BanStudents;