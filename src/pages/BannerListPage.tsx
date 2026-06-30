import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi } from '../utils/bannerApi';
import { Edit2, Plus, LayoutTemplate, AlertCircle, Search, X } from 'lucide-react';

export const BannerListPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bannerApi.getPaginated(1, 50); // Get first 50 banners
      if (res.success) {
        setBanners(res.data);
      } else {
        setError('Failed to fetch banners');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering
  const filteredBanners = banners.filter(banner => {
    const query = searchQuery.toLowerCase();
    return (
      (banner.internalName && banner.internalName.toLowerCase().includes(query)) ||
      (banner.leftContent?.title && banner.leftContent.title.toLowerCase().includes(query)) ||
      (banner.rightCard?.layoutType && banner.rightCard.layoutType.toLowerCase().includes(query))
    );
  });

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Banner Modules</h1>
          <p className="page-subtitle">Design and edit interactive promotions or headlines on the website.</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search banners..." 
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
            onClick={() => navigate('/banners/new')}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: "40px" }}
          >
            <Plus size={18} />
            Create Banner
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
          <span>Loading banners...</span>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Banner Name</th>
                  <th>Main Headline</th>
                  <th>Layout Style</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBanners.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <LayoutTemplate size={36} style={{ margin: "0 auto 0.5rem", opacity: 0.2, display: "block" }} />
                      No banners found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBanners.map((banner) => (
                    <tr key={banner._id}>
                      <td style={{ fontWeight: 600 }}>{banner.internalName || 'Unnamed Banner'}</td>
                      <td>{banner.leftContent?.title || 'No Headline'}</td>
                      <td>
                        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {banner.rightCard?.layoutType || 'default'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate(`/banners/edit/${banner._id}`)}
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

export default BannerListPage;
