import { useEffect, useState } from "react";
import { Server, Edit2, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table } from "../components/Table";
import { toast } from "../context/ToastContext";
import { smtpApi } from "../utils/smtpApi";

export const SMTPPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [configs, setConfigs] = useState<any[]>([]);

  const gotSMTP = async () => {
    setLoading(true);
    try {
      const res = await smtpApi.getSmtp();
      if (res?.success && res.data) {
        setConfigs([res.data]);
      } else {
        setConfigs([]);
      }
    } catch (error: any) {
      if (toast && toast.error) {
        toast.error(error.message || "Failed to fetch SMTP configurations");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    gotSMTP();
  }, []);
  const columns = [
    {
      name: "Host",
      selector: (row: any) => row.host,
      sortable: true,
      sortField: "host"
    },
    {
      name: "User",
      selector: (row: any) => row.user,
      sortable: true,
      sortField: "user"
    },
    {
      name: "Port",
      selector: (row: any) => row.port,
      sortable: true,
      sortField: "port"
    },
    {
      name: "Actions",
      right: true,
      cell: (row: any) => (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate(`/smtp-config/edit/${row._id}`)}
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
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this SMTP config?")) {
                setConfigs(configs.filter((c) => c._id !== row._id));
                if (toast && toast.success) {
                  toast.success("SMTP Configuration deleted");
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
            <Server size={32} style={{ color: "var(--primary)", filter: "drop-shadow(0 0 8px var(--primary-glow))" }} />
            SMTP Configurations
          </h1>
          <p className="page-subtitle">Manage your email server settings for sending out system emails.</p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {configs.length === 0 && (
            <button
              onClick={() => navigate("/smtp-config/new")}
              className="btn-primary"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", height: "40px" }}
            >
              <Plus size={18} />
              Add Configuration
            </button>
          )}
        </div>
      </div>

      <div className="panel-glass" style={{ padding: 0, overflow: "hidden" }}>
        <Table
          columns={columns}
          data={configs}
          loading={loading}
          totalRows={configs.length}
          serverSide={false}
          noDataText="No SMTP configurations found."
        />
      </div>
    </div>
  );
};

export default SMTPPage;
