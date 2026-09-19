import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsStudySection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange,
  handleStudyPointChange,
  handleAddStudyPoint,
  handleRemoveStudyPoint
}) => {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {formData.courseType === "Social" ? (
        <>
          {/* Social Study Section 1 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
              Study Section 1: What You Could Study
            </h4>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.study?.section_1?.badge || ""}
                onChange={(e) => handleCmsTextChange("study.section_1", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.study?.section_1?.title || ""}
                onChange={(e) => handleCmsTextChange("study.section_1", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.study?.section_1?.description || ""}
              onChange={(e) => handleCmsTextChange("study.section_1", "description", e.target.value)}
            />

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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Structure Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("study.section_1", "cards", {
                      number: "",
                      title: "",
                      description: "",
                      points: []
                    })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Structure Card
                </button>
              </div>
              {(formData.courseCms?.study?.section_1?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: "rgba(255,255,255,0.01)",
                    padding: "1rem",
                    borderRadius: "12px",
                    border: "1px solid var(--panel-border)"
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "100px 1fr 1fr auto",
                      gap: "0.5rem",
                      alignItems: "flex-end"
                    }}
                  >
                    <Input
                      label="Year / Number"
                      placeholder="e.g. 1"
                      value={card.number || ""}
                      onChange={(e) =>
                        handleCmsArrayItemChange("study.section_1", "cards", idx, "number", e.target.value)
                      }
                    />
                    <Input
                      label="Title"
                      placeholder="e.g. Year 1: Foundations"
                      value={card.title || ""}
                      onChange={(e) =>
                        handleCmsArrayItemChange("study.section_1", "cards", idx, "title", e.target.value)
                      }
                    />
                    <Input
                      label="Description"
                      value={card.description || ""}
                      onChange={(e) =>
                        handleCmsArrayItemChange("study.section_1", "cards", idx, "description", e.target.value)
                      }
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCmsArrayItem("study.section_1", "cards", idx)}
                      className="btn-secondary"
                      style={{ color: "var(--error)", padding: "0.5rem" }}
                    >
                      Remove Card
                    </button>
                  </div>

                  {/* Nested study points in card */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.5rem",
                      marginTop: "1rem",
                      borderTop: "1px dashed var(--panel-border)",
                      paddingTop: "0.5rem"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <label className="form-label" style={{ fontSize: "0.8rem", margin: 0 }}>
                        Module Points
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddStudyPoint?.("study.section_1.cards." + idx, "points")}
                        className="btn-secondary"
                        style={{ padding: "2px 6px", fontSize: "0.75rem" }}
                      >
                        + Add Point
                      </button>
                    </div>
                    {(card.points || []).map((pt: string, ptIdx: number) => (
                      <div key={ptIdx} style={{ display: "flex", gap: "0.5rem" }}>
                        <input
                          type="text"
                          className="form-input"
                          value={pt}
                          onChange={(e) =>
                            handleStudyPointChange?.("study.section_1.cards." + idx, "points", ptIdx, e.target.value)
                          }
                          style={{ background: "rgba(255,255,255,0.01)", border: "1px solid var(--panel-border)" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStudyPoint?.("study.section_1.cards." + idx, "points", ptIdx)}
                          className="btn-secondary"
                          style={{ color: "var(--error)" }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Study Section 2 */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.01)",
              border: "1px solid var(--panel-border)",
              padding: "1.25rem",
              borderRadius: "16px"
            }}
          >
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
              Study Section 2: Study Modes Intro
            </h4>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.study?.section_2?.badge || ""}
                onChange={(e) => handleCmsTextChange("study.section_2", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.study?.section_2?.title || ""}
                onChange={(e) => handleCmsTextChange("study.section_2", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.study?.section_2?.description || ""}
              onChange={(e) => handleCmsTextChange("study.section_2", "description", e.target.value)}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              The actual study-mode comparison cards are populated from the linked Time Tables, not from this section.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* General Study Block (Section 7) */}
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
                Section 7: Related Subjects
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec7_status"
                  checked={formData.courseCms?.section_7?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_7", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec7_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_7?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_7", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_7?.title || ""}
                onChange={(e) => handleCmsTextChange("section_7", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_7?.description || ""}
              onChange={(e) => handleCmsTextChange("section_7", "description", e.target.value)}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              The related subject cards below this intro are populated automatically from the Subjects linked to this
              course (see the Relations tab) — no cards need to be authored here.
            </p>
          </div>

          {/* General Study Modes Block (Section 8) */}
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
                Section 8: Conversion Snapshot
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec8_status"
                  checked={formData.courseCms?.section_8?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_8", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec8_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_8?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_8", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_8?.title || ""}
                onChange={(e) => handleCmsTextChange("section_8", "title", e.target.value)}
              />
            </div>

            {/* Study Modes Repeaters */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Snapshot Cards</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_8", "cards", { title: "", description: "", link: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Card
                </button>
              </div>
              {(formData.courseCms?.section_8?.cards || []).map((card: any, idx: number) => (
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
                    onChange={(e) => handleCmsArrayItemChange("section_8", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_8", "cards", idx, "description", e.target.value)}
                  />
                  <Input
                    label="Link Url"
                    value={card.link || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_8", "cards", idx, "link", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_8", "cards", idx)}
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
