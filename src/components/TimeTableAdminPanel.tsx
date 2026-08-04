import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { timeTableApi } from "../utils/timeTableApi";
import { courseApi } from "../utils/courseApi";
import { Save, ArrowLeft, Clock, Plus, Trash2 } from "lucide-react";
import { toast } from "../context/ToastContext";
import { SearchableSelect } from "./SearchableSelect";

import Input from "./Input";
import Textarea from "./Textarea";

export const TimeTableAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(!!id);
  const [isSlugAutoSynced, setIsSlugAutoSynced] = useState(!id);
  const [coursesList, setCoursesList] = useState<any[]>([]);

  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    badge: "",
    description: "",
    items: [],
    status: true
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await courseApi.getList();
        setCoursesList(res || []);
      } catch (e) {
        console.error("Failed to load courses list", e);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (id) {
      const fetchTimeTable = async () => {
        try {
          const res = await timeTableApi.getById(id);
          setFormData({
            title: res.title || "",
            slug: res.slug || "",
            badge: res.badge || "",
            description: res.description || "",
            items: Array.isArray(res.items) ? res.items : [],
            status: res.status !== false
          });
        } catch (e) {
          console.error("Failed to fetch timetable", e);
          toast.error("Failed to load timetable details.");
          navigate("/time-tables");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTimeTable();
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

  const handleAddItem = () => {
    setFormData((prev: any) => ({
      ...prev,
      items: [...prev.items, { type: "", mode: "" }]
    }));
  };

  const handleUpdateItem = (index: number, key: "type" | "mode", val: string) => {
    setFormData((prev: any) => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [key]: val };
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, i: number) => i !== index)
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.warning("Title is required!");
      return;
    }
    if (!formData.slug || !formData.slug.trim()) {
      toast.warning("Associated Course Slug is required!");
      return;
    }

    try {
      const payload = {
        title: formData.title,
        slug: formData.slug,
        badge: formData.badge,
        description: formData.description,
        items: formData.items,
        status: formData.status
      };

      let res;
      if (id) {
        res = await timeTableApi.update(id, payload);
      } else {
        res = await timeTableApi.create(payload);
      }

      if (res.success || res.data?.success) {
        toast.success(id ? "Time table updated successfully!" : "Time table created successfully!");
        navigate("/time-tables");
      } else {
        toast.error("Failed to save time table: " + (res.message || "Unknown error"));
      }
    } catch (e: any) {
      console.error("Failed to save timetable", e);
      toast.error("Error saving timetable: " + (e.response?.data?.message || e.message || "Check logs."));
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

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <form onSubmit={handleSave} id="timetable-form">
        <div className="page-header" style={{ marginBottom: "1.5rem" }}>
          <div>
            <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Clock size={28} style={{ color: "var(--primary)" }} />
              {id ? "Edit Time Table" : "Create Time Table"}
            </h1>
            <p className="page-subtitle">
              {id
                ? `Update scheduling configuration, study options, and status.`
                : "Add a new timetable course option to the portal."}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              onClick={() => navigate("/time-tables")}
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
              Save Time Table
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
              label="Timetable Title *"
              placeholder="e.g. Health & Social Care Blended Schedule"
              value={formData.title}
              onChange={handleTitleChange}
              required
            />
            <SearchableSelect
              label="Associated Course Slug *"
              value={formData.slug}
              onChange={(selectedSlug) => {
                setIsSlugAutoSynced(false);
                setFormData((prev: any) => ({ ...prev, slug: selectedSlug }));
              }}
              options={coursesList.map((course) => ({
                value: course.slug,
                label: `${course.title} (${course.slug})`
              }))}
              placeholder="Select a course..."
              required
            />
          </div>

          {/* Badge & Status */}
          <div className="responsive-form-grid">
            <Input
              label="Badge Text (Kicker / Tagline)"
              placeholder="e.g. Sept / Jan / May Intakes"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <label className="form-label" style={{ margin: 0 }}>
                Timetable Visibility Status
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
          </div>

          {/* Description */}
          <Textarea
            label="Timetable Description"
            placeholder="Enter schedule instructions, class hours information, study commitments, etc..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            minHeight="100px"
          />

          {/* Timetable Items */}
          <div style={{ marginTop: "0.5rem" }}>
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h4
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--text-secondary)"
                }}
              >
                Timetable Details (Study Patterns)
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="btn-secondary"
                style={{
                  padding: "6px 12px",
                  fontSize: "0.8rem",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <Plus size={14} />
                Add Study Row
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {formData.items.map((item: any, index: number) => (
                <div
                  key={index}
                  className="timetable-row-grid"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid var(--panel-border)",
                    borderRadius: "10px",
                    padding: "12px"
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginBottom: "4px",
                        color: "var(--text-muted)"
                      }}
                    >
                      Study Type (e.g. Full-time / Part-time)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Full-time"
                      value={item.type}
                      onChange={(e) => handleUpdateItem(index, "type", e.target.value)}
                      style={{ height: "38px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        marginBottom: "4px",
                        color: "var(--text-muted)"
                      }}
                    >
                      Delivery Mode (e.g. Blended / Online / Evening)
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Blended Learning (2 days/week)"
                      value={item.mode}
                      onChange={(e) => handleUpdateItem(index, "mode", e.target.value)}
                      style={{ height: "38px", fontSize: "0.85rem" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="btn-secondary"
                    style={{
                      height: "38px",
                      width: "38px",
                      padding: 0,
                      display: "grid",
                      placeItems: "center",
                      color: "var(--error)",
                      borderColor: "rgba(244, 63, 94, 0.15)"
                    }}
                    title="Remove Row"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              {formData.items.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "2.5rem",
                    border: "1px dashed var(--panel-border)",
                    borderRadius: "12px",
                    color: "var(--text-muted)",
                    fontSize: "0.9rem"
                  }}
                >
                  No study patterns added yet. Click "Add Study Row" above.
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TimeTableAdminPanel;
