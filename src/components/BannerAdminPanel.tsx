import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bannerApi } from "../utils/bannerApi";
import { MediaPickerModal } from "./MediaPickerModal";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Image } from "lucide-react";
import "./BannerAdminPanel.css";
import config from "../config";
import api from "../utils/api";
import { decrypt } from "../utils/crypto";
import { SearchableSelect } from "./SearchableSelect";
import Input from "./Input";
import Textarea from "./Textarea";

const Select = ({
  label,
  options,
  value,
  onChange
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value || ""} onChange={onChange}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

// Helper functions for color parsing
const parseColorAndOpacity = (colorStr: string) => {
  const defaultVal = { hex: "#000000", opacity: 0.5 };
  if (!colorStr) return defaultVal;

  const trimmed = colorStr.trim().toLowerCase();

  // Try to match rgba(r, g, b, a)
  const rgbaMatch = trimmed.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (rgbaMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbaMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbaMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbaMatch[3], 10)));
    const a = Math.min(1, Math.max(0, parseFloat(rgbaMatch[4])));
    const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return { hex, opacity: a };
  }

  // Try to match rgb(r, g, b)
  const rgbMatch = trimmed.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
    return { hex, opacity: 1.0 };
  }

  // Try to match hex colors: #rgb, #rgba, #rrggbb, #rrggbbaa
  if (trimmed.startsWith("#")) {
    const hexOnly = trimmed.substring(1);
    if (hexOnly.length === 3) {
      const r = hexOnly[0];
      const g = hexOnly[1];
      const b = hexOnly[2];
      return { hex: `#${r}${r}${g}${g}${b}${b}`, opacity: 1.0 };
    }
    if (hexOnly.length === 4) {
      const r = hexOnly[0];
      const g = hexOnly[1];
      const b = hexOnly[2];
      const a = hexOnly[3];
      const alphaVal = parseInt(a + a, 16) / 255;
      return { hex: `#${r}${r}${g}${g}${b}${b}`, opacity: parseFloat(alphaVal.toFixed(2)) };
    }
    if (hexOnly.length === 6) {
      return { hex: trimmed, opacity: 1.0 };
    }
    if (hexOnly.length === 8) {
      const hex = "#" + hexOnly.substring(0, 6);
      const alphaVal = parseInt(hexOnly.substring(6, 8), 16) / 255;
      return { hex, opacity: parseFloat(alphaVal.toFixed(2)) };
    }
  }

  return defaultVal;
};

const hexToRgb = (hex: string) => {
  let c = hex.substring(1);
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return { r, g, b };
};

// Helper to resolve the correct URL for preview dynamically
const getPreviewBgUrl = (imageUrl: string, fullImageUrl: string) => {
  if (fullImageUrl) {
    return fullImageUrl;
  }
  if (imageUrl) {
    if (imageUrl.startsWith("http") || imageUrl.startsWith("blob:")) {
      return imageUrl;
    }

    // Dynamically extract host from VITE_API_URL (e.g. http://localhost:4000/api -> http://localhost:4000)
    const apiUrl = config.apiUrl;
    const hostUrl = apiUrl.replace(/\/api$/, "");

    const cleanPath = imageUrl.replace(/^\/+/, "");

    if (cleanPath.startsWith("uploads/")) {
      return `${hostUrl}/${cleanPath}`;
    }
    if (cleanPath.startsWith("media/")) {
      return `${hostUrl}/${cleanPath}`;
    }
    return `${hostUrl}/media/uploads/${cleanPath}`;
  }
  return "";
};

const BannerAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"general" | "left" | "right">("general");
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    internalName: "",
    background: { imageUrl: "", fullImageUrl: "", bgColor: "" },
    leftContent: {
      title: "Find a degree that builds your bright future.",
      description: "Compare courses, Student Finance and flexible study routes before you apply.",
      badgeText: "FREE GUIDANCE FOR WORKING ADULTS",
      footerItems: []
    },
    rightCard: {
      layoutType: "stacked-cards",
      title: "Snapshot",
      description: "",
      mainValue: "~£23,925",
      items: [
        { title: "Free guidance", subtitle: "", description: "Get professional support", value: "", icon: "" },
        { title: "Funding check", subtitle: "", description: "Check finance options", value: "", icon: "" }
      ]
    }
  });

  const [slugsList, setSlugsList] = useState<any[]>([]);

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
      const fetchBanner = async () => {
        try {
          const banner = await bannerApi.getById(id);
          setFormData({
            internalName: banner.internalName || "",
            background: {
              imageUrl: banner.background?.imageUrl || "",
              fullImageUrl: banner.fullImageUrl || banner.background?.fullImageUrl || "",
              bgColor: banner.background?.bgColor || ""
            },
            leftContent: banner.leftContent || { title: "", description: "", badgeText: "", footerItems: [] },
            rightCard: {
              layoutType: banner.rightCard?.layoutType || "stacked-cards",
              title: banner.rightCard?.title || "",
              description: banner.rightCard?.description || "",
              mainValue: banner.rightCard?.mainValue || "",
              items: banner.rightCard?.items || []
            }
          });
        } catch (e) {
          console.error("Failed to fetch banner", e);
          toast.error("Failed to load banner details.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchBanner();
    }
  }, [id]);

  const bgUrl = useMemo(
    () => getPreviewBgUrl(formData.background.imageUrl, formData.background.fullImageUrl),
    [formData.background.imageUrl, formData.background.fullImageUrl]
  );
  const parsedColor = useMemo(() => parseColorAndOpacity(formData.background.bgColor), [formData.background.bgColor]);

  const updateBackground = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, background: { ...prev.background, [key]: value } }));
  };

  const updateColorFromParts = (newHex: string, newOpacity: number) => {
    const { r, g, b } = hexToRgb(newHex);
    const newBgColor = `rgba(${r}, ${g}, ${b}, ${newOpacity})`;
    updateBackground("bgColor", newBgColor);
  };

  const updateLeftContent = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, leftContent: { ...prev.leftContent, [key]: value } }));
  };

  const updateRightCard = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, rightCard: { ...prev.rightCard, [key]: value } }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      rightCard: {
        ...prev.rightCard,
        items: [...prev.rightCard.items, { title: "New Item", subtitle: "", description: "", value: "", icon: "" }]
      }
    }));
  };

  const updateItem = (index: number, key: string, value: string) => {
    const newItems = [...formData.rightCard.items];
    newItems[index] = { ...newItems[index], [key]: value };
    setFormData((prev) => ({ ...prev, rightCard: { ...prev.rightCard, items: newItems } }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.rightCard.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, rightCard: { ...prev.rightCard, items: newItems } }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.internalName || !formData.internalName.trim()) {
      toast.warning("Internal Banner Name is required!");
      return;
    }
    try {
      let res;
      if (id) {
        res = await bannerApi.update(id, formData);
      } else {
        res = await bannerApi.create(formData);
      }
      if (res.success) {
        toast.success("Banner saved successfully!");
        navigate("/banners");
      } else {
        toast.error("Failed to save banner: " + res.message);
      }
    } catch (e: any) {
      console.error("Failed to save banner", e);
      toast.error("Error saving banner: " + (e.message || "Check console for details."));
    }
  };

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

  const hasLeft = !!(formData.leftContent.title || formData.leftContent.description || formData.leftContent.badgeText);
  const hasRight = formData.rightCard.layoutType !== "none";

  return (
    <div className="banner-admin-wrapper animate-fade-in">
      <div className="banner-admin-container">
        {/* Configuration Form (Left Pane) */}
        <form onSubmit={handleSave} className="form-section">
          <div className="form-header">
            <div>
              <h2 className="form-title">{id ? "Edit Banner" : "Banner Builder"}</h2>
              <p className="form-subtitle">Customize headline details and layout settings.</p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                onClick={() => navigate("/banners")}
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
                Save
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs-container">
            <div className="tabs">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`tab-btn ${activeTab === "general" ? "active" : ""}`}
              >
                Background
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("left")}
                className={`tab-btn ${activeTab === "left" ? "active" : ""}`}
              >
                Headline Text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("right")}
                className={`tab-btn ${activeTab === "right" ? "active" : ""}`}
              >
                Right Card Settings
              </button>
            </div>
          </div>

          <div className="form-content">
            {/* Tab 1: Background */}
            {activeTab === "general" && (
              <div className="animate-fade-in">
                <SearchableSelect
                  label="Internal Banner Name *"
                  value={formData.internalName}
                  onChange={(selectedSlug) => {
                    setFormData({ ...formData, internalName: selectedSlug });
                  }}
                  options={slugsList.map((item) => ({
                    value: item.slug,
                    label: `${item.name} (${item.slug}) — ${item.type}`
                  }))}
                  placeholder="Select associated page or course slug..."
                  required
                />

                <div style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>
                    Background Image
                  </label>
                  {formData.background.imageUrl ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        background: "rgba(255, 255, 255, 0.02)",
                        padding: "0.75rem",
                        borderRadius: "10px",
                        border: "1px solid var(--panel-border)"
                      }}
                    >
                      <img
                        src={bgUrl}
                        alt="Background Preview"
                        style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px" }}
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
                          {formData.background.imageUrl.split("/").pop()}
                        </p>
                        <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {formData.background.imageUrl}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="btn-secondary"
                        style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsMediaPickerOpen(true)}
                      className="btn-secondary"
                      style={{
                        width: "100%",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                        border: "1px dashed var(--panel-border)",
                        borderRadius: "10px",
                        background: "rgba(255,255,255,0.01)"
                      }}
                    >
                      <Image size={24} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Select Media Asset</span>
                    </button>
                  )}
                </div>

                <Input
                  label="Fallback Image URL (Full URL)"
                  placeholder="e.g., https://site.com/fallback.jpg"
                  value={formData.background.fullImageUrl || ""}
                  onChange={(e) => updateBackground("fullImageUrl", e.target.value)}
                />

                <div style={{ marginBottom: "24px" }}>
                  <label className="form-label" style={{ display: "block", marginBottom: "8px" }}>
                    Background Overlay Color
                  </label>

                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <input
                        type="color"
                        value={parsedColor.hex}
                        onChange={(e) => updateColorFromParts(e.target.value, parsedColor.opacity)}
                        style={{
                          width: "42px",
                          height: "42px",
                          padding: 0,
                          border: "1px solid var(--panel-border)",
                          borderRadius: "10px",
                          background: "transparent",
                          cursor: "pointer",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., rgba(11, 15, 25, 0.7) or #ea580c80"
                        value={formData.background.bgColor || ""}
                        onChange={(e) => updateBackground("bgColor", e.target.value)}
                        style={{ width: "100%", height: "42px", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      background: "rgba(255, 255, 255, 0.02)",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      border: "1px solid var(--panel-border)"
                    }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                          Overlay Opacity
                        </span>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
                          {Math.round(parsedColor.opacity * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={parsedColor.opacity}
                        onChange={(e) => updateColorFromParts(parsedColor.hex, parseFloat(e.target.value))}
                        style={{
                          width: "100%",
                          height: "6px",
                          borderRadius: "3px",
                          outline: "none",
                          cursor: "pointer",
                          accentColor: "var(--primary)",
                          background: "rgba(255, 255, 255, 0.1)"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Media Picker Modal */}
            {isMediaPickerOpen && (
              <MediaPickerModal
                onClose={() => setIsMediaPickerOpen(false)}
                onSelect={(mediaId, filePath) => {
                  const apiUrl = config.apiUrl;
                  const hostUrl = apiUrl.replace(/\/api$/, "");
                  const cleanPath = filePath.replace(/^\/+/, "");
                  const resolvedUrl =
                    cleanPath.startsWith("uploads/") || cleanPath.startsWith("media/")
                      ? `${hostUrl}/${cleanPath}`
                      : `${hostUrl}/media/uploads/${cleanPath}`;

                  setFormData((prev) => ({
                    ...prev,
                    background: {
                      ...prev.background,
                      imageUrl: mediaId,
                      fullImageUrl: resolvedUrl
                    }
                  }));
                  setIsMediaPickerOpen(false);
                }}
              />
            )}

            {/* Tab 2: Left Content */}
            {activeTab === "left" && (
              <div className="animate-fade-in">
                <Input
                  label="Badge Tagline (Optional)"
                  placeholder="e.g., SPECIAL SCHEME"
                  value={formData.leftContent.badgeText}
                  onChange={(e) => updateLeftContent("badgeText", e.target.value)}
                />
                <Textarea
                  label="Primary Title"
                  placeholder="Enter the main title..."
                  value={formData.leftContent.title}
                  onChange={(e) => updateLeftContent("title", e.target.value)}
                />
                <Textarea
                  label="Supporting Description"
                  placeholder="Supporting text detail..."
                  value={formData.leftContent.description}
                  onChange={(e) => updateLeftContent("description", e.target.value)}
                />
              </div>
            )}

            {/* Tab 3: Right Card Settings */}
            {activeTab === "right" && (
              <div className="animate-fade-in">
                <Select
                  label="Card Layout Structure"
                  options={[
                    { label: "None (No Right Card)", value: "none" },
                    { label: "Stacked Cards (Headline & Description)", value: "stacked-cards" },
                    { label: "Match Result Card (Score & Match Stats)", value: "list-items" },
                    { label: "Highlight Stat Card (Huge Text & Sub Stats)", value: "stats-highlight" },
                    { label: "Grid 2x2 Layout", value: "grid-2x2" }
                  ]}
                  value={formData.rightCard.layoutType}
                  onChange={(e) => updateRightCard("layoutType", e.target.value)}
                />

                {formData.rightCard.layoutType === "none" ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px dashed var(--panel-border)",
                      borderRadius: "12px",
                      marginTop: "1.5rem"
                    }}
                  >
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      Right Card is disabled.
                    </p>
                    <p style={{ margin: "8px 0 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      The banner will only show the background and left headline content.
                    </p>
                  </div>
                ) : (
                  <>
                    <Input
                      label="Card Header Title"
                      placeholder="e.g., At a glance"
                      value={formData.rightCard.title}
                      onChange={(e) => updateRightCard("title", e.target.value)}
                    />

                    <Textarea
                      label="Card Header Description"
                      placeholder="e.g., Most adult learners choose by city..."
                      value={formData.rightCard.description || ""}
                      onChange={(e) => updateRightCard("description", e.target.value)}
                    />

                    {(formData.rightCard.layoutType === "stats-highlight" ||
                      formData.rightCard.layoutType === "list-items") && (
                      <Input
                        label="Stat Highlight Value"
                        placeholder="e.g., ~£23,925 or 96% match"
                        value={formData.rightCard.mainValue || ""}
                        onChange={(e) => updateRightCard("mainValue", e.target.value)}
                      />
                    )}

                    <div style={{ marginTop: "2rem" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1rem"
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            color: "var(--text-secondary)"
                          }}
                        >
                          Card Details List
                        </h4>
                        <button
                          type="button"
                          onClick={addItem}
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: "0.75rem", borderRadius: "6px" }}
                        >
                          + Add Item
                        </button>
                      </div>

                      {(formData.rightCard?.items || []).map((item, index) => (
                        <div key={index} className="card-item-container">
                          <div className="card-item-header">
                            <span className="card-item-label-muted">Card Item #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "var(--error)",
                                cursor: "pointer",
                                fontSize: "0.75rem",
                                fontWeight: 600
                              }}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="card-item-fields">
                            <div>
                              <label className="card-item-field">Title</label>
                              <input
                                type="text"
                                value={item.title}
                                onChange={(e) => updateItem(index, "title", e.target.value)}
                                className="form-input card-item-input"
                              />
                            </div>
                            {formData.rightCard.layoutType !== "list-items" && (
                              <div>
                                <label className="card-item-field">Subtitle</label>
                                <input
                                  type="text"
                                  value={item.subtitle || ""}
                                  onChange={(e) => updateItem(index, "subtitle", e.target.value)}
                                  className="form-input card-item-input"
                                />
                              </div>
                            )}
                          </div>

                          {["stats-highlight", "grid-2x2"].includes(formData.rightCard.layoutType) && (
                            <div style={{ marginBottom: "8px" }}>
                              <label className="card-item-field">Stat Value</label>
                              <input
                                type="text"
                                value={item.value || ""}
                                onChange={(e) => updateItem(index, "value", e.target.value)}
                                className="form-input card-item-input"
                              />
                            </div>
                          )}

                          {formData.rightCard.layoutType !== "stats-highlight" && (
                            <div>
                              <label className="card-item-field">Description</label>
                              <textarea
                                value={item.description || ""}
                                onChange={(e) => updateItem(index, "description", e.target.value)}
                                className="form-textarea card-item-textarea"
                              ></textarea>
                            </div>
                          )}
                        </div>
                      ))}

                      {(!formData.rightCard?.items || formData.rightCard.items.length === 0) && (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "2rem",
                            border: "1px dashed var(--panel-border)",
                            borderRadius: "10px",
                            color: "var(--text-muted)",
                            fontSize: "0.85rem"
                          }}
                        >
                          No items set up.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </form>

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
              backgroundSize: "cover", // Fills the div, crops if needed
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              height: !hasLeft && !hasRight ? "300px" : "480px"
            }}
          >
            {/* Ambient Dark Overlay to make headline readable */}
            <div
              className="banner-overlay"
              style={{
                backgroundColor: formData.background.bgColor || undefined
              }}
            ></div>

            {/* Main Content Layout */}
            <div
              className="banner-content-layout"
              style={{
                flexDirection: !hasLeft && !hasRight ? "row" : hasLeft && !hasRight ? "column" : undefined
              }}
            >
              {/* Left Content Area */}
              {hasLeft && (
                <div className="banner-left" style={{ flex: hasRight ? "1.2" : "1" }}>
                  {formData.leftContent.badgeText && (
                    <span className="banner-badge">{formData.leftContent.badgeText}</span>
                  )}

                  <h1 className="banner-title">{formData.leftContent.title || "Add main title headline..."}</h1>

                  <p className="banner-description">
                    {formData.leftContent.description || "Add supporting details here."}
                  </p>
                </div>
              )}

              {/* Right Card Area representing frontend mockup */}
              {hasRight && (
                <div className="banner-right">
                  {formData.rightCard.layoutType === "list-items" && formData.rightCard.items ? (
                    <div className="tlpanel">
                      <div className="tph">{formData.rightCard.title || "Sample result"}</div>
                      <div className="big">{formData.rightCard.mainValue || "96% match"}</div>
                      <div className="sub">
                        {formData.rightCard.description || "BA Business Management · SFE eligible"}
                      </div>
                      <div className="tlgrid">
                        {formData.rightCard.items.map((item, idx) => (
                          <div className="c" key={idx}>
                            <b>{item.value || item.title || "0%"}</b>
                            <span>{item.description || item.subtitle || item.title || ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="banner-card">
                      {/* Card Title rendered ONCE at the absolute top of the card for all layouts */}
                      <h3 className="card-title">{formData.rightCard.title || "Information Card"}</h3>
                      {formData.rightCard.description && (
                        <p
                          className="card-description"
                          style={{
                            fontSize: "0.9rem",
                            color: "#475569",
                            marginTop: "-0.75rem",
                            marginBottom: "1.25rem",
                            lineHeight: 1.4
                          }}
                        >
                          {formData.rightCard.description}
                        </p>
                      )}

                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {formData.rightCard.layoutType === "stacked-cards" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            {formData.rightCard.items.map((item, idx) => (
                              <div key={idx} style={{ color: "#0f172a" }}>
                                {item.subtitle && (
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      fontWeight: 800,
                                      color: "#f97316",
                                      textTransform: "uppercase",
                                      marginBottom: "4px",
                                      letterSpacing: "0.5px"
                                    }}
                                  >
                                    {item.subtitle}
                                  </div>
                                )}
                                <div
                                  style={{
                                    fontSize: "1.35rem",
                                    fontWeight: 800,
                                    marginBottom: "6px",
                                    lineHeight: 1.2,
                                    color: "#0f172a"
                                  }}
                                >
                                  {item.title || `Item ${idx + 1}`}
                                </div>
                                {item.description && (
                                  <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.4 }}>
                                    {item.description}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.rightCard.layoutType === "grid-2x2" && (
                          <div className="grid-2x2">
                            {formData.rightCard.items.map((item, idx) => (
                              <div
                                key={idx}
                                style={{
                                  background: "#f8fafc",
                                  border: "1px solid #e2e8f0",
                                  padding: "12px",
                                  borderRadius: "10px",
                                  color: "#0f172a"
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 800,
                                    color: "#4f46e5",
                                    marginBottom: "4px",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap"
                                  }}
                                >
                                  {item.title}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                                  {item.value || item.subtitle || "Stat..."}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {formData.rightCard.layoutType === "stats-highlight" && (
                          <div className="stats-card" style={{ padding: "16px 12px 12px" }}>
                            <div className="stats-label">Snapshot highlights</div>
                            <div className="stats-value">{formData.rightCard.mainValue || "~£0"}</div>
                            <div className="stats-grid">
                              {formData.rightCard.items.map((item, idx) => (
                                <div key={idx} className="stats-mini">
                                  <div
                                    style={{
                                      fontWeight: 800,
                                      fontSize: "0.95rem",
                                      color: "#0f172a",
                                      marginBottom: "2px"
                                    }}
                                  >
                                    {item.value || item.title || "£0"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.7rem",
                                      color: "#64748b",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    {item.subtitle || item.description || "Stat"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerAdminPanel;
