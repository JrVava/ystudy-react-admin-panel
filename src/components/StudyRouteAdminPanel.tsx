import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studyRouteApi } from "../utils/studyRouteApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Route as RouteIcon } from "lucide-react";

import Input from "./Input";
import Textarea from "./Textarea";

export const StudyRouteAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [isSlugAutoSynced, setIsSlugAutoSynced] = useState(!id);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    link: "",
    status: true
  });

  useEffect(() => {
    if (id) {
      const fetchStudyRoute = async () => {
        try {
          setIsLoading(true);
          const data = await studyRouteApi.getById(id);
          if (data) {
            setFormData({
              title: data.title || "",
              slug: data.slug || "",
              description: data.description || "",
              link: data.link || "",
              status: data.status !== false
            });
          } else {
            toast.error("Study route details not found");
            navigate("/study-routes");
          }
        } catch (e: any) {
          console.error("Failed to load study route", e);
          toast.error(e.message || "Failed to load study route details.");
          navigate("/study-routes");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudyRoute();
    }
  }, [id, navigate]);

  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-"); // Replace multiple - with single -
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => {
      const updated = { ...prev, title: newTitle };
      if (isSlugAutoSynced) {
        updated.slug = slugify(newTitle);
      }
      return updated;
    });
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugAutoSynced(false);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.warning("Title is required!");
      return;
    }
    if (!formData.slug.trim()) {
      toast.warning("Slug is required!");
      return;
    }
    if (!formData.description.trim()) {
      toast.warning("Description is required!");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        link: formData.link.trim(),
        status: formData.status
      };

      let res;
      if (isEditMode && id) {
        res = await studyRouteApi.update(id, payload);
      } else {
        res = await studyRouteApi.create(payload);
      }

      if (res && (res.success || res.studyRouteId || res.message)) {
        toast.success(isEditMode ? "Study route updated successfully!" : "Study route created successfully!");
        navigate("/study-routes");
      } else {
        toast.error("Failed to save: " + (res?.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to save study route");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: "var(--text-secondary)" }}>
        <span>Loading study route details...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/study-routes")}
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
            <ArrowLeft size={14} /> Back to Study Routes
          </button>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <RouteIcon
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            {isEditMode ? "Edit Study Route" : "New Study Route"}
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? "Modify the details, link target, and settings of this study route."
              : "Create a new study pathway or course progression route."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
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
              Route Information
            </h3>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Route Title *"
                placeholder="e.g. Undergraduate Foundation Program"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />

              <Input
                label="URL Slug *"
                placeholder="e.g. undergraduate-foundation-program"
                value={formData.slug}
                onChange={handleSlugChange}
                required
              />
            </div>

            <Input
              label="Resource Link URL (Optional)"
              placeholder="e.g. /courses/foundation or https://external-link.com"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            />

            <Textarea
              label="Description *"
              placeholder="Enter comprehensive details and pathway overview for this study route..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              minHeight="140px"
              required
            />

            {/* Status Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1rem",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid var(--panel-border)",
                borderRadius: "10px",
                marginTop: "0.5rem"
              }}
            >
              <div>
                <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>Status</p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {formData.status
                    ? "Active and discoverable on website"
                    : "Inactive and hidden from student selection"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, status: !prev.status }))}
                style={{
                  position: "relative",
                  width: "44px",
                  height: "22px",
                  borderRadius: "999px",
                  border: "none",
                  cursor: "pointer",
                  background: formData.status ? "var(--primary)" : "rgba(255, 255, 255, 0.12)",
                  transition: "background 0.25s ease",
                  padding: 0,
                  flexShrink: 0
                }}
                aria-label={formData.status ? "Deactivate route" : "Activate route"}
              >
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    left: formData.status ? "23px" : "3px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#fff",
                    transition: "left 0.2s ease",
                    display: "block"
                  }}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => navigate("/study-routes")}
              className="btn-secondary"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={18} />
              {isSaving ? "Saving..." : isEditMode ? "Update Study Route" : "Create Study Route"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudyRouteAdminPanel;
