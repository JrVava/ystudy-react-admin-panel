import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { courseApi } from '../utils/courseApi';
import { toast } from '../context/ToastContext';
import { locationApi } from '../utils/locationApi';
import { Save, ArrowLeft, Image, X, Plus, GraduationCap } from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import config from '../config';
import { lookupApi } from '../utils/lookupApi';

import Input from './Input';
import Textarea from './Textarea';
import MultiSelectDropdown from './MultiSelectDropdown';


const CourseAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'general' | 'badges' | 'relations' | 'cms'>('general');
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [cmsMediaPickerTarget, setCmsMediaPickerTarget] = useState<{ section: string; arrayField: string; index: number; key: string } | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [allCoursesList, setAllCoursesList] = useState<any[]>([]);
  const [allLocationsList, setAllLocationsList] = useState<any[]>([]);
  const [allSubjectsList, setAllSubjectsList] = useState<any[]>([]);
  const [allQualificationsList, setAllQualificationsList] = useState<any[]>([]);
  const [allModesList, setAllModesList] = useState<any[]>([]);
  const [allDurationsList, setAllDurationsList] = useState<any[]>([]);
  const [allFundingsList, setAllFundingsList] = useState<any[]>([]);
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
    modeType: [],
    subjects: [],
    qualifications: [],
    durations: [],
    fundings: [],
    status: true,
    courseCms: null
  });



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
    const loadSubjectsList = async () => {
      try {
        const res = await lookupApi('subjects').getPaginated(1, 1000);
        if (res && res.success) {
          setAllSubjectsList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load subjects list", e);
      }
    };
    const loadQualificationsList = async () => {
      try {
        const res = await lookupApi('qualifications').getPaginated(1, 1000);
        if (res && res.success) {
          setAllQualificationsList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load qualifications list", e);
      }
    };
    const loadModesList = async () => {
      try {
        const res = await lookupApi('modes').getPaginated(1, 1000);
        if (res && res.success) {
          setAllModesList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load modes list", e);
      }
    };
    const loadDurationsList = async () => {
      try {
        const res = await lookupApi('durations').getPaginated(1, 1000);
        if (res && res.success) {
          setAllDurationsList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load durations list", e);
      }
    };
    const loadFundingsList = async () => {
      try {
        const res = await lookupApi('fundings').getPaginated(1, 1000);
        if (res && res.success) {
          setAllFundingsList(res.data || []);
        }
      } catch (e) {
        console.error("Failed to load fundings list", e);
      }
    };
    loadCoursesList();
    loadLocationsList();
    loadSubjectsList();
    loadQualificationsList();
    loadModesList();
    loadDurationsList();
    loadFundingsList();

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
            modeType: normalizeIdArray(course.modeType),
            subjects: normalizeIdArray(course.subjects),
            qualifications: normalizeIdArray(course.qualifications),
            durations: normalizeIdArray(course.durations),
            fundings: normalizeIdArray(course.fundings),
            status: course.status !== false,
            courseCms: course.courseCms || null
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
    const val = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      title: val,
      slug: slugify(val)
    }));
  };

  const handleCmsTextChange = (section: string, key: string, value: string | boolean | null) => {
    setFormData((prev: any) => {
      const updatedCms = { ...(prev.courseCms || {}) };
      if (section) {
        updatedCms[section] = {
          ...(updatedCms[section] || {}),
          [key]: value
        };
      } else {
        updatedCms[key] = value;
      }
      return { ...prev, courseCms: updatedCms };
    });
  };

  const handleAddCmsArrayItem = (section: string, arrayField: string, defaultObj: any) => {
    setFormData((prev: any) => {
      const updatedCms = { ...(prev.courseCms || {}) };
      const sectionData = { ...(updatedCms[section] || {}) };
      const currentList = Array.isArray(sectionData[arrayField]) ? [...sectionData[arrayField]] : [];
      currentList.push(defaultObj);
      sectionData[arrayField] = currentList;
      updatedCms[section] = sectionData;
      return { ...prev, courseCms: updatedCms };
    });
  };

  const handleRemoveCmsArrayItem = (section: string, arrayField: string, index: number) => {
    setFormData((prev: any) => {
      const updatedCms = { ...(prev.courseCms || {}) };
      const sectionData = { ...(updatedCms[section] || {}) };
      const currentList = Array.isArray(sectionData[arrayField]) ? [...sectionData[arrayField]] : [];
      currentList.splice(index, 1);
      sectionData[arrayField] = currentList;
      updatedCms[section] = sectionData;
      return { ...prev, courseCms: updatedCms };
    });
  };

  const handleCmsArrayItemChange = (section: string, arrayField: string, index: number, key: string, value: any) => {
    setFormData((prev: any) => {
      const updatedCms = { ...(prev.courseCms || {}) };
      const sectionData = { ...(updatedCms[section] || {}) };
      const currentList = Array.isArray(sectionData[arrayField]) ? [...sectionData[arrayField]] : [];
      if (currentList[index]) {
        currentList[index] = { ...currentList[index], [key]: value };
      }
      sectionData[arrayField] = currentList;
      updatedCms[section] = sectionData;
      return { ...prev, courseCms: updatedCms };
    });
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

  const handleRelationToggle = (field: 'availableCourses' | 'relatedCourses' | 'locations' | 'modeType' | 'subjects' | 'qualifications' | 'durations' | 'fundings', courseId: string) => {
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

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Title is required!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.warning("Slug is required!");
      return;
    }
    if (!formData.courseType) {
      toast.warning("Course Type is required!");
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
        modeType: formData.modeType,
        subjects: formData.subjects || [],
        qualifications: formData.qualifications || [],
        durations: formData.durations || [],
        fundings: formData.fundings || [],
        status: formData.status,
        courseCms: formData.courseCms
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
      const apiUrl = config.apiUrl;
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
      <div className="admin-page-loader">
        <div className="loader-content">
          <img src="/ystudy-logo.png" alt="YStudy Logo" className="loader-logo animate-pulse" />
          <div className="loader-spinner"></div>
        </div>
      </div>
    );
  }

  // Empty space or clean placeholder for unused filters

  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      <form onSubmit={handleSave} id="course-form">
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
              type="button"
              onClick={() => navigate('/courses')}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="submit"
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
          <div className="tabs" style={{ width: '100%', alignSelf: 'flex-start' }}>
            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
              style={{ border: 0 }}
            >
              General Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('badges')}
              className={`tab-btn ${activeTab === 'badges' ? 'active' : ''}`}
              style={{ border: 0 }}
            >
              Badges & Salary
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('relations')}
              className={`tab-btn ${activeTab === 'relations' ? 'active' : ''}`}
              style={{ border: 0 }}
            >
              Relations
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('cms')}
              className={`tab-btn ${activeTab === 'cms' ? 'active' : ''}`}
              style={{ border: 0 }}
            >
              CMS Page sections
            </button>
          </div>

          {/* Tab 1: General Info */}
          {activeTab === 'general' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Visibility Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '300px', marginTop: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Visibility Status</label>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, status: !formData.status })}
                  className={formData.status ? "btn-primary" : "btn-secondary"}
                  style={{
                    width: '100%',
                    height: '42px',
                    background: formData.status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.05)',
                    color: formData.status ? '#10b981' : '#f43f5e',
                    border: formData.status ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(244, 63, 94, 0.15)',
                    fontWeight: 600
                  }}
                >
                  {formData.status ? "● Active / Visible" : "○ Inactive / Hidden"}
                </button>
              </div>

              <div className="responsive-form-grid">
                <Input
                  label="Course Title *"
                  placeholder="e.g. Master of Business Administration (MBA)"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                />
                <Input
                  label="Course Slug *"
                  placeholder="e.g. master-of-business-administration"
                  value={formData.slug}
                  onChange={(e) => {
                    setFormData((prev: any) => ({ ...prev, slug: e.target.value }));
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Type *</label>
                <select
                  className="form-input"
                  value={formData.courseType || 'General'}
                  onChange={e => setFormData({ ...formData, courseType: e.target.value })}
                  style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  required
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

              <MultiSelectDropdown
                label="Locations Availability"
                description="Select locations where this course study path is active."
                placeholder="Choose locations..."
                options={allLocationsList}
                selectedIds={formData.locations}
                onChange={(locationId) => handleRelationToggle('locations', locationId)}
              />

              <MultiSelectDropdown
                label="Subjects Association"
                description="Select subjects linked to this course."
                placeholder="Choose subjects..."
                options={allSubjectsList}
                selectedIds={formData.subjects || []}
                onChange={(subjectId) => handleRelationToggle('subjects', subjectId)}
              />

              <MultiSelectDropdown
                label="Qualifications Link"
                description="Select qualifications linked to this course."
                placeholder="Choose qualifications..."
                options={allQualificationsList}
                selectedIds={formData.qualifications || []}
                onChange={(qualificationId) => handleRelationToggle('qualifications', qualificationId)}
              />

              <MultiSelectDropdown
                label="Study Modes Link"
                description="Select learning modes linked to this course."
                placeholder="Choose study modes..."
                options={allModesList}
                selectedIds={formData.modeType || []}
                onChange={(modeId) => handleRelationToggle('modeType', modeId)}
              />

              <MultiSelectDropdown
                label="Durations Link"
                description="Select durations linked to this course."
                placeholder="Choose durations..."
                options={allDurationsList}
                selectedIds={formData.durations || []}
                onChange={(durationId) => handleRelationToggle('durations', durationId)}
              />

              <MultiSelectDropdown
                label="Fundings Link"
                description="Select fundings linked to this course."
                placeholder="Choose fundings..."
                options={allFundingsList}
                selectedIds={formData.fundings || []}
                onChange={(fundingId) => handleRelationToggle('fundings', fundingId)}
              />
            </div>
          )}

          {/* Tab 4: CMS Page sections */}
          {activeTab === 'cms' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', margin: 0 }}>
                Course Page CMS Configuration
              </h3>

              {/* kicker and bannerStyle */}
              <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Hero Badge / Kicker</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. High Demand, Popular Course"
                    value={formData.courseCms?.kicker || ''}
                    onChange={(e) => handleCmsTextChange('', 'kicker', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Hero Banner Overlay Style</label>
                  <select
                    className="form-input"
                    value={formData.courseCms?.bannerStyle || 'blue'}
                    onChange={(e) => handleCmsTextChange('', 'bannerStyle', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  >
                    <option value="blue" style={{ background: '#0b0f19' }}>Blue Glass Overlay (Default)</option>
                    <option value="black" style={{ background: '#0b0f19' }}>Black Glass Overlay</option>
                    <option value="white" style={{ background: '#0b0f19' }}>White Layout (No glass/image overlay)</option>
                  </select>
                </div>
              </div>

              {/* Section 2: Introduction */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1rem' }}>
                  Section 2: Hero Introduction Block
                </h4>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Section Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Introduction"
                      value={formData.courseCms?.section_2?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_2', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section Title</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Flexible route..."
                      value={formData.courseCms?.section_2?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_2', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Section Description</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Provide introduction description..."
                    value={formData.courseCms?.section_2?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_2', 'description', e.target.value)}
                    style={{ minHeight: '80px', width: '100%', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.6rem' }}
                  />
                </div>
              </div>

              {/* Section 3: Overview */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 3: Course Overview Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_3?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_3', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_3?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_3', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_3?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_3', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.courseCms?.section_3?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_3', 'description', e.target.value)}
                    style={{ minHeight: '80px', width: '100%', background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)', borderRadius: '8px', padding: '0.6rem' }}
                  />
                </div>

                {/* Cards repeatable */}
                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Overview Cards</h5>
                    <button
                      type="button"
                      onClick={() => handleAddCmsArrayItem('section_3', 'cards', { icon: '🎯', title: '', description: '' })}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Add Card
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(formData.courseCms?.section_3?.cards || []).map((card: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '12px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveCmsArrayItem('section_3', 'cards', idx)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Icon</label>
                            <input
                              type="text"
                              className="form-input"
                              value={card.icon || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_3', 'cards', idx, 'icon', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Title</label>
                            <input
                              type="text"
                              className="form-input"
                              value={card.title || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_3', 'cards', idx, 'title', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="form-group" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: '0.75rem' }}>Description</label>
                          <textarea
                            className="form-textarea"
                            value={card.description || ''}
                            onChange={(e) => handleCmsArrayItemChange('section_3', 'cards', idx, 'description', e.target.value)}
                            style={{ minHeight: '60px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tiles repeatable */}
                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Metric Tiles (Match score, flexibility, etc.)</h5>
                    <button
                      type="button"
                      onClick={() => handleAddCmsArrayItem('section_3', 'tiles', { value: '', label: '' })}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Add Tile
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {(formData.courseCms?.section_3?.tiles || []).map((tile: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '12px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveCmsArrayItem('section_3', 'tiles', idx)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '10px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Value</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. 98%"
                              value={tile.value || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_3', 'tiles', idx, 'value', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Label</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="e.g. Match score"
                              value={tile.label || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_3', 'tiles', idx, 'label', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Careers outcomes */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 4: Career Outcomes Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_4?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_4', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_4?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_4', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_4?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_4', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_4?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_4', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>
              </div>

              {/* Section 5: Student Finance */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 5: Student Finance Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_5?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_5', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_5?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_5', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_5?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_5', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Total Support Amount (Large display)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. £23,925"
                      value={formData.courseCms?.section_5?.totalSupport || ''}
                      onChange={(e) => handleCmsTextChange('section_5', 'totalSupport', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_5?.description || ''}
                      onChange={(e) => handleCmsTextChange('section_5', 'description', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>

                {/* Tiles repeatable */}
                <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', margin: 0 }}>Finance Components</h5>
                    <button
                      type="button"
                      onClick={() => handleAddCmsArrayItem('section_5', 'tiles', { value: '', label: '' })}
                      className="btn-secondary"
                      style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Add Tile
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {(formData.courseCms?.section_5?.tiles || []).map((tile: any, idx: number) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--panel-border)', padding: '1rem', borderRadius: '12px', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveCmsArrayItem('section_5', 'tiles', idx)}
                          style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                        >
                          <X size={14} />
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '10px' }}>
                          <div className="form-group">
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Value</label>
                            <input
                              type="text"
                              className="form-input"
                              value={tile.value || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_5', 'tiles', idx, 'value', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label" style={{ fontSize: '0.75rem' }}>Label</label>
                            <input
                              type="text"
                              className="form-input"
                              value={tile.label || ''}
                              onChange={(e) => handleCmsArrayItemChange('section_5', 'tiles', idx, 'label', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 6: Why Choose Course */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 6: Why Choose Course Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_6?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_6', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_6?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_6', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_6?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_6', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_6?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_6', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>
              </div>

              {/* Section 7: Study structure */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 7: Study Structure Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_7?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_7', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_7?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_7', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_7?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_7', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_7?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_7', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>

              </div>

              {/* Section 8: Study modes */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 8: Study Modes Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_8?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_8', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_8?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_8', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_8?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_8', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_8?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_8', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>
              </div>

              {/* Section 9: Student stories */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 9: Student Stories Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_9?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_9', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_9?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_9', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_9?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_9', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_9?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_9', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>
              </div>

              {/* Section 10: Entry requirements */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 10: Entry Requirements Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_10?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_10', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_10?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_10', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_10?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_10', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_10?.description || ''}
                      onChange={(e) => handleCmsTextChange('section_10', 'description', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Featured Comparison Course Link</label>
                    <select
                      className="form-input"
                      value={formData.courseCms?.section_10?.featured_course || ''}
                      onChange={(e) => handleCmsTextChange('section_10', 'featured_course', e.target.value || null)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    >
                      <option value="">None / Select course...</option>
                      {allCoursesList.map(c => (
                        <option key={c._id} value={c._id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 11: Upcoming intakes */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 11: Upcoming Intakes Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_11?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_11', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_11?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_11', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_11?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_11', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.courseCms?.section_11?.description || ''}
                    onChange={(e) => handleCmsTextChange('section_11', 'description', e.target.value)}
                    style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                  />
                </div>
              </div>

              {/* Section 12: Application toolkit */}
              <div style={{ background: 'rgba(255, 255, 255, 0.01)', border: '1px solid var(--panel-border)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', margin: 0 }}>
                    Section 12: Application Toolkit Block
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.courseCms?.section_12?.status !== false}
                      onChange={(e) => handleCmsTextChange('section_12', 'status', e.target.checked)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enabled</span>
                  </label>
                </div>
                <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Badge</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_12?.badge || ''}
                      onChange={(e) => handleCmsTextChange('section_12', 'badge', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_12?.title || ''}
                      onChange={(e) => handleCmsTextChange('section_12', 'title', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.courseCms?.section_12?.description || ''}
                      onChange={(e) => handleCmsTextChange('section_12', 'description', e.target.value)}
                      style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-primary)', border: '1px solid var(--panel-border)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </form>

      {/* Media Picker Modal Overlay */}
      {(isMediaPickerOpen || cmsMediaPickerTarget) && (
        <MediaPickerModal
          onClose={() => {
            setIsMediaPickerOpen(false);
            setCmsMediaPickerTarget(null);
          }}
          onSelect={(mediaId, filePath) => {
            if (cmsMediaPickerTarget) {
              const { section, arrayField, index, key } = cmsMediaPickerTarget;
              handleCmsArrayItemChange(section, arrayField, index, key, filePath);
              setCmsMediaPickerTarget(null);
            } else {
              setFormData((prev: any) => ({
                ...prev,
                image: mediaId,
                imageUrl: filePath,
                fullImageUrl: '' // Clear fullUrl so custom path resolves
              }));
              setIsMediaPickerOpen(false);
            }
          }}
        />
      )}
    </div>
  );
};

export default CourseAdminPanel;
