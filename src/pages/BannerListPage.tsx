import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bannerApi } from '../utils/bannerApi';
import { Edit2, Plus, AlertCircle, Search, X } from 'lucide-react';
import { Table } from '../components/Table';

export const BannerListPage: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch banners on changes
  useEffect(() => {
    fetchBanners(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery]);

  const fetchBanners = async (page: number, limit: number, field: string = 'createdAt', sort: string = 'desc', search: string = '') => {
    try {
      setLoading(true);
      setError(null);
      const res = await bannerApi.getPaginated(page, limit, field, sort, search);
      if (res.success) {
        setBanners(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError('Failed to fetch banners');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSort = (column: any, sortDirection: 'asc' | 'desc') => {
    setSortField(column.sortField || 'createdAt');
    setSortOrder(sortDirection);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: 'Banner Name',
      selector: (row: any) => row.internalName || 'Unnamed Banner',
      sortable: true,
      sortField: 'internalName',
      style: { fontWeight: 600 }
    },
    {
      name: 'Main Headline',
      selector: (row: any) => row.leftContent?.title || 'No Headline',
      sortable: true,
      sortField: 'leftContent.title'
    },
    {
      name: 'Layout Style',
      selector: (row: any) => row.rightCard?.layoutType,
      sortable: true,
      sortField: 'rightCard.layoutType',
      cell: (row: any) => (
        <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.04)', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {row.rightCard?.layoutType || 'default'}
        </span>
      )
    },
    {
      name: 'Actions',
      right: true,
      cell: (row: any) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(`/banners/edit/${row._id}`)}
            className="btn-secondary"
            style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <Edit2 size={12} />
            Edit
          </button>
        </div>
      )
    }
  ];

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
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", height: "40px", fontSize: "0.85rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(1);
                }} 
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

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <Table 
          columns={columns}
          data={banners}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No banners found matching search criteria."
        />
      </div>
    </div>
  );
};

export default BannerListPage;
