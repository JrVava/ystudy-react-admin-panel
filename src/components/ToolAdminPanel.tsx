import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toolApi } from "../utils/toolApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Wrench, Image } from "lucide-react";
import Input from "./Input";
import Textarea from "./Textarea";
import { MediaPickerModal } from "./MediaPickerModal";
import config from "../config";

export const ToolAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    time: "",
    link: "",
    mode: "free",
    image: "", // Media ID (ObjectId hex)
    imageUrl: "", // Resolved path for preview
    status: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchTool = async () => {
        try {
          setLoading(true);
          const data = await toolApi.getById(id);
          if (data) {
            setFormData({
              title: data.title || "",
              description: data.description || "",
              time: data.time || "",
              link: data.link || "",
              mode: data.mode || "free",
              image: data.image || "",
              imageUrl: data.fullImageUrl || "",
              status: data.status !== false
            });
          } else {
            toast.error("Tool details not found");
            navigate("/tools");
          }
        } catch (e: any) {
          console.error(e);
          toast.error(e.message || "Failed to load tool details");
          navigate("/tools");
        } finally {
          setLoading(false);
        }
      };
      fetchTool();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!formData.time.trim()) {
      toast.error("Time is required");
      return;
    }
    if (!formData.link.trim()) {
      toast.error("Resource Link is required");
      return;
    }
    if (!formData.image) {
      toast.error("Cover image is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        description: formData.description,
        time: formData.time,
        link: formData.link,
        mode: formData.mode,
        image: formData.image,
        status: formData.status
      };

      let res;
      if (isEditMode && id) {
        res = await toolApi.update(id, payload);
      } else {
        res = await toolApi.create(payload);
      }

      if (res.success) {
        toast.success(isEditMode ? "Updated successfully" : "Created successfully");
        navigate("/tools");
      } else {
        toast.error("Failed to save: " + res.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save tool");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Loading tool details...</span>
      </div>
    );
  }

  // Preview URL generator
  const currentPreviewUrl = formData.imageUrl
    ? formData.imageUrl.startsWith("http") || formData.imageUrl.startsWith("blob:")
      ? formData.imageUrl
      : `${config.apiUrl.replace(/\/api$/, "")}/${formData.imageUrl.replace(/^\/+/, "")}`
    : "";

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <button
            onClick={() => navigate("/tools")}
            className="btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              marginBottom: "1rem"
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Wrench size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            {isEditMode ? "Edit Tool" : "New Tool"}
          </h1>
          <p className="page-subtitle">
            {isEditMode ? "Modify details of the application helper tool." : "Add a new tool or helper module."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {/* Main Card */}
          <div
            className="panel-glass"
            style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <h3
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                margin: 0,
                borderBottom: "1px solid var(--panel-border)",
                paddingBottom: "0.5rem"
              }}
            >
              Tool Configurations
            </h3>

            <Input
              label="Tool Title *"
              placeholder="e.g. Personal Statement Builder"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Completion Time (e.g. 5 mins) *"
                placeholder="e.g. 10 mins"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                required
              />

              <div className="form-group">
                <label className="form-label">Access Mode *</label>
                <select
                  className="form-input"
                  value={formData.mode}
                  onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--panel-border)"
                  }}
                  required
                >
                  <option value="free" style={{ background: "#0b0f19" }}>
                    Free
                  </option>
                  <option value="paid" style={{ background: "#0b0f19" }}>
                    Paid
                  </option>
                </select>
              </div>
            </div>

            <Input
              label="Resource Link URL *"
              placeholder="e.g. /tools/personal-statement-builder or external link"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              required
            />

            {/* Image Selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label className="form-label">Cover Image *</label>
              {currentPreviewUrl ? (
                <div
                  style={{
                    position: "relative",
                    width: "200px",
                    height: "120px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid var(--panel-border)"
                  }}
                >
                  <img
                    src={currentPreviewUrl}
                    alt="Tool Cover"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: "", imageUrl: "" })}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      background: "rgba(0,0,0,0.6)",
                      border: "none",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "24px",
                      height: "24px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsMediaPickerOpen(true)}
                  style={{
                    width: "200px",
                    height: "120px",
                    border: "2px dashed var(--panel-border)",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.01)",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    color: "var(--text-secondary)"
                  }}
                >
                  <Image size={24} />
                  <span style={{ fontSize: "0.8rem" }}>Choose Image</span>
                </button>
              )}
            </div>

            <Textarea
              label="Description *"
              placeholder="Enter tool details and functions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />

            <div
              className="form-group"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}
            >
              <input
                type="checkbox"
                id="status"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="status" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                Active / Visible on website
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => navigate("/tools")} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Tool"}
            </button>
          </div>
        </div>
      </form>

      {/* Media Picker Overlay */}
      {isMediaPickerOpen && (
        <MediaPickerModal
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(mediaId, filePath) => {
            setFormData((prev: any) => ({
              ...prev,
              image: mediaId,
              imageUrl: filePath
            }));
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ToolAdminPanel;
