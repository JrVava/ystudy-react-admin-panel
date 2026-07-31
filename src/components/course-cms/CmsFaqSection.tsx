import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsFaqSection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange
}) => {
  if (formData.courseType !== "Social") return null;

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Social FAQ Section 1 */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--panel-border)",
          padding: "1.25rem",
          borderRadius: "16px"
        }}
      >
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>FAQ Intro Header</h4>
        <div className="responsive-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Title"
            value={formData.courseCms?.FAQ?.section_1?.title || ""}
            onChange={(e) => handleCmsTextChange("FAQ.section_1", "title", e.target.value)}
          />
          <Input
            label="Subtitle"
            value={formData.courseCms?.FAQ?.section_1?.subtitle || ""}
            onChange={(e) => handleCmsTextChange("FAQ.section_1", "subtitle", e.target.value)}
          />
        </div>
        <Textarea
          label="Description"
          value={formData.courseCms?.FAQ?.section_1?.description || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_1", "description", e.target.value)}
        />
      </div>

      {/* Social FAQ Section 2 */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--panel-border)",
          padding: "1.25rem",
          borderRadius: "16px"
        }}
      >
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
          Short Apply Form Guide
        </h4>
        <Input
          label="Title"
          value={formData.courseCms?.FAQ?.section_2?.title || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_2", "title", e.target.value)}
        />
        <Textarea
          label="Description"
          value={formData.courseCms?.FAQ?.section_2?.description || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_2", "description", e.target.value)}
        />
      </div>

      {/* Social FAQ Section 3 */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--panel-border)",
          padding: "1.25rem",
          borderRadius: "16px"
        }}
      >
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
          FAQs List (Q&A Accordion)
        </h4>
        <Input
          label="Title"
          value={formData.courseCms?.FAQ?.section_3?.title || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_3", "title", e.target.value)}
        />
        <Textarea
          label="Description"
          value={formData.courseCms?.FAQ?.section_3?.description || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_3", "description", e.target.value)}
        />

        {/* faq list repeaters */}
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
            <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Q&A Items</h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("FAQ.section_3", "cards", { title: "", description: "" })}
              className="btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
            >
              + Add FAQ
            </button>
          </div>
          {(formData.courseCms?.FAQ?.section_3?.cards || []).map((card: any, idx: number) => (
            <div
              key={idx}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", alignItems: "flex-end" }}
            >
              <Input
                label="Question text"
                value={card.title || ""}
                onChange={(e) => handleCmsArrayItemChange("FAQ.section_3", "cards", idx, "title", e.target.value)}
              />
              <Input
                label="Answer text"
                value={card.description || ""}
                onChange={(e) => handleCmsArrayItemChange("FAQ.section_3", "cards", idx, "description", e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveCmsArrayItem("FAQ.section_3", "cards", idx)}
                className="btn-secondary"
                style={{ color: "var(--error)", padding: "0.5rem" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Social FAQ Section 4 */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.01)",
          border: "1px solid var(--panel-border)",
          padding: "1.25rem",
          borderRadius: "16px"
        }}
      >
        <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>Footer Action Cards</h4>
        <div className="responsive-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Title"
            value={formData.courseCms?.FAQ?.section_4?.title || ""}
            onChange={(e) => handleCmsTextChange("FAQ.section_4", "title", e.target.value)}
          />
          <Input
            label="Subtitle"
            value={formData.courseCms?.FAQ?.section_4?.subtitle || ""}
            onChange={(e) => handleCmsTextChange("FAQ.section_4", "subtitle", e.target.value)}
          />
        </div>
        <Textarea
          label="Description"
          value={formData.courseCms?.FAQ?.section_4?.description || ""}
          onChange={(e) => handleCmsTextChange("FAQ.section_4", "description", e.target.value)}
        />

        {/* faq footer cards list */}
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
            <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Cards List</h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("FAQ.section_4", "cards", { title: "", link: "" })}
              className="btn-secondary"
              style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
            >
              + Add Action Card
            </button>
          </div>
          {(formData.courseCms?.FAQ?.section_4?.cards || []).map((card: any, idx: number) => (
            <div
              key={idx}
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.5rem", alignItems: "flex-end" }}
            >
              <Input
                label="Card Title"
                value={card.title || ""}
                onChange={(e) => handleCmsArrayItemChange("FAQ.section_4", "cards", idx, "title", e.target.value)}
              />
              <Input
                label="URL / Description"
                value={card.link || ""}
                onChange={(e) => handleCmsArrayItemChange("FAQ.section_4", "cards", idx, "link", e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveCmsArrayItem("FAQ.section_4", "cards", idx)}
                className="btn-secondary"
                style={{ color: "var(--error)", padding: "0.5rem" }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
