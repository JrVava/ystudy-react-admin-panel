import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationApi } from '../utils/locationApi';
import { Edit2, Plus, MapPin, AlertCircle, Search, X, Trash2 } from 'lucide-react';
import { toast } from '../context/ToastContext';

export const LocationListPage: React.FC = () => {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await locationApi.getPaginated(1, 50); // Get first 50 locations
      if (res.success) {
        setLocations(res.data || []);
      } else {
        setError('Failed to fetch locations');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching locations');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the location "${name}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await locationApi.delete(id);
      if (res.success) {
        toast.success("Location deleted successfully");
        fetchLocations();
      } else {
        toast.error("Failed to delete location: " + res.message);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error deleting location: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredLocations = locations.filter(loc => {
    const query = searchQuery.toLowerCase();
    return (
      (loc.title && loc.title.toLowerCase().includes(query)) ||
      (loc._id && loc._id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin size={32} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }} />
            Locations
          </h1>
          <p className="page-subtitle">Manage campus study locations, descriptions, and active status.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search locations..." 
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
            onClick={() => navigate('/courses/locations/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Add Location
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      {loading && locations.length === 0 ? (
        <div className="admin-page-loader">
          <div className="loader-content">
            <img src="/ystudy-logo.png" alt="YStudy Logo" className="loader-logo animate-pulse" />
            <div className="loader-spinner"></div>
          </div>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Location Title</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Updated At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLocations.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <MapPin size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                      No locations found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLocations.map((loc) => (
                    <tr key={loc._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loc.title || 'Unnamed Location'}</td>
                      <td>
                        <span 
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '3px 8px', 
                            borderRadius: '6px', 
                            fontWeight: 600,
                            background: loc.status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                            color: loc.status ? 'var(--success)' : 'var(--error)'
                          }}
                        >
                          {loc.status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{loc.createdAt ? new Date(loc.createdAt).toLocaleString() : 'N/A'}</td>
                      <td>{loc.updatedAt ? new Date(loc.updatedAt).toLocaleString() : 'N/A'}</td>
                      <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                        <button 
                          onClick={() => navigate(`/courses/locations/edit/${loc._id}`)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit2 size={12} />
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(loc._id, loc.title)}
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--error)', borderColor: 'rgba(244, 63, 94, 0.2)' }}
                        >
                          <Trash2 size={12} />
                          Delete
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

export default LocationListPage;
