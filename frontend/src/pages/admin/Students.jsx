import { useState, useEffect } from 'react';
import { searchStudents } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { Search, Users, ArrowUpRight } from 'lucide-react';
import Loader from '../../components/common/Loader';

const Students = () => {
  const { addToast } = useToast();
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [passingYears, setPassingYears] = useState([]);

  useEffect(() => {
    fetchInitialStudents();
  }, []);

  const fetchInitialStudents = async () => {
    try {
      const { data } = await searchStudents('');
      setStudents(data);
      
      // Extract unique yearOfPassing from the loaded students and sort descending
      const years = [...new Set(data.map(stud => stud.yearOfPassing))]
        .filter(y => y !== undefined && y !== null)
        .sort((a, b) => b - a);
      setPassingYears(years);
    } catch {
      addToast('Could not fetch student database profiles', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await searchStudents(searchQuery);
      setStudents(data);
      
      // Also update passingYears filter list if new unique years appear
      const years = [...new Set(data.map(stud => stud.yearOfPassing))]
        .filter(y => y !== undefined && y !== null)
        .sort((a, b) => b - a);
      setPassingYears(prevYears => {
        const merged = [...new Set([...prevYears, ...years])].sort((a, b) => b - a);
        return merged;
      });
    } catch {
      addToast('Dynamic search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter students by selected passing year
  const filteredStudents = students.filter(stud => String(stud.yearOfPassing) === String(selectedYear));

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Student Database</h1>
        <p>Review comprehensive directories, qualifications, and active student files</p>
      </div>

      {/* Dropdown Passing Year filter and Search bar Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Passing Year selector card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '16px 20px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', margin: 0 }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              Select Passing Year
            </label>
            <select 
              className="form-select" 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              style={{ background: 'var(--bg-input)', fontSize: '0.86rem', padding: '8px 12px' }}
            >
              <option value="">-- Select Passing Year --</option>
              {passingYears.map(y => (
                <option key={y} value={y}>{y} Batch</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search profiles card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', margin: 0 }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '40px' }} 
                placeholder="Search by Name, Roll, Branch, or email..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
              />
              <Search size={18} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Search Profiles</button>
          </form>
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : students.length === 0 ? (
        <div className="card text-center" style={{ padding: '60px' }}>
          <Users size={36} color="var(--text-tertiary)" style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3>No Student Files</h3>
          <p>No student files registered in database.</p>
        </div>
      ) : !selectedYear ? (
        /* Empty state telling admin to select a year */
        <div className="card text-center animate-fade-in" style={{ padding: '60px', background: 'var(--bg-card)', border: '1px dashed var(--border-color)' }}>
          <Users size={48} color="var(--accent-primary)" style={{ opacity: 0.8, marginBottom: '16px', filter: 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.2))' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Select a Passing Year</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto', fontSize: '0.9rem', lineHeight: 1.5 }}>
            Please select a target graduation / passing year from the dropdown above to display the registered student directory.
          </p>
        </div>
      ) : filteredStudents.length === 0 ? (
        /* No students found for this specific year */
        <div className="card text-center animate-fade-in" style={{ padding: '60px', border: '1px dashed var(--border-color)' }}>
          <Users size={36} color="var(--text-tertiary)" style={{ opacity: 0.3, marginBottom: '8px' }} />
          <h3>No Student Profiles Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>No students graduating in {selectedYear} match the query or are registered in the database.</p>
        </div>
      ) : (
        /* Student Directory table */
        <div className="card animate-slide-down">
          <h2 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Student Directory - {selectedYear} Batch ({filteredStudents.length})</h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Branch / Stream</th>
                  <th>CGPA</th>
                  <th>Phone Number</th>
                  <th>Email ID</th>
                  <th>Resume Link</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(stud => (
                  <tr key={stud._id}>
                    <td style={{ fontWeight: 600 }}>{stud.user?.name}</td>
                    <td>{stud.rollNumber}</td>
                    <td>{stud.branch}</td>
                    <td style={{ fontWeight: 700, color: 'var(--accent-success)' }}>{stud.cgpa}</td>
                    <td>{stud.phone || 'N/A'}</td>
                    <td>{stud.user?.email}</td>
                    <td>
                      {stud.resumeDriveLink ? (
                        <a href={stud.resumeDriveLink} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          View CV <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <span style={{ color: 'var(--text-tertiary)' }}>No File</span>
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

export default Students;