import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { upcomingIntakeApi } from "../utils/upcomingIntakeApi";
import { lookupApi } from "../utils/lookupApi";
import { Edit2, Plus, Calendar, AlertCircle, Search, X, Trash2 } from "lucide-react";
import { toast } from "../context/ToastContext";
import { Table } from "../components/Table";

export const UpcomingIntakeListPage: React.FC = () => {
  const [intakes, setIntakes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Lookups maps
  const [subjectsMap, setSubjectsMap] = useState<Record<string, string>>({});
  const [qualificationsMap, setQualificationsMap] = useState<Record<string, string>>({});

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Load lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const subRes = await lookupApi("subjects").getPaginated(1, 1000);
        if (subRes.success) {
          const map: Record<string, string> = {};
          (subRes.data || []).forEach((item: any) => {
            map[item._id] = item.name;
          });
          setSubjectsMap(map);
        }
        const qualRes = await lookupApi("qualifications").getPaginated(1, 1000);
        if (qualRes.success) {
          const map: Record<string, string> = {};
          (qualRes.data || []).forEach((item: any) => {
            map[item._id] = item.name;
          });
          setQualificationsMap(map);
        }
      } catch (err) {
        console.error("Error loading lookups in upcoming intakes list:", err);
      }
    };
    loadLookups();
  }, []);

  async function fetchIntakes(
    page: number,
    limit: number,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) {
    try {
      setLoading(true);
      setError(null);
      const res = await upcomingIntakeApi.getPaginated(page, limit, field, sort, search);
      if (res.success) {
        setIntakes(res.data || []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setError("Failed to fetch upcoming intakes");
      }
    } catch (err: any) {
      setError(err.message || "Error fetching upcoming intakes");
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

  // Fetch intakes on changes
  useEffect(() => {
    fetchIntakes(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
  }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery]);

  const handleDelete = async (id: string, label: string) => {
    if (!window.confirm(`Are you sure you want to delete intake: "${label}"?`)) {
      return;
    }
    try {
      setLoading(true);
      const res = await upcomingIntakeApi.delete(id);
      if (res.success) {
        toast.success(`Deleted successfully`);
        fetchIntakes(currentPage, rowsPerPage, sortField, sortOrder, debouncedSearchQuery);
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
      name: "Year",
      selector: (row: any) => row.year || "",
      sortable: true,
      sortField: "year"
    },
    {
      name: "Month",
      selector: (row: any) => row.month || "",
      sortable: true,
      sortField: "month"
    },
    {
      name: "Subject",
      selector: (row: any) => subjectsMap[row.subjectId] || row.subjectId || "Loading...",
      sortable: false
    },
    {
      name: "Qualification",
      selector: (row: any) => qualificationsMap[row.qualificationId] || row.qualificationId || "Loading...",
      sortable: false
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
            onClick={() => navigate(`/courses/upcoming-intakes/edit/${row._id}`)}
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
            onClick={() => handleDelete(row._id, `${row.month} ${row.year}`)}
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
            <Calendar
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            Upcoming Intakes
          </h1>
          <p className="page-subtitle">
            Manage student course intakes, start dates, application deadlines, and direct apply links.
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
              placeholder="Search by year or month..."
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
            onClick={() => navigate("/courses/upcoming-intakes/new")}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
          >
            <Plus size={18} />
            Add Intake
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
          data={intakes}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          noDataText="No upcoming intakes found matching search criteria."
        />
      </div>
    </div>
  );
};

export default UpcomingIntakeListPage;
