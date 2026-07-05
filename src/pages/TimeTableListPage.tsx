import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeTableApi } from '../utils/timeTableApi';
import { Edit2, Plus, Clock, AlertCircle, Search, X, Trash2 } from 'lucide-react';

export const TimeTableListPage: React.FC = () => {
  const [timeTables, setTimeTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchTimeTables();
  }, []);

  const fetchTimeTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await timeTableApi.getPaginated(1, 50); // Get first 50 timetables
      if (res.success) {
        setTimeTables(res.data || []);
      } else {
        setError('Failed to fetch timetables');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching timetables');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the timetable "${name}"? (It will be moved to the Recycle Bin)`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await timeTableApi.delete(id);
      if (res.success || res.data?.success) {
        alert("Timetable deleted successfully");
        await fetchTimeTables();
      } else {
        alert("Failed to delete timetable: " + (res.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Error deleting timetable: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredTimeTables = timeTables.filter(t => {
    const query = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(query)) ||
      (t.slug && t.slug.toLowerCase().includes(query)) ||
      (t._id && t._id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Clock size={32} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }} />
            Time Tables
          </h1>
          <p className="page-subtitle">Create and manage academic year schedules, study patterns, and course timetables.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search timetables..." 
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
            onClick={() => navigate('/time-tables/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Add Time Table
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
          <span>Loading timetables...</span>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimeTables.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <Clock size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                      No timetables found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTimeTables.map((t) => (
                    <tr key={t._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.title || 'Unnamed Timetable'}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px' }}>
                          {t.slug || 'N/A'}
                        </span>
                      </td>
                      <td>{t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}</td>
                      <td>{t.updatedAt ? new Date(t.updatedAt).toLocaleString() : 'N/A'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => navigate(`/time-tables/edit/${t._id}`)}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(t._id, t.title)}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--error)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
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

export default TimeTableListPage;
