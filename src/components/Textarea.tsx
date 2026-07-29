import React from 'react';

interface TextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  minHeight?: string;
  required?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  placeholder,
  minHeight = "100px",
  required = false
}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <textarea
      className="form-textarea"
      placeholder={placeholder}
      value={value || ''}
      onChange={onChange}
      style={{ minHeight }}
      required={required}
    />
  </div>
);

export default Textarea;
