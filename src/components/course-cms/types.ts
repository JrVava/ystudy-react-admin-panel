import React from "react";

export interface CmsSectionProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  handleCmsTextChange: (path: string, key: string, value: any) => void;
  handleAddCmsArrayItem: (path: string, arrayField: string, defaultObj: any) => void;
  handleRemoveCmsArrayItem: (path: string, arrayField: string, index: number) => void;
  handleCmsArrayItemChange: (path: string, arrayField: string, index: number, key: string, value: any) => void;
  handleAddStudyPoint?: (path: string, key: string) => void;
  handleRemoveStudyPoint?: (path: string, key: string, index: number) => void;
  handleStudyPointChange?: (path: string, key: string, index: number, value: string) => void;
  setCmsMediaPickerTarget: React.Dispatch<React.SetStateAction<any>>;
  allCoursesList?: any[];
}
