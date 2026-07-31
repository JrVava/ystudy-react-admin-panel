import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dynamicFormApi } from "../utils/dynamicFormApi";
import { toast } from "../context/ToastContext";
import { Save, FileText, Plus, X, Settings2, ArrowLeft } from "lucide-react";
import Input from "../components/Input";

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: string[] | string;
}

export const DynamicFormBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("Application Form");
  const [isActive, setIsActive] = useState(true);
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadForm = async () => {
    try {
      setLoading(true);
      const res = await dynamicFormApi.get();
      if (res) {
        setTitle(res.title || "Application Form");
        setIsActive(res.isActive !== false);
        setFields(res.fields || []);
      } else {
        toast.error("No form configuration found. Starting fresh.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load form configuration");
    } finally {
      setLoading(false);
    }
  };

  const saveForm = async () => {
    for (const f of fields) {
      if (!f.name.trim() || !f.label.trim()) {
        toast.error("All fields must have a Field Name and a Label.");
        return;
      }
    }

    try {
      setSaving(true);
      const formattedFields = fields.map((f) => {
        if (typeof f.options === "string") {
          return {
            ...f,
            options: f.options
              .split(",")
              .map((o) => o.trim())
              .filter((o) => o !== "")
          };
        }
        return f;
      });

      const payload = {
        title,
        isActive,
        fields: formattedFields
      };

      const res = await dynamicFormApi.update(payload);
      if (res.success) {
        toast.success("Form configuration saved securely!");
        loadForm();
      } else {
        toast.error("Failed to save: " + res.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save form configuration");
    } finally {
      setSaving(false);
    }
  };

  const addField = () => {
    setFields([...fields, { name: "", label: "", type: "text", placeholder: "", required: false }]);
  };

  const removeField = (index: number) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: value };
    setFields(updated);
  };

  useEffect(() => {
    loadForm();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Loading form configurations...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/media")}
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
        <ArrowLeft size={14} /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileText
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            Form Builder
          </h1>
          <p className="page-subtitle">
            Configure dynamic fields, options, validations, and statuses for the student application form.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={loadForm} className="btn-secondary" style={{ height: "40px" }}>
            Reload Config
          </button>
          <button
            onClick={saveForm}
            disabled={saving}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Global Settings */}
        <div
          className="panel-glass"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "1px solid var(--panel-border)",
              paddingBottom: "0.5rem"
            }}
          >
            <Settings2 size={16} /> Global Settings
          </h3>
          <div className="responsive-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
            <Input
              label="Form Title *"
              placeholder="e.g. Student Application Form"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div
            className="form-group"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}
          >
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
            />
            <label htmlFor="isActive" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
              Form is Active / Visible to students
            </label>
          </div>
        </div>

        {/* Fields List */}
        <div
          className="panel-glass"
          style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid var(--panel-border)",
              paddingBottom: "0.5rem"
            }}
          >
            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0 }}>Form Fields</h3>
            <button
              onClick={addField}
              className="btn-secondary"
              style={{
                padding: "0.4rem 0.8rem",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <Plus size={14} /> Add Field
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {fields.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                No fields added yet. Click "Add Field" to start building your application form.
              </div>
            ) : (
              fields.map((field, index) => (
                <div
                  key={index}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--panel-border)",
                    padding: "1.25rem",
                    borderRadius: "12px",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem"
                  }}
                >
                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      background: "none",
                      border: "none",
                      color: "var(--error)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <X size={18} />
                  </button>

                  <div
                    className="responsive-form-grid"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                      marginTop: "10px"
                    }}
                  >
                    <Input
                      label="Field ID / Name *"
                      placeholder="e.g. firstName"
                      value={field.name}
                      onChange={(e) => updateField(index, "name", e.target.value)}
                      required
                    />

                    <Input
                      label="Field Label *"
                      placeholder="e.g. First Name"
                      value={field.label}
                      onChange={(e) => updateField(index, "label", e.target.value)}
                      required
                    />

                    <div className="form-group">
                      <label className="form-label">Input Type *</label>
                      <select
                        className="form-input"
                        value={field.type}
                        onChange={(e) => updateField(index, "type", e.target.value)}
                        style={{
                          background: "rgba(255, 255, 255, 0.02)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--panel-border)"
                        }}
                        required
                      >
                        <option value="text" style={{ background: "#0b0f19" }}>
                          Text
                        </option>
                        <option value="email" style={{ background: "#0b0f19" }}>
                          Email
                        </option>
                        <option value="password" style={{ background: "#0b0f19" }}>
                          Password
                        </option>
                        <option value="textarea" style={{ background: "#0b0f19" }}>
                          Textarea
                        </option>
                        <option value="radio" style={{ background: "#0b0f19" }}>
                          Radio Buttons
                        </option>
                        <option value="checkbox" style={{ background: "#0b0f19" }}>
                          Checkbox
                        </option>
                        <option value="select" style={{ background: "#0b0f19" }}>
                          Dropdown Select
                        </option>
                      </select>
                    </div>

                    <Input
                      label="Placeholder Text"
                      placeholder="e.g. Enter first name"
                      value={field.placeholder || ""}
                      onChange={(e) => updateField(index, "placeholder", e.target.value)}
                    />
                  </div>

                  {["radio", "select", "checkbox"].includes(field.type) && (
                    <Input
                      label="Options (Comma Separated) *"
                      placeholder="e.g. Yes, No, Maybe"
                      value={Array.isArray(field.options) ? field.options.join(", ") : field.options || ""}
                      onChange={(e) => updateField(index, "options", e.target.value)}
                    />
                  )}

                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={field.required || false}
                      onChange={(e) => updateField(index, "required", e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--primary)" }}
                    />
                    <label
                      htmlFor={`required-${index}`}
                      className="form-label"
                      style={{ margin: 0, cursor: "pointer", fontSize: "0.85rem" }}
                    >
                      Required field (validate presence before submit)
                    </label>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFormBuilderPage;
