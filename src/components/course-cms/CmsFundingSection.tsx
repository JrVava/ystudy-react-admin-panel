import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsFundingSection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange,
  handleStudyPointChange,
  handleAddStudyPoint,
  handleRemoveStudyPoint,
  setCmsMediaPickerTarget
}) => {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {formData.courseType === "Social" ? (
        <>
          {/* Social Funding Section 1 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>Funding Section 1</h4>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Title"
                value={formData.courseCms?.funding?.section_1?.title || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "title", e.target.value)}
              />
              <Input
                label="Subtitle"
                value={formData.courseCms?.funding?.section_1?.subtitle || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "subtitle", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.funding?.section_1?.description || ""}
              onChange={(e) => handleCmsTextChange("funding.section_1", "description", e.target.value)}
            />
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "1rem", marginTop: "0.5rem" }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                <label className="form-label">Featured Image</label>
                {formData.courseCms?.funding?.section_1?.image ? (
                  <div style={{ position: "relative", width: "150px", height: "80px" }}>
                    <img
                      src={formData.courseCms.funding.section_1.image}
                      alt="funding"
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "6px" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleCmsTextChange("funding.section_1", "image", "")}
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.6)",
                        border: "none",
                        color: "#fff",
                        borderRadius: "50%",
                        cursor: "pointer",
                        width: "20px",
                        height: "20px",
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
                      setCmsMediaPickerTarget({ section: "funding.section_1", arrayField: "", index: -1, key: "image" })
                    }
                    className="btn-secondary"
                  >
                    Select Image
                  </button>
                )}
              </div>
              <Input
                label="Total Support Description"
                value={formData.courseCms?.funding?.section_1?.totalSupport || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "totalSupport", e.target.value)}
              />
            </div>

            {/* cards */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Support Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("funding.section_1", "cards", { title: "", subtitle: "", description: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Support Card
                </button>
              </div>
              {(formData.courseCms?.funding?.section_1?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_1", "cards", idx, "title", e.target.value)
                    }
                  />
                  <Input
                    label="Subtitle"
                    value={card.subtitle || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_1", "cards", idx, "subtitle", e.target.value)
                    }
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_1", "cards", idx, "description", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("funding.section_1", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Funding Section 2 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>Funding Section 2</h4>
            <Input
              label="Title"
              value={formData.courseCms?.funding?.section_2?.title || ""}
              onChange={(e) => handleCmsTextChange("funding.section_2", "title", e.target.value)}
            />
            <Textarea
              label="Description"
              value={formData.courseCms?.funding?.section_2?.description || ""}
              onChange={(e) => handleCmsTextChange("funding.section_2", "description", e.target.value)}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Bullet Points
                </label>
                <button
                  type="button"
                  onClick={() => handleAddStudyPoint?.("funding.section_2", "points")}
                  className="btn-secondary"
                  style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                >
                  + Add Point
                </button>
              </div>
              {(formData.courseCms?.funding?.section_2?.points || []).map((point: string, idx: number) => (
                <div key={idx} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    className="form-input"
                    value={point}
                    onChange={(e) => handleStudyPointChange?.("funding.section_2", "points", idx, e.target.value)}
                    style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--panel-border)" }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStudyPoint?.("funding.section_2", "points", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* General Funding support (Section 5) */}
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
                Section 5: SFE support cards
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec5_status"
                  checked={formData.courseCms?.section_5?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_5", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec5_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_5?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_5", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_5?.title || ""}
                onChange={(e) => handleCmsTextChange("section_5", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_5?.description || ""}
              onChange={(e) => handleCmsTextChange("section_5", "description", e.target.value)}
            />

            {/* SFE Support Cards Repeater */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Support Details</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("section_5", "cards", { title: "", description: "", number: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Support Info
                </button>
              </div>
              {(formData.courseCms?.section_5?.cards || []).map((card: any, idx: number) => (
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
                    onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "number", e.target.value)}
                  />
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_5", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* General Funding block (Section 6) */}
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
                Section 6: Why Choose/Funding Intro
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec6_status"
                  checked={formData.courseCms?.section_6?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_6", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec6_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_6?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_6", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_6?.title || ""}
                onChange={(e) => handleCmsTextChange("section_6", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_6?.description || ""}
              onChange={(e) => handleCmsTextChange("section_6", "description", e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
};
