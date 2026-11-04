import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { repaymentThresholdsPlanApi } from "../utils/repaymentThresholdsPlanApi";
import type { RepaymentThresholdsPlan } from "../utils/repaymentThresholdsPlanApi";
import { Table2, Plus, Edit2, Trash2, AlertCircle, Columns, Rows } from "lucide-react";
import { toast } from "../context/ToastContext";
import { Table } from "../components/Table";

export const RepaymentThresholdsPlanListPage: React.FC = () => {
  const [plans, setPlans] = useState<RepaymentThresholdsPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const navigate = useNavigate();

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchPlans(currentPage, rowsPerPage, sortField, sortOrder);
  }, [currentPage, rowsPerPage, sortField, sortOrder]);

  async function fetchPlans(page: number, limit: number, field: string = "createdAt", sort: string = "desc") {
    try {
      setLoading(true);
      setError(null);
      const res = await repaymentThresholdsPlanApi.getPaginated(page, limit, field, sort);
      if (res.success) {
        setPlans(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError(res.message || "Failed to fetch repayment thresholds plans");
      }
    } catch (err: any) {
      console.error("Error fetching repayment plans:", err);
      setError(err.message || "Error fetching repayment thresholds plans");
    } finally {
      setLoading(false);
    }
  }

  const handleStatusToggle = async (plan: RepaymentThresholdsPlan) => {
    if (!plan._id) return;
    const planId = plan._id;
    const newStatus = plan.status === false ? true : false;

    setTogglingIds((prev) => [...prev, planId]);
    // Optimistic local update
    setPlans((prev) => prev.map((p) => (p._id === planId ? { ...p, status: newStatus } : p)));

    try {
      const res = await repaymentThresholdsPlanApi.toggleStatus(planId);
      if (res && res.success !== false) {
        toast.success(`Plan marked as ${newStatus ? "Active" : "Inactive"}.`);
      } else {
        // Rollback
        setPlans((prev) => prev.map((p) => (p._id === planId ? { ...p, status: plan.status } : p)));
        toast.error("Failed to update plan status.");
      }
    } catch (err: any) {
      // Rollback
      setPlans((prev) => prev.map((p) => (p._id === planId ? { ...p, status: plan.status } : p)));
      toast.error(err.message || "Failed to update status.");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== planId));
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm("Are you sure you want to delete this repayment thresholds plan? This action cannot be undone.")
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await repaymentThresholdsPlanApi.delete(id);
      if (res && (res.success || res.message)) {
        toast.success("Repayment thresholds plan deleted successfully");
        await fetchPlans(currentPage, rowsPerPage, sortField, sortOrder);
      } else {
        toast.error("Failed to delete plan: " + (res?.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error deleting plan:", err);
      toast.error(err.message || "Error deleting plan");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newPerPage: number, page: number) => {
    setRowsPerPage(newPerPage);
    setCurrentPage(page);
  };

  const handleSort = (column: any, sortDirection: "asc" | "desc") => {
    setSortField(column.sortField || "createdAt");
    setSortOrder(sortDirection);
    setCurrentPage(1);
  };

  const columns = [
    {
      name: "Plan",
      selector: () => "Repayment Thresholds Matrix",
      cell: () => (
        <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>
          Repayment Thresholds Plan
        </span>
      )
    },
    {
      name: "Matrix Size",
      selector: (row: RepaymentThresholdsPlan) => (row.columns?.length || 0) + (row.rows?.length || 0),
      sortable: false,
      cell: (row: RepaymentThresholdsPlan) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              background: "rgba(255, 255, 255, 0.04)",
              padding: "4px 8px",
              borderRadius: "6px"
            }}
            title="Total columns"
          >
            <Columns size={12} style={{ color: "var(--primary)" }} />
            {row.columns?.length || 0} columns
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              background: "rgba(255, 255, 255, 0.04)",
              padding: "4px 8px",
              borderRadius: "6px"
            }}
            title="Total rows"
          >
            <Rows size={12} style={{ color: "var(--accent)" }} />
            {row.rows?.length || 0} rows
          </span>
        </div>
      )
    },
    {
      name: "Status",
      selector: (row: RepaymentThresholdsPlan) => (row.status !== false ? 1 : 0),
      sortable: true,
      cell: (row: RepaymentThresholdsPlan) => {
        const isToggling = row._id ? togglingIds.includes(row._id) : false;
        const isActive = row.status !== false;

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => handleStatusToggle(row)}
              disabled={isToggling}
              style={{
                position: "relative",
                width: "38px",
                height: "20px",
                borderRadius: "999px",
                border: "none",
                cursor: isToggling ? "wait" : "pointer",
                background: isActive ? "var(--primary)" : "rgba(255,255,255,0.12)",
                transition: "background 0.25s ease",
                padding: 0,
                flexShrink: 0,
                opacity: isToggling ? 0.6 : 1
              }}
              title={isActive ? "Active (Click to deactivate)" : "Inactive (Click to activate)"}
              aria-label={isActive ? "Deactivate plan" : "Activate plan"}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: isActive ? "19px" : "3px",
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: "#fff",
                  transition: "left 0.2s ease",
                  display: "block"
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: isActive ? "var(--success)" : "var(--text-muted)"
              }}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      }
    },
    {
      name: "Created At",
      selector: (row: RepaymentThresholdsPlan) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      cell: (row: RepaymentThresholdsPlan) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
        </span>
      )
    },
    {
      name: "Updated At",
      selector: (row: RepaymentThresholdsPlan) => row.updatedAt || "",
      sortable: true,
      sortField: "updatedAt",
      cell: (row: RepaymentThresholdsPlan) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {row.updatedAt ? new Date(row.updatedAt).toLocaleDateString() : "N/A"}
        </span>
      )
    },
    {
      name: "Actions",
      right: true,
      minWidth: "160px",
      cell: (row: RepaymentThresholdsPlan) => (
        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/repayment-thresholds-plans/edit/${row._id}`)}
            className="btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem"
            }}
          >
            <Edit2 size={12} />
            Edit
          </button>
          <button
            onClick={() => row._id && handleDelete(row._id)}
            className="btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              color: "var(--error)",
              borderColor: "rgba(244, 63, 94, 0.2)"
            }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Table2 size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            Repayment Thresholds Plans
          </h1>
          <p className="page-subtitle">
            Configure dynamic table columns, repayment threshold rates, and loan plan matrices.
          </p>
        </div>

        <div>
          {/* Only allow one record to be added: hide button if a record already exists */}
          {totalRows === 0 && plans.length === 0 && !loading && (
            <button
              onClick={() => navigate("/repayment-thresholds-plans/new")}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
            >
              <Plus size={18} />
              Add Repayment Plan
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.2)",
            color: "#f43f5e",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <AlertCircle size={20} />
          <span>Error: {error}</span>
        </div>
      )}

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={plans}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No repayment thresholds plans found."
        />
      </div>
    </div>
  );
};

export default RepaymentThresholdsPlanListPage;
