import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studyRouteApi } from "../utils/studyRouteApi";
import type { StudyRoute } from "../utils/studyRouteApi";
import { Route as RouteIcon, Plus, Edit2, Trash2, AlertCircle, Search, X } from "lucide-react";
import { toast } from "../context/ToastContext";
import { Table } from "../components/Table";

export const StudyRouteListPage: React.FC = () => {
  const [studyRoutes, setStudyRoutes] = useState<StudyRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const navigate = useNavigate();

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    fetchStudyRoutes(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery]);

  async function fetchStudyRoutes(
    page: number,
    limit: number,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await studyRouteApi.getPaginated(page, limit, field, sort, search);
      if (res.success) {
        setStudyRoutes(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError(res.message || "Failed to fetch study routes");
      }
    } catch (err: any) {
      console.error("Error fetching study routes:", err);
      setError(err.message || "Error fetching study routes");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the study route "${title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const res = await studyRouteApi.delete(id);
      if (res && (res.success || res.message)) {
        toast.success("Study route deleted successfully");
        await fetchStudyRoutes(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
      } else {
        toast.error("Failed to delete study route: " + (res?.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Error deleting study route:", err);
      toast.error(err.message || "Error deleting study route");
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
      name: "Title",
      selector: (row: StudyRoute) => row.title || "Unnamed",
      sortable: true,
      sortField: "title",
      grow: 1.5,
      cell: (row: StudyRoute) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.4rem 0" }}>
          <span style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.9rem" }}>{row.title}</span>
          {row.description && (
            <span
              style={{
                fontSize: "0.78rem",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "350px"
              }}
              title={row.description}
            >
              {row.description}
            </span>
          )}
        </div>
      )
    },
    {
      name: "Slug",
      selector: (row: StudyRoute) => row.slug,
      sortable: true,
      sortField: "slug",
      cell: (row: StudyRoute) => (
        <span
          style={{
            fontSize: "0.8rem",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--panel-border)",
            padding: "3px 8px",
            borderRadius: "6px",
            color: "var(--text-secondary)"
          }}
        >
          {row.slug || "N/A"}
        </span>
      )
    },
    {
      name: "Status",
      selector: (row: StudyRoute) => (row.status !== false ? 1 : 0),
      sortable: true,
      sortField: "status",
      cell: (row: StudyRoute) => (
        <span
          style={{
            fontSize: "0.75rem",
            padding: "3px 8px",
            borderRadius: "6px",
            fontWeight: 600,
            background: row.status !== false ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
            color: row.status !== false ? "var(--success)" : "var(--error)"
          }}
        >
          {row.status !== false ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      name: "Created At",
      selector: (row: StudyRoute) => row.createdAt || "",
      sortable: true,
      sortField: "createdAt",
      cell: (row: StudyRoute) => (
        <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}
        </span>
      )
    },
    {
      name: "Actions",
      right: true,
      minWidth: "160px",
      cell: (row: StudyRoute) => (
        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/study-routes/edit/${row._id}`)}
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
            onClick={() => row._id && handleDelete(row._id, row.title)}
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
            <RouteIcon
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            Study Routes
          </h1>
          <p className="page-subtitle">
            Configure learning pathways, academic study routes, and course progression links.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* Quick Search */}
          <div style={{ position: "relative", minWidth: "240px" }}>
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
              placeholder="Search title, slug, description..."
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

          <button
            onClick={() => navigate("/study-routes/new")}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Plus size={18} />
            Add Study Route
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
          data={studyRoutes}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No study routes found."
        />
      </div>
    </div>
  );
};

export default StudyRouteListPage;
