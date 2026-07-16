import React, { useEffect, useState } from 'react';
import { recycleBinApi } from '../utils/recycleBinApi';
import { Trash2, RotateCcw, AlertTriangle, Info, Calendar, FileText, LayoutTemplate, HelpCircle, MapPin, Layers, Image as ImageIcon, FolderOpen, RefreshCw, Search, X } from 'lucide-react';
import { toast } from '../context/ToastContext';
import config from '../config';
import { Table } from '../components/Table';

const collectionsList = [
  { value: 'courses', label: 'Courses', icon: FileText },
  { value: 'time_tables', label: 'Time Tables', icon: Calendar },
  { value: 'banners', label: 'Banners', icon: LayoutTemplate },
  { value: 'faqs', label: 'FAQs', icon: HelpCircle },
  { value: 'locations', label: 'Locations', icon: MapPin },
  { value: 'navigations', label: 'Navigations', icon: Layers },
  { value: 'media', label: 'Media Assets', icon: ImageIcon },
  { value: 'folders', label: 'Media Folders', icon: FolderOpen }
];

export const RecycleBinPage: React.FC = () => {
  const [selectedCollection, setSelectedCollection] = useState('courses');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
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
    const apiUrl = config.apiUrl;
    const hostUrl = apiUrl.replace(/\/api$/, "");
    const cleanPath = filePath.replace(/^\/+/, "");
    if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('media/')) {
      return `${hostUrl}/${cleanPath}`;
    }
    return `${hostUrl}/media/uploads/${cleanPath}`;
  };

  // Client Side Filtering & Sorting
  const filteredItems = items.filter(item => {
    const name = (getItemName(item) || "").toString().toLowerCase();
    const id = (item._id || "").toString().toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || id.includes(query);
  });

  const CurrentIcon = collectionsList.find(c => c.value === selectedCollection)?.icon || FileText;

  const columns = [
    {
      name: 'Resource Identity / Name',
      selector: (row: any) => getItemName(row) || '',
      sortable: true,
      style: { fontWeight: 600 },
      cell: (row: any) => {
        const name = getItemName(row);
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            {selectedCollection === 'media' && row.filePath ? (
              <img
                src={getMediaPreviewUrl(row.filePath)}
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
        );
      }
    },
    {
      name: 'Last Modified',
      selector: (row: any) => row.updatedAt || row.createdAt || '',
      sortable: true,
      cell: (row: any) => {
        const dateStr = row.updatedAt || row.createdAt;
        return dateStr ? new Date(dateStr).toLocaleString() : 'N/A';
      }
    },
    {
      name: 'Actions',
      right: true,
      cell: (row: any) => {
        const name = getItemName(row);
        return (
          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
            <button
              onClick={() => handleRestore(row._id, name)}
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
              onClick={() => handleHardDelete(row._id, name)}
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
        );
      }
    }
  ];

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", fontSize: "0.85rem" }}
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

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={filteredItems}
          loading={loading}
          serverSide={false}
          noDataText="No deleted records found matching criteria."
        />
      </div>
    </div>
  );
};

export default RecycleBinPage;
