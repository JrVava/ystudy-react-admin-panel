import React, { useState, useEffect } from "react";
import { Save, FileSpreadsheet, ArrowLeft, Settings2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "./Input";
import { toast } from "../context/ToastContext";
import { googleSheetApi } from "../utils/googleSheetApi";

export const GoogleSheetConfig = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    google_service_account_email: "",
    google_private_key: "",
    google_spreadsheet_id: "",
    status: true
  });

  useEffect(() => {
    if (id) {
      fetchConfig();
    }
  }, [id]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await googleSheetApi.getById(id!);
      if (res?.success && res.data) {
        setFormData({
          google_service_account_email: res.data.google_service_account_email || "",
          google_private_key: res.data.google_private_key || "",
          google_spreadsheet_id: res.data.google_spreadsheet_id || "",
          status: res.data.status !== undefined ? res.data.status : true
        });
      }
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to fetch Google Sheet configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | boolean = value;

    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!formData.google_service_account_email.trim())
      newErrors.google_service_account_email = "Service Account Email is required";
    if (formData.google_service_account_email && !/\S+@\S+\.\S+/.test(formData.google_service_account_email))
      newErrors.google_service_account_email = "Invalid email address";
    if (!formData.google_private_key.trim()) newErrors.google_private_key = "Private Key is required";
    if (!formData.google_spreadsheet_id.trim()) newErrors.google_spreadsheet_id = "Spreadsheet ID is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await googleSheetApi.update(id, formData);
      } else {
        await googleSheetApi.create(formData);
      }

      if (toast && toast.success) {
        toast.success(`Google Sheet integration ${id ? "updated" : "saved"} successfully!`);
      }
      navigate("/google-sheets"); // redirect back to the listing
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to save Google Sheet configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/google-sheets")}
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
        <ArrowLeft size={14} /> Back to Integrations
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <FileSpreadsheet
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            {id ? "Edit Google Sheet Integration" : "Add Google Sheet Integration"}
          </h1>
          <p className="page-subtitle">Configure credentials for Google Sheets access.</p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Save size={18} />
            {loading ? "Saving..." : "Save Config"}
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
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
            <Settings2 size={16} /> Credentials
          </h3>

          <div
            className="responsive-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <Input
              label="Service Account Email *"
              name="google_service_account_email"
              placeholder="service-account@example.iam.gserviceaccount.com"
              value={formData.google_service_account_email}
              onChange={handleChange}
              error={errors.google_service_account_email}
              style={{ gridColumn: "1 / -1" }}
              required
            />

            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label className="form-label">
                Google Private Key <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="google_private_key"
                className={`form-input ${errors.google_private_key ? "error" : ""}`}
                placeholder="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
                value={formData.google_private_key}
                onChange={handleChange}
                style={{ width: "100%", minHeight: "150px", fontFamily: "monospace", padding: "0.75rem" }}
                required
              />
              {errors.google_private_key && <span className="error-text">{errors.google_private_key}</span>}
            </div>

            <Input
              label="Spreadsheet ID *"
              name="google_spreadsheet_id"
              placeholder="Enter the Spreadsheet ID (found in URL)"
              value={formData.google_spreadsheet_id}
              onChange={handleChange}
              error={errors.google_spreadsheet_id}
              style={{ gridColumn: "1 / -1" }}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="status"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="status" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                Active Status
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetConfig;
