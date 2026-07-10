import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lookupApi } from '../utils/lookupApi';
import { Edit2, Plus, AlertCircle, Search, X, Trash2, BookOpen, Award, Layers, Clock, Coins } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface LookupListPageProps {
  type: 'subjects' | 'qualifications' | 'modes' | 'durations' | 'fundings';
}

const configByType = {
  subjects: { label: 'Subjects', icon: BookOpen, addLabel: 'Subject', path: '/courses/subjects' },
  qualifications: { label: 'Qualifications', icon: Award, addLabel: 'Qualification', path: '/courses/qualifications' },
  modes: { label: 'Modes of Study', icon: Layers, addLabel: 'Study Mode', path: '/courses/modes' },
  durations: { label: 'Durations', icon: Clock, addLabel: 'Duration', path: '/courses/durations' },
  fundings: { label: 'Fundings', icon: Coins, addLabel: 'Funding Option', path: '/courses/fundings' }
};

export const LookupListPage: React.FC<LookupListPageProps> = ({ type }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const config = configByType[type];
  const Icon = config.icon;
  const api = lookupApi(type);

  useEffect(() => {
    fetchItems();
  }, [type]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getPaginated(1, 100);
      if (res.success) {
        setItems(res.data || []);
      } else {
        setError(`Failed to fetch ${config.label.toLowerCase()}`);
      }
    } catch (err: any) {
      setError(err.message || `Error fetching ${config.label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await api.delete(id);
      if (res.success) {
        toast.success(`Deleted successfully`);
        fetchItems();
      } else {
        toast.error("Failed to delete: " + res.message);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error deleting item: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item._id && item._id.toLowerCase().includes(query))
    );
  });

  if (loading && items.length === 0) {
    return (
      <div className="admin-page-loader">
        <div className="loader-content">
          <img src="/ystudy-logo.png" alt="YStudy Logo" className="loader-logo animate-pulse" />
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Icon size={32} style={{ color: 'var(--primary)', filter: 'drop-shadow(0 0 8px var(--primary-glow))' }} />
            {config.label}
          </h1>
          <p className="page-subtitle">Configure list items displayed inside Course filter selections.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder={`Search ${config.label.toLowerCase()}...`}
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
            onClick={() => navigate(`${config.path}/new`)}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Add {config.addLabel}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Icon size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                    No records found matching search criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title || 'Unnamed Item'}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          background: item.status !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                          color: item.status !== false ? 'var(--success)' : 'var(--error)'
                        }}
                      >
                        {item.status !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}</td>
                    <td>{item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'N/A'}</td>
                    <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', padding: '1rem 1.25rem' }}>
                      <button
                        onClick={() => navigate(`${config.path}/edit/${item._id}`)}
                        className="btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Edit2 size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
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
    </div>
  );
};
export default LookupListPage;
