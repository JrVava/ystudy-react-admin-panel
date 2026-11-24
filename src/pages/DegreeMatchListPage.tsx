import React, { useEffect, useState, useCallback } from "react";
import {
  GraduationCap,
  Search,
  X,
  RefreshCw,
  Eye,
  User,
  Briefcase,
  BookOpen,
  AlertCircle,
  ChevronDown,
  CheckCircle2,
  Clock,
  ShieldCheck
} from "lucide-react";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { degreeMatchApi, type DegreeMatchItem, type DegreeMatchStatus } from "../utils/degreeMatchApi";

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

const ALL_STATUS_OPTIONS: DegreeMatchStatus[] = ["pending", "Under process", "reviwed", "completed", "failed"];

export const DegreeMatchListPage: React.FC = () => {
  const [items, setItems] = useState<DegreeMatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [statusOptions, setStatusOptions] = useState<string[]>(ALL_STATUS_OPTIONS);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [selectedItemForView, setSelectedItemForView] = useState<DegreeMatchItem | null>(null);

  // Load available statuses from backend on mount
  useEffect(() => {
    degreeMatchApi.getStatuses().then((statuses) => {
      if (statuses && Array.isArray(statuses) && statuses.length > 0) {
        setStatusOptions(statuses);
      }
    });
  }, []);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchItems = useCallback(
    async (page: number, limit: number, field: string, sort: string, search: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await degreeMatchApi.getPaginated(page, limit, field, sort, search, status);
        if (res && res.success) {
          setItems(Array.isArray(res.data) ? res.data : []);
          setTotalRows(res.total || 0);
          setCurrentPage(res.page || page);
        } else {
          setItems([]);
          setTotalRows(0);
        }
      } catch (err: any) {
        console.error("Failed to load degree match records", err);
        setError(err.message || "Failed to load degree match records");
        toast.error("Failed to load degree match records");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus);
  }, [fetchItems, currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus]);

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
      const res = await degreeMatchApi.updateStatus(targetId, newStatus);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === targetId
              ? { ...i, status: (res.status || newStatus) as DegreeMatchStatus, updatedAt: new Date().toISOString() }
              : i
          )
        );
        if (selectedItemForView && selectedItemForView._id === targetId) {
          setSelectedItemForView((prev) =>
            prev
              ? { ...prev, status: (res.status || newStatus) as DegreeMatchStatus, updatedAt: new Date().toISOString() }
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
      selector: (row: DegreeMatchItem) => row.firstName || "Unknown",
      sortable: true,
      sortField: "firstName",
      grow: 1.4,
      cell: (row: DegreeMatchItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.4rem 0" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              fontWeight: 700,
              fontSize: "0.95rem",
              flexShrink: 0
            }}
          >
            {row.firstName ? row.firstName.charAt(0).toUpperCase() : <User size={18} />}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.925rem" }}>
              {row.firstName || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Not provided</span>}
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
      name: "Status",
      selector: (row: DegreeMatchItem) => row.status,
      sortable: true,
      sortField: "status",
      grow: 1.2,
      cell: (row: DegreeMatchItem) => {
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
              aria-label={`Change status for ${row.firstName || "applicant"}`}
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
      selector: (row: DegreeMatchItem) =>
        (row.isNotificationSend !== undefined ? row.isNotificationSend : row.is_notification_send)
          ? "Sent"
          : "Not Sent",
      sortable: true,
      sortField: "isNotificationSend",
      grow: 1,
      cell: (row: DegreeMatchItem) => {
        const isSent = Boolean(
          row.isNotificationSend !== undefined ? row.isNotificationSend : row.is_notification_send
        );
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
      selector: (row: DegreeMatchItem) => (row.isNotificationSendToAdmin ? "Sent" : "Not Sent"),
      sortable: true,
      sortField: "isNotificationSendToAdmin",
      grow: 1,
      cell: (row: DegreeMatchItem) => {
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
      selector: (row: DegreeMatchItem) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      grow: 1,
      cell: (row: DegreeMatchItem) => {
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
      cell: (row: DegreeMatchItem) => (
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
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary)",
                border: "1px solid rgba(99, 102, 241, 0.3)"
              }}
            >
              <GraduationCap size={22} />
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
                Degree Match
              </h1>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "var(--text-secondary)",
                  margin: 0,
                  marginTop: "2px"
                }}
              >
                Manage student degree match inquiries and consultations.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: Status Filter & Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
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
              {ALL_STATUS_OPTIONS.map((st) => (
                <option key={st} value={st}>
                  {STATUS_CONFIG[st]?.label || st}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus)}
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
            placeholder="Search by name, email, phone, subjects..."
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
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Failed to load Degree Match records</div>
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
              ? "No degree match inquiries found for the current search or filter."
              : "No degree match inquiries recorded yet."
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
                  <GraduationCap size={22} />
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
                    Degree Match Inquiry Details
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
                        background:
                          selectedItemForView.isNotificationSend !== undefined
                            ? selectedItemForView.isNotificationSend
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(148, 163, 184, 0.12)"
                            : selectedItemForView.is_notification_send
                              ? "rgba(16, 185, 129, 0.12)"
                              : "rgba(148, 163, 184, 0.12)",
                        color: (
                          selectedItemForView.isNotificationSend !== undefined
                            ? selectedItemForView.isNotificationSend
                            : selectedItemForView.is_notification_send
                        )
                          ? "#10b981"
                          : "var(--text-muted)",
                        border: `1px solid ${
                          (
                            selectedItemForView.isNotificationSend !== undefined
                              ? selectedItemForView.isNotificationSend
                              : selectedItemForView.is_notification_send
                          )
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(148, 163, 184, 0.25)"
                        }`
                      }}
                    >
                      {(
                        selectedItemForView.isNotificationSend !== undefined
                          ? selectedItemForView.isNotificationSend
                          : selectedItemForView.is_notification_send
                      ) ? (
                        <CheckCircle2 size={13} />
                      ) : (
                        <Clock size={13} />
                      )}
                      <span>
                        {(
                          selectedItemForView.isNotificationSend !== undefined
                            ? selectedItemForView.isNotificationSend
                            : selectedItemForView.is_notification_send
                        )
                          ? "Sent"
                          : "Not Sent"}
                      </span>
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
                        border: `1px solid ${
                          selectedItemForView.isNotificationSendToAdmin
                            ? "rgba(16, 185, 129, 0.3)"
                            : "rgba(148, 163, 184, 0.25)"
                        }`
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
                      {selectedItemForView.firstName || "—"}
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
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Best Time to Call</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.bestTimeToCall || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>User Notification Sent</span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontWeight: 600,
                        color: (
                          selectedItemForView.isNotificationSend !== undefined
                            ? selectedItemForView.isNotificationSend
                            : selectedItemForView.is_notification_send
                        )
                          ? "#10b981"
                          : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {(
                        selectedItemForView.isNotificationSend !== undefined
                          ? selectedItemForView.isNotificationSend
                          : selectedItemForView.is_notification_send
                      ) ? (
                        <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                      ) : (
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                      )}
                      <span>
                        {(
                          selectedItemForView.isNotificationSend !== undefined
                            ? selectedItemForView.isNotificationSend
                            : selectedItemForView.is_notification_send
                        )
                          ? "Yes (Dispatched)"
                          : "No (Pending)"}
                      </span>
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Admin Notification Sent</span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontWeight: 600,
                        color: selectedItemForView.isNotificationSendToAdmin ? "#10b981" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      {selectedItemForView.isNotificationSendToAdmin ? (
                        <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                      ) : (
                        <Clock size={14} style={{ color: "var(--text-muted)" }} />
                      )}
                      <span>{selectedItemForView.isNotificationSendToAdmin ? "Yes (Dispatched)" : "No (Pending)"}</span>
                    </p>
                  </div>
                  {selectedItemForView.is_agree !== undefined && (
                    <div className="detail-item">
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                        Agreed to Terms & Conditions
                      </span>
                      <p
                        style={{
                          margin: "3px 0 0",
                          fontWeight: 600,
                          color: selectedItemForView.is_agree ? "#10b981" : "var(--text-muted)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <ShieldCheck
                          size={15}
                          style={{ color: selectedItemForView.is_agree ? "#10b981" : "var(--text-muted)" }}
                        />
                        <span>{selectedItemForView.is_agree ? "Yes (Agreed)" : "No"}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Academic & Study Goals */}
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
                  <BookOpen size={16} /> Academic & Study Aspirations
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.85rem"
                  }}
                >
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Highest Qualification</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.highestQualification || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Subjects of Interest</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.subjectsInterest || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Study Preference / Mode</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.study || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Career Aspiration</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.career || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Background & Situation */}
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
                  <Briefcase size={16} /> Background, Residency & Finance
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.85rem"
                  }}
                >
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Residency Status</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.residencyStatus || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Current Situation</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.situation || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Age Range</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.ageRange || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>English Language Confidence</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.languageConfident || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Household Income</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.HouseholdIncome || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Target Salary Level</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.salaryLevel || "—"}
                    </p>
                  </div>
                  <div className="detail-item" style={{ gridColumn: "1 / -1" }}>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Responsibilities</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 500, color: "var(--text-primary)" }}>
                      {selectedItemForView.responsibilities || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Timestamps */}
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
