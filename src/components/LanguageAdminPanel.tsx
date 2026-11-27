import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { languageApi, type LanguageInput } from "../utils/languageApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Globe, AlertCircle } from "lucide-react";

export const LanguageAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    nativeName: string;
    direction: "ltr" | "rtl";
    isDefault: boolean;
    status: boolean;
  }>({
    name: "",
    code: "",
    nativeName: "",
    direction: "ltr",
    isDefault: false,
    status: true
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate ISO code from first 2 letters of Language Name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    const autoCode = newName
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 2)
      .toLowerCase();
    setFormData((prev) => ({
      ...prev,
      name: newName,
      code: autoCode
    }));
  };

  useEffect(() => {
    if (isEditMode && id) {
      const fetchLanguage = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await languageApi.getById(id);
          if (data) {
            setFormData({
              name: data.name || "",
              code: data.code || "",
              nativeName: data.nativeName || "",
              direction: data.direction || "ltr",
              isDefault: Boolean(data.isDefault),
              status: data.status !== false
            });
          } else {
            toast.error("Language not found");
            navigate("/languages");
          }
        } catch (err: any) {
          console.error("Failed to load language details", err);
          setError(err.message || "Failed to load language details");
          toast.error(err.message || "Failed to load language details");
        } finally {
          setLoading(false);
        }
      };
      fetchLanguage();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Language name is required");
      toast.error("Language name is required");
      return;
    }
    if (!formData.code.trim()) {
      setError("Language code is required");
      toast.error("Language code is required");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: LanguageInput = {
        name: formData.name.trim(),
        code: formData.code.trim().toLowerCase(),
        nativeName: formData.nativeName.trim() || undefined,
        direction: formData.direction,
        isDefault: formData.isDefault,
        status: formData.status
      };

      if (isEditMode && id) {
        const res = await languageApi.update(id, payload);
        if (res && res.success) {
          toast.success("Language updated successfully");
          navigate("/languages");
        } else {
          setError(res?.message || "Failed to update language");
          toast.error(res?.message || "Failed to update language");
        }
      } else {
        const res = await languageApi.add(payload);
        if (res && res.success) {
          toast.success("Language created successfully");
          navigate("/languages");
        } else {
          setError(res?.message || "Failed to create language");
          toast.error(res?.message || "Failed to create language");
        }
      }
    } catch (err: any) {
      console.error("Save language error", err);
      setError(err.message || "An error occurred while saving");
      toast.error(err.message || "Failed to save language");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Loading language details...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <button
            type="button"
            onClick={() => navigate("/languages")}
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
            <ArrowLeft size={14} /> Back to Languages
          </button>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Globe size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            {isEditMode ? "Edit Language" : "New Language"}
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? `Update configurations and translation details for ${formData.name || "this language"}.`
              : "Register a new locale with ISO code, native name, and text direction."}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            color: "#f43f5e",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit}>
        <div
          className="panel-glass"
          style={{ padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              margin: 0,
              borderBottom: "1px solid var(--panel-border)",
              paddingBottom: "0.75rem",
              color: "var(--text-primary)"
            }}
          >
            Language Details
          </h3>

          {/* Language Name */}
          <div className="form-group">
            <label className="form-label">
              Language Name <span style={{ color: "var(--error)" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={handleNameChange}
              placeholder="e.g. English, French, Arabic"
              className="form-input"
            />
          </div>

          {/* ISO Code & Text Direction Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">
                ISO Code <span style={{ color: "var(--error)" }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().trim() })}
                placeholder="e.g. en, fr, ar"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Text Direction</label>
              <select
                value={formData.direction}
                onChange={(e) => setFormData({ ...formData, direction: e.target.value as "ltr" | "rtl" })}
                className="form-select"
              >
                <option value="ltr">Left to Right (LTR)</option>
                <option value="rtl">Right to Left (RTL)</option>
              </select>
            </div>
          </div>

          {/* Native Name */}
          <div className="form-group">
            <label className="form-label">Native Name (Optional)</label>
            <input
              type="text"
              value={formData.nativeName}
              onChange={(e) => setFormData({ ...formData, nativeName: e.target.value })}
              placeholder="e.g. Français, Español, العربية"
              className="form-input"
            />
          </div>

          {/* Settings / Switches */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              padding: "1.25rem",
              borderRadius: "12px",
              background: "var(--table-hover-bg, rgba(0, 0, 0, 0.02))",
              border: "1px solid var(--panel-border)"
            }}
          >
            <label className="switch-container">
              <input
                type="checkbox"
                className="switch-input"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              />
              <div className="switch-slider" />
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Set as Default Language
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Primary system language for user interface and default localization
                </div>
              </div>
            </label>

            <label className="switch-container">
              <input
                type="checkbox"
                className="switch-input"
                checked={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
              />
              <div className="switch-slider" />
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: 600, color: "var(--text-primary)" }}>Active Status</div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Enable or disable language availability across public and student portals
                </div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => navigate("/languages")}
              className="btn-secondary"
              style={{ height: "42px", padding: "0 1.25rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                height: "42px",
                padding: "0 1.5rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : isEditMode ? "Update Language" : "Save Language"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LanguageAdminPanel;
