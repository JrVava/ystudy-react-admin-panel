import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { upcomingIntakeApi } from "../utils/upcomingIntakeApi";
import { lookupApi } from "../utils/lookupApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Calendar } from "lucide-react";
import Input from "./Input";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const UpcomingIntakeAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<any>({
    year: "",
    month: "Jan",
    subjectId: "",
    qualificationId: "",
    link: "",
    status: true
  });

  const [subjects, setSubjects] = useState<any[]>([]);
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Load options
        const subRes = await lookupApi("subjects").getPaginated(1, 1000);
        const subOptions = subRes.success ? subRes.data || [] : [];
        setSubjects(subOptions);

        const qualRes = await lookupApi("qualifications").getPaginated(1, 1000);
        const qualOptions = qualRes.success ? qualRes.data || [] : [];
        setQualifications(qualOptions);

        // Load details if edit mode
        if (isEditMode && id) {
          const data = await upcomingIntakeApi.getById(id);
          if (data) {
            setFormData({
              year: data.year || "",
              month: data.month || "Jan",
              subjectId: data.subjectId || "",
              qualificationId: data.qualificationId || "",
              link: data.link || "",
              status: data.status !== false
            });
          } else {
            toast.error("Intake details not found");
            navigate("/courses/upcoming-intakes");
          }
        } else {
          // Initialize first options if available
          setFormData((prev: any) => ({
            ...prev,
            subjectId: subOptions[0]?._id || "",
            qualificationId: qualOptions[0]?._id || ""
          }));
        }
      } catch (err: any) {
        console.error(err);
        toast.error("Error loading page resources: " + (err.message || ""));
        navigate("/courses/upcoming-intakes");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !/^\d{4}$/.test(String(formData.year))) {
      toast.error("Year must be a 4-digit number (e.g. 2026)");
      return;
    }
    if (!formData.month) {
      toast.error("Month is required");
      return;
    }
    if (!formData.subjectId) {
      toast.error("Subject is required");
      return;
    }
    if (!formData.qualificationId) {
      toast.error("Qualification is required");
      return;
    }
    if (!formData.link) {
      toast.error("Apply link is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        year: String(formData.year)
      };

      let res;
      if (isEditMode && id) {
        res = await upcomingIntakeApi.update(id, payload);
      } else {
        res = await upcomingIntakeApi.create(payload);
      }

      if (res.success) {
        toast.success(isEditMode ? "Updated successfully" : "Created successfully");
        navigate("/courses/upcoming-intakes");
      } else {
        toast.error("Failed to save: " + res.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save upcoming intake");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Loading page data...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <button
            onClick={() => navigate("/courses/upcoming-intakes")}
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
            <Calendar
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            {isEditMode ? "Edit Intake" : "New Intake"}
          </h1>
          <p className="page-subtitle">
            {isEditMode
              ? "Modify details of the course intake start date."
              : "Add a new upcoming course intake start date."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
          {/* Main card */}
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
              Intake Parameters
            </h3>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Intake Year (4-digit) *"
                placeholder="e.g. 2026"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                required
              />

              <div className="form-group">
                <label className="form-label">Intake Month *</label>
                <select
                  className="form-input"
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--panel-border)"
                  }}
                  required
                >
                  {MONTHS.map((m) => (
                    <option key={m} value={m} style={{ background: "#0b0f19" }}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">Subject Category *</label>
                <select
                  className="form-input"
                  value={formData.subjectId}
                  onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--panel-border)"
                  }}
                  required
                >
                  <option value="" disabled style={{ background: "#0b0f19" }}>
                    Select Subject
                  </option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id} style={{ background: "#0b0f19" }}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Qualification Level *</label>
                <select
                  className="form-input"
                  value={formData.qualificationId}
                  onChange={(e) => setFormData({ ...formData, qualificationId: e.target.value })}
                  style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--panel-border)"
                  }}
                  required
                >
                  <option value="" disabled style={{ background: "#0b0f19" }}>
                    Select Qualification
                  </option>
                  {qualifications.map((q) => (
                    <option key={q._id} value={q._id} style={{ background: "#0b0f19" }}>
                      {q.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Application Link URL *"
              placeholder="e.g. https://ystudy.co.uk/apply"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
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
                Active / Visible on course pages
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
            <button type="button" onClick={() => navigate("/courses/upcoming-intakes")} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Intake"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpcomingIntakeAdminPanel;
