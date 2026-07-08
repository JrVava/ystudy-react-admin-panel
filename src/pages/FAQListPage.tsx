import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { faqApi } from '../utils/faqApi';
import { Edit2, Plus, HelpCircle, AlertCircle, Search, X, Trash2 } from 'lucide-react';
import { toast } from '../context/ToastContext';

interface GroupedFAQ {
  slug: string;
  count: number;
  updatedAt: string;
}

export const FAQListPage: React.FC = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await faqApi.getPaginated(1, 200); // Fetch up to 200 FAQs for grouping
      if (res.success) {
        setFaqs(res.data || []);
      } else {
        setError('Failed to fetch FAQs');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!window.confirm(`Are you sure you want to delete all FAQs under the slug "${slug}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await faqApi.delete(slug);
      if (res.success || res.message) {
        toast.success("FAQs deleted successfully!");
        fetchFAQs();
      } else {
        toast.error("Failed to delete FAQs: " + (res.message || "Unknown error"));
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error deleting FAQs: " + (err.message || "Check console"));
      setLoading(false);
    }
  };

  // Group items by slug on the client side
  const groupedFAQs: Record<string, GroupedFAQ> = faqs.reduce((acc: Record<string, GroupedFAQ>, item: any) => {
    if (!item.slug) return acc;
    if (!acc[item.slug]) {
      acc[item.slug] = {
        slug: item.slug,
        count: 0,
        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
      };
    }
    acc[item.slug].count += 1;
    
    // Track most recent date
    const itemDate = new Date(item.updatedAt || item.createdAt || 0);
    const accDate = new Date(acc[item.slug].updatedAt);
    if (itemDate > accDate) {
      acc[item.slug].updatedAt = item.updatedAt || item.createdAt;
    }
    return acc;
  }, {});

  const groupedList = Object.values(groupedFAQs);

  // Client-side filtering by slug name
  const filteredGroups = groupedList.filter(group => {
    const query = searchQuery.toLowerCase().trim();
    return group.slug.toLowerCase().includes(query);
  });

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'N/A';
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">FAQs (Frequently Asked Questions)</h1>
          <p className="page-subtitle">Manage dynamic question and answer blocks grouped by slugs.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search by slug..." 
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
            onClick={() => navigate('/faqs/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Create FAQ Group
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
          <span>Loading FAQs...</span>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>FAQ Group Slug</th>
                  <th>Questions Count</th>
                  <th>Last Updated</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <HelpCircle size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                      No FAQ groups found. Click "Create FAQ Group" to add one.
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => (
                    <tr key={group.slug}>
                      <td style={{ fontWeight: 600 }}>{group.slug}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', padding: '4px 10px', borderRadius: '12px', fontWeight: 600 }}>
                          {group.count} Q&As
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(group.updatedAt)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => navigate(`/faqs/edit/${group.slug}`)}
                            className="btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            <Edit2 size={12} />
                            Edit Group
                          </button>
                          <button 
                            onClick={() => handleDelete(group.slug)}
                            className="btn-secondary hover:text-error"
                            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'rgba(239, 68, 68, 0.8)', border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)' }}
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

export default FAQListPage;
