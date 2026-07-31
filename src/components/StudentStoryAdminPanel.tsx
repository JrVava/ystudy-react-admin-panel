import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { studentStoryApi } from "../utils/studentStoryApi";
import { toast } from "../context/ToastContext";
import { Save, ArrowLeft, Users, Star } from "lucide-react";
import Input from "./Input";
import Textarea from "./Textarea";

export const StudentStoryAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<any>({
    name: "",
    description: "",
    star: 5,
    badge: "",
    age: "",
    subject: "",
    year: "",
    status: true
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchStory = async () => {
        try {
          setLoading(true);
          const data = await studentStoryApi.getById(id);
          if (data) {
            setFormData({
              name: data.name || "",
              description: data.description || "",
              star: data.star !== undefined ? Number(data.star) : 5,
              badge: data.badge || "",
              age: data.age !== undefined ? String(data.age) : "",
              subject: data.subject || "",
              year: data.year || "",
              status: data.status !== false
            });
          } else {
            toast.error("Student story details not found");
            navigate("/student-stories");
          }
        } catch (e: any) {
          console.error(e);
          toast.error(e.message || "Failed to load student story");
          navigate("/student-stories");
        } finally {
          setLoading(false);
        }
      };
      fetchStory();
    }
  }, [id, isEditMode, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...formData,
        star: Number(formData.star),
        age: formData.age ? Number(formData.age) : undefined
      };

      let res;
      if (isEditMode && id) {
        res = await studentStoryApi.update(id, payload);
      } else {
        res = await studentStoryApi.create(payload);
      }

      if (res.success) {
        toast.success(isEditMode ? "Updated successfully" : "Created successfully");
        navigate("/student-stories");
      } else {
        toast.error("Failed to save: " + res.message);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save student story");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Loading story details...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "2rem" }}>
        <div>
          <button
            onClick={() => navigate("/student-stories")}
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
            <Users size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            {isEditMode ? "Edit Student Story" : "New Student Story"}
          </h1>
          <p className="page-subtitle">
            {isEditMode ? "Modify details of the student's story." : "Add a new student review or story."}
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
              Story Details
            </h3>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Student Name *"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                label="Badge / Tagline"
                placeholder="e.g. Alumnus, Business Manager"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              />
            </div>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}
            >
              <div className="form-group">
                <label className="form-label">Star Rating *</label>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "40px" }}>
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setFormData({ ...formData, star: starVal })}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Star
                        size={20}
                        fill={starVal <= formData.star ? "var(--warning)" : "none"}
                        color={starVal <= formData.star ? "var(--warning)" : "var(--text-muted)"}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Input
                label="Student Age"
                placeholder="e.g. 28"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />

              <Input
                label="Graduation Year"
                placeholder="e.g. Class of 2024"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>

            <Input
              label="Subject / Topic Name"
              placeholder="e.g. BA Business Management"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            />

            <Textarea
              label="Story / Review text *"
              placeholder="Enter student story details..."
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
            <button
              type="button"
              onClick={() => navigate("/student-stories")}
              className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Story"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentStoryAdminPanel;
