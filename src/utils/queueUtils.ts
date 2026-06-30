export interface UploadItem {
  id: string;
  file?: File;
  fileName: string;
  totalSize: number;
  uploadedBytes: number;
  status: "pending" | "uploading" | "paused" | "completed" | "processing" | "failed_network" | "error";
  error?: string;
  backendUploadId?: string;
  jobId?: string;
  eta?: number; // seconds
  speed?: number; // bytes per second
  folderName?: string;
}

export const CHUNK_SIZE = 1024 * 256; // 256KB chunks

// Helper to save to local storage (excluding File objects)
export const saveQueueToStorage = (items: UploadItem[]) => {
  const serialized = items.map((item) => ({ ...item, file: undefined }));
  localStorage.setItem("uploadQueue", JSON.stringify(serialized));
};

export const loadQueueFromStorage = (): UploadItem[] => {
  const stored = localStorage.getItem("uploadQueue");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};
