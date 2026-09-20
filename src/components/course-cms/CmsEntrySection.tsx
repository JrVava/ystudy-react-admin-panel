import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import type { CmsSectionProps } from "./types.ts";
import { CmsStatusToggle } from "./CmsStatusToggle";

export const CmsEntrySection: React.FC<CmsSectionProps> = ({
  formData,
  handleCmsTextChange,
  handleAddCmsArrayItem,
  handleRemoveCmsArrayItem,
  handleCmsArrayItemChange,
  allCoursesList = []
}) => {
  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {formData.courseType === "Social" ? (
        <>
          {/* Social Entry Section 1 */}
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
                General Entry Requirements
              </h4>
              <CmsStatusToggle
                id="entry1_status"
                path="Entry.section_1"
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
                value={formData.courseCms?.Entry?.section_1?.badge || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_1", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.Entry?.section_1?.title || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_1", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.Entry?.section_1?.description || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_1", "description", e.target.value)}
            />

            {/* entry qualifications cards list */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Requirements Rows</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("Entry.section_1", "cards", {
                      parentClass: "entryrow",
                      icon: "✓",
                      title: "",
                      description: ""
                    })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Row
                </button>
              </div>
              {(formData.courseCms?.Entry?.section_1?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 80px 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Row Style (parentClass)"
                    placeholder="e.g. entryrow or entryrow q"
                    value={card.parentClass || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("Entry.section_1", "cards", idx, "parentClass", e.target.value)
                    }
                  />
                  <Input
                    label="Icon"
                    placeholder="✓ or ?"
                    value={card.icon || ""}
                    onChange={(e) => handleCmsArrayItemChange("Entry.section_1", "cards", idx, "icon", e.target.value)}
                  />
                  <Input
                    label="Qualification Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("Entry.section_1", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Details / Requirements"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("Entry.section_1", "cards", idx, "description", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("Entry.section_1", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Entry Section 2 */}
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
                Upcoming Intakes Intro
              </h4>
              <CmsStatusToggle
                id="entry2_status"
                path="Entry.section_2"
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
                value={formData.courseCms?.Entry?.section_2?.badge || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_2", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.Entry?.section_2?.title || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_2", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.Entry?.section_2?.description || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_2", "description", e.target.value)}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
              Intake dates themselves come from the Upcoming Intakes module, not this section.
            </p>
          </div>

          {/* Social Entry Section 3 */}
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
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, marginBottom: "1rem" }}>Toolkit Section</h4>
              <CmsStatusToggle
                id="entry3_status"
                path="Entry.section_3"
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
                value={formData.courseCms?.Entry?.section_3?.badge || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_3", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.Entry?.section_3?.title || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_3", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.Entry?.section_3?.description || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_3", "description", e.target.value)}
            />

            {/* toolkit cards */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Toolkit Cards</h5>
                <button
                  type="button"
                  onClick={() =>
                    handleAddCmsArrayItem("Entry.section_3", "cards", {
                      icons: "",
                      title: "",
                      description: "",
                      btnName: "",
                      link: ""
                    })
                  }
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Toolkit Card
                </button>
              </div>
              {(formData.courseCms?.Entry?.section_3?.cards || []).map((card: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1fr 1fr 1fr 1fr auto",
                    gap: "0.5rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="Icon (emoji)"
                    placeholder="e.g. 📄"
                    value={card.icons || ""}
                    onChange={(e) => handleCmsArrayItemChange("Entry.section_3", "cards", idx, "icons", e.target.value)}
                  />
                  <Input
                    label="Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("Entry.section_3", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Description"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("Entry.section_3", "cards", idx, "description", e.target.value)
                    }
                  />
                  <Input
                    label="Button Text"
                    placeholder="e.g. Build my CV →"
                    value={card.btnName || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("Entry.section_3", "cards", idx, "btnName", e.target.value)
                    }
                  />
                  <Input
                    label="Link Url"
                    value={card.link || ""}
                    onChange={(e) => handleCmsArrayItemChange("Entry.section_3", "cards", idx, "link", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("Entry.section_3", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Social Entry Section 4 */}
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
                Conversion Band (Title + Salary Snapshot)
              </h4>
              <CmsStatusToggle
                id="entry4_status"
                path="Entry.section_4"
                formData={formData}
                handleCmsTextChange={handleCmsTextChange}
              />
            </div>
            <Input
              label="Title"
              value={formData.courseCms?.Entry?.section_4?.title || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_4", "title", e.target.value)}
            />
            <Textarea
              label="Description"
              value={formData.courseCms?.Entry?.section_4?.description || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_4", "description", e.target.value)}
            />
          </div>

          {/* Social Entry Section 5 */}
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
                Related & Alternatives Intro
              </h4>
              <CmsStatusToggle
                id="entry5_status"
                path="Entry.section_5"
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
                value={formData.courseCms?.Entry?.section_5?.badge || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_5", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.Entry?.section_5?.title || ""}
                onChange={(e) => handleCmsTextChange("Entry.section_5", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.Entry?.section_5?.description || ""}
              onChange={(e) => handleCmsTextChange("Entry.section_5", "description", e.target.value)}
            />
          </div>
        </>
      ) : (
        <>
          {/* General Entry blocks (Section 10, 11, 12) */}
          {/* Section 10 */}
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
                Section 10: General Entry Requirements & featured course
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec10_status"
                  checked={formData.courseCms?.section_10?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_10", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec10_status" className="form-label" style={{ margin: 0 }}>
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
                value={formData.courseCms?.section_10?.badge || ""}
                onChange={(e) => handleCmsTextChange("section_10", "badge", e.target.value)}
              />
              <Input
                label="Title"
                value={formData.courseCms?.section_10?.title || ""}
                onChange={(e) => handleCmsTextChange("section_10", "title", e.target.value)}
              />
            </div>
            <Textarea
              label="Description"
              value={formData.courseCms?.section_10?.description || ""}
              onChange={(e) => handleCmsTextChange("section_10", "description", e.target.value)}
            />

            {/* Featured Course selector */}
            <div className="form-group" style={{ marginTop: "1rem" }}>
              <label className="form-label">Featured Related Course link</label>
              <select
                className="form-input"
                value={formData.courseCms?.section_10?.featured_course || ""}
                onChange={(e) => handleCmsTextChange("section_10", "featured_course", e.target.value)}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--panel-border)"
                }}
              >
                <option value="" style={{ background: "#0b0f19" }}>
                  None Selected
                </option>
                {allCoursesList.map((c: any) => (
                  <option key={c._id} value={c._id} style={{ background: "#0b0f19" }}>
                    {c.title || c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 11 Intakes */}
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
                Section 11: General Intakes Information
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec11_status"
                  checked={formData.courseCms?.section_11?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_11", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec11_status" className="form-label" style={{ margin: 0 }}>
                  Visible
                </label>
              </div>
            </div>

            {/* Intakes cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Intake details list</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_11", "cards", { title: "", description: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Intake
                </button>
              </div>
              {(formData.courseCms?.section_11?.cards || []).map((card: any, idx: number) => (
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
                    label="Intake Date / Term"
                    placeholder="e.g. September 2026"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_11", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Application Deadline / Status"
                    placeholder="e.g. Open for application"
                    value={card.description || ""}
                    onChange={(e) =>
                      handleCmsArrayItemChange("section_11", "cards", idx, "description", e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_11", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem" }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 12 Toolkit */}
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
                Section 12: Application Assistance Toolkit
              </h4>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  id="sec12_status"
                  checked={formData.courseCms?.section_12?.status !== false}
                  onChange={(e) => handleCmsTextChange("section_12", "status", e.target.checked)}
                  style={{ width: "16px", height: "16px" }}
                />
                <label htmlFor="sec12_status" className="form-label" style={{ margin: 0 }}>
                  Visible
                </label>
              </div>
            </div>

            <div
              className="responsive-form-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}
            >
              <Input
                label="Title"
                value={formData.courseCms?.section_12?.title || ""}
                onChange={(e) => handleCmsTextChange("section_12", "title", e.target.value)}
              />
              <Input
                label="Description"
                value={formData.courseCms?.section_12?.description || ""}
                onChange={(e) => handleCmsTextChange("section_12", "description", e.target.value)}
              />
            </div>

            {/* Toolkit tools list mapping */}
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
                <h5 style={{ margin: 0, fontSize: "0.9rem" }}>Featured Tools</h5>
                <button
                  type="button"
                  onClick={() => handleAddCmsArrayItem("section_12", "cards", { title: "", link: "" })}
                  className="btn-secondary"
                  style={{ padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                >
                  + Add Tool Card
                </button>
              </div>
              {(formData.courseCms?.section_12?.cards || []).map((card: any, idx: number) => (
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
                    label="Tool Title"
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_12", "cards", idx, "title", e.target.value)}
                  />
                  <Input
                    label="Tool Page Link"
                    placeholder="e.g. /tools/personal-statement"
                    value={card.link || card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_12", "cards", idx, "link", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_12", "cards", idx)}
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
