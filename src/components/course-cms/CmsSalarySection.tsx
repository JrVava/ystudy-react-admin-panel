import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";

export const CmsSalarySection: React.FC<CmsSectionProps> = ({
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
          {/* Social Salary fields */}
          <div
            className="responsive-form-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
          >
            <Input
              label="Badge"
              value={formData.courseCms?.salary?.badge || ""}
              onChange={(e) => handleCmsTextChange("salary", "badge", e.target.value)}
            />
            <Input
              label="Title"
              value={formData.courseCms?.salary?.title || ""}
              onChange={(e) => handleCmsTextChange("salary", "title", e.target.value)}
            />
          </div>
          <Textarea
            label="Description"
            value={formData.courseCms?.salary?.description || ""}
            onChange={(e) => handleCmsTextChange("salary", "description", e.target.value)}
          />

          {/* salary cards */}
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
              <h4 style={{ margin: 0, fontSize: "0.95rem" }}>Roles & Salaries</h4>
              <button
                type="button"
                onClick={() => handleAddCmsArrayItem("salary", "cards", { title: "", description: "" })}
                className="btn-secondary"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
              >
                + Add Role
              </button>
            </div>
            {(formData.courseCms?.salary?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "1rem",
                  alignItems: "flex-end",
                  background: "rgba(255,255,255,0.01)",
                  padding: "0.5rem",
                  borderRadius: "8px"
                }}
              >
                <Input
                  label="Role Title"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("salary", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Salary description"
                  value={card.description || ""}
                  onChange={(e) => handleCmsArrayItemChange("salary", "cards", idx, "description", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("salary", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem" }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* General Salary Block (Section 4) */}
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
                Section 4: Career & Salary Outcomes
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec4_status"
                  checked={formData.courseCms?.section_4?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_4", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec4_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_4?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_4", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_4?.title || ""}
                onChange={(e) => handleCmsTextChange("section_4", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_4?.description || ""}
              onChange={(e) => handleCmsTextChange("section_4", "description", e.target.value)}
            />

            {/* Salary Outcomes Cards Repeater */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Job Roles & Salaries</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_4", "cards", { title: "", description: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Job Role
                </button>
              </div>
              {(formData.courseCms?.section_4?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Job Role / Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_4", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Expected Salary / Text"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_4", "cards", idx, "description", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_4", "cards", idx)}
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
