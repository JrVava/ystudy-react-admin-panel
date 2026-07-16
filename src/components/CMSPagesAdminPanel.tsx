import React, { useEffect, useState } from 'react';
import { cmsApi } from '../utils/cmsApi';
import { navigationApi } from '../utils/navigationApi';
import { 
  FileText, Edit2, X, Save, AlertCircle, 
  CheckCircle, Info, ChevronDown, ChevronUp, Search, Image, ArrowLeft
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import config from '../config';
import { SearchableSelect } from './SearchableSelect';
import Table from './Table';

interface CMSPage {
  _id: string;
  page: string;
  created_at: string | null;
  updated_at: string | null;
}

export const CMSPagesAdminPanel: React.FC = () => {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [navItems, setNavItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Editor states
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [pageData, setPageData] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion active state (stores the section key, e.g. "section_10")
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Media picker path for dynamic image fields
  const [activeMediaPickerPath, setActiveMediaPickerPath] = useState<string[] | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [cmsRes, navData] = await Promise.all([
        cmsApi.getAll(),
        navigationApi.getFlat().catch(err => {
          console.error("Failed to load navigations", err);
          return [];
        })
      ]);

      if (navData) {
        setNavItems(navData);
      }

      if (cmsRes && cmsRes.success) {
        setPages(cmsRes.data);
      } else {
        setError('Failed to fetch pages');
      }
    } catch (err: any) {
      console.error('Error fetching CMS pages:', err);
      setError(err.message || 'An error occurred while loading pages.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (pageObj: CMSPage) => {
    setEditingPage(pageObj);
    setPageData(null);
    setEditorError(null);
    setSaveSuccess(false);
    setActiveSection(null);
    
    try {
      const data = await cmsApi.getById(pageObj._id);
      if (data && data.success) {
        setPageData(data.data);
        
        // Find the first non-metadata section key to expand by default
        const keys = Object.keys(data.data).filter(k => !isMetadataKey(k));
        if (keys.length > 0) {
          setActiveSection(keys[0]);
        }
      } else {
        setEditorError('Failed to load page structure');
      }
    } catch (err: any) {
      console.error('Error loading page data:', err);
      setEditorError('Error loading page contents.');
    }
  };

  const handleValueChange = (path: string[], value: any) => {
    if (!pageData) return;
    
    // Deep clone state to avoid mutation
    const updatedData = JSON.parse(JSON.stringify(pageData));
    
    // Set value dynamically at path
    let current = updatedData;
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setPageData(updatedData);
  };

  const handleSave = async () => {
    if (!editingPage || !pageData) return;
    setIsSaving(true);
    setEditorError(null);
    setSaveSuccess(false);

    try {
      const res = await cmsApi.update(editingPage._id, pageData);
      if (res && (res.success || res.data)) {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setEditingPage(null);
          setPageData(null);
        }, 1500);
        fetchPages(); // Refresh timestamps
      } else {
        setEditorError(res.message || 'Failed to save updates.');
      }
    } catch (err: any) {
      console.error('Error saving CMS page:', err);
      setEditorError(err.message || 'Error occurred while saving modifications.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to check if a key is a MongoDB or internal metadata field
  const isMetadataKey = (key: string) => {
    return ['_id', 'createdAt', 'updatedAt', 'page', 'created_at', 'updated_at'].includes(key);
  };

  // Format label from camelCase or snake_case
  const formatLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fully recursive form field renderer
  const renderField = (value: any, path: string[], label: string): React.ReactNode => {
    // 1. Skip rendering if it is a Mongo ObjectId or Date wrapper object
    if (value && typeof value === 'object' && ('$oid' in value || '$date' in value)) {
      return null;
    }

    // Check if it is an image field (either string value, or null/undefined image field)
    const isImageField = label.toLowerCase().includes('image') && 
                         (value === null || value === undefined || typeof value === 'string');

    if (isImageField) {
      const getImageUrl = (pathStr: string) => {
        if (!pathStr) return '';
        if (pathStr.startsWith('http') || pathStr.startsWith('blob:')) return pathStr;
        const apiUrl = config.apiUrl;
        const hostUrl = apiUrl.replace(/\/api$/, "");
        const cleanPath = pathStr.replace(/^\/+/, "");
        if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('media/')) {
          return `${hostUrl}/${cleanPath}`;
        }
        return `${hostUrl}/media/uploads/${cleanPath}`;
      };

      const getParentObj = (path: string[], data: any): any => {
        let current = data;
        for (let i = 0; i < path.length - 1; i++) {
          if (!current) return null;
          current = current[path[i]];
        }
        return current;
      };

      const parentObj = getParentObj(path, pageData);
      
      let previewPath = value;
      if (value && mediaPreviews[value]) {
        previewPath = mediaPreviews[value];
      } else if (parentObj && parentObj.fullImageUrl && label === 'image') {
        previewPath = parentObj.fullImageUrl;
      }
      
      const fullUrl = getImageUrl(previewPath || '');
      
      return (
        <div className="form-group" key={path.join('.')}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{formatLabel(label)}</label>
          {value ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
              <img
                src={fullUrl}
                alt={label}
                style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=120';
                }}
              />
              <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {previewPath && previewPath.includes('/') ? previewPath.split('/').pop() : value}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveMediaPickerPath(path)}
                className="btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              >
                Change
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setActiveMediaPickerPath(path)}
              className="btn-secondary"
              style={{ width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px dashed var(--panel-border)', borderRadius: '10px', background: 'rgba(255,255,255,0.01)' }}
            >
              <Image size={24} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Image Asset</span>
            </button>
          )}
        </div>
      );
    }

    // 2. Handle null / undefined
    if (value === null || value === undefined) {
      return (
        <div className="form-group" key={path.join('.')}>
          <label className="form-label" style={{ fontSize: '0.8rem' }}>{formatLabel(label)}</label>
          <input
            type="text"
            value=""
            onChange={e => handleValueChange(path, e.target.value)}
            className="form-input"
            style={{ fontSize: '0.9rem' }}
          />
        </div>
      );
    }

    // 3. Handle Boolean type
    if (typeof value === 'boolean') {
      return (
        <div className="form-group" key={path.join('.')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
          <label className="form-label" style={{ fontSize: '0.8rem', margin: 0 }}>{formatLabel(label)}</label>
          <label className="switch-container">
            <input 
              type="checkbox" 
              className="switch-input"
              checked={value}
              onChange={e => handleValueChange(path, e.target.checked)}
            />
            <div className="switch-slider"></div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: value ? 'var(--success)' : 'var(--text-muted)' }}>
              {value ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>
      );
    }

    // 4. Handle Array type
    if (Array.isArray(value)) {
      return (
        <div key={path.join('.')} style={{ marginTop: '1.25rem', borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', marginBottom: '1.25rem' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
            {formatLabel(label)} List
          </h5>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {value.map((item, index) => {
              const itemPath = [...path, String(index)];
              const isObj = typeof item === 'object' && item !== null;
              
              return (
                <div key={index} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--panel-border)', borderRadius: '10px', padding: '1rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                    {formatLabel(label).replace(/s$/, '')} #{index + 1}
                  </div>
                  {isObj ? (
                    Object.keys(item)
                      .filter(subKey => subKey !== 'fullImageUrl')
                      .map(subKey => 
                        renderField(item[subKey], [...itemPath, subKey], subKey)
                      )
                  ) : (
                    <input
                      type="text"
                      value={item || ''}
                      onChange={e => {
                        const updatedArr = [...value];
                        updatedArr[index] = e.target.value;
                        handleValueChange(path, updatedArr);
                      }}
                      className="form-input"
                      style={{ fontSize: '0.9rem', width: '100%' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 5. Handle Object type (Recursive step)
    if (typeof value === 'object') {
      return (
        <div key={path.join('.')} style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.02)', borderRadius: '12px', padding: '1rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
          <h5 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            {formatLabel(label)} Details
          </h5>
          {Object.keys(value)
            .filter(k => k !== 'status' && k !== 'fullImageUrl') // Status handles at parent accordion level
            .map(subKey => 
              renderField(value[subKey], [...path, subKey], subKey)
            )
          }
        </div>
      );
    }

    // 6. Handle String & Number primitives
    const isTextarea = typeof value === 'string' && (value.length > 70 || label.toLowerCase().includes('description') || label.toLowerCase().includes('content'));
    const isNumber = typeof value === 'number';

    return (
      <div className="form-group" key={path.join('.')}>
        <label className="form-label" style={{ fontSize: '0.8rem' }}>{formatLabel(label)}</label>
        {isTextarea ? (
          <textarea
            value={value || ''}
            onChange={e => handleValueChange(path, e.target.value)}
            className="form-textarea"
            style={{ minHeight: '80px', fontSize: '0.9rem' }}
          />
        ) : (
          <input
            type={isNumber ? "number" : "text"}
            value={value !== undefined ? value : ''}
            onChange={e => handleValueChange(path, isNumber ? Number(e.target.value) : e.target.value)}
            className="form-input"
            style={{ fontSize: '0.9rem' }}
          />
        )}
      </div>
    );
  };

  const getPageDisplayName = (slug: string) => {
    const navItem = navItems.find(n => n.slug === slug);
    if (navItem && navItem.pageName) {
      return navItem.pageName;
    }
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  // Client-side search filter for pages
  const filteredPages = pages.filter(p => {
    if (!p.page) return false;
    const displayName = getPageDisplayName(p.page).toLowerCase();
    const slugName = p.page.toLowerCase();
    const query = searchQuery.toLowerCase();
    return displayName.includes(query) || slugName.includes(query);
  });
  const pageColumns = [
    {
      name: 'Page Name',
      selector: (row: any) => getPageDisplayName(row.page),
      sortable: true,
      style: { fontWeight: 700, color: 'var(--text-primary)' }
    },
    {
      name: 'Created At',
      selector: (row: any) => row.created_at || '',
      sortable: true,
      cell: (row: any) => row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'
    },
    {
      name: 'Updated At',
      selector: (row: any) => row.updated_at || '',
      sortable: true,
      cell: (row: any) => row.updated_at ? new Date(row.updated_at).toLocaleString() : 'N/A'
    },
    {
      name: 'Actions',
      right: true,
      cell: (row: any) => (
        <button 
          onClick={() => handleEditClick(row)}
          className="btn-secondary"
          style={{ padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
        >
          <Edit2 size={12} />
          Edit Page
        </button>
      )
    }
  ];

  if (loading && pages.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <span>Loading CMS Pages list...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={28} style={{ color: 'var(--primary)' }} />
            CMS Page Modules
          </h1>
          <p className="page-subtitle">Edit page sections dynamically. Fields expand inside accordions one at a time.</p>
        </div>

        {/* Quick Search on CMS page selector */}
        {!editingPage && (
          <div style={{ position: "relative", minWidth: "240px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search CMS pages..." 
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
        )}
      </div>

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Pages list table vs Editor layout */}
      {!editingPage ? (
        <div className="panel-glass" style={{ padding: 0, overflow: 'hidden' }}>
          <Table 
            columns={pageColumns}
            data={filteredPages}
            loading={loading}
            serverSide={false}
            noDataText="No CMS pages matched your search query."
          />
        </div>
      ) : (
        /* Edit dynamic form view */
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Editor Header panel */}
          <div className="panel-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', background: 'rgba(79, 70, 229, 0.1)', color: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                  Editing Page: <span style={{ color: 'var(--accent)', textTransform: 'capitalize' }}>{editingPage.page}</span>
                </h3>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => { setEditingPage(null); setPageData(null); }}
                className="btn-secondary"
                disabled={isSaving}
                style={{ padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button 
                onClick={handleSave}
                className="btn-primary"
                disabled={isSaving || !pageData}
                style={{ padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                {isSaving ? 'Saving...' : saveSuccess ? (
                  <>
                    <CheckCircle size={16} />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save Layout
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feedback banners */}
          {editorError && (
            <div style={{ background: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={20} />
              <span>{editorError}</span>
            </div>
          )}

          {saveSuccess && (
            <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", color: "var(--success)", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={20} />
              <span>Layout changes successfully saved to the server!</span>
            </div>
          )}

          {/* Dynamic Inputs Accordion List */}
          {!pageData && !editorError ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <span>Fetching page data structure...</span>
            </div>
          ) : (
            <div className="panel-glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', color: 'var(--info)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1rem' }}>
                <Info size={16} style={{ flexShrink: 0 }} />
                <span>Page sections can be toggled open one at a time to reduce scrolling. Schema bindings are fixed.</span>
              </div>
              
              <form onSubmit={e => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '0 0.5rem 1.25rem 0.5rem', borderBottom: '1px solid var(--panel-border)', marginBottom: '1rem' }}>
                  <SearchableSelect
                    label="Page Slug / Name *"
                    value={pageData.page || ''}
                    onChange={(val) => setPageData({ ...pageData, page: val })}
                    options={navItems.map((nav: any) => ({
                      value: nav.slug,
                      label: `${nav.pageName} (${nav.slug})`
                    }))}
                    placeholder="Select a page slug..."
                    required
                  />
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    Warning: Changing this links this CMS layout configuration to a different frontend route/slug.
                  </span>
                </div>

                {Object.keys(pageData)
                  .filter(key => !isMetadataKey(key))
                  .map(key => {
                    const sectionValue = pageData[key];
                    const isExpanded = activeSection === key;
                    const hasStatus = sectionValue && typeof sectionValue === 'object' && sectionValue.status !== undefined;
                    const isSectionStatusActive = hasStatus ? sectionValue.status : true;

                    return (
                      <div 
                        key={key} 
                        style={{ 
                          border: '1px solid var(--panel-border)', 
                          borderRadius: '16px', 
                          overflow: 'hidden', 
                          background: isExpanded ? 'rgba(255,255,255,0.01)' : 'transparent',
                          transition: 'all 0.25s ease'
                        }}
                      >
                        {/* Accordion Header Bar */}
                        <div 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            padding: '1.25rem 1.5rem', 
                            background: isExpanded ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.005)',
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                          onClick={() => setActiveSection(isExpanded ? null : key)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {isExpanded ? <ChevronUp size={18} style={{ color: 'var(--primary)' }} /> : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />}
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: isSectionStatusActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                              {formatLabel(key)}
                            </h4>
                          </div>

                          {/* Accordion Header Switch: toggles status if it exists */}
                          {hasStatus && (
                            <div onClick={e => e.stopPropagation()}>
                              <label className="switch-container">
                                <input 
                                  type="checkbox" 
                                  className="switch-input"
                                  checked={isSectionStatusActive}
                                  onChange={e => handleValueChange([key, 'status'], e.target.checked)}
                                />
                                <div className="switch-slider"></div>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: isSectionStatusActive ? 'var(--success)' : 'var(--text-muted)' }}>
                                  {isSectionStatusActive ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Accordion Body Content */}
                        {isExpanded && (
                          <div style={{ padding: '1.5rem', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.1)' }}>
                            {typeof sectionValue === 'object' && sectionValue !== null ? (
                              Object.keys(sectionValue)
                                .filter(subKey => subKey !== 'status')
                                .map(subKey => 
                                  renderField(sectionValue[subKey], [key, subKey], subKey)
                                )
                            ) : (
                              renderField(sectionValue, [key], key)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </form>
            </div>
          )}
        </div>
      )}
      
      {activeMediaPickerPath && (
        <MediaPickerModal
          onClose={() => setActiveMediaPickerPath(null)}
          onSelect={(mediaId, filePath) => {
            setMediaPreviews(prev => ({ ...prev, [mediaId]: filePath }));
            handleValueChange(activeMediaPickerPath, mediaId);
            setActiveMediaPickerPath(null);
          }}
        />
      )}
    </div>
  );
};

export default CMSPagesAdminPanel;
