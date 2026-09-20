import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";
import { CmsStatusToggle } from "./CmsStatusToggle";

export const CmsReviewsSection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange
}) => {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {formData.courseType === "Social" ? (
        <>
          {/* Social Reviews Configuration */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <CmsStatusToggle
              id="reviews_status"
              path="reviews"
              formData={formData}
              handleCmsTextChange={handleCmsTextChange}
            />
          </div>
          <Input
            label="Reviews Title"
            value={formData.courseCms?.reviews?.title || ""}
            onChange={(e) => handleCmsTextChange("reviews", "title", e.target.value)}
          />
          <Input
            label="Reviews Badge"
            value={formData.courseCms?.reviews?.badge || ""}
            onChange={(e) => handleCmsTextChange("reviews", "badge", e.target.value)}
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
                Section 9: Next Steps (CTA Cards)
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Next Steps Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("section_9", "cards", { icon: "", title: "", description: "", link: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Card
                </button>
              </div>
              {(formData.courseCms?.section_9?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Icon (emoji)"
                    placeholder="e.g. 📝"
                    value={card.icon || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "icon", e.target.value)}
                  />
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "description", e.target.value)}
                  />
                  <Input
                    label="Link Url"
                    value={card.link || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_9", "cards", idx, "link", e.target.value)}
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
