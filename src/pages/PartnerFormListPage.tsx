import React, { useEffect, useState, useCallback } from "react";
import {
  Handshake,
  Search,
  X,
  RefreshCw,
  Eye,
  User,
  Briefcase,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  Clock
} from "lucide-react";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import {
  partnerFormApi,
  type PartnerFormItem,
  type PartnerFormStatus,
  type PartnerFormModuleOption
} from "../utils/partnerFormApi";

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  "Under process": {
    label: "Under Process",
    bg: "rgba(59, 130, 246, 0.12)",
    color: "#3b82f6",
    border: "rgba(59, 130, 246, 0.3)"
  },
  completed: {
    label: "Completed",
    bg: "rgba(16, 185, 129, 0.12)",
    color: "#10b981",
    border: "rgba(16, 185, 129, 0.3)"
  },
  reviwed: {
    label: "Reviewed",
    bg: "rgba(139, 92, 246, 0.12)",
    color: "#8b5cf6",
    border: "rgba(139, 92, 246, 0.3)"
  },
  reviewed: {
    label: "Reviewed",
    bg: "rgba(139, 92, 246, 0.12)",
    color: "#8b5cf6",
    border: "rgba(139, 92, 246, 0.3)"
  },
  pending: {
    label: "Pending",
    bg: "rgba(245, 158, 11, 0.12)",
    color: "#f59e0b",
    border: "rgba(245, 158, 11, 0.3)"
  },
  failed: {
    label: "Failed",
    bg: "rgba(239, 68, 68, 0.12)",
    color: "#ef4444",
    border: "rgba(239, 68, 68, 0.3)"
  }
};

const ALL_STATUS_OPTIONS: PartnerFormStatus[] = ["pending", "Under process", "reviwed", "completed", "failed"];

export const PartnerFormListPage: React.FC = () => {
  const [items, setItems] = useState<PartnerFormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [statusOptions, setStatusOptions] = useState<string[]>(ALL_STATUS_OPTIONS);
  const [modules, setModules] = useState<PartnerFormModuleOption[]>([
    { label: "Become An Adviser", value: "becomeAnAdviser" },
    { label: "Influencers", value: "influencers" },
    { label: "Affiliate Partners", value: "affiliatePartners" },
    { label: "Business", value: "business" },
    { label: "Refer A friend", value: "referAFriend" }
  ]);
  const [selectedModule, setSelectedModule] = useState<string>("becomeAnAdviser");
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [selectedItemForView, setSelectedItemForView] = useState<PartnerFormItem | null>(null);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load available statuses and modules from backend on mount
  useEffect(() => {
    partnerFormApi.getStatuses().then((statuses) => {
      if (statuses && Array.isArray(statuses) && statuses.length > 0) {
        setStatusOptions(statuses);
      }
    });

    partnerFormApi.getModules().then((modList) => {
      if (modList && Array.isArray(modList) && modList.length > 0) {
        setModules(modList);
      }
    });
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchItems = useCallback(
    async (
      page: number,
      limit: number,
      field: string,
      sort: string,
      search: string,
      status: string,
      module: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const res = await partnerFormApi.getPaginated(page, limit, field, sort, search, status, module);
        if (res && res.success) {
          setItems(Array.isArray(res.data) ? res.data : []);
          setTotalRows(res.total || 0);
          setCurrentPage(res.page || page);
        } else {
          setItems([]);
          setTotalRows(0);
        }
      } catch (err: any) {
        console.error("Failed to load partner form records", err);
        setError(err.message || "Failed to load partner form records");
        toast.error("Failed to load partner form records");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus, selectedModule);
  }, [fetchItems, currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus, selectedModule]);

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

  const handleStatusChange = async (targetId: string, newStatus: string) => {
    if (togglingIds.includes(targetId)) return;
    setTogglingIds((prev) => [...prev, targetId]);

    try {
      const res = await partnerFormApi.updateStatus(targetId, newStatus);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === targetId
              ? { ...i, status: (res.status || newStatus) as PartnerFormStatus, updatedAt: new Date().toISOString() }
              : i
          )
        );
        if (selectedItemForView && selectedItemForView._id === targetId) {
          setSelectedItemForView((prev) =>
            prev
              ? { ...prev, status: (res.status || newStatus) as PartnerFormStatus, updatedAt: new Date().toISOString() }
              : null
          );
        }
        toast.success(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Status update error:", err);
      toast.error(err.message || "Error updating status");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const columns = [
    {
      name: "Applicant Name",
      selector: (row: PartnerFormItem) => row.fullName || "Unknown",
      sortable: true,
      sortField: "fullName",
      grow: 1.4,
      cell: (row: PartnerFormItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.4rem 0" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(16, 185, 129, 0.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "0.95rem",
              flexShrink: 0
            }}
          >
            {row.fullName ? row.fullName.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.925rem" }}>
              {row.fullName || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not provided</span>}
            </div>
            {row.email && (
              <div
                style={{
                  fontSize: "0.78rem",
                  color: "var(--text-muted)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "200px"
                }}
                title={row.email}
              >
                {row.email}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      name: "Module",
      selector: (row: PartnerFormItem) => row.module || "becomeAnAdviser",
      sortable: true,
      sortField: "module",
      grow: 1,
      cell: (row: PartnerFormItem) => {
        const mod = modules.find((m) => (m.value || "").toLowerCase() === (row.module || "").toLowerCase());
        const label = mod?.label || row.module || "Become An Adviser";
        return (
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: "6px",
              background: "rgba(99, 102, 241, 0.12)",
              color: "var(--primary)",
              fontSize: "0.78rem",
              fontWeight: 600,
              whiteSpace: "nowrap"
            }}
          >
            {label}
          </span>
        );
      }
    },
    {
      name: "Status",
      selector: (row: PartnerFormItem) => row.status,
      sortable: true,
      sortField: "status",
      grow: 1.2,
      cell: (row: PartnerFormItem) => {
        const isToggling = togglingIds.includes(row._id);
        const currentStatus = row.status || "pending";
        const cfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG["pending"];

        return (
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
            <select
              value={currentStatus}
              disabled={isToggling}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                background: cfg.bg,
                color: cfg.color,
                border: `1px solid ${cfg.border}`,
                padding: "6px 28px 6px 12px",
                borderRadius: "20px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: isToggling ? "wait" : "pointer",
                outline: "none",
                transition: "all 0.2s ease"
              }}
              aria-label={`Change status for ${row.fullName || "applicant"}`}
            >
              {statusOptions.map((statusKey) => (
                <option
                  key={statusKey}
                  value={statusKey}
                  style={{ background: "var(--card-bg, #1e293b)", color: "var(--text-primary, #ffffff)" }}
                >
                  {STATUS_CONFIG[statusKey]?.label || statusKey}
                </option>
              ))}
            </select>
            {isToggling ? (
              <RefreshCw
                size={12}
                className="animate-spin"
                style={{
                  position: "absolute",
                  right: "10px",
                  pointerEvents: "none",
                  color: cfg.color
                }}
              />
            ) : (
              <ChevronDown
                size={12}
                style={{
                  position: "absolute",
                  right: "10px",
                  pointerEvents: "none",
                  color: cfg.color
                }}
              />
            )}
          </div>
        );
      }
    },
    {
      name: "Notification (User)",
      selector: (row: PartnerFormItem) => (row.isNotificationSend ? "Sent" : "Not Sent"),
      sortable: true,
      sortField: "isNotificationSend",
      grow: 1,
      cell: (row: PartnerFormItem) => {
        const isSent = Boolean(row.isNotificationSend);
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              background: isSent ? "rgba(16, 185, 129, 0.12)" : "rgba(148, 163, 184, 0.12)",
              color: isSent ? "#10b981" : "var(--text-muted)",
              border: `1px solid ${isSent ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.25)"}`
            }}
          >
            {isSent ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            <span>{isSent ? "Sent" : "Not Sent"}</span>
          </div>
        );
      }
    },
    {
      name: "Notification (Admin)",
      selector: (row: PartnerFormItem) => (row.isNotificationSendToAdmin ? "Sent" : "Not Sent"),
      sortable: true,
      sortField: "isNotificationSendToAdmin",
      grow: 1,
      cell: (row: PartnerFormItem) => {
        const isSent = Boolean(row.isNotificationSendToAdmin);
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.78rem",
              fontWeight: 600,
              background: isSent ? "rgba(16, 185, 129, 0.12)" : "rgba(148, 163, 184, 0.12)",
              color: isSent ? "#10b981" : "var(--text-muted)",
              border: `1px solid ${isSent ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.25)"}`
            }}
          >
            {isSent ? <CheckCircle2 size={13} /> : <Clock size={13} />}
            <span>{isSent ? "Sent" : "Not Sent"}</span>
          </div>
        );
      }
    },
    {
      name: "Submitted At",
      selector: (row: PartnerFormItem) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      grow: 1,
      cell: (row: PartnerFormItem) => {
        if (!row.createdAt) return <span style={{ color: "var(--text-muted)" }}>—</span>;
        const d = new Date(row.createdAt);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
            <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
            <span style={{ fontSize: "0.725rem", color: "var(--text-muted)" }}>
              {d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        );
      }
    },
    {
      name: "Action",
      cell: (row: PartnerFormItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <button
            type="button"
            onClick={() => setSelectedItemForView(row)}
            className="btn-action-view"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              color: "var(--primary)",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            title="View Details"
          >
            <Eye size={14} />
            <span>Details</span>
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      grow: 0.8
    }
  ];

  return (
    <div className="admin-page-container" style={{ padding: "1.75rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(16, 185, 129, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}
            >
              <Handshake size={22} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  margin: 0,
                  color: "var(--text-primary)",
                  letterSpacing: "-0.5px"
                }}
              >
                Partner Form
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                  marginTop: "2px"
                }}
              >
                Manage and review partner and adviser application enquiries across all partnership categories.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: Module Filter, Status Filter & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Module Filter Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: 500 }}>Module:</span>
            <select
              value={selectedModule}
              onChange={(e) => {
                setSelectedModule(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                background: "var(--input-bg, var(--panel-bg))",
                color: "var(--text-primary)",
                border: "1px solid var(--panel-border)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
                fontWeight: 600
              }}
            >
              <option value="all">All Modules</option>
              {modules.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.825rem", color: "var(--text-secondary)", fontWeight: 500 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                background: "var(--input-bg, var(--panel-bg))",
                color: "var(--text-primary)",
                border: "1px solid var(--panel-border)",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="ALL">All Statuses</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              fetchItems(
                currentPage,
                rowsPerPage,
                sortField,
                sortOrder,
                debouncedSearch,
                selectedStatus,
                selectedModule
              )
            }
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: "var(--input-bg, var(--panel-bg))",
              color: "var(--text-primary)",
              border: "1px solid var(--panel-border)",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: loading ? "wait" : "pointer",
              transition: "all 0.2s"
            }}
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Module Selection Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          overflowX: "auto",
          paddingBottom: "6px",
          marginBottom: "1.25rem",
          scrollbarWidth: "none"
        }}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedModule("all");
            setCurrentPage(1);
          }}
          style={{
            padding: "8px 16px",
            borderRadius: "10px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
            border: selectedModule === "all" ? "1px solid var(--primary)" : "1px solid var(--panel-border)",
            background: selectedModule === "all" ? "var(--primary)" : "var(--card-bg, var(--panel-bg))",
            color: selectedModule === "all" ? "#ffffff" : "var(--text-secondary)",
            transition: "all 0.2s ease",
            whiteSpace: "nowrap"
          }}
        >
          All Modules
        </button>
        {modules.map((m) => {
          const isActive = selectedModule.toLowerCase() === m.value.toLowerCase();
          return (
            <button
              key={m.value}
              type="button"
              onClick={() => {
                setSelectedModule(m.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                border: isActive ? "1px solid var(--primary)" : "1px solid var(--panel-border)",
                background: isActive ? "var(--primary)" : "var(--card-bg, var(--panel-bg))",
                color: isActive ? "#ffffff" : "var(--text-secondary)",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar Card */}
      <div
        style={{
          background: "var(--card-bg, var(--panel-bg))",
          border: "1px solid var(--panel-border)",
          borderRadius: "14px",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap"
        }}
      >
        <div style={{ position: "relative", flex: 1, minWidth: "260px", maxWidth: "420px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-muted)"
            }}
          />
          <input
            type="text"
            placeholder="Search by name, email, phone, description..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "9px 36px 9px 36px",
              borderRadius: "8px",
              border: "1px solid var(--panel-border)",
              background: "var(--input-bg, rgba(0,0,0,0.15))",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "border-color 0.2s"
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px"
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          Showing <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{items.length}</span> of{" "}
          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{totalRows}</span> inquiries
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#ef4444",
            padding: "1rem",
            borderRadius: "10px",
            marginBottom: "1.25rem"
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Failed to load Partner Form records</div>
            <div style={{ fontSize: "0.825rem", opacity: 0.9 }}>{error}</div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div
        style={{
          background: "var(--card-bg, var(--panel-bg))",
          border: "1px solid var(--panel-border)",
          borderRadius: "14px",
          overflow: "hidden"
        }}
      >
        <Table
          columns={columns}
          data={items}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          sortServer={true}
          serverSide={true}
          noDataText={
            searchQuery || selectedStatus !== "ALL"
              ? "No partner form inquiries found for the current search or filter."
              : "No partner form inquiries recorded yet."
          }
        />
      </div>

      {/* Detail Modal */}
      {selectedItemForView && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1.25rem"
          }}
          onClick={() => setSelectedItemForView(null)}
        >
          <div
            style={{
              background: "var(--modal-bg, var(--panel-bg))",
              border: "1px solid var(--panel-border)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "760px",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
              overflow: "hidden"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--panel-border)",
                background: "var(--header-bg, transparent)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(99, 102, 241, 0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--primary)"
                  }}
                >
                  <Handshake size={22} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.2rem",
                      fontWeight: 700,
                      color: "var(--text-primary)"
                    }}
                  >
                    Partner Form Inquiry Details
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ID: {selectedItemForView._id}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedItemForView(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "6px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div
              style={{
                padding: "1.5rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem"
              }}
            >
              {/* Quick Status & Notification Banner */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1rem 1.25rem",
                  borderRadius: "12px",
                  background: "var(--input-bg, rgba(0,0,0,0.1))",
                  border: "1px solid var(--panel-border)",
                  flexWrap: "wrap",
                  gap: "0.75rem"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      Inquiry Status
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {STATUS_CONFIG[selectedItemForView.status]?.label || selectedItemForView.status}
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      User Notification
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        marginTop: "2px",
                        background: selectedItemForView.isNotificationSend
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(148, 163, 184, 0.12)",
                        color: selectedItemForView.isNotificationSend ? "#10b981" : "var(--text-muted)",
                        border: `1px solid ${selectedItemForView.isNotificationSend ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.25)"}`
                      }}
                    >
                      {selectedItemForView.isNotificationSend ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      <span>{selectedItemForView.isNotificationSend ? "Sent" : "Not Sent"}</span>
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      Admin Notification
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        marginTop: "2px",
                        background: selectedItemForView.isNotificationSendToAdmin
                          ? "rgba(16, 185, 129, 0.12)"
                          : "rgba(148, 163, 184, 0.12)",
                        color: selectedItemForView.isNotificationSendToAdmin ? "#10b981" : "var(--text-muted)",
                        border: `1px solid ${selectedItemForView.isNotificationSendToAdmin ? "rgba(16, 185, 129, 0.3)" : "rgba(148, 163, 184, 0.25)"}`
                      }}
                    >
                      {selectedItemForView.isNotificationSendToAdmin ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      <span>{selectedItemForView.isNotificationSendToAdmin ? "Sent" : "Not Sent"}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Change to:</span>
                  <select
                    value={selectedItemForView.status}
                    disabled={togglingIds.includes(selectedItemForView._id)}
                    onChange={(e) => handleStatusChange(selectedItemForView._id, e.target.value)}
                    style={{
                      background: "var(--card-bg, #1e293b)",
                      color: "var(--text-primary, #ffffff)",
                      border: "1px solid var(--panel-border)",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st]?.label || st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 1. Personal & Contact Info */}
              <div>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    margin: "0 0 0.75rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <User size={16} /> Personal & Contact Information
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.85rem"
                  }}
                >
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Full Name</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.fullName || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Email Address</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.email ? (
                        <a
                          href={`mailto:${selectedItemForView.email}`}
                          style={{ color: "var(--primary)", textDecoration: "none" }}
                        >
                          {selectedItemForView.email}
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Phone Number</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.phone ? (
                        <a
                          href={`tel:${selectedItemForView.phone}`}
                          style={{ color: "var(--text-primary)", textDecoration: "none" }}
                        >
                          {selectedItemForView.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Partner & Enquiry Details */}
              <div>
                <h4
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    margin: "0 0 0.75rem 0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <Briefcase size={16} /> Partner & Enquiry Details
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.85rem"
                  }}
                >
                  <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Target Module / Enquiry Category
                    </span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--primary)" }}>
                      {modules.find(
                        (m) => (m.value || "").toLowerCase() === (selectedItemForView.module || "").toLowerCase()
                      )?.label ||
                        selectedItemForView.module ||
                        "Become An Adviser"}
                    </p>
                  </div>
                  <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      Best Description of Role / Expertise
                    </span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.bestDescription || "—"}
                    </p>
                  </div>
                  <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Audience Enquiry / Comments</span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontWeight: 500,
                        color: "var(--text-primary)",
                        lineHeight: "1.5",
                        whiteSpace: "pre-wrap"
                      }}
                    >
                      {selectedItemForView.audienceEnquiry || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Timestamps */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--panel-border)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  flexWrap: "wrap",
                  gap: "0.5rem"
                }}
              >
                <div>
                  Created:{" "}
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    {selectedItemForView.createdAt ? new Date(selectedItemForView.createdAt).toLocaleString() : "—"}
                  </span>
                </div>
                <div>
                  Last Updated:{" "}
                  <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                    {selectedItemForView.updatedAt ? new Date(selectedItemForView.updatedAt).toLocaleString() : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--panel-border)",
                display: "flex",
                justifyContent: "flex-end",
                background: "var(--header-bg, transparent)"
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedItemForView(null)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  background: "var(--primary)",
                  color: "#ffffff",
                  border: "none",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
