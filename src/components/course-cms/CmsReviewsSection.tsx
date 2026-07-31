import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsReviewsSection: React.FC<CmsSectionProps> = ({
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
          {/* Social Reviews Configuration */}
          <Input
            label="Reviews Title"
            value={formData.courseCms?.reviews?.title || ""}
            onChange={(e) => handleCmsTextChange("reviews", "title", e.target.value)}
          />
          <Input
            label="Reviews Subtitle"
            value={formData.courseCms?.reviews?.subtitle || ""}
            onChange={(e) => handleCmsTextChange("reviews", "subtitle", e.target.value)}
          />
          <Textarea
            label="Reviews Description"
            value={formData.courseCms?.reviews?.description || ""}
            onChange={(e) => handleCmsTextChange("reviews", "description", e.target.value)}
          />
        </>
      ) : (
        <>
          {/* General Reviews Block (Section 9) */}
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
                Section 9: Student Reviews & Quotes
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec9_status"
                  checked={formData.courseCms?.section_9?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_9", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec9_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_9?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_9", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_9?.title || ""}
                onChange={(e) => handleCmsTextChange("section_9", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_9?.description || ""}
              onChange={(e) => handleCmsTextChange("section_9", "description", e.target.value)}
            />

            {/* Reviews cards */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Reviews Cards</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_9", "cards", { title: "", description: "", image: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Review Card
                </button>
              </div>
              {(formData.courseCms?.section_9?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "150px 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <label className="form-label" style={{ fontSize: "0.75rem" }}>
                      Student Avatar
                    </label>
                    {card.image ? (
                      <div style={{ position: "relative", width: "50px", height: "50px" }}>
                        <img
                          src={card.image}
                          alt="avatar"
                          style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleCmsArrayItemChange("section_9", "cards", idx, "image", "")}
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
                          setCmsMediaPickerTarget({
                            section: "section_9",
                            arrayField: "cards",
                            index: idx,
                            key: "image"
                          })
                        }
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "0.75rem" }}
                      >
                        Select Image
                      </button>
                    )}
                  </div>
                  <Input
                    label="Student Name / Role"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Review Text / Quote"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_9", "cards", idx)}
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
