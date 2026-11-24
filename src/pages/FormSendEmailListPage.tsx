import React, { useEffect, useState, useCallback } from "react";
import { Mail, Search, X, RefreshCw, AlertCircle } from "lucide-react";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { formSendEmailApi, type FormSendEmailToUserItem } from "../utils/formSendEmailApi";

export const FormSendEmailListPage: React.FC = () => {
  const [items, setItems] = useState<FormSendEmailToUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [togglingIds, setTogglingIds] = useState<string[]>([]);
  const [togglingSendEmailIds, setTogglingSendEmailIds] = useState<string[]>([]);
  const [togglingSendEmailToAdminIds, setTogglingSendEmailToAdminIds] = useState<string[]>([]);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchItems = useCallback(async (page: number, limit: number, field: string, sort: string, search: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await formSendEmailApi.getPaginated(page, limit, field, sort, search);
      if (res && res.success) {
        setItems(Array.isArray(res.data) ? res.data : []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setItems([]);
        setTotalRows(0);
      }
    } catch (err: any) {
      console.error("Failed to load form send email records", err);
      setError(err.message || "Failed to load form send email records");
      toast.error("Failed to load form send email records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch);
  }, [fetchItems, currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch]);

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

  const handleStatusToggle = async (item: FormSendEmailToUserItem) => {
    const targetId = item._id;
    if (togglingIds.includes(targetId)) return;

    const newStatus = !(item.status !== false);
    setTogglingIds((prev) => [...prev, targetId]);

    try {
      const res = await formSendEmailApi.updateStatus(targetId, newStatus);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === targetId
              ? { ...i, status: res.status !== undefined ? res.status : newStatus, updatedAt: new Date().toISOString() }
              : i
          )
        );
        toast.success(`Status for "${item.formName}" updated to ${newStatus ? "Active" : "Inactive"}`);
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

  const handleSendEmailToggle = async (item: FormSendEmailToUserItem) => {
    const targetId = item._id;
    if (togglingSendEmailIds.includes(targetId)) return;

    const newSendEmail = !item.sendEmail;
    setTogglingSendEmailIds((prev) => [...prev, targetId]);

    try {
      const res = await formSendEmailApi.updateSendEmail(targetId, newSendEmail);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === targetId
              ? {
                  ...i,
                  sendEmail: res.sendEmail !== undefined ? res.sendEmail : newSendEmail,
                  updatedAt: new Date().toISOString()
                }
              : i
          )
        );
        toast.success(`Email Notification for "${item.formName}" ${newSendEmail ? "Enabled" : "Disabled"}`);
      } else {
        toast.error(res?.message || "Failed to update email notification");
      }
    } catch (err: any) {
      console.error("Send email update error:", err);
      toast.error(err.message || "Error updating email notification");
    } finally {
      setTogglingSendEmailIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const handleSendEmailToAdminToggle = async (item: FormSendEmailToUserItem) => {
    const targetId = item._id;
    if (togglingSendEmailToAdminIds.includes(targetId)) return;

    const newSendEmailToAdmin = !item.sendEmailToAdmin;
    setTogglingSendEmailToAdminIds((prev) => [...prev, targetId]);

    try {
      const res = await formSendEmailApi.updateSendEmailToAdmin(targetId, newSendEmailToAdmin);
      if (res && res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i._id === targetId
              ? {
                  ...i,
                  sendEmailToAdmin: res.sendEmail !== undefined ? res.sendEmail : newSendEmailToAdmin,
                  updatedAt: new Date().toISOString()
                }
              : i
          )
        );
        toast.success(
          `Admin Email Notification for "${item.formName}" ${newSendEmailToAdmin ? "Enabled" : "Disabled"}`
        );
      } else {
        toast.error(res?.message || "Failed to update admin email notification");
      }
    } catch (err: any) {
      console.error("Send email to admin update error:", err);
      toast.error(err.message || "Error updating admin email notification");
    } finally {
      setTogglingSendEmailToAdminIds((prev) => prev.filter((id) => id !== targetId));
    }
  };

  const columns = [
    {
      name: "Form Name",
      selector: (row: FormSendEmailToUserItem) => row.formName || "Unnamed Form",
      sortable: true,
      sortField: "formName",
      grow: 1.5,
      cell: (row: FormSendEmailToUserItem) => (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.4rem 0" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "rgba(99, 102, 241, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--primary)",
              flexShrink: 0
            }}
          >
            <Mail size={16} />
          </div>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.925rem" }}>{row.formName}</span>
        </div>
      )
    },
    {
      name: "Send Email to User",
      selector: (row: FormSendEmailToUserItem) => row.sendEmail,
      sortable: true,
      sortField: "sendEmail",
      cell: (row: FormSendEmailToUserItem) => {
        const isEnabled = Boolean(row.sendEmail);
        const isToggling = togglingSendEmailIds.includes(row._id);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={() => handleSendEmailToggle(row)}
              disabled={isToggling}
              style={{
                position: "relative",
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                border: "none",
                cursor: isToggling ? "wait" : "pointer",
                background: isEnabled ? "var(--success)" : "var(--toggle-inactive-bg, #cbd5e1)",
                transition: "background 0.25s ease",
                padding: 0,
                flexShrink: 0,
                opacity: isToggling ? 0.6 : 1
              }}
              title={isEnabled ? "Click to disable user emails" : "Click to enable user emails"}
              aria-label={isEnabled ? "Disable email notification" : "Enable email notification"}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: isEnabled ? "21px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "block"
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: isEnabled ? "var(--success)" : "var(--text-muted)",
                whiteSpace: "nowrap"
              }}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      }
    },
    {
      name: "Send Email to Admin",
      selector: (row: FormSendEmailToUserItem) => row.sendEmailToAdmin,
      sortable: true,
      sortField: "sendEmailToAdmin",
      cell: (row: FormSendEmailToUserItem) => {
        const isEnabled = Boolean(row.sendEmailToAdmin);
        const isToggling = togglingSendEmailToAdminIds.includes(row._id);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={() => handleSendEmailToAdminToggle(row)}
              disabled={isToggling}
              style={{
                position: "relative",
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                border: "none",
                cursor: isToggling ? "wait" : "pointer",
                background: isEnabled ? "var(--success)" : "var(--toggle-inactive-bg, #cbd5e1)",
                transition: "background 0.25s ease",
                padding: 0,
                flexShrink: 0,
                opacity: isToggling ? 0.6 : 1
              }}
              title={isEnabled ? "Click to disable admin emails" : "Click to enable admin emails"}
              aria-label={isEnabled ? "Disable admin email notification" : "Enable admin email notification"}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: isEnabled ? "21px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "block"
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: isEnabled ? "var(--success)" : "var(--text-muted)",
                whiteSpace: "nowrap"
              }}
            >
              {isEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        );
      }
    },
    {
      name: "Status",
      selector: (row: FormSendEmailToUserItem) => row.status,
      sortable: true,
      sortField: "status",
      cell: (row: FormSendEmailToUserItem) => {
        const isActive = row.status !== false;
        const isToggling = togglingIds.includes(row._id);

        return (
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <button
              type="button"
              onClick={() => handleStatusToggle(row)}
              disabled={isToggling}
              style={{
                position: "relative",
                width: "40px",
                height: "22px",
                borderRadius: "999px",
                border: "none",
                cursor: isToggling ? "wait" : "pointer",
                background: isActive ? "var(--primary)" : "var(--toggle-inactive-bg, #cbd5e1)",
                transition: "background 0.25s ease",
                padding: 0,
                flexShrink: 0,
                opacity: isToggling ? 0.6 : 1
              }}
              title={isActive ? "Click to deactivate" : "Click to activate"}
              aria-label={isActive ? "Deactivate form email setting" : "Activate form email setting"}
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: isActive ? "21px" : "3px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
                  transition: "left 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  display: "block"
                }}
              />
            </button>
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: isActive ? "var(--success)" : "var(--text-muted)",
                whiteSpace: "nowrap"
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
      selector: (row: FormSendEmailToUserItem) => row.createdAt,
      sortable: true,
      sortField: "createdAt",
      cell: (row: FormSendEmailToUserItem) => (
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleString() : "N/A"}
        </span>
      )
    },
    {
      name: "Updated At",
      selector: (row: FormSendEmailToUserItem) => row.updatedAt,
      sortable: true,
      sortField: "updatedAt",
      cell: (row: FormSendEmailToUserItem) => (
        <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "N/A"}
        </span>
      )
    }
  ];

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Mail size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            Form Send Email
          </h1>
          <p className="page-subtitle">Manage automated email notification settings to users across dynamic forms.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          <div style={{ position: "relative", minWidth: "260px" }}>
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
              placeholder="Search by form name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ width: "100%", paddingLeft: "36px", paddingRight: "32px", height: "40px", fontSize: "0.85rem" }}
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
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchItems(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch)}
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", height: "40px", padding: "0 1rem" }}
            title="Refresh list"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
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
          data={items}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No form send email configurations found."
        />
      </div>
    </div>
  );
};

export default FormSendEmailListPage;
