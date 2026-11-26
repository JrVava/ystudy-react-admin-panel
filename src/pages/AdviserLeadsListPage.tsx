import React, { useEffect, useState, useCallback } from "react";
import {
  PhoneCall,
  Search,
  X,
  RefreshCw,
  Eye,
  User,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Mail,
  Phone,
  Check
} from "lucide-react";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { adviserCallApi, type AdviserCallItem, type AdviserCallStatus } from "../utils/adviserCallApi";

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

const ALL_STATUS_OPTIONS: AdviserCallStatus[] = ["pending", "Under process", "reviwed", "completed", "failed"];

export const AdviserLeadsListPage: React.FC = () => {
  const [items, setItems] = useState<AdviserCallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [statusOptions, setStatusOptions] = useState<string[]>(ALL_STATUS_OPTIONS);
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [selectedItemForView, setSelectedItemForView] = useState<AdviserCallItem | null>(null);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load available statuses from backend on mount
  useEffect(() => {
    adviserCallApi.getStatuses().then((statuses) => {
      if (statuses && Array.isArray(statuses) && statuses.length > 0) {
        setStatusOptions(statuses);
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
    async (page: number, limit: number, field: string, sort: string, search: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await adviserCallApi.getPaginated(page, limit, field, sort, search, status);
        if (res && res.success) {
          setItems(res.data || []);
          setTotalRows(res.total || 0);
        } else {
          setItems([]);
          setTotalRows(0);
        }
      } catch (err: any) {
        console.error("Failed to load adviser leads records", err);
        setError(err.message || "Failed to load adviser leads records");
        toast.error("Failed to load adviser leads records");
        setItems([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Trigger fetch when parameters change
  useEffect(() => {
    fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus);
  }, [fetchItems, currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePerRowsChange = (newRowsPerPage: number, page: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(page);
  };

  const handleSort = (column: any, sortDirection: "asc" | "desc") => {
    setSortField(column.sortField || "createdAt");
    setSortOrder(sortDirection);
    setCurrentPage(1);
  };

  // Handle status update
  const handleStatusChange = async (targetId: string, newStatus: string) => {
    if (togglingIds.includes(targetId)) return;
    setTogglingIds((prev) => [...prev, targetId]);

    try {
      const res = await adviserCallApi.updateStatus(targetId, newStatus);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === targetId
              ? {
                  ...item,
                  status: (res.status || newStatus) as AdviserCallStatus,
                  updatedAt: new Date().toISOString()
                }
              : item
          )
        );

        if (selectedItemForView && selectedItemForView._id === targetId) {
          setSelectedItemForView((prev) =>
            prev
              ? {
                  ...prev,
                  status: (res.status || newStatus) as AdviserCallStatus,
                  updatedAt: new Date().toISOString()
                }
              : null
          );
        }
        toast.success(res.message || "Status updated successfully");
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      console.error("Failed to update status", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setTogglingIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  // Helper date formatter
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  // Define Table Columns
  const columns = [
    {
      name: "Applicant Name",
      selector: (row: AdviserCallItem) => row.name || "Unknown",
      sortable: true,
      sortField: "name",
      minWidth: "220px",
      cell: (row: AdviserCallItem) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "4px 0" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.name || "—"}</span>
          <span
            style={{
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}
          >
            <Mail size={12} /> {row.email || "No email"}
          </span>
          {row.phone && (
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Phone size={12} /> {row.phone}
            </span>
          )}
        </div>
      )
    },
    {
      name: "Topic & Method",
      selector: (row: AdviserCallItem) => row.topic || "",
      sortable: true,
      sortField: "topic",
      minWidth: "200px",
      cell: (row: AdviserCallItem) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.85rem" }}>
            {row.topic || "General Discussion"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            {row.contactMethod && (
              <span
                style={{
                  fontSize: "0.72rem",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  fontWeight: 600,
                  textTransform: "capitalize"
                }}
              >
                {row.contactMethod}
              </span>
            )}
            {(row.preferredDay || row.preferredTimeSlot) && (
              <span
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                <Calendar size={11} /> {row.preferredDay || ""}{" "}
                {row.preferredTimeSlot ? `(${row.preferredTimeSlot})` : ""}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      name: "Status",
      selector: (row: AdviserCallItem) => row.status,
      sortable: true,
      sortField: "status",
      minWidth: "170px",
      cell: (row: AdviserCallItem) => {
        const isUpdating = togglingIds.includes(row._id);
        const currentCfg = STATUS_CONFIG[row.status] || {
          label: row.status,
          bg: "rgba(148, 163, 184, 0.12)",
          color: "var(--text-muted)",
          border: "rgba(148, 163, 184, 0.25)"
        };

        return (
          <div style={{ position: "relative", display: "inline-block" }} onClick={(e) => e.stopPropagation()}>
            <select
              value={row.status}
              disabled={isUpdating}
              onChange={(e) => handleStatusChange(row._id, e.target.value)}
              style={{
                appearance: "none",
                WebkitAppearance: "none",
                MozAppearance: "none",
                padding: "6px 28px 6px 12px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: 600,
                cursor: isUpdating ? "not-allowed" : "pointer",
                background: currentCfg.bg,
                color: currentCfg.color,
                border: `1px solid ${currentCfg.border}`,
                outline: "none",
                transition: "all 0.2s ease"
              }}
            >
              {statusOptions.map((st) => {
                const optCfg = STATUS_CONFIG[st];
                return (
                  <option
                    key={st}
                    value={st}
                    style={{
                      background: "var(--card-bg, #1e293b)",
                      color: "var(--text-primary, #ffffff)"
                    }}
                  >
                    {optCfg ? optCfg.label : st}
                  </option>
                );
              })}
            </select>
            <span
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: currentCfg.color,
                display: "flex",
                alignItems: "center"
              }}
            >
              {isUpdating ? <RefreshCw size={12} className="animate-spin" /> : <ChevronDown size={13} />}
            </span>
          </div>
        );
      }
    },
    {
      name: "Notification (User)",
      selector: (row: AdviserCallItem) => (row.isNotificationSend ? "Sent" : "Not Sent"),
      sortable: true,
      sortField: "isNotificationSend",
      minWidth: "160px",
      cell: (row: AdviserCallItem) => {
        const isSent = Boolean(row.isNotificationSend);
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
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
      selector: (row: AdviserCallItem) => (row.isNotificationSendToAdmin ? "Sent" : "Not Sent"),
      sortable: true,
      sortField: "isNotificationSendToAdmin",
      minWidth: "160px",
      cell: (row: AdviserCallItem) => {
        const isSent = Boolean(row.isNotificationSendToAdmin);
        return (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "0.75rem",
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
      selector: (row: AdviserCallItem) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      minWidth: "160px",
      cell: (row: AdviserCallItem) => (
        <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{formatDate(row.createdAt)}</span>
      )
    },
    {
      name: "Action",
      minWidth: "90px",
      cell: (row: AdviserCallItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setSelectedItemForView(row)}
            className="action-btn"
            title="View Details"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid var(--panel-border)",
              background: "var(--card-bg)",
              color: "var(--primary)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            }}
          >
            <Eye size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div
      className="page-container"
      style={{
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        maxWidth: "1600px",
        margin: "0 auto",
        width: "100%"
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem"
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "rgba(59, 130, 246, 0.12)",
                color: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <PhoneCall size={22} />
            </div>
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  margin: 0,
                  color: "var(--text-primary)"
                }}
              >
                Adviser Leads
              </h1>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  margin: "4px 0 0 0"
                }}
              >
                Manage adviser calls, consultation requests, and lead follow-ups
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus)}
            disabled={loading}
            className="action-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              background: "var(--card-bg)",
              border: "1px solid var(--panel-border)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: 500,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--card-bg)",
          padding: "1rem 1.25rem",
          borderRadius: "12px",
          border: "1px solid var(--panel-border)"
        }}
      >
        {/* Search Input */}
        <div
          style={{
            position: "relative",
            flex: "1 1 300px",
            maxWidth: "450px"
          }}
        >
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
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name, email, phone, topic, discussion..."
            style={{
              width: "100%",
              padding: "9px 36px 9px 36px",
              borderRadius: "8px",
              background: "var(--bg-primary, rgba(255, 255, 255, 0.04))",
              border: "1px solid var(--panel-border)",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              outline: "none"
            }}
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
              }}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "transparent",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Status Filter & Reset */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Status Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                background: "var(--bg-primary, rgba(255, 255, 255, 0.04))",
                border: "1px solid var(--panel-border)",
                color: "var(--text-primary)",
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

          {(searchQuery || selectedStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
                setCurrentPage(1);
              }}
              style={{
                background: "transparent",
                border: "1px dashed var(--panel-border)",
                color: "var(--text-muted)",
                padding: "7px 12px",
                borderRadius: "8px",
                fontSize: "0.82rem",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Table Content */}
      <div
        style={{
          background: "var(--card-bg, var(--panel-bg))",
          borderRadius: "14px",
          border: "1px solid var(--panel-border)",
          overflow: "hidden"
        }}
      >
        {error ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <AlertCircle size={40} color="#ef4444" />
            <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Failed to load Adviser Leads</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", maxWidth: "400px" }}>{error}</p>
            <button
              onClick={() =>
                fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus)
              }
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "var(--primary)",
                color: "#ffffff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
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
              debouncedSearch || selectedStatus !== "ALL"
                ? "No adviser leads found for the current search or filter."
                : "No adviser leads recorded yet."
            }
          />
        )}
      </div>

      {/* View Details Modal */}
      {selectedItemForView && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
          onClick={() => setSelectedItemForView(null)}
        >
          <div
            style={{
              background: "var(--card-bg, #1e293b)",
              borderRadius: "16px",
              border: "1px solid var(--panel-border)",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid var(--panel-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                position: "sticky",
                top: 0,
                background: "var(--card-bg, #1e293b)",
                zIndex: 10
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "8px",
                    background: "rgba(59, 130, 246, 0.12)",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <PhoneCall size={18} />
                </div>
                <div>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)"
                    }}
                  >
                    Adviser Lead Details
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>ID: {selectedItemForView._id}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedItemForView(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "6px"
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Quick Status & Notifications Ribbon */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "1rem",
                  padding: "0.85rem 1.25rem",
                  borderRadius: "10px",
                  background: "var(--bg-primary, rgba(255, 255, 255, 0.03))",
                  border: "1px solid var(--panel-border)"
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

              {/* 1. Contact Information */}
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
                  <User size={16} /> Contact Information
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
                      {selectedItemForView.name || "—"}
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
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Contact Method</span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        textTransform: "capitalize"
                      }}
                    >
                      {selectedItemForView.contactMethod || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Consultation & Schedule Details */}
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
                  <Calendar size={16} /> Consultation & Schedule Details
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "0.85rem"
                  }}
                >
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Topic to Discuss</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.topic || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Preferred Day</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.preferredDay || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Preferred Time Slot</span>
                    <p style={{ margin: "3px 0 0", fontWeight: 600, color: "var(--text-primary)" }}>
                      {selectedItemForView.preferredTimeSlot || "—"}
                    </p>
                  </div>
                  <div className="detail-item">
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Terms Agreement</span>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontWeight: 600,
                        color: selectedItemForView.is_agree ? "#10b981" : "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      {selectedItemForView.is_agree ? <Check size={14} /> : null}
                      {selectedItemForView.is_agree ? "Agreed to terms" : "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Discussion Notes */}
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
                  <MessageSquare size={16} /> Discussion Notes & Message
                </h4>
                <div
                  style={{
                    background: "var(--bg-primary, rgba(255, 255, 255, 0.03))",
                    border: "1px solid var(--panel-border)",
                    borderRadius: "10px",
                    padding: "1rem",
                    fontSize: "0.88rem",
                    lineHeight: "1.5",
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap"
                  }}
                >
                  {selectedItemForView.discuss ? (
                    selectedItemForView.discuss
                  ) : (
                    <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                      No specific notes or message provided by applicant.
                    </span>
                  )}
                </div>
              </div>

              {/* 4. Timestamps */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid var(--panel-border)",
                  fontSize: "0.8rem",
                  color: "var(--text-muted)"
                }}
              >
                <div>Submitted: {formatDate(selectedItemForView.createdAt)}</div>
                {selectedItemForView.updatedAt && <div>Last Updated: {formatDate(selectedItemForView.updatedAt)}</div>}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid var(--panel-border)",
                display: "flex",
                justifyContent: "flex-end"
              }}
            >
              <button
                onClick={() => setSelectedItemForView(null)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "8px",
                  background: "var(--bg-primary, rgba(255, 255, 255, 0.08))",
                  border: "1px solid var(--panel-border)",
                  color: "var(--text-primary)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
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
