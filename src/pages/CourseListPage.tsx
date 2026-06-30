import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseApi } from '../utils/courseApi';
import { Edit2, Plus, GraduationCap, AlertCircle, Search, X } from 'lucide-react';

export const CourseListPage: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseApi.getPaginated(1, 50); // Get first 50 courses
      if (res.success) {
        setCourses(res.data || []);
      } else {
        setError('Failed to fetch courses');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching courses');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredCourses = courses.filter(course => {
    const query = searchQuery.toLowerCase();
    return (
      (course.title && course.title.toLowerCase().includes(query)) ||
      (course._id && course._id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <GraduationCap size={32} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }} />
            Courses
          </h1>
          <p className="page-subtitle">Manage curriculum courses, entry requirements, salary outcomes, and relations.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search courses..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", height: "40px", fontSize: "0.85rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={() => navigate('/courses/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Add Course
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <span>Loading courses...</span>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course Title</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <GraduationCap size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                      No courses found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{course.title || 'Unnamed Course'}</td>
                      <td>{course.createdAt ? new Date(course.createdAt).toLocaleString() : 'N/A'}</td>
                      <td>{course.updatedAt ? new Date(course.updatedAt).toLocaleString() : 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/courses/edit/${course._id}`)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseListPage;
