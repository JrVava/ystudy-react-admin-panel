import React from "react";
import type { UploadItem } from "../utils/queueUtils";
import { Play, Pause, X, RotateCw, AlertCircle, CheckCircle, UploadCloud } from "lucide-react";

interface UploadItemProps {
  item: UploadItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onAttachFile: (id: string, file: File) => void;
}

export const UploadItemCard = ({ item, onPause, onResume, onCancel, onAttachFile }: UploadItemProps) => {
  const percent = item.totalSize ? Math.min(100, Math.round((item.uploadedBytes / item.totalSize) * 100)) : 0;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024,
      sizes = ["B", "KB", "MB", "GB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatEta = (seconds?: number) => {
    if (seconds === undefined || seconds === Infinity || Number.isNaN(seconds)) return "Calculating...";
    if (seconds < 60) return `${Math.round(seconds)}s left`;
    return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s left`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAttachFile(item.id, e.target.files[0]);
    }
  };

  return (
    <div
      className="card-glass"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        background: "rgba(30, 41, 59, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: "14px",
        padding: "1rem",
        transition: "all 0.2s ease"
      }}
    >
      <div className="item-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          className="file-name"
          style={{
            fontWeight: 600,
            fontSize: "0.95rem",
            color: "var(--text-primary)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%"
          }}
        >
          {item.fileName}{" "}
          {item.folderName && (
            <span style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 500 }}>({item.folderName})</span>
          )}
        </span>
        <div className="item-actions" style={{ display: "flex", gap: "0.4rem" }}>
          {item.status === "uploading" && (
            <button
              className="btn-icon btn-pause"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--panel-border)",
                color: "var(--text-primary)",
                cursor: "pointer",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => onPause(item.id)}
            >
              <Pause size={14} />
            </button>
          )}
          {(item.status === "paused" || item.status === "failed_network") && item.file && (
            <button
              className="btn-icon btn-resume"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--panel-border)",
                color: "var(--text-primary)",
                cursor: "pointer",
                borderRadius: "8px",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onClick={() => onResume(item.id)}
            >
              {item.status === "failed_network" ? <RotateCw size={14} /> : <Play size={14} />}
            </button>
          )}
          <button
            className="btn-icon btn-cancel"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid var(--panel-border)",
              color: "var(--error)",
              cursor: "pointer",
              borderRadius: "8px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => onCancel(item.id)}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Progress container bar */}
      <div
        className="progress-container"
        style={{
          height: "6px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "10px",
          overflow: "hidden",
          margin: "4px 0"
        }}
      >
        <div
          className={`progress-bar ${item.status === "error" || item.status === "failed_network" ? "error" : ""} ${item.status === "completed" || item.status === "processing" ? "success" : ""}`}
          style={{
            height: "100%",
            borderRadius: "10px",
            width: `${percent}%`,
            background:
              item.status === "error" || item.status === "failed_network"
                ? "var(--error)"
                : item.status === "completed" || item.status === "processing"
                  ? "var(--success)"
                  : "linear-gradient(to right, var(--primary), var(--accent))",
            transition: "width 0.3s ease"
          }}
        ></div>
      </div>

      <div
        className="item-meta"
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "0.5rem"
        }}
      >
        <span className="status-text" style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: 500 }}>
          {item.status === "pending" && "Queueing..."}
          {item.status === "processing" && "Processing on server..."}
          {item.status === "completed" && (
            <>
              <CheckCircle size={14} style={{ color: "var(--success)" }} /> Completed
            </>
          )}
          {item.status === "failed_network" && (
            <>
              <AlertCircle size={14} style={{ color: "var(--error)" }} /> Network Failed
            </>
          )}
          {item.status === "error" && (
            <>
              <AlertCircle size={14} style={{ color: "var(--error)" }} /> {item.error}
            </>
          )}
          {(item.status === "uploading" || item.status === "paused") && `${percent}% of ${formatBytes(item.totalSize)}`}
        </span>

        {item.status === "uploading" && (
          <span className="eta-text" style={{ color: "var(--text-muted)", fontWeight: 500 }}>
            {formatBytes(item.speed || 0)}/s • {formatEta(item.eta)}
          </span>
        )}

        {!item.file && (item.status === "paused" || item.status === "failed_network") && (
          <div
            className="re-attach-prompt"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              width: "100%",
              borderTop: "1px solid rgba(255,255,255,0.03)",
              paddingTop: "8px",
              marginTop: "4px"
            }}
          >
            <span
              className="resume-warning"
              style={{
                color: "var(--warning)",
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.25rem"
              }}
            >
              <UploadCloud size={12} />
              Re-select original file to resume:
            </span>
            <input
              type="file"
              onChange={handleFileChange}
              style={{ fontSize: "0.75rem", color: "var(--text-secondary)", cursor: "pointer" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadItemCard;
