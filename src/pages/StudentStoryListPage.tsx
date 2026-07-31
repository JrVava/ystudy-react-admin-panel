import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { studentStoryApi } from "../utils/studentStoryApi";
import { Edit2, Plus, Users, AlertCircle, Search, X, Trash2, Star } from "lucide-react";
import { toast } from "../context/ToastContext";
import { Table } from "../components/Table";

export const StudentStoryListPage: React.FC = () => {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  async function fetchStories(
    page: number,
    limit: number,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await studentStoryApi.getPaginated(page, limit, field, sort, search);
      if (res.success) {
        setStories(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError("Failed to fetch student stories");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching student stories");
    } finally {
      setLoading(false);
    }
  }

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch stories on changes
  useEffect(() => {
    fetchStories(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await studentStoryApi.delete(id);
      if (res.success) {
        toast.success(`Deleted successfully`);
        fetchStories(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
      } else {
        toast.error("Failed to delete: " + res.message);
      }
    } catch (e: any) {
      console.error(e);
      toast.error("Error deleting item: " + (e.message || "Unknown error"));
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
      name: "Student Name",
      selector: (row: any) => row.name || "Anonymous",
      sortable: true,
      sortField: "name"
    },
    {
      name: "Rating",
      selector: (row: any) => row.star,
      sortable: true,
      sortField: "star",
      cell: (row: any) => (
        <div style={{ display: "flex", gap: "2px", alignItems: "center" }}>
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              size={14}
              fill={idx < (row.star || 0) ? "var(--warning)" : "none"}
              color={idx < (row.star || 0) ? "var(--warning)" : "var(--text-muted)"}
            />
          ))}
          <span style={{ fontSize: "0.8rem", marginLeft: "4px", color: "var(--text-secondary)" }}>
            ({row.star || 0})
          </span>
        </div>
      )
    },
    {
      name: "Subject",
      selector: (row: any) => row.subject || "General",
      sortable: true,
      sortField: "subject"
    },
    {
      name: "Badge",
      selector: (row: any) => row.badge || "N/A",
      sortable: true,
      sortField: "badge"
    },
    {
      name: "Status",
      selector: (row: any) => row.status,
      sortable: true,
      sortField: "status",
      cell: (row: any) => (
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
      name: "Actions",
      right: true,
      cell: (row: any) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/student-stories/edit/${row._id}`)}
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
            onClick={() => handleDelete(row._id, row.name)}
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
            <Users size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            Student Stories
          </h1>
          <p className="page-subtitle">Manage student reviews, testimonials, ratings, and course associations.</p>
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
              placeholder="Search stories..."
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
            onClick={() => navigate("/student-stories/new")}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Plus size={18} />
            Add Story
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
          data={stories}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No student stories found matching search criteria."
        />
      </div>
    </div>
  );
};

export default StudentStoryListPage;
