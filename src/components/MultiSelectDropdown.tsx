import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  label: string;
  description?: string;
  placeholder: string;
  options: any[];
  selectedIds: string[];
  onChange: (id: string) => void;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  description,
  placeholder,
  options,
  selectedIds,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const optionsList = Array.isArray(options) ? options : [];
  const selectedIdsList = Array.isArray(selectedIds) ? selectedIds : [];

  const filteredOptions = optionsList.filter(opt =>
    opt && typeof opt.title === 'string' && opt.title.toLowerCase().includes((search || "").toLowerCase())
  );

  const selectedOptions = optionsList.filter(opt => opt && opt._id && selectedIdsList.includes(opt._id));

  return (
    <div className="form-group" style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.5rem" }} ref={dropdownRef}>
      <div>
        <label className="form-label" style={{ margin: 0 }}>{label}</label>
        {description && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>{description}</p>}
      </div>

      {/* Select Box Trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          minHeight: "42px",
          padding: "6px 12px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--panel-border)",
          borderRadius: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          cursor: "pointer",
          position: "relative",
          paddingRight: "36px",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--primary)"}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.borderColor = "var(--panel-border)";
        }}
      >
        {selectedOptions.length === 0 ? (
          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{placeholder}</span>
        ) : (
          selectedOptions.map(opt => (
            <span
              key={opt._id}
              onClick={(e) => {
                e.stopPropagation();
                onChange(opt._id);
              }}
              style={{
                background: "rgba(99, 102, 241, 0.15)",
                border: "1px solid rgba(99, 102, 241, 0.3)",
                color: "var(--text-primary)",
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "0.75rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontWeight: 500
              }}
            >
              {opt.title}
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  color: "var(--text-muted)"
                }}
              >
                <X size={10} style={{ color: "var(--text-muted)" }} />
              </button>
            </span>
          ))
        )}

        <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none", display: "flex", alignItems: "center" }}>
          <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </div>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid var(--panel-border)",
            borderRadius: "10px",
            marginTop: "6px",
            zIndex: 1000,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)",
            overflow: "hidden"
          }}
        >
          {/* Search Input */}
          <div style={{ padding: "8px", borderBottom: "1px solid var(--panel-border)", position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ height: "34px", fontSize: "0.8rem", padding: "6px 10px 6px 30px" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options Scrolling Box */}
          <div style={{ maxHeight: "200px", overflowY: "auto", padding: "4px" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "12px", textAlign: "center", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                No courses found
              </div>
            ) : (
              filteredOptions.map(opt => {
                const isSelected = selectedIdsList.includes(opt._id);
                return (
                  <div
                    key={opt._id}
                    onClick={() => onChange(opt._id)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent",
                      color: "white",
                      transition: "background 0.15s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = isSelected ? "rgba(99, 102, 241, 0.08)" : "transparent"}
                  >
                    <span>{opt.title}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ accentColor: "var(--primary)", cursor: "pointer" }}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
