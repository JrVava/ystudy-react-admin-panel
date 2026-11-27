import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Plus, Search, X, Edit2, Trash2, AlertCircle, Star, ArrowRightLeft } from "lucide-react";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { languageApi, type LanguageItem } from "../utils/languageApi";

export const LanguageListPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<LanguageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Row action loading states
  const [actionLoadingIds, setActionLoadingIds] = useState<string[]>([]);

  // Debounce search query (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch paginated languages
  const fetchLanguages = useCallback(
    async (page: number, limit: number, field: string, sort: string, search: string, status: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await languageApi.getPaginated(page, limit, field, sort, search, status);
        if (res && res.success) {
          setItems(res.data || []);
          setTotalRows(res.total || 0);
        } else {
          setItems([]);
          setTotalRows(0);
        }
      } catch (err: any) {
        console.error("Failed to load languages", err);
        setError(err.message || "Failed to load languages");
        toast.error("Failed to load languages");
        setItems([]);
        setTotalRows(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchLanguages(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus);
  }, [fetchLanguages, currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus]);

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

  // Toggle active/inactive status
  const handleToggleStatus = async (item: LanguageItem) => {
    if (actionLoadingIds.includes(item._id)) return;
    setActionLoadingIds((prev) => [...prev, item._id]);

    const newStatus = !item.status;
    try {
      const res = await languageApi.updateStatus(item._id, newStatus);
      if (res && res.success) {
        toast.success(`Language marked as ${newStatus ? "Active" : "Inactive"}`);
        setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i)));
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    } finally {
      setActionLoadingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  // Make default language
  const handleMakeDefault = async (item: LanguageItem) => {
    if (item.isDefault) return;
    if (actionLoadingIds.includes(item._id)) return;
    setActionLoadingIds((prev) => [...prev, item._id]);

    try {
      const res = await languageApi.update(item._id, { isDefault: true });
      if (res && res.success) {
        toast.success(`"${item.name}" set as default language`);
        setItems((prev) =>
          prev.map((i) => ({
            ...i,
            isDefault: i._id === item._id
          }))
        );
      } else {
        toast.error(res?.message || "Failed to set default language");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update default language");
    } finally {
      setActionLoadingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  // Delete language
  const handleDelete = async (item: LanguageItem) => {
    if (item.isDefault) {
      toast.error("Cannot delete the default language");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete language: "${item.name}"?`)) {
      return;
    }

    setActionLoadingIds((prev) => [...prev, item._id]);
    try {
      const res = await languageApi.delete(item._id);
      if (res && res.success) {
        toast.success("Language deleted successfully");
        fetchLanguages(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearch, selectedStatus);
      } else {
        toast.error(res?.message || "Failed to delete language");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete language");
    } finally {
      setActionLoadingIds((prev) => prev.filter((id) => id !== item._id));
    }
  };

  // Define Table Columns matching Tools & Student Guides structure
  const columns = [
    {
      name: "Language Name",
      selector: (row: LanguageItem) => row.name || "Unnamed Language",
      sortable: true,
      sortField: "name",
      cell: (row: LanguageItem) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{row.name}</span>
          {row.nativeName && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{row.nativeName}</span>}
        </div>
      )
    },
    {
      name: "Code",
      selector: (row: LanguageItem) => row.code || "",
      sortable: true,
      sortField: "code",
      cell: (row: LanguageItem) => (
        <span
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 700,
            background: "rgba(99, 102, 241, 0.12)",
            color: "var(--primary)",
            border: "1px solid rgba(99, 102, 241, 0.25)"
          }}
        >
          {row.code}
        </span>
      )
    },
    {
      name: "Direction",
      selector: (row: LanguageItem) => row.direction || "ltr",
      sortable: true,
      sortField: "direction",
      cell: (row: LanguageItem) => (
        <span
          style={{
            fontSize: "0.75rem",
            textTransform: "uppercase",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            background: "var(--table-hover-bg, rgba(0, 0, 0, 0.04))",
            color: "var(--text-secondary)",
            border: "1px solid var(--panel-border)",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <ArrowRightLeft size={11} /> {row.direction === "rtl" ? "RTL" : "LTR"}
        </span>
      )
    },
    {
      name: "Default",
      selector: (row: LanguageItem) => (row.isDefault ? "Default" : "No"),
      sortable: true,
      sortField: "isDefault",
      cell: (row: LanguageItem) => {
        if (row.isDefault) {
          return (
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 8px",
                borderRadius: "6px",
                fontWeight: 600,
                background: "rgba(245, 158, 11, 0.15)",
                color: "#f59e0b",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Star size={12} fill="#f59e0b" /> Default
            </span>
          );
        }
        return (
          <button
            onClick={() => handleMakeDefault(row)}
            className="btn-secondary"
            style={{
              padding: "0.25rem 0.6rem",
              borderRadius: "6px",
              fontSize: "0.75rem",
              cursor: "pointer"
            }}
            title="Set as system default language"
          >
            Set Default
          </button>
        );
      }
    },
    {
      name: "Status",
      selector: (row: LanguageItem) => row.status,
      sortable: true,
      sortField: "status",
      cell: (row: LanguageItem) => (
        <span
          onClick={() => handleToggleStatus(row)}
          style={{
            fontSize: "0.75rem",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            background: row.status !== false ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
            color: row.status !== false ? "var(--success)" : "var(--error)",
            cursor: "pointer"
          }}
          title="Click to toggle status"
        >
          {row.status !== false ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      name: "Actions",
      right: true,
      cell: (row: LanguageItem) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/languages/edit/${row._id}`)}
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
            onClick={() => handleDelete(row)}
            disabled={row.isDefault}
            className="btn-secondary"
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: "8px",
              fontSize: "0.85rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
              color: "var(--error)",
              borderColor: "rgba(244, 63, 94, 0.2)",
              opacity: row.isDefault ? 0.4 : 1,
              cursor: row.isDefault ? "not-allowed" : "pointer"
            }}
            title={row.isDefault ? "Cannot delete default language" : "Delete Language"}
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
      {/* Page Header matching Tools / Student Guides */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Globe size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            Languages
          </h1>
          <p className="page-subtitle">
            Manage system languages, native translations, text direction, and default locale.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "220px" }}>
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
              placeholder="Search languages..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", height: "40px", fontSize: "0.85rem" }}
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="form-input"
            style={{ height: "40px", fontSize: "0.85rem", padding: "0 12px", cursor: "pointer" }}
          >
            <option value="ALL">All Statuses</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>

          {/* Add Language Button */}
          <button
            onClick={() => navigate("/languages/new")}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Plus size={18} />
            Add Language
          </button>
        </div>
      </div>

      {/* Error Alert */}
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

      {/* Panel Glass Table Container */}
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
          noDataText="No languages found matching search criteria."
        />
      </div>
    </div>
  );
};

export default LanguageListPage;
