import React from "react";
import Input from "../Input";
import Textarea from "../Textarea";
import { Plus, Trash2 } from "lucide-react";

export interface SubjectCmsSectionsProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export const SubjectCmsSections: React.FC<SubjectCmsSectionsProps> = ({ formData, setFormData }) => {
  const cms = formData.cms || {};

  const handleCmsTextChange = (section: string, key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      cms: {
        ...prev.cms,
        [section]: {
          ...(prev.cms?.[section] || {}),
          [key]: value
        }
      }
    }));
  };

  const handleAddCmsArrayItem = (section: string, arrayField: string, defaultObj: any) => {
    setFormData((prev: any) => {
      const secData = prev.cms?.[section] || {};
      const currentArray = Array.isArray(secData[arrayField]) ? [...secData[arrayField]] : [];
      currentArray.push(defaultObj);
      return {
        ...prev,
        cms: {
          ...prev.cms,
          [section]: {
            ...secData,
            [arrayField]: currentArray
          }
        }
      };
    });
  };

  const handleRemoveCmsArrayItem = (section: string, arrayField: string, index: number) => {
    setFormData((prev: any) => {
      const secData = prev.cms?.[section] || {};
      const currentArray = Array.isArray(secData[arrayField]) ? [...secData[arrayField]] : [];
      currentArray.splice(index, 1);
      return {
        ...prev,
        cms: {
          ...prev.cms,
          [section]: {
            ...secData,
            [arrayField]: currentArray
          }
        }
      };
    });
  };

  const handleCmsArrayItemChange = (section: string, arrayField: string, index: number, key: string, value: any) => {
    setFormData((prev: any) => {
      const secData = prev.cms?.[section] || {};
      const currentArray = Array.isArray(secData[arrayField]) ? [...secData[arrayField]] : [];
      if (!currentArray[index]) {
        currentArray[index] = {};
      }
      currentArray[index] = { ...currentArray[index], [key]: value };
      return {
        ...prev,
        cms: {
          ...prev.cms,
          [section]: {
            ...secData,
            [arrayField]: currentArray
          }
        }
      };
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* SECTION 2: Popular Courses Banner */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 2
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Popular Courses Banner
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec2_status"
              checked={cms.section_2?.status !== false}
              onChange={(e) => handleCmsTextChange("section_2", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec2_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. Popular courses"
            value={cms.section_2?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_2", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Health & Social Care courses adults often compare."
            value={cms.section_2?.title || ""}
            onChange={(e) => handleCmsTextChange("section_2", "title", e.target.value)}
          />
        </div>
        <Textarea
          label="Section Description"
          placeholder="e.g. Use these as starting points. An adviser can help you choose..."
          value={cms.section_2?.description || ""}
          onChange={(e) => handleCmsTextChange("section_2", "description", e.target.value)}
          minHeight="70px"
        />
      </div>

      {/* SECTION 3: Why Study This Subject */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 3
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Why Study This Subject?
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec3_status"
              checked={cms.section_3?.status !== false}
              onChange={(e) => handleCmsTextChange("section_3", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec3_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. Why study this subject?"
            value={cms.section_3?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_3", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Useful if you want a practical career direction."
            value={cms.section_3?.title || ""}
            onChange={(e) => handleCmsTextChange("section_3", "title", e.target.value)}
          />
        </div>
        <Textarea
          label="Section Description"
          placeholder="Provide context on why mature students choose this subject..."
          value={cms.section_3?.description || ""}
          onChange={(e) => handleCmsTextChange("section_3", "description", e.target.value)}
          minHeight="70px"
        />

        {/* Feature Cards Repeater */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--panel-border)", paddingTop: "1.25rem" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Feature Cards ({cms.section_3?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("section_3", "cards", { title: "", description: "" })}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Feature Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(cms.section_3?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <Input
                  label={`Card #${idx + 1} Title`}
                  placeholder="e.g. Career change"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_3", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Description"
                  placeholder="e.g. Use the degree to move into a new sector..."
                  value={card.description || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_3", "cards", idx, "description", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("section_3", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: Career Outcomes */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 4
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Career Outcomes
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec4_status"
              checked={cms.section_4?.status !== false}
              onChange={(e) => handleCmsTextChange("section_4", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec4_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. Career outcomes"
            value={cms.section_4?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_4", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Roles this subject can lead towards."
            value={cms.section_4?.title || ""}
            onChange={(e) => handleCmsTextChange("section_4", "title", e.target.value)}
          />
        </div>

        {/* Career Role Cards Repeater */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--panel-border)", paddingTop: "1.25rem" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Career Role Cards ({cms.section_4?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("section_4", "cards", { title: "", description: "" })}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Role Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(cms.section_4?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <Input
                  label={`Role #${idx + 1} Title`}
                  placeholder="e.g. Support Manager"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_4", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Description"
                  placeholder="e.g. Build relevant academic knowledge..."
                  value={card.description || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_4", "cards", idx, "description", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("section_4", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 5: Salary Progression */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 5
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Salary Progression
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec5_status"
              checked={cms.section_5?.status !== false}
              onChange={(e) => handleCmsTextChange("section_5", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec5_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. Salary progression"
            value={cms.section_5?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_5", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Typical earning stages to compare."
            value={cms.section_5?.title || ""}
            onChange={(e) => handleCmsTextChange("section_5", "title", e.target.value)}
          />
        </div>
        <Textarea
          label="Section Description"
          placeholder="e.g. Figures vary by region, employer and experience..."
          value={cms.section_5?.description || ""}
          onChange={(e) => handleCmsTextChange("section_5", "description", e.target.value)}
          minHeight="70px"
        />

        {/* Salary Stage Cards Repeater */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--panel-border)", paddingTop: "1.25rem" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Salary Stage Cards ({cms.section_5?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("section_5", "cards", { title: "", price: "", description: "" })}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Stage Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(cms.section_5?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "180px 140px 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <Input
                  label="Stage Title"
                  placeholder="e.g. Entry / Senior"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Price / Salary"
                  placeholder="e.g. £23k or £55k+"
                  value={card.price || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "price", e.target.value)}
                />
                <Input
                  label="Description"
                  placeholder="e.g. First graduate or transition roles."
                  value={card.description || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_5", "cards", idx, "description", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("section_5", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 6: Funding Snapshot */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 6
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Funding Snapshot
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec6_status"
              checked={cms.section_6?.status !== false}
              onChange={(e) => handleCmsTextChange("section_6", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec6_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        {/* Funding Cards Repeater */}
        <div>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Funding Cards ({cms.section_6?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() =>
                handleAddCmsArrayItem("section_6", "cards", {
                  className: "v705-card",
                  badge: "",
                  title: "",
                  description: "",
                  link: "",
                  linkName: "Learn more"
                })
              }
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Funding Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {(cms.section_6?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.85rem",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 180px 1fr auto",
                    gap: "0.85rem",
                    alignItems: "flex-end"
                  }}
                >
                  <Input
                    label="CSS Class Name"
                    placeholder="e.g. v705-card dark"
                    value={card.className || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "className", e.target.value)}
                  />
                  <Input
                    label="Badge Text"
                    placeholder="e.g. Funding snapshot"
                    value={card.badge || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "badge", e.target.value)}
                  />
                  <Input
                    label="Title"
                    placeholder="e.g. Check funding before you apply."
                    value={card.title || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "title", e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveCmsArrayItem("section_6", "cards", idx)}
                    className="btn-secondary"
                    style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 180px", gap: "0.85rem" }}>
                  <Textarea
                    label="Description"
                    placeholder="Detailed funding description..."
                    value={card.description || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "description", e.target.value)}
                    minHeight="60px"
                  />
                  <Input
                    label="Button Link URL"
                    placeholder="e.g. /funding-calculator"
                    value={card.link || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "link", e.target.value)}
                  />
                  <Input
                    label="Link Label"
                    placeholder="e.g. Learn more"
                    value={card.linkName || ""}
                    onChange={(e) => handleCmsArrayItemChange("section_6", "cards", idx, "linkName", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 7: Related Subjects Header */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 7
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Related Subjects Header
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec7_status"
              checked={cms.section_7?.status !== false}
              onChange={(e) => handleCmsTextChange("section_7", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec7_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. Related subjects"
            value={cms.section_7?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_7", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Compare nearby routes."
            value={cms.section_7?.title || ""}
            onChange={(e) => handleCmsTextChange("section_7", "title", e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 8: FAQ Section Header */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 8
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              FAQ Section Header
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec8_status"
              checked={cms.section_8?.status !== false}
              onChange={(e) => handleCmsTextChange("section_8", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec8_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input
            label="Badge Text"
            placeholder="e.g. FAQ"
            value={cms.section_8?.badge || ""}
            onChange={(e) => handleCmsTextChange("section_8", "badge", e.target.value)}
          />
          <Input
            label="Section Title"
            placeholder="e.g. Questions before choosing this subject."
            value={cms.section_8?.title || ""}
            onChange={(e) => handleCmsTextChange("section_8", "title", e.target.value)}
          />
        </div>
      </div>

      {/* SECTION 9: Help & Adviser Callout */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 9
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Help & Adviser Callout
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec9_status"
              checked={cms.section_9?.status !== false}
              onChange={(e) => handleCmsTextChange("section_9", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec9_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input
            label="Section Title"
            placeholder="e.g. Want help choosing a course?"
            value={cms.section_9?.title || ""}
            onChange={(e) => handleCmsTextChange("section_9", "title", e.target.value)}
          />
          <Textarea
            label="Section Description"
            placeholder="e.g. Check your eligibility or apply with adviser support."
            value={cms.section_9?.description || ""}
            onChange={(e) => handleCmsTextChange("section_9", "description", e.target.value)}
            minHeight="70px"
          />
        </div>
      </div>

      {/* SECTION 10: Action Cards Grid */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 10
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Action Cards Grid
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec10_status"
              checked={cms.section_10?.status !== false}
              onChange={(e) => handleCmsTextChange("section_10", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec10_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        {/* Action Cards Repeater */}
        <div>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Action Cards ({cms.section_10?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("section_10", "cards", { title: "", description: "" })}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Action Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(cms.section_10?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <Input
                  label={`Card #${idx + 1} Title`}
                  placeholder="e.g. Check if you can get funded."
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_10", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Description"
                  placeholder="e.g. Quickly understand if you may qualify..."
                  value={card.description || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_10", "cards", idx, "description", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("section_10", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 11: Useful Next Steps */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.015)",
          border: "1px solid var(--panel-border)",
          padding: "1.5rem",
          borderRadius: "16px"
        }}
      >
        <div
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}
        >
          <div>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                background: "rgba(99, 102, 241, 0.12)",
                padding: "2px 8px",
                borderRadius: "4px"
              }}
            >
              Section 11
            </span>
            <h4 style={{ fontSize: "1.05rem", fontWeight: 700, margin: "0.35rem 0 0 0", color: "var(--text-primary)" }}>
              Useful Next Steps
            </h4>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="checkbox"
              id="sec11_status"
              checked={cms.section_11?.status !== false}
              onChange={(e) => handleCmsTextChange("section_11", "status", e.target.checked)}
              style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <label
              htmlFor="sec11_status"
              className="form-label"
              style={{ margin: 0, cursor: "pointer", fontWeight: 600 }}
            >
              Visible
            </label>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <Input
            label="Section Title"
            placeholder="e.g. Useful next steps"
            value={cms.section_11?.title || ""}
            onChange={(e) => handleCmsTextChange("section_11", "title", e.target.value)}
          />
          <Textarea
            label="Section Description"
            placeholder="e.g. Move from information to action..."
            value={cms.section_11?.description || ""}
            onChange={(e) => handleCmsTextChange("section_11", "description", e.target.value)}
            minHeight="70px"
          />
        </div>

        {/* Next Step Cards Repeater */}
        <div style={{ marginTop: "1.25rem", borderTop: "1px solid var(--panel-border)", paddingTop: "1.25rem" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}
          >
            <h5 style={{ margin: 0, fontSize: "0.925rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Next Step Cards ({cms.section_11?.cards?.length || 0})
            </h5>
            <button
              type="button"
              onClick={() => handleAddCmsArrayItem("section_11", "cards", { title: "", link: "" })}
              className="btn-secondary"
              style={{
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <Plus size={14} /> Add Step Card
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
            {(cms.section_11?.cards || []).map((card: any, idx: number) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.85rem",
                  alignItems: "flex-end",
                  background: "rgba(0, 0, 0, 0.25)",
                  padding: "0.85rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
                }}
              >
                <Input
                  label={`Step #${idx + 1} Title`}
                  placeholder="e.g. Find degrees"
                  value={card.title || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_11", "cards", idx, "title", e.target.value)}
                />
                <Input
                  label="Link / Subtitle"
                  placeholder="e.g. Quickly understand if you qualify..."
                  value={card.link || ""}
                  onChange={(e) => handleCmsArrayItemChange("section_11", "cards", idx, "link", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveCmsArrayItem("section_11", "cards", idx)}
                  className="btn-secondary"
                  style={{ color: "var(--error)", padding: "0.5rem", height: "38px" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
