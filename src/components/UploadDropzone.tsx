import React, { useCallback, useState, useEffect } from "react";
import { UploadCloud } from "lucide-react";
import { SearchableSelect } from "./SearchableSelect";

interface UploadDropzoneProps {
  onFilesAdded: (files: File[], folderName?: string) => void;
  folders?: any[];
  initialFolderName?: string;
}

export const UploadDropzone = ({ onFilesAdded, folders = [], initialFolderName = "" }: UploadDropzoneProps) => {
  const [folderName, setFolderName] = useState(initialFolderName);

  useEffect(() => {
    if (initialFolderName) {
      setFolderName(initialFolderName);
    }
  }, [initialFolderName]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onFilesAdded(files, folderName.trim() || undefined);
      }
    },
    [onFilesAdded, folderName]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files), folderName.trim() || undefined);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: "200px" }}>
          <label className="form-label" style={{ textAlign: "left" }}>
            Target Folder Name
          </label>
          <input
            type="text"
            placeholder="Enter new folder name (optional)..."
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="form-input"
            style={{ width: "100%" }}
          />
        </div>
        {folders && folders.filter((f) => f.name && f.name !== "uploads").length > 0 && (
          <div style={{ flex: 1, minWidth: "200px" }}>
            <SearchableSelect
              label="Or Select Existing Folder"
              value={folders.some((f) => f.name === folderName) ? folderName : ""}
              onChange={(val) => {
                if (val) {
                  setFolderName(val);
                }
              }}
              options={folders
                .filter((f) => f.name && f.name !== "uploads")
                .map((folder) => ({
                  value: folder.name,
                  label: folder.name
                }))}
              placeholder="-- Choose Folder --"
            />
          </div>
        )}
      </div>

      <div
        className="dropzone-container"
        onDragOver={onDragOver}
        onDrop={onDrop}
        style={{
          background: "rgba(30, 41, 59, 0.4)",
          border: "2px dashed rgba(255, 255, 255, 0.08)",
          borderRadius: "20px",
          padding: "3rem 1.5rem",
          textAlign: "center",
          backdropFilter: "blur(12px)",
          transition: "all 0.3s ease"
        }}
      >
        <div className="dropzone-content">
          <div
            className="icon-wrapper"
            style={{
              display: "inline-flex",
              padding: "1.25rem",
              background: "rgba(79, 70, 229, 0.1)",
              borderRadius: "50%",
              marginBottom: "1rem",
              color: "var(--primary)",
              animation: "float 6s ease-in-out infinite"
            }}
          >
            <UploadCloud size={40} className="cloud-icon" />
          </div>
          <h2 style={{ fontSize: "1.35rem", fontWeight: 600, marginBottom: "0.25rem" }}>
            Drag & Drop your media files here
          </h2>
          <p
            className="subtitle"
            style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}
          >
            or click to browse from your device
          </p>

          <label className="btn-primary" style={{ display: "inline-flex", cursor: "pointer", marginTop: "0.5rem" }}>
            Browse Files
            <input type="file" multiple className="hidden-input" style={{ display: "none" }} onChange={onChange} />
          </label>
        </div>
      </div>
    </div>
  );
};
