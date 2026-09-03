import React, { useState, useEffect } from "react";
import { Save, Server, ArrowLeft, Settings2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "./Input";
import { toast } from "../context/ToastContext";
import { smtpApi } from "../utils/smtpApi";

export const SMTPConfig = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    host: "",
    port: "",
    user: "",
    password: "",
    secure: false,
    fromEmail: "",
    status: true
  });

  useEffect(() => {
    if (id) {
      fetchSmtpConfig();
    }
  }, [id]);

  const fetchSmtpConfig = async () => {
    setLoading(true);
    try {
      const res = await smtpApi.getById();
      if (res?.success && res.data) {
        setFormData({
          host: res.data.host || "",
          port: res.data.port?.toString() || "",
          user: res.data.user || "",
          password: res.data.password || "",
          secure: res.data.secure || false,
          fromEmail: res.data.fromEmail || "",
          status: res.data.status !== undefined ? res.data.status : true
        });
      }
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to fetch SMTP configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    if (!formData.host.trim()) newErrors.host = "Host is required";
    if (!formData.port || isNaN(Number(formData.port)) || Number(formData.port) <= 0)
      newErrors.port = "Valid port is required";
    if (!formData.user.trim()) newErrors.user = "User is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (formData.fromEmail && !/\S+@\S+\.\S+/.test(formData.fromEmail)) newErrors.fromEmail = "Invalid email address";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        port: Number(formData.port)
      };

      if (id) {
        payload._id = id;
        await smtpApi.updateSMTP(payload);
      } else {
        await smtpApi.createSMTP(payload);
      }

      if (toast && toast.success) {
        toast.success(`SMTP configuration ${id ? "updated" : "saved"} successfully!`);
      }
      navigate("/smtp-config"); // redirect back to the listing
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to save SMTP configuration");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back Button */}
      <button
        onClick={() => navigate("/smtp-config")}
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
        <ArrowLeft size={14} /> Back to Configurations
      </button>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Server size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            {id ? "Edit SMTP Configuration" : "Add SMTP Configuration"}
          </h1>
          <p className="page-subtitle">Configure your email server settings for sending out system emails.</p>
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
            <Settings2 size={16} /> Server Details
          </h3>

          <div
            className="responsive-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <Input
              label="Host *"
              name="host"
              placeholder="smtp.example.com"
              value={formData.host}
              onChange={handleChange}
              error={errors.host}
              required
            />
            <Input
              label="Port *"
              name="port"
              type="number"
              placeholder="587"
              value={formData.port}
              onChange={handleChange}
              error={errors.port}
              required
            />
            <Input
              label="User *"
              name="user"
              placeholder="user@example.com"
              value={formData.user}
              onChange={handleChange}
              error={errors.user}
              required
            />
            <Input
              label="Password *"
              name="password"
              type="password"
              placeholder="Enter SMTP password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
            <Input
              label="From Email"
              name="fromEmail"
              type="email"
              placeholder="noreply@example.com"
              value={formData.fromEmail}
              onChange={handleChange}
              error={errors.fromEmail}
              style={{ gridColumn: "1 / -1" }}
            />
          </div>

          <div style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <input
                type="checkbox"
                id="secure"
                name="secure"
                checked={formData.secure}
                onChange={handleChange}
                style={{ width: "18px", height: "18px", accentColor: "var(--primary)" }}
              />
              <label htmlFor="secure" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                Use Secure Connection (SSL/TLS)
              </label>
            </div>

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
