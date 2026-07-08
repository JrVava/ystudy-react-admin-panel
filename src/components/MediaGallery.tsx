import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../utils/api";
import { decrypt } from "../utils/crypto";
import { toast } from "../context/ToastContext";
import { useUploadQueue } from "../hooks/useUploadQueue";
import { UploadDropzone } from "./UploadDropzone";
import { UploadList } from "./UploadList";
import { 
  Folder, Edit2, Trash2, RefreshCw, Search, X, 
  ChevronLeft, ChevronRight, Check, AlertCircle, FileText, UploadCloud
} from "lucide-react";

export const MediaGallery: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [editingImage, setEditingImage] = useState<any>(null);
  const [editForm, setEditForm] = useState({ title: "", altText: "", caption: "", description: "" });
  const [isSavingSeo, setIsSavingSeo] = useState(false);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const { queue, addFiles, pauseUpload, resumeUpload, cancelUpload, attachFile } = useUploadQueue();

  // Folder inline renaming state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

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

  const handleDelete = async (mediaId: string) => {
    if (!window.confirm("Are you sure you want to delete this image?")) return;
    try {
      const { data } = await api.post(`/upload/delete/${mediaId}`);
      if (data.success) {
        setImages(prev => prev.filter(img => img._id !== mediaId));
      }
    } catch (e) {
      console.error("Failed to delete image", e);
      toast.error("Failed to delete image.");
    }
  };

  // Inline folder renaming confirmation
  const handleRenameFolderSubmit = async (folderId: string) => {
    if (!renameValue || renameValue.trim() === "") {
      setRenamingFolderId(null);
      return;
    }

    try {
      const response = await api.post(`/upload/folders/rename/${folderId}`, {
        newName: renameValue.trim()
      });
      const decrypted = decrypt(response.data.data);
      if (decrypted.success) {
        fetchFolders();
        fetchImages(1, folderId);
      } else {
        toast.error(decrypted.message || "Failed to rename folder");
      }
    } catch (e) {
      console.error("Failed to rename folder", e);
      toast.error("Failed to rename folder.");
    } finally {
      setRenamingFolderId(null);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!window.confirm("WARNING: This will permanently delete the folder AND all images inside it. Are you sure?")) return;

    try {
      const response = await api.post(`/upload/folders/delete/${folderId}`);
      const decrypted = decrypt(response.data.data);
      if (decrypted.success) {
        setActiveFolderId(null);
        fetchFolders();
        fetchImages(1, null);
      } else {
        toast.error(decrypted.message || "Failed to delete folder");
      }
    } catch (e) {
      console.error("Failed to delete folder", e);
      toast.error("Failed to delete folder.");
    }
  };

  const handleEditClick = async (img: any) => {
    setEditingImage(img);
    setEditForm({ 
      title: img.title || "", 
      altText: img.altText || "", 
      caption: img.caption || "", 
      description: img.description || "" 
    });

    try {
      const response = await api.get(`/upload/seo/${img._id}`);
      const decrypted = decrypt(response.data.data);
      if (decrypted.success && decrypted.data) {
        setEditForm({
          title: decrypted.data.title || "",
          altText: decrypted.data.altText || "",
          caption: decrypted.data.caption || "",
          description: decrypted.data.description || ""
        });
      }
    } catch (e) {
      console.error("Failed to fetch latest SEO metadata", e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;
    setIsSavingSeo(true);
    try {
      const response = await api.post(`/upload/update-seo/${editingImage._id}`, editForm);
      const decrypted = decrypt(response.data.data);
      if (decrypted.success) {
        setImages(prev => prev.map(img => img._id === editingImage._id ? { ...img, ...editForm } : img));
        setEditingImage(null);
      }
    } catch (e) {
      console.error("Failed to save SEO metadata", e);
      toast.error("Failed to save SEO metadata.");
    } finally {
      setIsSavingSeo(false);
    }
  };

  // Client-side filtering for search query
  const filteredImages = images.filter(img => {
    const query = searchQuery.toLowerCase();
    return (
      (img.fileName && img.fileName.toLowerCase().includes(query)) ||
      (img.altText && img.altText.toLowerCase().includes(query)) ||
      (img.title && img.title.toLowerCase().includes(query)) ||
      (img.caption && img.caption.toLowerCase().includes(query))
    );
  });

  return (
    <div style={{ width: "100%" }}>
      {/* Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Media Assets</h3>
        
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexGrow: 1, justifyContent: "flex-end", maxWidth: "600px" }}>
          {/* Search bar */}
          <div style={{ position: "relative", flexGrow: 1, maxWidth: "240px" }}>
            <Search size={16} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ width: "100%", paddingLeft: "32px", height: "38px", fontSize: "0.85rem" }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")} 
                style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button 
            onClick={() => { fetchFolders(); fetchImages(1, activeFolderId); }} 
            className="btn-secondary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 0.85rem", height: "38px", fontSize: "0.85rem" }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button 
            onClick={() => setIsUploadModalOpen(true)} 
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1.15rem", height: "38px", fontSize: "0.85rem" }}
          >
            <UploadCloud size={14} />
            Upload Media
          </button>
        </div>
      </div>

      {/* Folders Tab interface */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
        <button 
          onClick={() => handleTabClick(null)}
          className={activeFolderId === null ? "btn-primary" : "btn-secondary"}
          style={{ whiteSpace: "nowrap", padding: "0.5rem 1rem", borderRadius: "10px" }}
        >
          All Assets
        </button>
        {folders
          .filter((folder) => folder.name !== "uploads")
          .map((folder) => {
            const isEditing = renamingFolderId === folder._id;
            
            return (
              <div 
                key={folder._id} 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  background: activeFolderId === folder._id ? "rgba(99, 102, 241, 0.15)" : "rgba(255, 255, 255, 0.02)", 
                  border: `1px solid ${activeFolderId === folder._id ? "var(--primary)" : "var(--panel-border)"}`, 
                  borderRadius: "10px", 
                  overflow: "hidden",
                  padding: "2px"
                }}
              >
                {isEditing ? (
                  /* Inline Renaming Input Form */
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 6px" }}>
                    <input 
                      type="text" 
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      className="form-input"
                      style={{ height: "30px", padding: "4px 8px", fontSize: "0.8rem", width: "110px", background: "rgba(0,0,0,0.5)" }}
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRenameFolderSubmit(folder._id);
                        if (e.key === 'Escape') setRenamingFolderId(null);
                      }}
                    />
                    <button 
                      onClick={() => handleRenameFolderSubmit(folder._id)}
                      style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--success)", border: "none", width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Save Name"
                    >
                      <Check size={12} />
                    </button>
                    <button 
                      onClick={() => setRenamingFolderId(null)}
                      style={{ background: "rgba(244, 63, 94, 0.15)", color: "var(--error)", border: "none", width: "26px", height: "26px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      title="Cancel"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  /* Regular Folder Tab */
                  <>
                    <button 
                      onClick={() => handleTabClick(folder._id)}
                      style={{ padding: "0.45rem 0.85rem", border: "none", cursor: "pointer", background: "transparent", color: "white", fontWeight: 500, display: "flex", alignItems: "center", gap: "0.4rem", whiteSpace: "nowrap" }}
                    >
                      <Folder size={14} style={{ color: activeFolderId === folder._id ? "var(--primary)" : "var(--text-secondary)" }} />
                      {folder.name}
                    </button>
                    {activeFolderId === folder._id && (
                      <div style={{ display: "flex", background: "rgba(0,0,0,0.2)", borderLeft: "1px solid rgba(255,255,255,0.05)" }}>
                        <button 
                          onClick={() => {
                            setRenamingFolderId(folder._id);
                            setRenameValue(folder.name);
                          }}
                          style={{ padding: "0.45rem 0.45rem", border: "none", cursor: "pointer", background: "transparent", color: "white" }}
                          title="Rename Folder Inline"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteFolder(folder._id)}
                          style={{ padding: "0.45rem 0.45rem", border: "none", cursor: "pointer", background: "transparent", color: "var(--error)" }}
                          title="Delete Folder"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
      </div>
      
      {/* Media Grid */}
      {filteredImages.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)", background: "rgba(255,255,255,0.01)", borderRadius: "16px", border: "2px dashed var(--panel-border)" }}>
          <AlertCircle size={32} style={{ margin: "0 auto 1rem", color: "var(--text-muted)" }} />
          <p style={{ fontWeight: 500 }}>No assets found in this category.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.25rem" }}>
          {filteredImages.map((img) => (
            <div 
              key={img._id} 
              className="animate-fade-in"
              style={{ 
                background: "rgba(255,255,255,0.02)", 
                padding: "10px", 
                borderRadius: "14px", 
                border: "1px solid var(--panel-border)", 
                position: "relative",
                transition: "all 0.25s ease"
              }}
            >
              {/* Media Card Hover Buttons */}
              <div style={{ position: "absolute", top: "15px", right: "15px", display: "flex", gap: "6px", zIndex: 10 }}>
                <button 
                  onClick={() => handleEditClick(img)}
                  style={{ 
                    background: "rgba(99, 102, 241, 0.9)", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "50%", 
                    width: "28px", 
                    height: "28px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}
                  title="Edit SEO"
                >
                  <Edit2 size={12} />
                </button>
                <button 
                  onClick={() => handleDelete(img._id)}
                  style={{ 
                    background: "rgba(244, 63, 94, 0.9)", 
                    color: "white", 
                    border: "none", 
                    borderRadius: "50%", 
                    width: "28px", 
                    height: "28px", 
                    cursor: "pointer", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center"
                  }}
                  title="Delete Image"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Image Preview */}
              <img 
                src={`http://localhost:4000/${img.filePath}`} 
                alt={img.altText || img.fileName} 
                title={img.title}
                style={{ width: "100%", height: "140px", objectFit: "cover", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.03)" }} 
              />

              {/* Filename and details */}
              <p style={{ marginTop: "10px", fontSize: "0.85rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-primary)", fontWeight: 600 }}>
                {img.fileName}
              </p>
              
              {img.altText && (
                <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--success)", background: "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                    SEO Set
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--panel-border)", paddingTop: "1.25rem" }}>
          <button 
            disabled={page <= 1} 
            onClick={() => fetchImages(page - 1)}
            className="btn-secondary"
            style={{ padding: "0.4rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 500 }}>
            Page {page} of {totalPages}
          </span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => fetchImages(page + 1)}
            className="btn-secondary"
            style={{ padding: "0.4rem 1rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Pop-up Uploader Modal */}
      {isUploadModalOpen && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(10, 14, 26, 0.8)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div className="panel-glass modal-solid-bg animate-fade-in" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <UploadCloud size={20} style={{ color: "var(--primary)" }} />
                Upload New Assets
              </h3>
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  fetchFolders();
                  fetchImages(1, activeFolderId);
                }} 
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <UploadDropzone 
              onFilesAdded={addFiles} 
              folders={folders} 
              initialFolderName={activeFolderId ? folders.find(f => f._id === activeFolderId)?.name || "" : ""} 
            />

            <UploadList
              queue={queue}
              onPause={pauseUpload}
              onResume={resumeUpload}
              onCancel={cancelUpload}
              onAttachFile={attachFile}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
              <button 
                onClick={() => {
                  setIsUploadModalOpen(false);
                  fetchFolders();
                  fetchImages(1, activeFolderId);
                }}
                className="btn-primary"
                style={{ padding: "0.5rem 1.25rem" }}
              >
                Done
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit SEO Modal (Solid background) */}
      {editingImage && createPortal(
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(10, 14, 26, 0.85)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px" }}>
          <div className="panel-glass modal-solid-bg animate-fade-in" style={{ width: "100%", maxWidth: "440px", maxHeight: "90vh", overflowY: "auto", padding: "2rem" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <FileText size={20} style={{ color: "var(--primary)" }} />
                Edit Asset SEO Metadata
              </h3>
              <button 
                onClick={() => setEditingImage(null)} 
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1.5rem" }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">SEO Title Tag</label>
                <input 
                  type="text" 
                  placeholder="Descriptive Title" 
                  value={editForm.title} 
                  onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Alt Text (Image Description)</label>
                <input 
                  type="text" 
                  placeholder="Alternative text for search engines" 
                  value={editForm.altText} 
                  onChange={e => setEditForm({ ...editForm, altText: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Caption</label>
                <input 
                  type="text" 
                  placeholder="A visible caption text" 
                  value={editForm.caption} 
                  onChange={e => setEditForm({ ...editForm, caption: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Long Description</label>
                <textarea 
                  placeholder="Detailed description of the asset" 
                  value={editForm.description} 
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="form-textarea"
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button 
                onClick={() => setEditingImage(null)} 
                className="btn-secondary"
                style={{ padding: "0.5rem 1rem" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="btn-primary"
                style={{ padding: "0.5rem 1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
                disabled={isSavingSeo}
              >
                {isSavingSeo ? "Saving..." : (
                  <>
                    <Check size={16} />
                    Save SEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MediaGallery;
