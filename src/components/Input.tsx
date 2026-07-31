import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  className = "",
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
        className={`form-input ${className}`}
        type={type}
        placeholder={placeholder}
        value={value === undefined || value === null ? "" : value}
        onChange={onChange}
        required={required}
        {...rest}
      />
    </div>
  );
};

export default Input;
