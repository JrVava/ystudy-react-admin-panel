import React from "react";

interface CmsStatusToggleProps {
  id: string;
  path: string;
  formData: any;
  handleCmsTextChange: (path: string, key: string, value: any) => void;
}

export const CmsStatusToggle: React.FC<CmsStatusToggleProps> = ({ id, path, formData, handleCmsTextChange }) => {
  const section = path.split(".").reduce((acc: any, part) => acc?.[part], formData.courseCms);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <input
        type="checkbox"
        id={id}
        checked={section?.status !== false}
        onChange={(e) => handleCmsTextChange(path, "status", e.target.checked)}
        style={{ width: "16px", height: "16px" }}
      />
      <label htmlFor={id} className="form-label" style={{ margin: 0 }}>
        Visible
      </label>
    </div>
  );
};
