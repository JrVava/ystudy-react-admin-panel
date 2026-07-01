import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bannerApi } from '../utils/bannerApi';
import { MediaPickerModal } from './MediaPickerModal';
import { Save, ArrowLeft, Image } from 'lucide-react';
import './BannerAdminPanel.css';

const Input = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      className="form-input"
      type="text"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <textarea
      className="form-textarea"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
    />
  </div>
);

const Select = ({ label, options, value, onChange }: { label: string; options: { label: string; value: string }[]; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select
      className="form-select"
      value={value || ''}
      onChange={onChange}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  </div>
);

const BannerAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'left' | 'right'>('general');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    internalName: '',
    background: { imageUrl: '', fullImageUrl: '' },
    leftContent: { title: 'Find a degree that builds your bright future.', description: 'Compare courses, Student Finance and flexible study routes before you apply.', badgeText: 'FREE GUIDANCE FOR WORKING ADULTS', footerItems: [] },
    rightCard: {
      layoutType: 'stacked-cards',
      title: 'Snapshot',
      mainValue: '~£23,925',
      items: [
        { title: 'Free guidance', subtitle: '', description: 'Get professional support', value: '', icon: '' },
        { title: 'Funding check', subtitle: '', description: 'Check finance options', value: '', icon: '' }
      ]
    }
  });

  useEffect(() => {
    if (id) {
      const fetchBanner = async () => {
        try {
          const banner = await bannerApi.getById(id);
          setFormData({
            internalName: banner.internalName || '',
            background: { imageUrl: banner.background?.imageUrl || '', fullImageUrl: banner.fullImageUrl || banner.background?.fullImageUrl || '' },
            leftContent: banner.leftContent || { title: '', description: '', badgeText: '', footerItems: [] },
            rightCard: banner.rightCard || { layoutType: 'stacked-cards', title: 'Snapshot', mainValue: '', items: [] }
          });
        } catch (e) {
          console.error("Failed to fetch banner", e);
          alert("Failed to load banner details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBanner();
    }
  }, [id]);

  const updateBackground = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, background: { ...prev.background, [key]: value } }));
  };

  const updateLeftContent = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, leftContent: { ...prev.leftContent, [key]: value } }));
  };

  const updateRightCard = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, rightCard: { ...prev.rightCard, [key]: value } }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      rightCard: {
        ...prev.rightCard,
        items: [...prev.rightCard.items, { title: 'New Item', subtitle: '', description: '', value: '', icon: '' }]
      }
    }));
  };

  const updateItem = (index: number, key: string, value: string) => {
    const newItems = [...formData.rightCard.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setFormData(prev => ({ ...prev, rightCard: { ...prev.rightCard, items: newItems } }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.rightCard.items.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, rightCard: { ...prev.rightCard, items: newItems } }));
  };

  const handleSave = async () => {
    try {
      let res;
      if (id) {
        res = await bannerApi.update(id, formData);
      } else {
        res = await bannerApi.create(formData);
      }
      if (res.success) {
        alert("Banner saved successfully!");
        navigate('/banners');
      } else {
        alert("Failed to save banner: " + res.message);
      }
    } catch (e: any) {
      console.error("Failed to save banner", e);
      alert("Error saving banner: " + (e.message || "Check console for details."));
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <span>Loading Banner Builder...</span>
      </div>
    );
  }

  // Helper to resolve the correct URL for preview dynamically
  const getPreviewBgUrl = () => {
    if (formData.background.fullImageUrl) {
      return formData.background.fullImageUrl;
    }
    const path = formData.background.imageUrl;
    if (path) {
      if (path.startsWith('http') || path.startsWith('blob:')) {
        return path;
      }

      // Dynamically extract host from VITE_API_URL (e.g. http://localhost:4000/api -> http://localhost:4000)
      const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";
      const hostUrl = apiUrl.replace(/\/api$/, "");

      const cleanPath = path.replace(/^\/+/, "");

      if (cleanPath.startsWith('uploads/')) {
        return `${hostUrl}/${cleanPath}`;
      }
      if (cleanPath.startsWith('media/')) {
        return `${hostUrl}/${cleanPath}`;
      }
      return `${hostUrl}/media/uploads/${cleanPath}`;
    }
    return '';
  };

  const bgUrl = getPreviewBgUrl();
  console.log('bgUrl', bgUrl);

  return (
    <div className="banner-admin-wrapper animate-fade-in">
      <div className="banner-admin-container">

        {/* Configuration Form (Left Pane) */}
        <div className="form-section">
          <div className="form-header">
            <div>
              <h2 className="form-title">{id ? 'Edit Banner' : 'Banner Builder'}</h2>
              <p className="form-subtitle">Customize headline details and layout settings.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => navigate('/banners')}
                className="btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem' }}
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              >
                Background
              </button>
              <button
                onClick={() => setActiveTab('left')}
                className={`tab-btn ${activeTab === 'left' ? 'active' : ''}`}
              >
                Headline Text
              </button>
              <button
                onClick={() => setActiveTab('right')}
                className={`tab-btn ${activeTab === 'right' ? 'active' : ''}`}
              >
                Right Card Settings
              </button>
            </div>
          </div>

          <div className="form-content">
            {/* Tab 1: Background */}
            {activeTab === 'general' && (
              <div className="animate-fade-in">
                <Input
                  label="Internal Banner Name"
                  placeholder="e.g., Homepage Promo Banner"
                  value={formData.internalName}
                  onChange={e => setFormData({ ...formData, internalName: e.target.value })}
                />

                <div style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Background Image</label>
                  {formData.background.imageUrl ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--panel-border)' }}>
                      <img
                        src={bgUrl}
                        alt="Background Preview"
                        style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formData.background.imageUrl.split('/').pop()}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {formData.background.imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: '1px dashed var(--panel-border)', borderRadius: '10px', background: 'rgba(255,255,255,0.01)' }}
                    >
                      <Image size={24} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Select Media Asset</span>
                    </button>
                  )}
                </div>

                <Input
                  label="Fallback Image URL (Full URL)"
                  placeholder="e.g., https://site.com/fallback.jpg"
                  value={formData.background.fullImageUrl || ''}
                  onChange={e => updateBackground('fullImageUrl', e.target.value)}
                />
              </div>
            )}

            {/* Media Picker Modal */}
            {isMediaPickerOpen && (
              <MediaPickerModal
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(mediaId, filePath) => {
                  const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";
                  const hostUrl = apiUrl.replace(/\/api$/, "");
                  const cleanPath = filePath.replace(/^\/+/, "");
                  const resolvedUrl = cleanPath.startsWith('uploads/') || cleanPath.startsWith('media/')
                    ? `${hostUrl}/${cleanPath}`
                    : `${hostUrl}/media/uploads/${cleanPath}`;

                  setFormData(prev => ({
                    ...prev,
                    background: {
                      imageUrl: mediaId,
                      fullImageUrl: resolvedUrl
                    }
                  }));
                  setIsMediaPickerOpen(false);
                }}
              />
            )}

            {/* Tab 2: Left Content */}
            {activeTab === 'left' && (
              <div className="animate-fade-in">
                <Input
                  label="Badge Tagline (Optional)"
                  placeholder="e.g., SPECIAL SCHEME"
                  value={formData.leftContent.badgeText}
                  onChange={e => updateLeftContent('badgeText', e.target.value)}
                />
                <Textarea
                  label="Primary Title"
                  placeholder="Enter the main title..."
                  value={formData.leftContent.title}
                  onChange={e => updateLeftContent('title', e.target.value)}
                />
                <Textarea
                  label="Supporting Description"
                  placeholder="Supporting text detail..."
                  value={formData.leftContent.description}
                  onChange={e => updateLeftContent('description', e.target.value)}
                />
              </div>
            )}

            {/* Tab 3: Right Card Settings */}
            {activeTab === 'right' && (
              <div className="animate-fade-in">
                <Select
                  label="Card Layout Structure"
                  options={[
                    { label: 'Stacked Cards (Headline & Description)', value: 'stacked-cards' },
                    { label: 'List Rows (Items & Mini Value)', value: 'list-items' },
                    { label: 'Highlight Stat Card (Huge Text & Sub Stats)', value: 'stats-highlight' },
                    { label: 'Grid 2x2 Layout', value: 'grid-2x2' }
                  ]}
                  value={formData.rightCard.layoutType}
                  onChange={e => updateRightCard('layoutType', e.target.value)}
                />

                <Input
                  label="Card Header Title"
                  placeholder="e.g., At a glance"
                  value={formData.rightCard.title}
                  onChange={e => updateRightCard('title', e.target.value)}
                />

                {formData.rightCard.layoutType === 'stats-highlight' && (
                  <Input
                    label="Stat Highlight Value"
                    placeholder="e.g., ~£23,925"
                    value={formData.rightCard.mainValue || ''}
                    onChange={e => updateRightCard('mainValue', e.target.value)}
                  />
                )}

                <div style={{ marginTop: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                      Card Details List
                    </h4>
                    <button
                      onClick={addItem}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem', borderRadius: '6px' }}
                    >
                      + Add Item
                    </button>
                  </div>

                  {formData.rightCard.items.map((item, index) => (
                    <div key={index} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', borderRadius: '10px', padding: '12px', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Card Item #{index + 1}</span>
                        <button onClick={() => removeItem(index)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Remove</button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '2px', color: 'var(--text-muted)' }}>Title</label>
                          <input type="text" value={item.title} onChange={e => updateItem(index, 'title', e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '2px', color: 'var(--text-muted)' }}>Subtitle</label>
                          <input type="text" value={item.subtitle || ''} onChange={e => updateItem(index, 'subtitle', e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
                        </div>
                      </div>

                      {['stats-highlight', 'grid-2x2'].includes(formData.rightCard.layoutType) && (
                        <div style={{ marginBottom: '8px' }}>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '2px', color: 'var(--text-muted)' }}>Stat Value</label>
                          <input type="text" value={item.value || ''} onChange={e => updateItem(index, 'value', e.target.value)} className="form-input" style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
                        </div>
                      )}

                      {formData.rightCard.layoutType !== 'stats-highlight' && (
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 600, marginBottom: '2px', color: 'var(--text-muted)' }}>Description</label>
                          <textarea value={item.description || ''} onChange={e => updateItem(index, 'description', e.target.value)} className="form-textarea" style={{ padding: '6px 10px', minHeight: '50px', fontSize: '0.85rem' }}></textarea>
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.rightCard.items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '2rem', border: '1px dashed var(--panel-border)', borderRadius: '10px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No items set up.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Pane (Right Pane) */}
        <div className="preview-section">
          {/* Browser Mockup Header */}
          <div className="browser-header">
            <div className="browser-dot red"></div>
            <div className="browser-dot yellow"></div>
            <div className="browser-dot green"></div>
            <div className="browser-url">Headline Live Visualizer</div>
          </div>

          {/* Banner Container */}
          <div
            className="banner-preview-bg"
            style={{
              backgroundImage: bgUrl ? `url("${encodeURI(bgUrl)}")` : "none",
              backgroundColor: "#0a0d16",
              backgroundSize: "cover",      // Fills the div, crops if needed
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            {/* Ambient Dark Overlay to make headline readable */}
            <div className="banner-overlay"></div>

            {/* Main Content Layout */}
            <div className="banner-content-layout">
              {/* Left Content Area */}
              <div className="banner-left">
                {formData.leftContent.badgeText && (
                  <span className="banner-badge">
                    {formData.leftContent.badgeText}
                  </span>
                )}

                <h1 className="banner-title">
                  {formData.leftContent.title || 'Add main title headline...'}
                </h1>

                <p className="banner-description">
                  {formData.leftContent.description || 'Add supporting details here.'}
                </p>
              </div>

              {/* Right Card Area representing frontend mockup */}
              <div className="banner-right">
                <div className="banner-card">
                  {/* Card Title rendered ONCE at the absolute top of the card for all layouts */}
                  <h3 className="card-title">
                    {formData.rightCard.title || 'Information Card'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {formData.rightCard.layoutType === 'stacked-cards' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {formData.rightCard.items.map((item, idx) => (
                          <div key={idx} style={{ color: '#0f172a' }}>
                            {item.subtitle && (
                              <div style={{ fontSize: '11px', fontWeight: 800, color: '#f97316', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>
                                {item.subtitle}
                              </div>
                            )}
                            <div style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '6px', lineHeight: 1.2, color: '#0f172a' }}>
                              {item.title || `Item ${idx + 1}`}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.4 }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.rightCard.layoutType === 'grid-2x2' && (
                      <div className="grid-2x2">
                        {formData.rightCard.items.map((item, idx) => (
                          <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '10px', color: '#0f172a' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4f46e5', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.value || item.subtitle || 'Stat...'}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.rightCard.layoutType === 'list-items' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {formData.rightCard.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.title || `Row ${idx + 1}`}</div>
                              {item.subtitle && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.subtitle}</div>}
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#f97316' }}>{item.value || ''}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {formData.rightCard.layoutType === 'stats-highlight' && (
                      <div className="stats-card" style={{ padding: '16px 12px 12px' }}>
                        <div className="stats-label">Snapshot highlights</div>
                        <div className="stats-value">{formData.rightCard.mainValue || '~£0'}</div>
                        <div className="stats-grid">
                          {formData.rightCard.items.map((item, idx) => (
                            <div key={idx} className="stats-mini">
                              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '2px' }}>{item.value || item.title || '£0'}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.subtitle || item.description || 'Stat'}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BannerAdminPanel;
