import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { repaymentThresholdsPlanApi } from "../utils/repaymentThresholdsPlanApi";
import type { TableColumn, TableRow } from "../utils/repaymentThresholdsPlanApi";
import {
  Save,
  ArrowLeft,
  Table2,
  Plus,
  Trash2,
  Columns,
  Eye,
  CheckCircle2,
  Sparkles,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { toast } from "../context/ToastContext";

// Standard starter columns for repayment thresholds
const DEFAULT_COLUMNS: TableColumn[] = [
  { key: "plan", header: "Plan" },
  { key: "weekly", header: "Weekly Threshold" },
  { key: "monthly", header: "Monthly Threshold" },
  { key: "yearly", header: "Yearly Threshold" },
  { key: "who_for", header: "Who it's usually for" }
];

const DEFAULT_ROWS: TableRow[] = [
  {
    isHighlighted: true,
    plan: "Plan 1",
    weekly: "£517",
    monthly: "£2,241",
    yearly: "£26,900",
    who_for: "Started before 2012"
  },
  {
    isHighlighted: true,
    plan: "Plan 2",
    weekly: "£565",
    monthly: "£2,448",
    yearly: "£29,385",
    who_for: "English undergrad, 2012–2022"
  },
  {
    isHighlighted: true,
    plan: "Plan 4",
    weekly: "£649",
    monthly: "£2,816",
    yearly: "£33,795",
    who_for: "Scotland"
  },
  {
    isHighlighted: true,
    plan: "Plan 5",
    weekly: "£480",
    monthly: "£2,083",
    yearly: "£25,000",
    who_for: "English undergrad from 2023"
  },
  {
    isHighlighted: true,
    plan: "Postgraduate Loan",
    weekly: "£403",
    monthly: "£1,750",
    yearly: "£21,000",
    who_for: "Master's or Doctoral loans"
  }
];

const slugifyKey = (text: string): string => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]+/g, "")
      .replace(/__+/g, "_")
      .replace(/^_+|_+$/g, "") || `col_${Date.now()}`
  );
};

export const RepaymentThresholdsPlanAdminPanel: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Form State
  const [columns, setColumns] = useState<TableColumn[]>(isEditMode ? [] : DEFAULT_COLUMNS);
  const [rows, setRows] = useState<TableRow[]>(isEditMode ? [] : DEFAULT_ROWS);
  const [status, setStatus] = useState<boolean>(true);

  // New column modal/popover state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColHeader, setNewColHeader] = useState("");
  const [newColKey, setNewColKey] = useState("");
  const [newColDefault, setNewColDefault] = useState("");

  useEffect(() => {
    if (isEditMode && id) {
      fetchPlan(id);
    } else if (!isEditMode) {
      // Check if a record already exists; only allow one record
      const checkExistingPlan = async () => {
        try {
          setLoading(true);
          const res = await repaymentThresholdsPlanApi.getPaginated(1, 1);
          if (res && res.data && res.data.length > 0) {
            toast.info("A repayment thresholds plan already exists. Only one record is allowed.");
            navigate(`/repayment-thresholds-plans/edit/${res.data[0]._id}`, { replace: true });
          }
        } catch (e) {
          console.error("Failed to check existing plans", e);
        } finally {
          setLoading(false);
        }
      };
      checkExistingPlan();
    }
  }, [id, isEditMode, navigate]);

  const fetchPlan = async (planId: string) => {
    try {
      setLoading(true);
      const data = await repaymentThresholdsPlanApi.getById(planId);
      if (data) {
        setColumns(data.columns || []);
        setRows(data.rows || []);
        setStatus(data.status !== false);
      } else {
        toast.error("Repayment thresholds plan not found");
        navigate("/repayment-thresholds-plans");
      }
    } catch (e: any) {
      console.error("Failed to load plan:", e);
      toast.error(e.message || "Failed to load repayment plan details");
      navigate("/repayment-thresholds-plans");
    } finally {
      setLoading(false);
    }
  };

  // Add a new column
  const handleAddColumn = () => {
    if (!newColHeader.trim()) {
      toast.warning("Column header is required");
      return;
    }

    const key = newColKey.trim() ? slugifyKey(newColKey) : slugifyKey(newColHeader);

    if (columns.some((c) => c.key === key)) {
      toast.warning(`A column with key "${key}" already exists. Please choose a different name.`);
      return;
    }

    const newColumn: TableColumn = {
      header: newColHeader.trim(),
      key
    };

    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);

    // Populate new key in existing rows with optional default value
    setRows((prevRows) =>
      prevRows.map((r) => ({
        ...r,
        [key]: newColDefault || ""
      }))
    );

    // Reset column dialog
    setNewColHeader("");
    setNewColKey("");
    setNewColDefault("");
    setIsAddingColumn(false);
    toast.success(`Column "${newColumn.header}" added.`);
  };

  // Update existing column header
  const handleUpdateColumnHeader = (index: number, newHeader: string) => {
    setColumns((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], header: newHeader };
      return copy;
    });
  };

  // Move column left or right
  const handleMoveColumn = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= columns.length) return;

    setColumns((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Remove a column
  const handleRemoveColumn = (index: number) => {
    const targetCol = columns[index];
    if (!targetCol) return;

    if (columns.length <= 1) {
      toast.warning("At least one column is required.");
      return;
    }

    if (!window.confirm(`Are you sure you want to remove the column "${targetCol.header}"?`)) {
      return;
    }

    const updatedCols = columns.filter((_, i) => i !== index);
    setColumns(updatedCols);

    // Clean up key from rows
    setRows((prev) =>
      prev.map((r) => {
        const copy = { ...r };
        delete copy[targetCol.key];
        return copy;
      })
    );

    toast.info(`Column "${targetCol.header}" removed.`);
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow: TableRow = { isHighlighted: false };
    columns.forEach((col) => {
      newRow[col.key] = "";
    });
    setRows((prev) => [...prev, newRow]);
  };

  // Update a row's cell value
  const handleUpdateCell = (rowIndex: number, columnKey: string, value: string) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        [columnKey]: value
      };
      return copy;
    });
  };

  // Toggle row highlight
  const handleToggleHighlight = (rowIndex: number) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        isHighlighted: !copy[rowIndex].isHighlighted
      };
      return copy;
    });
  };

  // Move row up or down
  const handleMoveRow = (rowIndex: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? rowIndex - 1 : rowIndex + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    setRows((prev) => {
      const copy = [...prev];
      const temp = copy[rowIndex];
      copy[rowIndex] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Remove a row
  const handleRemoveRow = (rowIndex: number) => {
    setRows((prev) => prev.filter((_, idx) => idx !== rowIndex));
  };

  // Load default template if empty
  const handleLoadTemplate = () => {
    if (
      rows.length > 0 &&
      !window.confirm("This will replace current columns and rows with the default repayment template. Continue?")
    ) {
      return;
    }
    setColumns(DEFAULT_COLUMNS);
    setRows(DEFAULT_ROWS);
    toast.success("Default template loaded!");
  };

  // Submit and save
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (columns.length === 0) {
      toast.warning("At least one column is required!");
      return;
    }

    if (rows.length === 0) {
      toast.warning("At least one row is required!");
      return;
    }

    try {
      setSaving(true);

      // Guard: only one record is allowed
      if (!isEditMode) {
        const existingCheck = await repaymentThresholdsPlanApi.getPaginated(1, 1);
        if (existingCheck && existingCheck.data && existingCheck.data.length > 0) {
          toast.warning("A repayment thresholds plan already exists. Only one record is allowed.");
          navigate(`/repayment-thresholds-plans/edit/${existingCheck.data[0]._id}`);
          return;
        }
      }

      const payload = {
        columns,
        rows,
        status
      };

      let res;
      if (isEditMode && id) {
        res = await repaymentThresholdsPlanApi.update(id, payload);
      } else {
        res = await repaymentThresholdsPlanApi.create(payload);
      }

      if (res && (res.success || res.planId || res.message)) {
        toast.success(isEditMode ? "Plan updated successfully!" : "Plan created successfully!");
        navigate("/repayment-thresholds-plans");
      } else {
        toast.error("Failed to save: " + (res?.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save repayment thresholds plan");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: "var(--text-secondary)" }}>
        <span>Loading repayment thresholds plan...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: "1.5rem" }}>
        <div>
          <button
            onClick={() => navigate("/repayment-thresholds-plans")}
            className="btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              marginBottom: "1rem"
            }}
          >
            <ArrowLeft size={14} /> Back to Plans
          </button>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Table2 size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            {isEditMode ? "Edit Repayment Thresholds Plan" : "New Repayment Thresholds Plan"}
          </h1>
          <p className="page-subtitle">
            Configure dynamic table columns, repayment threshold rates, and loan plan matrices.
          </p>
        </div>

        {/* View Mode Toggle & Template Loader */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {!isEditMode && rows.length === 0 && (
            <button
              type="button"
              onClick={handleLoadTemplate}
              className="btn-secondary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem" }}
            >
              <Sparkles size={14} style={{ color: "var(--warning)" }} />
              Load UK Student Loan Template
            </button>
          )}

          <div
            style={{
              display: "flex",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "10px",
              padding: "3px",
              border: "1px solid var(--panel-border)"
            }}
          >
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "edit" ? "var(--primary)" : "transparent",
                color: viewMode === "edit" ? "#fff" : "var(--text-secondary)",
                transition: "all 0.2s ease"
              }}
            >
              <Columns size={14} /> Matrix Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                background: viewMode === "preview" ? "var(--primary)" : "transparent",
                color: viewMode === "preview" ? "#fff" : "var(--text-secondary)",
                transition: "all 0.2s ease"
              }}
            >
              <Eye size={14} /> Live Preview
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Column Management Section */}
        <div
          className="panel-glass"
          style={{ padding: "1.25rem", marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "0.5rem"
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                <Columns size={18} style={{ color: "var(--primary)" }} />
                Table Columns ({columns.length})
              </h3>
              <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Drag or order columns, rename headers, or add custom thresholds.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingColumn(!isAddingColumn)}
              className="btn-secondary"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                fontSize: "0.8rem",
                padding: "6px 12px"
              }}
            >
              <Plus size={14} /> {isAddingColumn ? "Cancel" : "Add Column"}
            </button>
          </div>

          {/* Add Column Popup Form */}
          {isAddingColumn && (
            <div
              style={{
                padding: "1rem",
                borderRadius: "10px",
                background: "rgba(99, 102, 241, 0.08)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr)) auto",
                gap: "0.75rem",
                alignItems: "end"
              }}
            >
              <div>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>
                  Column Header Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Deduction"
                  value={newColHeader}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNewColHeader(val);
                    if (!newColKey || newColKey === slugifyKey(newColHeader)) {
                      setNewColKey(slugifyKey(val));
                    }
                  }}
                  className="form-input"
                  style={{ height: "36px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>
                  Key (Identifier)
                </label>
                <input
                  type="text"
                  placeholder="e.g. monthly_deduction"
                  value={newColKey}
                  onChange={(e) => setNewColKey(e.target.value)}
                  className="form-input"
                  style={{ height: "36px", fontSize: "0.85rem" }}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: "0.8rem" }}>
                  Default Value for Existing Rows (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. £0 or N/A"
                  value={newColDefault}
                  onChange={(e) => setNewColDefault(e.target.value)}
                  className="form-input"
                  style={{ height: "36px", fontSize: "0.85rem" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className="btn-primary"
                  style={{ height: "36px", padding: "0 1rem", fontSize: "0.85rem" }}
                >
                  Save Column
                </button>
              </div>
            </div>
          )}

          {/* Current Column Chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {columns.map((col, index) => (
              <div
                key={col.key || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid var(--panel-border)",
                  borderRadius: "8px",
                  padding: "6px 10px"
                }}
              >
                <input
                  type="text"
                  value={col.header}
                  onChange={(e) => handleUpdateColumnHeader(index, e.target.value)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    outline: "none",
                    width: `${Math.max(col.header.length * 8 + 10, 80)}px`,
                    maxWidth: "160px"
                  }}
                  title="Click to rename header"
                />

                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>({col.key})</span>

                <div style={{ display: "flex", alignItems: "center", gap: "2px", marginLeft: "4px" }}>
                  <button
                    type="button"
                    onClick={() => handleMoveColumn(index, "left")}
                    disabled={index === 0}
                    style={{
                      background: "none",
                      border: "none",
                      color: index === 0 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                      cursor: index === 0 ? "default" : "pointer",
                      padding: "2px"
                    }}
                    title="Move left"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveColumn(index, "right")}
                    disabled={index === columns.length - 1}
                    style={{
                      background: "none",
                      border: "none",
                      color: index === columns.length - 1 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                      cursor: index === columns.length - 1 ? "default" : "pointer",
                      padding: "2px"
                    }}
                    title="Move right"
                  >
                    →
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveColumn(index)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--error)",
                      cursor: "pointer",
                      padding: "2px",
                      marginLeft: "4px"
                    }}
                    title="Remove column"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matrix Editor View */}
        {viewMode === "edit" ? (
          <div className="panel-glass" style={{ padding: "1.25rem", marginBottom: "1.5rem", overflowX: "auto" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem"
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}>Table Rows ({rows.length})</h3>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Enter values for each column. Toggle star to highlight key rows on the frontend.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddRow}
                className="btn-primary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.8rem",
                  padding: "6px 12px"
                }}
              >
                <Plus size={14} /> Add Row
              </button>
            </div>

            {/* Editable Matrix Grid */}
            <div style={{ overflowX: "auto", border: "1px solid var(--panel-border)", borderRadius: "10px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
                <thead>
                  <tr style={{ background: "rgba(10, 14, 26, 0.7)", borderBottom: "1px solid var(--panel-border)" }}>
                    <th
                      style={{ padding: "10px 12px", width: "40px", color: "var(--text-secondary)", fontWeight: 600 }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        width: "80px",
                        color: "var(--text-secondary)",
                        fontWeight: 600,
                        textAlign: "center"
                      }}
                      title="Highlighted row"
                    >
                      Highlight
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{
                          padding: "10px 12px",
                          color: "var(--text-primary)",
                          fontWeight: 700,
                          minWidth: "150px"
                        }}
                      >
                        {col.header}
                      </th>
                    ))}
                    <th
                      style={{
                        padding: "10px 12px",
                        width: "90px",
                        textAlign: "center",
                        color: "var(--text-secondary)",
                        fontWeight: 600
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rIndex) => (
                    <tr
                      key={rIndex}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        background: row.isHighlighted
                          ? "rgba(99, 102, 241, 0.08)"
                          : rIndex % 2 === 0
                            ? "rgba(255, 255, 255, 0.01)"
                            : "transparent"
                      }}
                    >
                      {/* Row Index */}
                      <td style={{ padding: "8px 12px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                        {rIndex + 1}
                      </td>

                      {/* Highlight Toggle Button */}
                      <td style={{ padding: "8px 12px", textAlign: "center" }}>
                        <button
                          type="button"
                          onClick={() => handleToggleHighlight(rIndex)}
                          style={{
                            background: row.isHighlighted ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.04)",
                            border: `1px solid ${row.isHighlighted ? "rgba(245, 158, 11, 0.5)" : "rgba(255, 255, 255, 0.1)"}`,
                            color: row.isHighlighted ? "#f59e0b" : "var(--text-muted)",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem"
                          }}
                          title="Toggle Highlight on row"
                        >
                          ★ {row.isHighlighted ? "Yes" : "No"}
                        </button>
                      </td>

                      {/* Dynamic Cells for each column */}
                      {columns.map((col) => (
                        <td key={col.key} style={{ padding: "6px 8px" }}>
                          <input
                            type="text"
                            value={row[col.key] !== undefined ? row[col.key] : ""}
                            onChange={(e) => handleUpdateCell(rIndex, col.key, e.target.value)}
                            placeholder={`Enter ${col.header}...`}
                            className="form-input"
                            style={{
                              height: "34px",
                              fontSize: "0.85rem",
                              padding: "4px 8px",
                              background: row.isHighlighted ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.2)",
                              border: "1px solid rgba(255, 255, 255, 0.08)"
                            }}
                          />
                        </td>
                      ))}

                      {/* Reorder and Delete Actions */}
                      <td style={{ padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                          <button
                            type="button"
                            onClick={() => handleMoveRow(rIndex, "up")}
                            disabled={rIndex === 0}
                            style={{
                              background: "none",
                              border: "none",
                              color: rIndex === 0 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                              cursor: rIndex === 0 ? "default" : "pointer",
                              padding: "4px"
                            }}
                            title="Move up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveRow(rIndex, "down")}
                            disabled={rIndex === rows.length - 1}
                            style={{
                              background: "none",
                              border: "none",
                              color: rIndex === rows.length - 1 ? "rgba(255,255,255,0.15)" : "var(--text-secondary)",
                              cursor: rIndex === rows.length - 1 ? "default" : "pointer",
                              padding: "4px"
                            }}
                            title="Move down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(rIndex)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--error)",
                              cursor: "pointer",
                              padding: "4px"
                            }}
                            title="Delete row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length + 3}
                        style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}
                      >
                        No rows added yet. Click &quot;Add Row&quot; or &quot;Load UK Student Loan Template&quot; above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Live Preview Mode */
          <div className="panel-glass" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "var(--success)",
                  fontWeight: 700,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  marginBottom: "0.5rem"
                }}
              >
                <CheckCircle2 size={12} /> Live Render Preview
              </span>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                Student Loan Repayment Thresholds Matrix
              </h3>
            </div>

            <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--panel-border)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "rgba(99, 102, 241, 0.12)", borderBottom: "1px solid var(--panel-border)" }}>
                    {columns.map((col) => (
                      <th
                        key={col.key}
                        style={{
                          padding: "12px 16px",
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          textAlign: "left"
                        }}
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{
                        background: row.isHighlighted
                          ? "rgba(99, 102, 241, 0.15)"
                          : idx % 2 === 0
                            ? "rgba(255, 255, 255, 0.02)"
                            : "transparent",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                        fontWeight: row.isHighlighted ? 600 : 400
                      }}
                    >
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          style={{
                            padding: "12px 16px",
                            color: row.isHighlighted ? "#fff" : "var(--text-secondary)"
                          }}
                        >
                          {row[col.key] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={columns.length}
                        style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)" }}
                      >
                        No data available in preview.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Status Setting and Actions */}
        <div
          className="panel-glass"
          style={{
            padding: "1.25rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}
        >
          {/* Status Toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setStatus(!status)}
              style={{
                position: "relative",
                width: "44px",
                height: "22px",
                borderRadius: "999px",
                border: "none",
                cursor: "pointer",
                background: status ? "var(--primary)" : "rgba(255,255,255,0.12)",
                transition: "background 0.25s ease",
                padding: 0,
                flexShrink: 0
              }}
              aria-label={status ? "Deactivate plan" : "Activate plan"}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: status ? "23px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s ease",
                  display: "block"
                }}
              />
            </button>
            <div>
              <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)" }}>
                {status ? "Plan is Active" : "Plan is Inactive"}
              </span>
              <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {status ? "Visible and queryable across public pages" : "Hidden from public loan calculations"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => navigate("/repayment-thresholds-plans")}
              className="btn-secondary"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Save size={18} />
              {saving ? "Saving..." : isEditMode ? "Update Plan" : "Create Plan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RepaymentThresholdsPlanAdminPanel;
