import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { locationApi } from "../utils/locationApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Image, MapPin } from "lucide-react";
import { MediaPickerModal } from "./MediaPickerModal";
import config from "../config";
import api from "../utils/api";
import { decrypt } from "../utils/crypto";
import { SearchableSelect } from "./SearchableSelect";

import Input from "./Input";
import Textarea from "./Textarea";

export const LocationAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [isSlugAutoSynced, setIsSlugAutoSynced] = useState(!id);
  const [slugsList, setSlugsList] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    short_description: "",
    long_description: "",
    image: "", // MongoDB ID
    imageUrl: "", // File path (for preview)
    fullImageUrl: "", // Backend absolute URL
    status: true
  });

  useEffect(() => {
    const fetchSlugs = async () => {
      try {
        const res = await api.get("/navigations/allInOne");
        const decrypted = decrypt(res.data.data);
        if (decrypted && decrypted.success && decrypted.data) {
          setSlugsList(decrypted.data);
        }
      } catch (e) {
        console.error("Failed to load slugs list", e);
      }
    };
    fetchSlugs();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchLocation = async () => {
        try {
          const location = await locationApi.getById(id);
          setFormData({
            title: location.title || "",
            slug: location.slug || "",
            short_description: location.short_description || "",
            long_description: location.long_description || "",
            image: location.image || "",
            imageUrl: location.imageUrl || "",
            fullImageUrl: location.fullImageUrl || "",
            status: location.status !== false
          });
        } catch (e) {
          console.error("Failed to fetch location", e);
          toast.error("Failed to load location details.");
          navigate("/courses/locations");
        } finally {
          setIsLoading(false);
        }
      };
      fetchLocation();
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
    setFormData((prev: any) => {
      const updated = { ...prev, title: newTitle };
      if (isSlugAutoSynced) {
        updated.slug = slugify(newTitle);
      }
      return updated;
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

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        short_description: formData.short_description,
        long_description: formData.long_description,
        image: formData.image || null,
        status: formData.status
      };

      let res;
      if (id) {
        res = await locationApi.update(id, payload);
      } else {
        res = await locationApi.create(payload);
      }

      if (res.success || res.data?.success) {
        toast.success(id ? "Location updated successfully!" : "Location created successfully!");
        navigate("/courses/locations");
      } else {
        toast.error("Failed to save location: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error("Failed to save location", e);
      toast.error("Error saving location: " + (e.response?.data?.message || e.message || "Check logs."));
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
      <form onSubmit={handleSave} id="location-form">
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <MapPin size={28} style={{ color: "var(--primary)" }} />
              {id ? "Edit Location" : "Create Location"}
            </h1>
            <p className="page-subtitle">
              {id ? `Update campus title, description, and status.` : "Add a new campus site location to the portal."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => navigate("/courses/locations")}
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
              Save Location
            </button>
          </div>
        </div>

        <div
          className="panel-glass"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {/* Title and Slug */}
          <div className="responsive-form-grid">
            <Input
              label="Location Title *"
              placeholder="e.g. London Campus"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
            <SearchableSelect
              label="Location Slug *"
              value={formData.slug}
              onChange={(selectedSlug) => {
                setIsSlugAutoSynced(false);
                setFormData((prev: any) => ({ ...prev, slug: selectedSlug }));
              }}
              options={slugsList.map((item) => ({
                value: item.slug,
                label: `${item.name} (${item.slug}) — ${item.type}`
              }))}
              placeholder="Select associated page or course slug..."
              required
            />
          </div>

          {/* Image Selector */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label className="form-label">Location Cover Image</label>
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
                  alt="Location Cover"
                  style={{
                    width: "120px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    border: "1px solid var(--panel-border)"
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=300";
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
                <Image size={32} style={{ color: "var(--text-muted)" }} />
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Select Cover Image from Media Gallery
                </span>
              </button>
            )}
          </div>

          {/* Status selection */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxWidth: "300px" }}>
            <label className="form-label" style={{ margin: 0 }}>
              Location Status
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

          {/* Descriptions */}
          <Textarea
            label="Short Description"
            placeholder="Brief description of the campus site..."
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            minHeight="80px"
          />

          <Textarea
            label="Detailed Description"
            placeholder="Complete information about local facilities, courses, and access options..."
            value={formData.long_description}
            onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
            minHeight="180px"
          />
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
              fullImageUrl: "" // Clear fullUrl so custom path resolves
            }));
            setIsMediaPickerOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default LocationAdminPanel;
