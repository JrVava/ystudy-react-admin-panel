import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { timeTableApi } from "../utils/timeTableApi";
import { Edit2, Plus, Clock, AlertCircle, Search, X, Trash2 } from "lucide-react";
import { toast } from "../context/ToastContext";
import { Table } from "../components/Table";

export const TimeTableListPage: React.FC = () => {
  const [timeTables, setTimeTables] = useState<any[]>([]);
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

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch timetables on changes
  useEffect(() => {
    fetchTimeTables(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery]);

  async function fetchTimeTables(
    page: number,
    limit: number,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await timeTableApi.getPaginated(page, limit, field, sort, search);
      if (res.success) {
        setTimeTables(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError("Failed to fetch timetables");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching timetables");
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (
      !window.confirm(`Are you sure you want to delete the timetable "${name}"? (It will be moved to the Recycle Bin)`)
    ) {
      return;
    }

    try {
      setLoading(true);
      const res = await timeTableApi.delete(id);
      if (res.success || res.data?.success) {
        toast.success("Timetable deleted successfully");
        await fetchTimeTables(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
      } else {
        toast.error("Failed to delete timetable: " + (res.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error deleting timetable: " + (err.message || "Unknown error"));
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
      selector: (row: any) => row.title || "Unnamed Timetable",
      sortable: true,
      sortField: "title"
    },
    {
      name: "Slug",
      selector: (row: any) => row.slug,
      sortable: true,
      sortField: "slug",
      cell: (row: any) => (
        <span
          style={{ fontSize: "0.8rem", background: "rgba(255,255,255,0.04)", padding: "4px 8px", borderRadius: "6px" }}
        >
          {row.slug || "N/A"}
        </span>
      )
    },
    {
      name: "Created At",
      selector: (row: any) => row.createdAt,
      sortable: true,
      sortField: "createdAt",
      cell: (row: any) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "N/A")
    },
    {
      name: "Updated At",
      selector: (row: any) => row.updatedAt,
      sortable: true,
      sortField: "updatedAt",
      cell: (row: any) => (row.updatedAt ? new Date(row.updatedAt).toLocaleString() : "N/A")
    },
    {
      name: "Actions",
      right: true,
      cell: (row: any) => (
        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/time-tables/edit/${row._id}`)}
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
            onClick={() => handleDelete(row._id, row.title)}
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
            <Clock size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            Time Tables
          </h1>
          <p className="page-subtitle">
            Create and manage academic year schedules, study patterns, and course timetables.
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
              placeholder="Search timetables..."
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
            onClick={() => navigate("/time-tables/new")}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Plus size={18} />
            Add Time Table
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
          data={timeTables}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No timetables found matching search criteria."
        />
      </div>
    </div>
  );
};

export default TimeTableListPage;
