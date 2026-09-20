import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";
import { CmsStatusToggle } from "./CmsStatusToggle";

export const CmsFundingSection: React.FC<CmsSectionProps> = ({
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
          {/* Social Funding Section 1 */}
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
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
                Funding Section 1: Student Finance Estimate
              </h4>
              <CmsStatusToggle
                id="fund1_status"
                path="funding.section_1"
                formData={formData}
                handleCmsTextChange={handleCmsTextChange}
              />
            </div>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.funding?.section_1?.badge || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.funding?.section_1?.title || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.funding?.section_1?.description || ""}
              onChange={(e) => handleCmsTextChange("funding.section_1", "description", e.target.value)}
            />
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}
            >
              <Input
                label="Total Support Card Title"
                placeholder="e.g. Total possible support"
                value={formData.courseCms?.funding?.section_1?.cardTItle || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "cardTItle", e.target.value)}
              />
              <Input
                label="Total Support Card Value"
                placeholder="e.g. £23,925"
                value={formData.courseCms?.funding?.section_1?.cardDescription || ""}
                onChange={(e) => handleCmsTextChange("funding.section_1", "cardDescription", e.target.value)}
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
                    handleAddCmsArrayItem("funding.section_1", "cards", { title: "", description: "", link: "" })
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
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_1", "cards", idx, "description", e.target.value)
                    }
                  />
                  <Input
                    label="Link Url"
                    value={card.link || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_1", "cards", idx, "link", e.target.value)
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
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}
            >
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>
                Funding Section 2: Why This Course
              </h4>
              <CmsStatusToggle
                id="fund2_status"
                path="funding.section_2"
                formData={formData}
                handleCmsTextChange={handleCmsTextChange}
              />
            </div>
            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Badge"
                value={formData.courseCms?.funding?.section_2?.badge || ""}
                onChange={(e) => handleCmsTextChange("funding.section_2", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.funding?.section_2?.title || ""}
                onChange={(e) => handleCmsTextChange("funding.section_2", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.funding?.section_2?.description || ""}
              onChange={(e) => handleCmsTextChange("funding.section_2", "description", e.target.value)}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Reason Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("funding.section_2", "cards", { icon: "", title: "", description: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Reason Card
                </button>
              </div>
              {(formData.courseCms?.funding?.section_2?.cards || []).map((card: any, idx: number) => (
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
                    label="Icon (emoji)"
                    placeholder="e.g. 💼"
                    value={card.icon || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_2", "cards", idx, "icon", e.target.value)
                    }
                  />
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_2", "cards", idx, "title", e.target.value)
                    }
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("funding.section_2", "cards", idx, "description", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("funding.section_2", "cards", idx)}
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
                Section 5: Progression Ladder
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Progression Steps</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("section_5", "cards", { badge: "", title: "", description: "", salary: "" })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Step
                </button>
              </div>
              {(formData.courseCms?.section_5?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr 100px auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Step #"
                    placeholder="e.g. 1"
                    value={card.badge || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "badge", e.target.value)}
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
                  <Input
                    label="Salary"
                    placeholder="e.g. £24k–£30k"
                    value={card.salary || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "salary", e.target.value)}
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
                Section 6: Entry Routes Intro
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

            {/* Entry route cards */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Entry Route Cards</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_6", "cards", { title: "", description: "", link: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Route Card
                </button>
              </div>
              {(formData.courseCms?.section_6?.cards || []).map((card: any, idx: number) => (
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
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "description", e.target.value)}
                  />
                  <Input
                    label="Link Url"
                    value={card.link || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "link", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_6", "cards", idx)}
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
