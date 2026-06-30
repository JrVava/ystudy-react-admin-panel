import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../utils/courseApi';
import { MediaPickerModal } from './MediaPickerModal';
import { Save, ArrowLeft, Image, X, Plus, Search, GraduationCap } from 'lucide-react';

const Input = ({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input
      className="form-input"
      type={type}
      placeholder={placeholder}
      value={value === undefined || value === null ? '' : value}
      onChange={onChange}
    />
  </div>
);

const Textarea = ({ label, value, onChange, placeholder, minHeight = "100px" }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; placeholder?: string; minHeight?: string }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <textarea
      className="form-textarea"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      style={{ minHeight }}
    />
  </div>
);

const CourseAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'general' | 'badges' | 'relations'>('general');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allCoursesList, setAllCoursesList] = useState<any[]>([]);
  const [availableSearch, setAvailableSearch] = useState("");
  const [relatedSearch, setRelatedSearch] = useState("");
  const [newBadgeText, setNewBadgeText] = useState("");
  
  // Normalized form state
  const [formData, setFormData] = useState<any>({
    title: '',
    slug: '',
    shortDescription: '',
    longDescription: '',
    image: '', // MongoDB ID
    imageUrl: '', // File path (for preview)
    fullImageUrl: '', // Backend absolute URL
    badges: [],
    salaryRange: {
      from: 0,
      to: 0
    },
    careerOutcomeBadge: '',
    availableCourses: [],
    relatedCourses: []
  });

  const [isSlugAutoSynced, setIsSlugAutoSynced] = useState(!id); // Auto-sync slug with title only if creating new

  // Normalize ObjectId values into string representations
  const normalizeId = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      if (val.$oid) return val.$oid;
      if (val.toString) return val.toString();
    }
    return String(val);
  };

  const normalizeIdArray = (arr: any): string[] => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => normalizeId(item)).filter(Boolean);
  };

  useEffect(() => {
    // Load related/available courses for relationship selection
    const loadCoursesList = async () => {
      try {
        const list = await courseApi.getList();
        setAllCoursesList(list || []);
      } catch (e) {
        console.error("Failed to load courses selection list", e);
      }
    };
    loadCoursesList();

    if (id) {
      const fetchCourse = async () => {
        try {
          const course = await courseApi.getById(id);
          setFormData({
            title: course.title || '',
            slug: course.slug || '',
            shortDescription: course.shortDescription || '',
            longDescription: course.longDescription || '',
            image: normalizeId(course.image),
            imageUrl: course.image && typeof course.image === 'object' && course.image.filePath ? course.image.filePath : '',
            fullImageUrl: course.fullImageUrl || '',
            badges: Array.isArray(course.badges) ? course.badges : [],
            salaryRange: {
              from: course.salaryRange?.from || 0,
              to: course.salaryRange?.to || 0
            },
            careerOutcomeBadge: course.careerOutcomeBadge || '',
            availableCourses: normalizeIdArray(course.availableCourses),
            relatedCourses: normalizeIdArray(course.relatedCourses)
          });
        } catch (e) {
          console.error("Failed to fetch course", e);
          alert("Failed to load course details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id]);

  // Auto-generate slug from title
  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-'); // Replace multiple - with single -
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev: any) => {
      const updated = { ...prev, title: newTitle };
      if (isSlugAutoSynced) {
        updated.slug = slugify(newTitle);
      }
      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const customSlug = e.target.value;
    setIsSlugAutoSynced(false); // Stop auto-syncing if manually typed
    setFormData((prev: any) => ({ ...prev, slug: customSlug }));
  };

  const handleAddBadge = () => {
    const badge = newBadgeText.trim();
    if (badge && !formData.badges.includes(badge)) {
      setFormData((prev: any) => ({
        ...prev,
        badges: [...prev.badges, badge]
      }));
      setNewBadgeText("");
    }
  };

  const handleRemoveBadge = (badgeToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      badges: prev.badges.filter((b: string) => b !== badgeToRemove)
    }));
  };

  const handleRelationToggle = (field: 'availableCourses' | 'relatedCourses', courseId: string) => {
    setFormData((prev: any) => {
      const currentRelations = [...prev[field]];
      const index = currentRelations.indexOf(courseId);
      if (index > -1) {
        currentRelations.splice(index, 1);
      } else {
        currentRelations.push(courseId);
      }
      return { ...prev, [field]: currentRelations };
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert("Title is required!");
      return;
    }
    if (!formData.slug.trim()) {
      alert("Slug is required!");
      return;
    }

    try {
      // Build output payload
      const payload = {
        title: formData.title,
        slug: formData.slug,
        shortDescription: formData.shortDescription,
        longDescription: formData.longDescription,
        image: formData.image || null,
        badges: formData.badges,
        salaryRange: formData.salaryRange,
        careerOutcomeBadge: formData.careerOutcomeBadge,
        availableCourses: formData.availableCourses,
        relatedCourses: formData.relatedCourses
      };

      let res;
      if (id) {
        res = await courseApi.update(id, payload);
      } else {
        res = await courseApi.create(payload);
      }

      if (res.success || res.data?.success) {
        alert(id ? "Course updated successfully!" : "Course created successfully!");
        navigate('/courses');
      } else {
        alert("Failed to save course: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error("Failed to save course", e);
      alert("Error saving course: " + (e.response?.data?.message || e.message || "Check logs."));
    }
  };

  const getPreviewImageUrl = () => {
    if (formData.fullImageUrl) {
      return formData.fullImageUrl;
    }
    const path = formData.imageUrl;
    if (path) {
      if (path.startsWith('http') || path.startsWith('blob:')) {
        return path;
      }
      const apiUrl = (import.meta.env.VITE_API_URL as string) || "http://localhost:4000/api";
      const hostUrl = apiUrl.replace(/\/api$/, "");
      const cleanPath = path.replace(/^\/+/, "");
      if (cleanPath.startsWith('uploads/') || cleanPath.startsWith('media/')) {
        return `${hostUrl}/${cleanPath}`;
      }
      return `${hostUrl}/media/uploads/${cleanPath}`;
    }
    return '';
  };

  const currentPreviewUrl = getPreviewImageUrl();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <span>Loading Course Details...</span>
      </div>
    );
  }

  // Filter relationship list based on searches
  const filteredAvailableCoursesList = allCoursesList
    .filter(c => c._id !== id) // Exclude current course
    .filter(c => c.title.toLowerCase().includes(availableSearch.toLowerCase()));

  const filteredRelatedCoursesList = allCoursesList
    .filter(c => c._id !== id) // Exclude current course
    .filter(c => c.title.toLowerCase().includes(relatedSearch.toLowerCase()));

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <div className="page-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <GraduationCap size={28} style={{ color: 'var(--primary)' }} />
            {id ? 'Edit Course' : 'Create Course'}
          </h1>
          <p className="page-subtitle">{id ? `Update credentials, structure, and attributes for the course.` : 'Add a new course curriculum path to the catalog.'}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => navigate('/courses')}
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
            Save Course
          </button>
        </div>
      </div>

      <div className="panel-glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Navigation Tabs */}
        <div className="tabs" style={{ width: '100%', maxWidth: '500px', alignSelf: 'flex-start' }}>
          <button
            onClick={() => setActiveTab('general')}
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            style={{ border: 0 }}
          >
            General Info
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
            style={{ border: 0 }}
          >
            Badges & Salary
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`tab-btn ${activeTab === 'relations' ? 'active' : ''}`}
            style={{ border: 0 }}
          >
            Relations
          </button>
        </div>

        {/* Tab 1: General Info */}
        {activeTab === 'general' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <Input
                label="Course Title *"
                placeholder="e.g. Master of Business Administration (MBA)"
                value={formData.title}
                onChange={handleTitleChange}
              />
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Slug *</span>
                  {isSlugAutoSynced && <span style={{ fontSize: '0.7rem', color: 'var(--success)' }}>Auto-synced</span>}
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. master-of-business-administration-mba"
                  value={formData.slug}
                  onChange={handleSlugChange}
                />
              </div>
            </div>

            {/* Image Selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className="form-label">Course Cover Image</label>
              {currentPreviewUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--panel-border)' }}>
                  <img
                    src={currentPreviewUrl}
                    alt="Course Cover"
                    style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--panel-border)' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300';
                    }}
                  />
                  <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {formData.imageUrl ? formData.imageUrl.split('/').pop() : 'Selected Image'}
                    </p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ID: {formData.image}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="btn-secondary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    Change Cover
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  className="btn-secondary"
                  style={{ width: '100%', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', border: '1px dashed var(--panel-border)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}
                >
                  <Image size={32} style={{ color: 'var(--text-muted)' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Select Cover Image from Media Gallery</span>
                </button>
              )}
            </div>

            <Textarea
              label="Short Description"
              placeholder="Provide a concise 1-2 sentence overview of the course..."
              value={formData.shortDescription}
              onChange={e => setFormData({ ...formData, shortDescription: e.target.value })}
              minHeight="80px"
            />

            <Textarea
              label="Long Description"
              placeholder="Provide the full summary of structure, requirements, modules..."
              value={formData.longDescription}
              onChange={e => setFormData({ ...formData, longDescription: e.target.value })}
              minHeight="180px"
            />

          </div>
        )}

        {/* Tab 2: Badges & Salary */}
        {activeTab === 'badges' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Badges Input */}
            <div className="form-group">
              <label className="form-label">Key Badges / Tags</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Free Financing, Online Learning"
                  value={newBadgeText}
                  onChange={e => setNewBadgeText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBadge();
                    }
                  }}
                  style={{ flexGrow: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddBadge}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', padding: '0 1rem' }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Badges Display */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '10px', border: '1px solid var(--panel-border)', minHeight: '52px', alignItems: 'center' }}>
                {formData.badges.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>No badges added. Type badge and click Add.</span>
                ) : (
                  formData.badges.map((badge: string, i: number) => (
                    <span
                      key={i}
                      style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        color: 'var(--text-primary)',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {badge}
                      <button
                        type="button"
                        onClick={() => handleRemoveBadge(badge)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        <X size={12} className="hover:text-error" style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Salary Range */}
            <div style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '1rem', letterSpacing: '0.5px' }}>
                Expected Graduate Salary Outcomes
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Salary From (£ / year)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 25000"
                    value={formData.salaryRange?.from || 0}
                    onChange={e => setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, from: Number(e.target.value) }
                    })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Salary To (£ / year)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 60000"
                    value={formData.salaryRange?.to || 0}
                    onChange={e => setFormData({
                      ...formData,
                      salaryRange: { ...formData.salaryRange, to: Number(e.target.value) }
                    })}
                  />
                </div>
              </div>
            </div>

            <Input
              label="Career Outcome Badge Text"
              placeholder="e.g. High Demand Career path"
              value={formData.careerOutcomeBadge}
              onChange={e => setFormData({ ...formData, careerOutcomeBadge: e.target.value })}
            />

          </div>
        )}

        {/* Tab 3: Relationships */}
        {activeTab === 'relations' && (
          <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            
            {/* Available Courses list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>
                  Available Courses Links
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Select courses available under this study program pathway.</p>
              </div>

              {/* Quick Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter courses list..."
                  className="form-input"
                  style={{ width: '100%', height: '34px', paddingLeft: '30px', fontSize: '0.8rem' }}
                  value={availableSearch}
                  onChange={e => setAvailableSearch(e.target.value)}
                />
              </div>

              {/* Checklist Container */}
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '10px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredAvailableCoursesList.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No matching courses found.</span>
                ) : (
                  filteredAvailableCoursesList.map(course => {
                    const isChecked = formData.availableCourses.includes(course._id);
                    return (
                      <label
                        key={course._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                          border: isChecked ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRelationToggle('availableCourses', course._id)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isChecked ? 600 : 400 }}>
                          {course.title}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

            {/* Related Courses list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', margin: 0 }}>
                  Related Courses Options
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>Select courses to display as recommendations for this pathway.</p>
              </div>

              {/* Quick Search */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filter courses list..."
                  className="form-input"
                  style={{ width: '100%', height: '34px', paddingLeft: '30px', fontSize: '0.8rem' }}
                  value={relatedSearch}
                  onChange={e => setRelatedSearch(e.target.value)}
                />
              </div>

              {/* Checklist Container */}
              <div style={{ background: 'rgba(0,0,0,0.15)', border: '1px solid var(--panel-border)', borderRadius: '12px', padding: '10px', maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filteredRelatedCoursesList.length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No matching courses found.</span>
                ) : (
                  filteredRelatedCoursesList.map(course => {
                    const isChecked = formData.relatedCourses.includes(course._id);
                    return (
                      <label
                        key={course._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(99, 102, 241, 0.06)' : 'transparent',
                          border: isChecked ? '1px solid rgba(99, 102, 241, 0.15)' : '1px solid transparent',
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleRelationToggle('relatedCourses', course._id)}
                          style={{ accentColor: 'var(--primary)' }}
                        />
                        <span style={{ color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: isChecked ? 600 : 400 }}>
                          {course.title}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Media Picker Modal Overlay */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(mediaId, filePath) => {
            setFormData((prev: any) => ({
              ...prev,
              image: mediaId,
              imageUrl: filePath,
              fullImageUrl: '' // Clear fullUrl so custom path resolves
            }));
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CourseAdminPanel;
