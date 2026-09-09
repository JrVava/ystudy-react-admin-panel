import React, { useEffect, useState } from "react";
import { FileSpreadsheet, Edit2, Plus, Trash2, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { googleSheetApi } from "../utils/googleSheetApi";

export const GoogleSheetListPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sheets, setSheets] = useState<any[]>([]);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchSheets = async (
    page: number,
    limit: number,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    setLoading(true);
    try {
      const res = await googleSheetApi.getPaginated(page, limit, field, sort, search);
      if (res?.success) {
        setSheets(Array.isArray(res.data) ? res.data : []);
        setTotalRows(res.total || 0);
        setCurrentPage(res.page || page);
      } else {
        setSheets([]);
      }
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to fetch Google Sheets configurations");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheets(currentPage, rowsPerPage, sortField, sortOrder);
  }, [currentPage, rowsPerPage, sortField, sortOrder]);

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
      name: "Service Account Email",
      selector: (row: any) => row.google_service_account_email || "N/A",
      sortable: true,
      sortField: "google_service_account_email"
    },
    {
      name: "Spreadsheet ID",
      selector: (row: any) => row.google_spreadsheet_id || "N/A",
      sortable: true,
      sortField: "google_spreadsheet_id"
    },
    {
      name: "Status",
      selector: (row: any) => (
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
      ),
      sortable: true,
      sortField: "status"
    },
    {
      name: "Actions",
      right: true,
      cell: (row: any) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/google-sheets/edit/${row._id}`)}
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
            onClick={async () => {
              if (window.confirm("Are you sure you want to delete this Google Sheet config?")) {
                try {
                  await googleSheetApi.delete(row._id);
                  if (toast && toast.success) {
                    toast.success("Google Sheet Configuration deleted");
                  }
                  fetchSheets(currentPage, rowsPerPage, sortField, sortOrder);
                } catch (error: any) {
                  if (toast && toast.error) {
                    toast.error(error.message || "Failed to delete config");
                  }
                }
              }
            }}
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
            <FileSpreadsheet
              size={32}
              style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }}
            />
            Google Sheets Integrations
          </h1>
          <p className="page-subtitle">Manage your Google Sheets for exporting or syncing data.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {totalRows === 0 && (
            <button
              onClick={() => navigate("/google-sheets/new")}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
            >
              <Plus size={18} />
              Add Integration
            </button>
          )}
        </div>
      </div>

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={sheets}
          loading={loading}
          totalRows={totalRows}
          currentPage={currentPage}
          rowsPerPage={rowsPerPage}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handlePerRowsChange}
          onSort={handleSort}
          serverSide={true}
          noDataText="No Google Sheet configurations found."
        />
      </div>
    </div>
  );
};

export default GoogleSheetListPage;
