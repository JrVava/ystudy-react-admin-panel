import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lookupApi } from "../utils/lookupApi";
import { Save, ArrowLeft, BookOpen, Image as ImageIcon, X, Plus, Layers } from "lucide-react";
import { toast } from "../context/ToastContext";
import { MediaPickerModal } from "./MediaPickerModal";
import config from "../config";
import Input from "./Input";
import Textarea from "./Textarea";
import { SubjectCmsSections } from "./subject-cms/SubjectCmsSections";

const DEFAULT_CMS_DATA = {
  section_2: {
    badge: "Popular courses",
    title: "",
    description: "",
    status: true
  },
  section_3: {
    badge: "Why study this subject?",
    title: "",
    description: "",
    cards: [],
    status: true
  },
  section_4: {
    badge: "Career outcomes",
    title: "",
    cards: [],
    status: true
  },
  section_5: {
    badge: "Salary progression",
    title: "",
    description: "",
    cards: [],
    status: true
  },
  section_6: {
    cards: [],
    status: true
  },
  section_7: {
    badge: "Related subjects",
    title: "",
    status: true
  },
  section_8: {
    badge: "FAQ",
    title: "",
    status: true
  },
  section_9: {
    title: "",
    description: "",
    status: true
  },
  section_10: {
    cards: [],
    status: true
  },
  section_11: {
    title: "Useful next steps",
    description: "",
    cards: [],
    status: true
  }
};

export const SubjectAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = lookupApi("subjects");

  const [activeTab, setActiveTab] = useState<"general" | "cms">("general");
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    badge: "",
    description: "",
    salary: "",
    image: "",
    imageUrl: "",
    fullImageUrl: "",
    tags: [],
    status: true,
    cms: DEFAULT_CMS_DATA
  });

  useEffect(() => {
    if (id) {
      const fetchSubject = async () => {
        try {
          setIsLoading(true);
          const data = await api.getById(id);
          if (data) {
            setFormData({
              title: data.title || "",
              slug: data.slug || "",
              badge: data.badge || "",
              description: data.description || "",
              salary: data.salary || "",
              image: data.image || "",
              imageUrl: data.image && typeof data.image === "object" && data.image.filePath ? data.image.filePath : "",
              fullImageUrl: data.fullImageUrl || "",
              tags: Array.isArray(data.tags) ? data.tags : [],
              status: data.status !== false,
              cms: data.cms ? { ...DEFAULT_CMS_DATA, ...data.cms } : DEFAULT_CMS_DATA
            });
          }
        } catch (e) {
          console.error("Failed to fetch subject", e);
          toast.error("Failed to load subject details.");
          navigate("/courses/subjects");
        } finally {
          setIsLoading(false);
        }
      };
      fetchSubject();
    } else {
      setFormData({
        title: "",
        slug: "",
        badge: "",
        description: "",
        salary: "",
        image: "",
        imageUrl: "",
        fullImageUrl: "",
        tags: [],
        status: true,
        cms: DEFAULT_CMS_DATA
      });
      setIsLoading(false);
    }
  }, [id, navigate]);

  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev: any) => ({
      ...prev,
      title: val,
      slug: slugify(val)
    }));
  };

  const handleAddTag = () => {
    const tag = newTagText.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setNewTagText("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tagToRemove)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Subject Title is required!");
      return;
    }

    try {
      setIsSaving(true);
      const payload: any = {
        title: formData.title.trim(),
        slug: formData.slug || slugify(formData.title),
        badge: formData.badge.trim(),
        description: formData.description.trim(),
        salary: formData.salary.trim(),
        image: formData.image || null,
        tags: formData.tags,
        status: formData.status,
        cms: formData.cms
      };

      let res;
      if (id) {
        res = await api.update(id, payload);
      } else {
        res = await api.create(payload);
      }

      if (res.success || res.data?.success) {
        toast.success(id ? "Subject updated successfully!" : "Subject created successfully!");
        navigate("/courses/subjects");
      } else {
        toast.error("Failed to save: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error saving subject: " + (e.response?.data?.message || e.message || "Check logs."));
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewImageUrl = () => {
    if (formData.fullImageUrl) {
      return formData.fullImageUrl;
    }
    const path = formData.imageUrl;
    if (path) {
      if (path.startsWith("http") || path.startsWith("blob:")) {
        return path;
      }
      const apiUrl = config.apiUrl;
      const hostUrl = apiUrl.replace(/\/api$/, "");
      const cleanPath = path.replace(/^\/+/, "");
      if (cleanPath.startsWith("uploads/") || cleanPath.startsWith("media/")) {
        return `${hostUrl}/${cleanPath}`;
      }
      return `${hostUrl}/media/uploads/${cleanPath}`;
    }
    return "";
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

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <form onSubmit={handleSave} id="subject-form">
        {/* Page Header */}
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <BookOpen size={28} style={{ color: "var(--primary)" }} />
              {id ? "Edit Subject" : "Create Subject"}
            </h1>
            <p className="page-subtitle">
              {id
                ? "Update subject configuration, details, and frontend CMS section blocks."
                : "Add a new subject parameter with full CMS landing content."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => navigate("/courses/subjects")}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem" }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.25rem" }}
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Subject"}
            </button>
          </div>
        </div>

        {/* Panel Glass Box */}
        <div
          className="panel-glass"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Main Navigation Tabs */}
          <div className="tabs" style={{ width: "100%", alignSelf: "flex-start" }}>
            <button
              type="button"
              onClick={() => setActiveTab("general")}
              className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
              style={{ border: 0 }}
            >
              General Info
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("cms")}
              className={`tab-btn ${activeTab === "cms" ? "active" : ""}`}
              style={{ border: 0 }}
            >
              Subject CMS Sections
            </button>
          </div>

          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Visibility Status */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "300px" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Visibility Status
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <input
                    type="checkbox"
                    id="status-toggle"
                    checked={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="status-toggle"
                    style={{ cursor: "pointer", fontSize: "0.9rem", color: "var(--text-secondary)" }}
                  >
                    {formData.status ? "Active (Published)" : "Inactive (Hidden)"}
                  </label>
                </div>
              </div>

              {/* Title & Slug Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Title *"
                  placeholder="e.g. Health & Social Care"
                  value={formData.title}
                  onChange={handleTitleChange}
                  required
                />
                <Input
                  label="Slug"
                  placeholder="e.g. health-social-care"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              {/* Badge & Average Salary Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Input
                  label="Badge Label"
                  placeholder="e.g. Popular, High Demand"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                />
                <Input
                  label="Average Salary"
                  placeholder="e.g. £35,000 / year"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              {/* Description */}
              <Textarea
                label="Description"
                placeholder="Provide a detailed overview of the subject..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                minHeight="100px"
              />

              {/* Cover Image Selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label">Cover Image Asset</label>
                {currentPreviewUrl ? (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "1rem",
                      borderRadius: "12px",
                      border: "1px solid var(--panel-border)"
                    }}
                  >
                    <img
                      src={currentPreviewUrl}
                      alt="Cover Preview"
                      style={{
                        width: "120px",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid var(--panel-border)"
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300";
                      }}
                    />
                    <div style={{ flexGrow: 1, overflow: "hidden" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "var(--text-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {formData.imageUrl ? formData.imageUrl.split("/").pop() : "Selected Image Asset"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      Change Asset
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "", imageUrl: "", fullImageUrl: "" })}
                      className="btn-secondary"
                      style={{ padding: "0.5rem", color: "var(--error)" }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      padding: "2rem 1.5rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.75rem",
                      border: "1px dashed var(--panel-border)",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.01)"
                    }}
                  >
                    <ImageIcon size={32} style={{ color: "var(--text-muted)" }} />
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      Select Cover Image from Media Gallery
                    </span>
                  </button>
                )}
              </div>

              {/* Tags system */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="form-label">Subject Tags</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Type a tag name and click Add..."
                    value={newTagText}
                    onChange={(e) => setNewTagText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    style={{ flexGrow: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-secondary"
                    style={{ display: "flex", alignItems: "center", gap: "0.2rem", padding: "0.5rem 1rem" }}
                  >
                    <Plus size={16} /> Add Tag
                  </button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {formData.tags.length === 0 ? (
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                      No tags added yet.
                    </span>
                  ) : (
                    formData.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        style={{
                          background: "rgba(99, 102, 241, 0.15)",
                          border: "1px solid rgba(99, 102, 241, 0.3)",
                          color: "var(--text-primary)",
                          padding: "4px 10px",
                          borderRadius: "99px",
                          fontSize: "0.8rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "var(--text-secondary)",
                            cursor: "pointer",
                            padding: 0,
                            display: "flex",
                            alignItems: "center"
                          }}
                        >
                          <X size={12} style={{ color: "var(--text-muted)" }} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Subject CMS */}
          {activeTab === "cms" && <SubjectCmsSections formData={formData} setFormData={setFormData} />}
        </div>
      </form>

      {/* Media Picker Modal */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(mediaId, filePath) => {
            setFormData((prev: any) => ({
              ...prev,
              image: mediaId,
              imageUrl: filePath,
              fullImageUrl: ""
            }));
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default SubjectAdminPanel;
