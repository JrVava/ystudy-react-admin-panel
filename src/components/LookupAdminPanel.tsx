import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lookupApi } from "../utils/lookupApi";
import { Save, ArrowLeft, BookOpen, Award, Layers, Clock, Coins, Image as ImageIcon, X, Plus } from "lucide-react";
import { toast } from "../context/ToastContext";
import { MediaPickerModal } from "./MediaPickerModal";
import config from "../config";
import Input from "./Input";
import Textarea from "./Textarea";

interface LookupAdminPanelProps {
  type: "subjects" | "qualifications" | "modes" | "durations" | "fundings";
}

const configByType = {
  subjects: { label: "Subject", icon: BookOpen, path: "/courses/subjects" },
  qualifications: { label: "Qualification", icon: Award, path: "/courses/qualifications" },
  modes: { label: "Study Mode", icon: Layers, path: "/courses/modes" },
  durations: { label: "Duration", icon: Clock, path: "/courses/durations" },
  fundings: { label: "Funding Option", icon: Coins, path: "/courses/fundings" }
};

export const LookupAdminPanel: React.FC<LookupAdminPanelProps> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const lookupConfig = configByType[type];
  const Icon = lookupConfig.icon;
  const api = lookupApi(type);

  const [isLoading, setIsLoading] = useState(!!id);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [newTagText, setNewTagText] = useState("");
  const [formData, setFormData] = useState<any>({
    title: "",
    status: true,
    badge: "",
    description: "",
    image: "",
    imageUrl: "",
    fullImageUrl: "",
    tags: [],
    salary: ""
  });

  const isRichLookup = type === "subjects" || type === "qualifications";

  useEffect(() => {
    if (id) {
      const fetchItem = async () => {
        try {
          const data = await api.getById(id);
          setFormData({
            title: data.title || "",
            status: data.status !== false,
            badge: data.badge || "",
            description: data.description || "",
            image: data.image || "",
            imageUrl: data.image && typeof data.image === "object" && data.image.filePath ? data.image.filePath : "",
            fullImageUrl: data.fullImageUrl || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            salary: data.salary || ""
          });
        } catch (e) {
          console.error(`Failed to fetch ${type}`, e);
          toast.error(`Failed to load details.`);
          navigate(lookupConfig.path);
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    } else {
      setFormData({
        title: "",
        status: true,
        badge: "",
        description: "",
        image: "",
        imageUrl: "",
        fullImageUrl: "",
        tags: [],
        salary: ""
      });
      setIsLoading(false);
    }
  }, [id, type, navigate, lookupConfig.path]);

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
      toast.warning("Title is required!");
      return;
    }

    try {
      setIsLoading(true);
      const payload: any = {
        title: formData.title.trim(),
        status: formData.status
      };

      if (isRichLookup) {
        payload.badge = formData.badge.trim();
        payload.description = formData.description.trim();
        payload.image = formData.image || null;
        payload.tags = formData.tags;
        if (type === "subjects") {
          payload.salary = formData.salary ? formData.salary.trim() : "";
        }
      }

      let res;
      if (id) {
        res = await api.update(id, payload);
      } else {
        res = await api.create(payload);
      }

      if (res.success || res.data?.success) {
        toast.success(
          id ? `${lookupConfig.label} updated successfully!` : `${lookupConfig.label} created successfully!`
        );
        navigate(lookupConfig.path);
      } else {
        toast.error("Failed to save: " + (res.message || "Unknown error"));
        setIsLoading(false);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error saving details: " + (e.response?.data?.message || e.message || "Check logs."));
      setIsLoading(false);
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
      <form onSubmit={handleSave} id="lookup-form">
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Icon size={28} style={{ color: "var(--primary)" }} />
              {id ? `Edit ${lookupConfig.label}` : `Create ${lookupConfig.label}`}
            </h1>
            <p className="page-subtitle">
              {id ? `Update detail parameters and status.` : `Add a new option parameter to the filter catalog.`}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => navigate(lookupConfig.path)}
              className="btn-secondary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem" }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button
              type="submit"
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.25rem" }}
            >
              <Save size={16} />
              Save {lookupConfig.label}
            </button>
          </div>
        </div>

        <div
          className="panel-glass"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <Input
            label="Title *"
            placeholder={`e.g. ${type === "subjects" ? "Computing" : type === "qualifications" ? "BSc" : "Details..."}`}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          {/* Render Rich Fields if Subjects or Qualifications */}
          {isRichLookup && (
            <>
              <Input
                label="Badge Label"
                placeholder="e.g. Popular, Support Available"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />

              {type === "subjects" && (
                <Input
                  label="Average Salary"
                  placeholder="e.g. £35,000"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              )}

              <Textarea
                label="Description"
                placeholder="Provide a detailed description of the lookup category..."
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
                        {formData.imageUrl ? formData.imageUrl.split("/").pop() : "Selected Image"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="btn-secondary"
                      style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                    >
                      Change Cover
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsMediaPickerOpen(true)}
                    className="btn-secondary"
                    style={{
                      width: "100%",
                      padding: "2.5rem 1.5rem",
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

              {/* Tags repeater array field */}
              <div className="form-group">
                <label className="form-label">Repeater Tags</label>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Free Financing, Evening Class, Supporting Matura"
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
                    style={{ display: "flex", alignItems: "center", padding: "0 1rem" }}
                  >
                    <Plus size={16} />
                    Add Tag
                  </button>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    background: "rgba(0,0,0,0.15)",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid var(--panel-border)",
                    minHeight: "52px",
                    alignItems: "center"
                  }}
                >
                  {formData.tags.length === 0 ? (
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", paddingLeft: "4px" }}>
                      No tags added yet. Type a tag and click Add.
                    </span>
                  ) : (
                    formData.tags.map((tag: string, i: number) => (
                      <span
                        key={i}
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
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            color: "var(--text-muted)"
                          }}
                        >
                          <X size={10} style={{ color: "var(--text-muted)" }} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "300px" }}>
            <label className="form-label" style={{ margin: 0 }}>
              Visibility Status
            </label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, status: !formData.status })}
              className={formData.status ? "btn-primary" : "btn-secondary"}
              style={{
                width: "100%",
                height: "42px",
                background: formData.status ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.05)",
                color: formData.status ? "#10b981" : "#f43f5e",
                border: formData.status ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(244, 63, 94, 0.15)",
                fontWeight: 600
              }}
            >
              {formData.status ? "● Active / Visible" : "○ Inactive / Hidden"}
            </button>
          </div>
        </div>
      </form>

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

export default LookupAdminPanel;
