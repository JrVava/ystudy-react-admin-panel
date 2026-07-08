import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../utils/courseApi';
import { toast } from '../context/ToastContext';
import { locationApi } from '../utils/locationApi';
import { Save, ArrowLeft, Image, X, Plus, Search, GraduationCap, ChevronDown } from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';

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

const MultiSelectDropdown = ({ 
  label, 
  description,
  placeholder, 
  options, 
  selectedIds, 
  onChange 
}: { 
  label: string; 
  description?: string;
  placeholder: string; 
  options: any[]; 
  selectedIds: string[]; 
  onChange: (id: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const optionsList = Array.isArray(options) ? options : [];
  const selectedIdsList = Array.isArray(selectedIds) ? selectedIds : [];

  const filteredOptions = optionsList.filter(opt => 
    opt && typeof opt.title === 'string' && opt.title.toLowerCase().includes((search || "").toLowerCase())
  );

  const selectedOptions = optionsList.filter(opt => opt && opt._id && selectedIdsList.includes(opt._id));

  return (
    <div className="form-group" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.5rem" }} ref={dropdownRef}>
      <div>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        {description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{description}</p>}
      </div>
      
      {/* Select Box Trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: "42px",
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--panel-border)",
          borderRadius: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          cursor: "pointer",
          position: "relative",
          paddingRight: "36px",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = "var(--panel-border)";
        }}
      >
        {selectedOptions.length === 0 ? (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span
              key={opt._id}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt._id);
              }}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 500
              }}
            >
              {opt.title}
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "var(--text-muted)"
                }}
              >
                <X size={10} style={{ color: "var(--text-muted)" }} />
              </button>
            </span>
          ))
        )}

        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--panel-border)",
            borderRadius: "10px",
            marginTop: "6px",
            zIndex: 1000,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }}
        >
          {/* Search Input */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--panel-border)", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ height: "34px", fontSize: "0.8rem", padding: "6px 10px 6px 30px" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options Scrolling Box */}
          <div style={{ maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                No courses found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedIdsList.includes(opt._id);
                return (
                  <div
                    key={opt._id}
                    onClick={() => onChange(opt._id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                      color: "white",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent"}
                  >
                    <span>{opt.title}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'general' | 'badges' | 'relations'>('general');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allCoursesList, setAllCoursesList] = useState<any[]>([]);
  const [allLocationsList, setAllLocationsList] = useState<any[]>([]);
  const [newBadgeText, setNewBadgeText] = useState("");
  const [newEntryRequirementText, setNewEntryRequirementText] = useState("");
  
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
    relatedCourses: [],
    locations: [],
    courseType: 'General',
    entryRequirement: [],
    modeType: []
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
    // Load related/available courses for relationship selection using paginated route (limit 1000) to bypass status: true constraint
    const loadCoursesList = async () => {
      try {
        const res = await courseApi.getPaginated(1, 1000);
        if (res && res.success) {
          setAllCoursesList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load courses selection list", e);
      }
    };
    // Load locations using paginated route (limit 1000) to bypass status: true constraint
    const loadLocationsList = async () => {
      try {
        const res = await locationApi.getPaginated(1, 1000);
        if (res && res.success) {
          setAllLocationsList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load locations list", e);
      }
    };
    loadCoursesList();
    loadLocationsList();

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
            relatedCourses: normalizeIdArray(course.relatedCourses),
            locations: normalizeIdArray(course.locations),
            courseType: course.courseType || 'General',
            entryRequirement: Array.isArray(course.entryRequirement) ? course.entryRequirement : [],
            modeType: Array.isArray(course.modeType) ? course.modeType : []
          });
        } catch (e) {
          console.error("Failed to fetch course", e);
          toast.error("Failed to load course details.");
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

  const handleAddEntryRequirement = () => {
    const req = newEntryRequirementText.trim();
    if (req && !formData.entryRequirement.includes(req)) {
      setFormData((prev: any) => ({
        ...prev,
        entryRequirement: [...prev.entryRequirement, req]
      }));
      setNewEntryRequirementText("");
    }
  };

  const handleRemoveEntryRequirement = (reqToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      entryRequirement: prev.entryRequirement.filter((r: string) => r !== reqToRemove)
    }));
  };

  const handleRelationToggle = (field: 'availableCourses' | 'relatedCourses' | 'locations', courseId: string) => {
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
      toast.warning("Title is required!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.warning("Slug is required!");
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
        relatedCourses: formData.relatedCourses,
        locations: formData.locations,
        courseType: formData.courseType,
        entryRequirement: formData.entryRequirement,
        modeType: formData.modeType
      };

      let res;
      if (id) {
        res = await courseApi.update(id, payload);
      } else {
        res = await courseApi.create(payload);
        const createdId = res.courseId || res.data?.courseId || res.data?.data?.courseId;
        if (createdId) {
          // Immediately update to persist courseType, entryRequirement, and modeType on backend
          await courseApi.update(createdId, payload);
        }
      }

      if (res.success || res.data?.success) {
        toast.success(id ? "Course updated successfully!" : "Course created successfully!");
        navigate('/courses');
      } else {
        toast.error("Failed to save course: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error("Failed to save course", e);
      toast.error("Error saving course: " + (e.response?.data?.message || e.message || "Check logs."));
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

  // Empty space or clean placeholder for unused filters

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
            
            <div className="responsive-form-grid">
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

            <div className="form-group">
              <label className="form-label">Course Type *</label>
              <select
                className="form-input"
                value={formData.courseType || 'General'}
                onChange={e => setFormData({ ...formData, courseType: e.target.value })}
                style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
              >
                <option value="General" style={{ background: '#0b0f19' }}>General</option>
                <option value="Social" style={{ background: '#0b0f19' }}>Social</option>
              </select>
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

            {/* Study Mode Type */}
            <MultiSelectDropdown
              label="Study Mode Type"
              description="Select available learning patterns/modes."
              placeholder="Choose mode types..."
              options={[
                { _id: 'Full-time', title: 'Full-time' },
                { _id: 'Part-time', title: 'Part-time' },
                { _id: 'Blended', title: 'Blended' },
                { _id: 'Online', title: 'Online' },
                { _id: 'Distance Learning', title: 'Distance Learning' }
              ]}
              selectedIds={formData.modeType || []}
              onChange={(mode) => {
                const currentModes = [...(formData.modeType || [])];
                const index = currentModes.indexOf(mode);
                if (index > -1) {
                  currentModes.splice(index, 1);
                } else {
                  currentModes.push(mode);
                }
                setFormData({ ...formData, modeType: currentModes });
              }}
            />

            {/* Entry Requirements Input */}
            <div className="form-group">
              <label className="form-label">Entry Requirements</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 80 UCAS Points, IELTS 5.5"
                  value={newEntryRequirementText}
                  onChange={e => setNewEntryRequirementText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddEntryRequirement();
                    }
                  }}
                  style={{ flexGrow: 1 }}
                />
                <button
                  type="button"
                  onClick={handleAddEntryRequirement}
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifySelf: 'center', padding: '0 1rem' }}
                >
                  <Plus size={16} />
                  Add
                </button>
              </div>

              {/* Entry Requirements Display */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '10px', border: '1px solid var(--panel-border)', minHeight: '52px', alignItems: 'center' }}>
                {(formData.entryRequirement || []).length === 0 ? (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '4px' }}>No entry requirements added. Type requirement and click Add.</span>
                ) : (
                  formData.entryRequirement.map((req: string, i: number) => (
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
                      {req}
                      <button
                        type="button"
                        onClick={() => handleRemoveEntryRequirement(req)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      >
                        <X size={12} style={{ color: 'var(--text-muted)' }} />
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
              <div className="responsive-form-grid">
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
          <div className="animate-fade-in responsive-form-grid" style={{ gap: '2rem' }}>
            <MultiSelectDropdown
              label="Available Courses Links"
              description="Select courses available under this study program pathway."
              placeholder="Choose available courses..."
              options={allCoursesList.filter(c => c._id !== id)}
              selectedIds={formData.availableCourses}
              onChange={(courseId) => handleRelationToggle('availableCourses', courseId)}
            />

            <MultiSelectDropdown
              label="Related Courses Options"
              description="Select courses to display as recommendations for this pathway."
              placeholder="Choose related courses..."
              options={allCoursesList.filter(c => c._id !== id)}
              selectedIds={formData.relatedCourses}
              onChange={(courseId) => handleRelationToggle('relatedCourses', courseId)}
            />

            <div style={{ gridColumn: 'span 2' }}>
              <MultiSelectDropdown
                label="Locations Availability"
                description="Select locations where this course study path is active."
                placeholder="Choose locations..."
                options={allLocationsList}
                selectedIds={formData.locations}
                onChange={(locationId) => handleRelationToggle('locations', locationId)}
              />
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
