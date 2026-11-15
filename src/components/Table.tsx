import React from "react";
import DataTable, { createTheme } from "react-data-table-component";
import { useTheme } from "../context/ThemeContext";

// Define the custom dark theme for YStudy matching index.css variables
createTheme("ystudy-dark", {
  text: {
    primary: "#f8fafc",
    secondary: "#94a3b8",
    disabled: "rgba(255, 255, 255, 0.3)"
  },
  background: {
    default: "transparent"
  },
  context: {
    background: "rgba(99, 102, 241, 0.2)",
    text: "#f8fafc"
  },
  divider: {
    default: "rgba(255, 255, 255, 0.08)"
  }
});

// Define the custom light theme for YStudy
createTheme("ystudy-light", {
  text: {
    primary: "#0f172a",
    secondary: "#475569",
    disabled: "rgba(0, 0, 0, 0.25)"
  },
  background: {
    default: "transparent"
  },
  context: {
    background: "rgba(99, 102, 241, 0.1)",
    text: "#0f172a"
  },
  divider: {
    default: "rgba(0, 0, 0, 0.08)"
  }
});

const getCustomStyles = (isLight: boolean) => ({
  headRow: {
    style: {
      backgroundColor: isLight ? "#f1f5f9" : "rgba(10, 14, 26, 0.7)",
      borderBottomWidth: "1px",
      borderBottomColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
      borderBottomStyle: "solid" as const,
      minHeight: "52px"
    }
  },
  headCells: {
    style: {
      fontSize: "0.8rem",
      fontWeight: "600",
      color: isLight ? "#475569" : "#94a3b8",
      textTransform: "uppercase" as const,
      letterSpacing: "0.5px",
      paddingLeft: "1.25rem",
      paddingRight: "1.25rem"
    }
  },
  rows: {
    style: {
      minHeight: "56px",
      backgroundColor: "transparent",
      borderBottomWidth: "1px",
      borderBottomColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.04)",
      borderBottomStyle: "solid" as const,
      transition: "background-color 0.2s ease",
      "&:not(:lastOfType)": {
        borderBottomWidth: "1px",
        borderBottomColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.04)",
        borderBottomStyle: "solid" as const
      },
      "&:hover": {
        backgroundColor: isLight ? "rgba(0, 0, 0, 0.025) !important" : "rgba(255, 255, 255, 0.02) !important"
      }
    }
  },
  cells: {
    style: {
      fontSize: "0.95rem",
      color: isLight ? "#0f172a" : "#f8fafc",
      paddingLeft: "1.25rem",
      paddingRight: "1.25rem"
    }
  },
  pagination: {
    style: {
      backgroundColor: "transparent",
      color: isLight ? "#475569" : "#94a3b8",
      borderTopWidth: "1px",
      borderTopColor: isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.08)",
      borderTopStyle: "solid" as const,
      fontSize: "0.85rem",
      fontWeight: 500
    },
    pageButtonsStyle: {
      borderRadius: "50%",
      height: "34px",
      width: "34px",
      padding: "4px",
      margin: "2px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      color: isLight ? "#0f172a" : "#f8fafc",
      fill: isLight ? "#0f172a" : "#f8fafc",
      "&:disabled": {
        color: isLight ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.18)",
        fill: isLight ? "rgba(0, 0, 0, 0.2)" : "rgba(255, 255, 255, 0.18)"
      },
      "&:hover:not(:disabled)": {
        backgroundColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.08)"
      }
    }
  },
  noData: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      color: isLight ? "#475569" : "#94a3b8",
      fontSize: "0.95rem",
      backgroundColor: "transparent"
    }
  },
  progress: {
    style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
      color: "#6366f1",
      backgroundColor: "transparent"
    }
  }
});

interface TableProps {
  columns: any[];
  data: any[];
  loading?: boolean;
  totalRows?: number;
  onChangePage?: (page: number) => void;
  onChangeRowsPerPage?: (currentRowsPerPage: number, currentPage: number) => void;
  onSort?: (selectedColumn: any, sortDirection: "asc" | "desc") => void;
  sortServer?: boolean;
  serverSide?: boolean;
  currentPage?: number;
  rowsPerPage?: number;
  selectableRows?: boolean;
  onSelectedRowsChange?: (selectedInfo: any) => void;
  noDataText?: string;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  loading = false,
  totalRows,
  onChangePage,
  onChangeRowsPerPage,
  onSort,
  sortServer,
  serverSide = true,
  currentPage = 1,
  rowsPerPage = 10,
  selectableRows = false,
  onSelectedRowsChange,
  noDataText = "No records found."
}) => {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // If record is less than 10, no need to show pagination.
  // When serverSide pagination is used, totalRows gives the count in database.
  // Otherwise, data.length gives the client-side count.
  const showPagination = totalRows !== undefined ? totalRows >= 10 : data.length >= 10;

  return (
    <div className="table-container" style={{ background: "transparent" }}>
      <DataTable
        columns={columns}
        data={data}
        progressPending={loading}
        progressComponent={
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
              className="loader-spinner"
              style={{ position: "relative", width: "40px", height: "40px", borderWidth: "2px" }}
            ></div>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Loading records...</span>
          </div>
        }
        noDataComponent={<div>{noDataText}</div>}
        theme={isLight ? "ystudy-light" : "ystudy-dark"}
        customStyles={getCustomStyles(isLight)}
        pagination={showPagination}
        paginationServer={serverSide}
        paginationTotalRows={totalRows}
        paginationDefaultPage={currentPage}
        paginationPerPage={rowsPerPage}
        paginationRowsPerPageOptions={[10, 20, 50, 100]}
        onChangePage={onChangePage}
        onChangeRowsPerPage={onChangeRowsPerPage}
        sortServer={sortServer !== undefined ? sortServer : serverSide}
        onSort={onSort}
        selectableRows={selectableRows}
        onSelectedRowsChange={onSelectedRowsChange}
        sortIcon={<span style={{ marginLeft: "4px", fontSize: "0.75rem", color: "var(--primary)" }}>▲</span>}
        defaultSortAsc={true}
        persistTableHead
      />
    </div>
  );
};

export default Table;
