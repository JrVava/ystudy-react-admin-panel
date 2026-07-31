import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsOverviewSection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange,
  setCmsMediaPickerTarget
}) => {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {formData.courseType === "Social" ? (
        <>
          {/* Social Overview fields */}
          <div
            className="responsive-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <Input
              label="Badge"
              value={formData.courseCms?.overview?.badge || ""}
              onChange={(e) => handleCmsTextChange("overview", "badge", e.target.value)}
            />
            <Input
              label="Title"
              value={formData.courseCms?.overview?.title || ""}
              onChange={(e) => handleCmsTextChange("overview", "title", e.target.value)}
            />
          </div>
          <Textarea
            label="Description"
            value={formData.courseCms?.overview?.description || ""}
            onChange={(e) => handleCmsTextChange("overview", "description", e.target.value)}
          />

          {/* statsCards array */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              border: "1px solid var(--panel-border)",
              padding: "1rem",
              borderRadius: "12px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Statistics Cards</h4>
              <button
                type="button"
                onClick={() => handleAddCmsArrayItem("overview", "statsCards", { title: "", value: "", label: "" })}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                + Add Stat
              </button>
            </div>
            {(formData.courseCms?.overview?.statsCards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  background: "rgba(255,255,255,0.01)",
                  padding: "0.5rem",
                  borderRadius: "8px"
                }}
              >
                <Input
                  label="Title / Icon key"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("overview", "statsCards", idx, "title", e.target.value)}
                />
                <Input
                  label="Value"
                  value={card.value || ""}
                  onChange={(e) => handleCmsArrayItemChange("overview", "statsCards", idx, "value", e.target.value)}
                />
                <Input
                  label="Label"
                  value={card.label || ""}
                  onChange={(e) => handleCmsArrayItemChange("overview", "statsCards", idx, "label", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("overview", "statsCards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* cards array */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              border: "1px solid var(--panel-border)",
              padding: "1rem",
              borderRadius: "12px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Highlight Cards</h4>
              <button
                type="button"
                onClick={() => handleAddCmsArrayItem("overview", "cards", { image: "", text: "" })}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                + Add Highlight
              </button>
            </div>
            {(formData.courseCms?.overview?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "200px 1fr auto",
                  gap: "1rem",
                  alignItems: "center",
                  background: "rgba(255,255,255,0.01)",
                  padding: "0.5rem",
                  borderRadius: "8px"
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>
                    Card Icon / Image
                  </label>
                  {card.image ? (
                    <div style={{ position: "relative", width: "80px", height: "50px" }}>
                      <img
                        src={card.image}
                        alt="icon"
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleCmsArrayItemChange("overview", "cards", idx, "image", "")}
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          color: "#fff",
                          borderRadius: "50%",
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                          fontSize: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        setCmsMediaPickerTarget({ section: "overview", arrayField: "cards", index: idx, key: "image" })
                      }
                      className="btn-secondary"
                      style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                    >
                      Select Icon
                    </button>
                  )}
                </div>
                <Input
                  label="Highlight Text"
                  value={card.text || ""}
                  onChange={(e) => handleCmsArrayItemChange("overview", "cards", idx, "text", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("overview", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", alignSelf: "flex-end" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* General Overview: Hero kicker, bannerStyle, Section 2, Section 3 */}
          <div
            className="responsive-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <div className="form-group">
              <label className="form-label">Hero Badge / Kicker</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. High Demand"
                value={formData.courseCms?.kicker || ""}
                onChange={(e) => handleCmsTextChange("", "kicker", e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--panel-border)"
                }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Banner Image Style</label>
              <select
                className="form-input"
                value={formData.courseCms?.bannerStyle || "left"}
                onChange={(e) => handleCmsTextChange("", "bannerStyle", e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--panel-border)"
                }}
              >
                <option value="left" style={{ background: "#0b0f19" }}>
                  Left text, Right Image
                </option>
                <option value="right" style={{ background: "#0b0f19" }}>
                  Right text, Left Image
                </option>
                <option value="center" style={{ background: "#0b0f19" }}>
                  Centered (No Image)
                </option>
              </select>
            </div>
          </div>

          {/* Section 2: Intro */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", margin: 0, marginBottom: "1rem" }}>
              Section 2: Course Intro Block
            </h4>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.section_2?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_2", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_2?.title || ""}
                onChange={(e) => handleCmsTextChange("section_2", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_2?.description || ""}
              onChange={(e) => handleCmsTextChange("section_2", "description", e.target.value)}
            />
          </div>

          {/* Section 3: Overview */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h4 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--primary)", margin: 0 }}>
                Section 3: Course Overview Metrics
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec3_status"
                  checked={formData.courseCms?.section_3?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_3", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec3_status" className="form-label" style={{ margin: 0 }}>
                  Visible
                </label>
              </div>
            </div>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.section_3?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_3", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_3?.title || ""}
                onChange={(e) => handleCmsTextChange("section_3", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_3?.description || ""}
              onChange={(e) => handleCmsTextChange("section_3", "description", e.target.value)}
            />

            {/* Tiles Repeaters */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "1rem",
                borderTop: "1px solid var(--panel-border)",
                paddingTop: "1rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Overview Stat Cards</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_3", "tiles", { value: "", label: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Stat Card
                </button>
              </div>
              {(formData.courseCms?.section_3?.tiles || []).map((card: any, idx: number) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                  <Input
                    label="Metric Value (e.g. 96%)"
                    value={card.value || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_3", "tiles", idx, "value", e.target.value)}
                  />
                  <Input
                    label="Description Label"
                    value={card.label || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_3", "tiles", idx, "label", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_3", "tiles", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Cards Repeaters */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                marginTop: "1rem",
                borderTop: "1px solid var(--panel-border)",
                paddingTop: "1rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Overview Highlight Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("section_3", "cards", { title: "", description: "", number: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Card
                </button>
              </div>
              {(formData.courseCms?.section_3?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Number Label"
                    placeholder="e.g. 01"
                    value={card.number || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_3", "cards", idx, "number", e.target.value)}
                  />
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_3", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_3", "cards", idx, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_3", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
