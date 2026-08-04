import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown } from "lucide-react";

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = "Select option...",
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      (opt.label || "").toLowerCase().includes(search.toLowerCase()) ||
      (opt.value || "").toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);
  const hasAsterisk = label.trim().endsWith("*");
  const cleanLabel = hasAsterisk ? label.trim().slice(0, -1).trim() : label;

  return (
    <div className="form-group" style={{ position: "relative" }} ref={dropdownRef}>
      <label className="form-label">
        {cleanLabel}
        {(required || hasAsterisk) && <span className="text-red-500 font-bold ml-1">*</span>}
      </label>

      {/* Hidden input to hold value for native HTML form validation */}
      <input
        type="text"
        value={value || ""}
        onChange={() => {}}
        required={required}
        style={{
          position: "absolute",
          width: "100%",
          height: "1px",
          bottom: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none"
        }}
      />

      <div
        className="form-input"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          background: "rgba(255, 255, 255, 0.02)",
          border: isOpen ? "1px solid var(--primary)" : "1px solid var(--panel-border)",
          minHeight: "42px",
          padding: "8px 12px",
          borderRadius: "10px",
          color: value ? "var(--text-primary)" : "var(--text-muted)",
          transition: "all 0.2s"
        }}
        onMouseEnter={(e) => {
          if (!isOpen && !disabled) e.currentTarget.style.borderColor = "var(--primary)";
        }}
        onMouseLeave={(e) => {
          if (!isOpen && !disabled) e.currentTarget.style.borderColor = "var(--panel-border)";
        }}
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          size={16}
          style={{
            transform: isOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            color: "var(--text-muted)"
          }}
        />
      </div>

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
            padding: "6px"
          }}
        >
          <div style={{ position: "relative", marginBottom: "6px" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)"
              }}
            />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{
                height: "34px",
                fontSize: "0.8rem",
                paddingLeft: "30px",
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--panel-border)"
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          </div>

          <div style={{ maxHeight: "180px", overflowY: "auto" }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: "10px", color: "var(--text-muted)", fontSize: "0.8rem", textAlign: "center" }}>
                No matches found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      color: isSelected ? "white" : "var(--text-secondary)",
                      background: isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      border: isSelected ? "1px solid rgba(99, 102, 241, 0.3)" : "1px solid transparent",
                      transition: "all 0.1s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isSelected
                        ? "rgba(99, 102, 241, 0.2)"
                        : "rgba(255, 255, 255, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isSelected ? "rgba(99, 102, 241, 0.15)" : "transparent";
                    }}
                  >
                    {opt.label}
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
export default SearchableSelect;
