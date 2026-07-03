import React, { useState, useEffect } from "react";
import { navigationApi } from "../utils/navigationApi";
import { 
  Layers, Edit3, CheckCircle, AlertCircle, Save, X, GripVertical, Info,
  ChevronDown, ChevronRight, Search
} from "lucide-react";
import "./Navigation.css";

interface NavigationItem {
  _id: string;
  slug: string;
  pageName: string;
  componentName: string;
  parentId: string | null;
  position: number;
}

const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
};

export const NavigationAdminPanel: React.FC = () => {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Notification banner states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Item form configuration state
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [editForm, setEditForm] = useState({
    slug: "",
    pageName: "",
    componentName: ""
  });

  // Search query state
  const [searchQuery, setSearchQuery] = useState("");

  // Expanded parent node IDs state (nodes collapsed by default)
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([]);

  // Drag and drop states
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | "inside" | null>(null);

  useEffect(() => {
    fetchNavigations();
  }, []);

  const fetchNavigations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await navigationApi.getFlat();
      if (data) {
        setItems(data);
      } else {
        setError("Failed to fetch navigation items.");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while loading navigation.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: NavigationItem) => {
    setEditingItem(item);
    setEditForm({
      slug: item.slug || "",
      pageName: item.pageName || "",
      componentName: item.componentName || ""
    });
    setSaveErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSaving(true);
    setSaveErrorMsg(null);
    setSuccessMsg(null);

    try {
      // Keep original componentName since editing it is disabled
      const updated = await navigationApi.update(editingItem._id, {
        slug: editForm.slug,
        pageName: editForm.pageName,
        componentName: editingItem.componentName, // lock down
        parentId: editingItem.parentId
      });

      if (updated) {
        setSuccessMsg(`Successfully edited item "${editForm.pageName}".`);
        setEditingItem(null);
        fetchNavigations();
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setSaveErrorMsg("Failed to save changes. Please try again.");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      setSaveErrorMsg(err.response?.data?.message || err.message || "Error: Check backend configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleCollapseNode = (nodeId: string) => {
    const isCurrentlyExpanded = expandedNodeIds.includes(nodeId);
    if (isCurrentlyExpanded) {
      // Collapse this node: remove it and all its descendants from expandedNodeIds
      const getDescendantIds = (parentId: string): string[] => {
        const children = items.filter(n => n.parentId === parentId);
        return children.reduce((acc, child) => {
          return [...acc, child._id, ...getDescendantIds(child._id)];
        }, [] as string[]);
      };
      const descendants = getDescendantIds(nodeId);
      setExpandedNodeIds(prev => prev.filter(id => id !== nodeId && !descendants.includes(id)));
    } else {
      // Expand this node:
      const targetNode = items.find(n => n._id === nodeId);
      if (!targetNode) return;

      // 1. Find sibling nodes (same parentId)
      const siblingIds = items.filter(n => n.parentId === targetNode.parentId && n._id !== nodeId).map(n => n._id);
      
      // 2. Find all descendants of sibling nodes (to collapse siblings and their children)
      const getDescendantIds = (parentId: string): string[] => {
        const children = items.filter(n => n.parentId === parentId);
        return children.reduce((acc, child) => {
          return [...acc, child._id, ...getDescendantIds(child._id)];
        }, [] as string[]);
      };
      const siblingsAndDescendants = siblingIds.reduce((acc, sibId) => {
        return [...acc, sibId, ...getDescendantIds(sibId)];
      }, [] as string[]);

      setExpandedNodeIds(prev => {
        const filtered = prev.filter(id => !siblingsAndDescendants.includes(id));
        return [...filtered, nodeId];
      });
    }
  };

  // Drag-and-drop tree builder
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (targetId === draggedId) return;

    setDragOverId(targetId);

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    
    const beforeThreshold = rect.height * 0.3;
    const afterThreshold = rect.height * 0.7;

    if (relativeY < beforeThreshold) {
      setDropPosition("before");
    } else if (relativeY > afterThreshold) {
      setDropPosition("after");
    } else {
      setDropPosition("inside");
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
    setDropPosition(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !dropPosition) {
      cleanupDrag();
      return;
    }

    const draggedNode = items.find(n => n._id === draggedId);
    const targetNode = items.find(n => n._id === targetId);
    if (!draggedNode || !targetNode) {
      cleanupDrag();
      return;
    }

    // Guard: Prevent nesting a node inside its own descendants
    if (dropPosition === "inside") {
      let currentParentId = targetNode.parentId;
      while (currentParentId) {
        if (currentParentId === draggedId) {
          alert("Cannot move a parent node inside its own child.");
          cleanupDrag();
          return;
        }
        const parent = items.find(n => n._id === currentParentId);
        currentParentId = parent ? parent.parentId : null;
      }
    }

    let updatedItems = [...items];
    const nodeToMove = { ...draggedNode };

    updatedItems = updatedItems.filter(n => n._id !== draggedId);

    if (dropPosition === "inside") {
      nodeToMove.parentId = targetId;
      const maxPosition = updatedItems
        .filter(n => n.parentId === targetId)
        .reduce((max, n) => Math.max(max, n.position), 0);
      nodeToMove.position = maxPosition + 1;
      updatedItems.push(nodeToMove);

      // Make sure the parent node is expanded so we can see the dropped item
      setExpandedNodeIds(prev => {
        if (prev.includes(targetId)) return prev;
        const siblingIds = updatedItems.filter(n => n.parentId === targetNode.parentId && n._id !== targetId).map(n => n._id);
        const getDescendantIds = (parentId: string): string[] => {
          const children = updatedItems.filter(n => n.parentId === parentId);
          return children.reduce((acc, child) => {
            return [...acc, child._id, ...getDescendantIds(child._id)];
          }, [] as string[]);
        };
        const siblingsAndDescendants = siblingIds.reduce((acc, sibId) => {
          return [...acc, sibId, ...getDescendantIds(sibId)];
        }, [] as string[]);
        const filtered = prev.filter(id => !siblingsAndDescendants.includes(id));
        return [...filtered, targetId];
      });
    } else {
      nodeToMove.parentId = targetNode.parentId;
      const index = updatedItems.findIndex(n => n._id === targetId);
      
      if (dropPosition === "before") {
        updatedItems.splice(index, 0, nodeToMove);
      } else {
        updatedItems.splice(index + 1, 0, nodeToMove);
      }

      const siblings = updatedItems.filter(n => n.parentId === targetNode.parentId);
      siblings.forEach((sib, idx) => {
        sib.position = idx;
      });
    }

    setItems(updatedItems);
    cleanupDrag();

    try {
      const payload = updatedItems.map(item => ({
        id: item._id,
        parentId: item.parentId,
        position: item.position
      }));
      await navigationApi.reorder(payload);
      setSuccessMsg("Navigation structure updated and saved.");
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (e: any) {
      console.error("Reordering failed", e);
      setSaveErrorMsg("Failed to persist reordering to database. Refreshing original positions...");
      fetchNavigations();
    }
  };

  const cleanupDrag = () => {
    setDraggedId(null);
    setDragOverId(null);
    setDropPosition(null);
  };

  // Helper function: Check recursively if a node or its children match the search query
  const checkMatchesSearch = (nodeId: string, query: string): boolean => {
    if (!query) return false;
    const node = items.find(n => n._id === nodeId);
    if (!node) return false;

    const matchesThis = 
      (node.pageName && node.pageName.toLowerCase().includes(query.toLowerCase())) ||
      (node.slug && node.slug.toLowerCase().includes(query.toLowerCase()));
      
    if (matchesThis) return true;

    // Check children
    const childNodes = items.filter(n => n.parentId === nodeId);
    return childNodes.some(child => checkMatchesSearch(child._id, query));
  };

  // Build recursive tree map from flat array
  const buildTree = (nodes: NavigationItem[], parentId: string | null = null): React.ReactNode[] => {
    return nodes
      .filter(node => node.parentId === parentId)
      .sort((a, b) => a.position - b.position)
      .map(node => {
        const isDragged = draggedId === node._id;
        const isOver = dragOverId === node._id;
        const children = buildTree(nodes, node._id);
        const hasChildren = nodes.some(n => n.parentId === node._id);
        const isExpanded = expandedNodeIds.includes(node._id);
        const directChildrenCount = nodes.filter(n => n.parentId === node._id).length;

        // When search query is active, auto-expand node if a child matches
        const queryActive = searchQuery.trim() !== "";
        const childMatches = queryActive && checkMatchesSearch(node._id, searchQuery);
        
        // Render child nodes only if parent is expanded (or if a child matches, force it open)
        const showChildren = hasChildren && (isExpanded || childMatches);

        // Highlight this node if it directly matches search query
        const isSearchMatch = queryActive && (
          (node.pageName && node.pageName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (node.slug && node.slug.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        return (
          <div key={node._id} style={{ marginLeft: parentId ? "2rem" : "0", marginTop: "0.5rem" }}>
            
            {/* Visual drop indicator BEFORE node */}
            {isOver && dropPosition === "before" && <div className="tree-node-drag-line" />}

            <div 
              draggable
              onDragStart={e => handleDragStart(e, node._id)}
              onDragOver={e => handleDragOver(e, node._id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, node._id)}
              className={`navigation-row ${isDragged ? "dragging" : ""} ${isOver && dropPosition === "inside" ? "drop-inside" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.75rem 1.25rem",
                background: isSearchMatch 
                  ? "rgba(99, 102, 241, 0.18)" 
                  : isOver && dropPosition === "inside" 
                    ? "rgba(99, 102, 241, 0.15)" 
                    : "rgba(255, 255, 255, 0.02)",
                border: `1px solid ${isSearchMatch 
                  ? "rgba(99, 102, 241, 0.5)" 
                  : isOver && dropPosition === "inside" 
                    ? "var(--primary)" 
                    : "var(--panel-border)"}`,
                boxShadow: isSearchMatch ? "0 0 10px rgba(99, 102, 241, 0.25)" : "none",
                borderRadius: "12px",
                cursor: "grab",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {/* Drag Handle */}
                <div style={{ color: "var(--text-muted)", cursor: "grab", display: "flex", alignItems: "center" }} title="Drag to reorder">
                  <GripVertical size={16} />
                </div>
                
                {/* Accordion Expansion Trigger (Only for parents) */}
                {hasChildren ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapseNode(node._id);
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.03)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      color: "white",
                      cursor: "pointer",
                      width: "24px",
                      height: "24px",
                      borderRadius: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 0
                    }}
                  >
                    {showChildren ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                ) : (
                  <div style={{ width: "24px" }} />
                )}

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    {node.pageName}
                    {hasChildren && (
                      <span 
                        style={{ 
                          fontSize: "0.7rem", 
                          background: "rgba(99, 102, 241, 0.15)", 
                          color: "var(--primary)", 
                          padding: "2px 8px", 
                          borderRadius: "99px",
                          fontWeight: 800,
                          border: "1px solid rgba(99, 102, 241, 0.25)"
                        }}
                      >
                        {directChildrenCount} {directChildrenCount === 1 ? "item" : "items"}
                      </span>
                    )}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/{node.slug} &bull; {node.componentName}</span>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => handleEditClick(node)}
                  className="btn-secondary"
                  style={{ padding: "4px 10px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.25rem", borderRadius: "8px" }}
                >
                  <Edit3 size={12} />
                  Edit
                </button>
              </div>
            </div>

            {/* Visual drop indicator AFTER node (only if it has no children, or children are collapsed) */}
            {isOver && dropPosition === "after" && !showChildren && <div className="tree-node-drag-line" />}

            {/* Children elements */}
            {hasChildren && showChildren && (
              <div style={{ borderLeft: "1px dashed rgba(255,255,255,0.06)", paddingLeft: "0.25rem" }}>
                {children}
              </div>
            )}
            
            {/* Visual drop indicator AFTER node with children */}
            {isOver && dropPosition === "after" && showChildren && <div className="tree-node-drag-line" />}
          </div>
        );
      });
  };

  if (loading && items.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem", color: "var(--text-secondary)" }}>
        <span>Loading navigation structure...</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ width: "100%" }}>
      {/* Page Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={28} style={{ color: "var(--primary)" }} />
            Navigation Hierarchy
          </h1>
          <p className="page-subtitle">Drag handles to re-order nodes. Parent rows can collapse nested routes.</p>
        </div>

        {/* Quick Search inside Navigation */}
        <div style={{ position: "relative", minWidth: "240px" }}>
          <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input 
            type="text" 
            placeholder="Search pages or slugs..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ width: "100%", paddingLeft: "34px", paddingRight: "30px", height: "40px", fontSize: "0.85rem" }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")} 
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Global Notifications */}
      {successMsg && (
        <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.25)", color: "var(--success)", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.25)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span><strong>Save Error:</strong> {saveErrorMsg}</span>
        </div>
      )}

      {error && (
        <div style={{ background: "rgba(244, 63, 94, 0.12)", border: "1px solid rgba(244, 63, 94, 0.25)", color: "#f43f5e", padding: "1rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Dual Panel Layout: Tree vs Editor Form */}
      <div style={{ display: "grid", gridTemplateColumns: editingItem ? "1.2fr 1fr" : "1fr", gap: "1.5rem" }}>
        
        {/* Navigation Tree Display */}
        <div className="panel-glass">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', color: 'var(--info)', padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 500, marginBottom: '1.5rem' }}>
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>Click chevrons next to parent items to collapse or expand. Matching items highlight in search query active.</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {buildTree(items)}
            {items.length === 0 && (
              <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>No pages set up.</div>
            )}
          </div>
        </div>

        {/* Modal-style Editor Column */}
        {editingItem && (
          <div className="panel-glass animate-fade-in" style={{ height: "fit-content" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 700 }}>
                Edit Item: <span style={{ color: "var(--accent)" }}>{editingItem.pageName}</span>
              </h3>
              <button 
                onClick={() => setEditingItem(null)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="form-group">
                <label className="form-label">Page Display Name</label>
                <input 
                  type="text" 
                  value={editForm.pageName} 
                  onChange={e => {
                    const val = e.target.value;
                    setEditForm(prev => ({
                      ...prev,
                      pageName: val,
                      slug: slugify(val)
                    }));
                  }} 
                  className="form-input" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL Slug</label>
                <input 
                  type="text" 
                  value={editForm.slug} 
                  onChange={e => setEditForm({ ...editForm, slug: e.target.value })} 
                  className="form-input" 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: "2rem" }}>
                <label className="form-label">React Component File Name</label>
                <input 
                  type="text" 
                  value={editForm.componentName} 
                  className="form-input" 
                  disabled={true}
                  style={{ opacity: 0.6, cursor: "not-allowed", background: "rgba(0,0,0,0.4)" }}
                />
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                  React bindings can only be changed by repository developers.
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="btn-secondary"
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isSaving}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                >
                  <Save size={16} />
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavigationAdminPanel;
