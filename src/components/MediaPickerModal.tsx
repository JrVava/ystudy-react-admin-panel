import React, { useState, useEffect } from "react";
import api from "../utils/api";
import { Folder, X, Search, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface MediaPickerModalProps {
  onSelect: (mediaId: string, filePath: string) => void;
  onClose: () => void;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ onSelect, onClose }) => {
  const [images, setImages] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchFolders = async () => {
    try {
      const { data } = await api.get("/upload/folders");
      if (data.success) {
        setFolders(data.data);
      }
    } catch (e) {
      console.error("Failed to load folders", e);
    }
  };

  const fetchImages = async (pageNumber: number, folderId: string | null = activeFolderId) => {
    try {
      const folderQuery = folderId ? `&folderId=${folderId}` : "";
      const { data } = await api.get(`/upload/list?page=${pageNumber}&limit=12${folderQuery}`);
      if (data.success) {
        setImages(data.data);
        setTotalPages(data.totalPages);
        setPage(data.page);
      }
    } catch (e) {
      console.error("Failed to load images", e);
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchImages(1, null);
  }, []);

  const handleTabClick = (folderId: string | null) => {
    setActiveFolderId(folderId);
    fetchImages(1, folderId);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage._id, selectedImage.filePath);
    }
  };

  const filteredImages = images.filter(img => {
    const q = searchQuery.toLowerCase();
    return (
      (img.fileName && img.fileName.toLowerCase().includes(q)) ||
      (img.altText && img.altText.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
      <div className="panel-glass animate-fade-in" style={{ width: "90%", maxWidth: "850px", maxHeight: "85vh", overflowY: "auto", padding: "2rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", gap: "1rem", flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800 }}>Choose Media</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button 
              onClick={onClose} 
              className="btn-secondary"
              style={{ padding: "0.5rem 1rem", fontSize: "0.85rem", borderRadius: "8px" }}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={!selectedImage}
              className="btn-primary"
              style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem", borderRadius: "8px" }}
            >
              Confirm Selection
            </button>
            <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {/* Folders List */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "4px" }}>
            <button 
              onClick={() => handleTabClick(null)}
              className={activeFolderId === null ? "btn-primary" : "btn-secondary"}
              style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "8px", whiteSpace: "nowrap" }}
            >
              All
            </button>
            {folders.filter((folder) => folder.name !== "uploads").map((folder) => (
              <button 
                key={folder._id}
                onClick={() => handleTabClick(folder._id)}
                className={activeFolderId === folder._id ? "btn-primary" : "btn-secondary"}
                style={{ padding: "0.4rem 1rem", fontSize: "0.85rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}
              >
                <Folder size={14} />
                {folder.name}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search images..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "32px", height: "36px", fontSize: "0.85rem" }}
            />
          </div>
        </div>
        
        {filteredImages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)", background: "rgba(0,0,0,0.15)", borderRadius: "12px", border: "1px dashed var(--panel-border)" }}>
            <p>No images found in this folder.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "1rem" }}>
            {filteredImages.map((img) => (
              <div 
                key={img._id} 
                onClick={() => setSelectedImage(img)}
                style={{ 
                  background: selectedImage?._id === img._id ? "rgba(79, 70, 229, 0.1)" : "rgba(255,255,255,0.01)", 
                  padding: "10px", 
                  borderRadius: "12px", 
                  border: selectedImage?._id === img._id ? "2px solid var(--primary)" : "1px solid var(--panel-border)", 
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.2s"
                }}
              >
                <div style={{ position: "absolute", top: "15px", left: "15px", zIndex: 10 }}>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: "1px solid var(--panel-border)",
                    background: selectedImage?._id === img._id ? "var(--primary)" : "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white"
                  }}>
                    {selectedImage?._id === img._id && <Check size={12} />}
                  </div>
                </div>
                <img 
                  src={`http://localhost:4000/${img.filePath}`} 
                  alt={img.altText || img.fileName} 
                  style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "8px" }} 
                />
                <p style={{ marginTop: "8px", fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)", fontWeight: 600 }}>
                  {img.fileName}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  ID: {img._id.substring(img._id.length - 6)}
                </p>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            <button 
              disabled={page <= 1} 
              onClick={() => fetchImages(page - 1)}
              className="btn-secondary"
              style={{ padding: "0.3rem 0.8rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              <ChevronLeft size={14} />
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button 
              disabled={page >= totalPages} 
              onClick={() => fetchImages(page + 1)}
              className="btn-secondary"
              style={{ padding: "0.3rem 0.8rem", borderRadius: "6px", display: "flex", alignItems: "center", gap: "0.25rem" }}
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Actions moved to the top header for better accessibility */}

      </div>
    </div>
  );
};
