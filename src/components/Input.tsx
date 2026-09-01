import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
  error,
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
      <input
        className={`form-input ${className} ${error ? "border-red-500" : ""}`}
        type={type}
        placeholder={placeholder}
        value={value === undefined || value === null ? "" : value}
        onChange={onChange}
        required={required}
        {...rest}
      />
      {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
    </div>
  );
};

export default Input;
