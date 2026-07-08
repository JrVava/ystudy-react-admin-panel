import React, { useEffect, useState } from 'react';
import { recycleBinApi } from '../utils/recycleBinApi';
import { Trash2, RotateCcw, AlertTriangle, Info, Calendar, FileText, LayoutTemplate, HelpCircle, MapPin, Layers, Image, FolderOpen, RefreshCw, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '../context/ToastContext';

const collectionsList = [
  { value: 'courses', label: 'Courses', icon: FileText },
  { value: 'time_tables', label: 'Time Tables', icon: Calendar },
  { value: 'banners', label: 'Banners', icon: LayoutTemplate },
  { value: 'faqs', label: 'FAQs', icon: HelpCircle },
  { value: 'locations', label: 'Locations', icon: MapPin },
  { value: 'navigations', label: 'Navigations', icon: Layers },
  { value: 'media', label: 'Media Assets', icon: Image },
  { value: 'folders', label: 'Media Folders', icon: FolderOpen }
];

export const RecycleBinPage: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState('courses');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Sorting, and Pagination States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
    fetchDeletedItems();
  }, [selectedCollection]);

  const fetchDeletedItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await recycleBinApi.list(selectedCollection, 1, 100);
      if (res.success) {
        setItems(res.data || []);
      } else {
        setError('Failed to load deleted records.');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Error loading deleted records.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to restore "${name}" back to active status?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await recycleBinApi.restore(id, selectedCollection);
      if (res.success || res.data?.success) {
        toast.success(`"${name}" has been successfully restored.`);
        fetchDeletedItems();
      } else {
        toast.error("Failed to restore: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error restoring record: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleHardDelete = async (id: string, name: string) => {
    const confirm1 = window.confirm(`WARNING: Are you sure you want to PERMANENTLY delete "${name}"?\nThis cannot be undone!`);
    if (!confirm1) return;

    const confirm2 = window.prompt(`To confirm permanent deletion of "${name}", type "DELETE" below:`);
    if (confirm2 !== "DELETE") {
      toast.warning("Deletion cancelled. Confirmation text did not match.");
      return;
    }

    try {
      setLoading(true);
      const res = await recycleBinApi.delete(id, selectedCollection);
      if (res.success || res.data?.success) {
        toast.success(`"${name}" was permanently deleted.`);
        fetchDeletedItems();
      } else {
        toast.error("Failed to delete record: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error permanently deleting record: " + (e.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (item: any) => {
    return item.title || item.internalName || item.name || item.filename || item.slug || item.fileName || item._id;
  };

  const getMediaPreviewUrl = (filePath: string) => {
    if (!filePath) return '';
    if (filePath.startsWith('http') || filePath.startsWith('blob:')) {
      return filePath;
    }
    const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";
    const hostUrl = apiUrl.replace(/\/api$/, "");
    const cleanPath = filePath.replace(/^\/+/, "");
    if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('media/')) {
      return `${hostUrl}/${cleanPath}`;
    }
    return `${hostUrl}/media/uploads/${cleanPath}`;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  // Client Side Filtering & Sorting
  const filteredItems = items.filter(item => {
    const name = (getItemName(item) || "").toString().toLowerCase();
    const id = (item._id || "").toString().toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const timeA = (a.updatedAt || a.createdAt) ? new Date(a.updatedAt || a.createdAt).getTime() : 0;
    const timeB = (b.updatedAt || b.createdAt) ? new Date(b.updatedAt || b.createdAt).getTime() : 0;
    return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
  });

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / itemsPerPage));
  const paginatedItems = sortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const CurrentIcon = collectionsList.find(c => c.value === selectedCollection)?.icon || FileText;

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trash2 size={32} style={{ color: 'var(--error)', filter: 'drop-shadow(0 0 8px rgba(244,63,94,0.4))' }} />
            Recycle Bin
          </h1>
          <p className="page-subtitle">Recover soft-deleted items or delete them permanently from the system databases.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search deleted records..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="form-input"
              style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", fontSize: "0.85rem" }}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setCurrentPage(1); }}
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            onClick={fetchDeletedItems}
            className="btn-secondary"
            style={{ height: '40px', padding: '0 12px', display: 'grid', placeItems: 'center' }}
            title="Refresh list"
            disabled={loading}
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>

          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            className="form-select"
            style={{ minWidth: '180px', fontWeight: 600 }}
          >
            {collectionsList.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertTriangle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      {selectedCollection === 'media' && (
        <div style={{ background: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.2)", color: "#f97316", padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem" }}>
          <Info size={16} />
          <span>Hard-deleting media records will also physically remove uploaded files from storage!</span>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <span>Fetching deleted records...</span>
        </div>
      ) : (
        <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Resource Identity / Name</th>
                  <th
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                    onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    title="Click to sort by date"
                  >
                    Last Modified <span style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{sortOrder === 'desc' ? '↓' : '↑'}</span>
                  </th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <CurrentIcon size={40} style={{ margin: "0 auto 0.75rem", opacity: 0.2, display: "block" }} />
                      No deleted records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const name = getItemName(item);
                    return (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {selectedCollection === 'media' && item.filePath ? (
                              <img
                                src={getMediaPreviewUrl(item.filePath)}
                                alt={name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--panel-border)', flexShrink: 0 }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=100';
                                }}
                              />
                            ) : (
                              <CurrentIcon size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                            )}
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name || 'Unnamed Record'}</span>
                          </div>
                        </td>

                        <td>
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleString()
                            : (item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : 'N/A')}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => handleRestore(item._id, name)}
                              className="btn-secondary"
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: '#10b981',
                                borderColor: 'rgba(16, 185, 129, 0.2)'
                              }}
                            >
                              <RotateCcw size={12} />
                              Restore
                            </button>
                            <button
                              onClick={() => handleHardDelete(item._id, name)}
                              className="btn-secondary"
                              style={{
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                color: 'var(--error)',
                                borderColor: 'rgba(244, 63, 94, 0.2)'
                              }}
                            >
                              <Trash2 size={12} />
                              Delete Forever
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {sortedItems.length > itemsPerPage && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid var(--panel-border)', background: 'rgba(10, 14, 26, 0.3)', flexWrap: 'wrap', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedItems.length)} of {sortedItems.length} records
              </span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', minWidth: '40px', height: '36px', opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 600, padding: '0 0.5rem' }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-secondary"
                  style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', minWidth: '40px', height: '36px', opacity: currentPage === totalPages ? 0.4 : 1 }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecycleBinPage;
