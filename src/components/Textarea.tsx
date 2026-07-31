import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  minHeight?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  minHeight = "100px",
  required = false,
  className = "",
  style,
  ...rest
}) => {
  const hasAsterisk = label.trim().endsWith("*");
  const cleanLabel = hasAsterisk ? label.trim().slice(0, -1).trim() : label;

  return (
    <div className="form-group">
      <label className="form-label">
        {cleanLabel}
        {(required || hasAsterisk) && <span className="text-red-500 font-bold ml-1">*</span>}
      </label>
      <textarea
        className={`form-textarea ${className}`}
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
        style={{ minHeight, ...style }}
        required={required}
        {...rest}
      />
    </div>
  );
};

export default Textarea;
