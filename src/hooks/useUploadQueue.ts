import { useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";
import { CHUNK_SIZE, saveQueueToStorage, loadQueueFromStorage } from "../utils/queueUtils";
import type { UploadItem } from "../utils/queueUtils";

export const useUploadQueue = () => {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const activeUploads = useRef<Record<string, boolean>>({});
  const pollTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  // Load from local storage on mount
  useEffect(() => {
    const loaded = loadQueueFromStorage();
    // Reset transient states
    const resetQueue = loaded.map((item) => {
      if (item.status === "uploading") {
        return { ...item, status: "paused" as const }; // require manual resume if page refreshed
      }
      return item;
    });
    setQueue(resetQueue);

    return () => {
      // Clear all active timeouts on unmount
      Object.values(pollTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // Save to local storage on queue change (debounced to avoid heavy storage writes during progress updates)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveQueueToStorage(queue);
    }, 1000);
    return () => clearTimeout(timer);
  }, [queue]);

  const updateItem = useCallback((id: string, updates: Partial<UploadItem>) => {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, []);

  const uploadChunks = async (item: UploadItem, backendUploadId: string) => {
    if (!item.file) return;

    let uploadedBytes = item.uploadedBytes;
    const startTime = Date.now();
    const initialUploadedBytes = uploadedBytes;

    try {
      while (uploadedBytes < item.totalSize) {
        if (!activeUploads.current[item.id]) {
          break; // paused or cancelled
        }

        const endByte = Math.min(uploadedBytes + CHUNK_SIZE, item.totalSize);
        const chunk = item.file.slice(uploadedBytes, endByte);
        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", String(Math.floor(uploadedBytes / CHUNK_SIZE)));

        let currentUploadedBytes = uploadedBytes;

        const progressInterval = setInterval(() => {
          const elapsed = Math.max((Date.now() - startTime) / 1000, 0.001);
          const speed = Math.max((currentUploadedBytes - initialUploadedBytes) / elapsed, 0);
          const remainingBytes = Math.max(item.totalSize - currentUploadedBytes, 0);
          const eta = speed > 0 ? remainingBytes / speed : Infinity;

          updateItem(item.id, {
            speed,
            eta,
            uploadedBytes: currentUploadedBytes
          });
        }, 500);

        await api.post(`/upload/chunk/${backendUploadId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const chunkUploaded = progressEvent.loaded;
            currentUploadedBytes = Math.min(uploadedBytes + chunkUploaded, item.totalSize);
          }
        });

        clearInterval(progressInterval);
        uploadedBytes = endByte;

        // Final update for this chunk
        const elapsed = Math.max((Date.now() - startTime) / 1000, 0.001);
        const speed = Math.max((uploadedBytes - initialUploadedBytes) / elapsed, 0);
        const remainingBytes = Math.max(item.totalSize - uploadedBytes, 0);
        const eta = speed > 0 ? remainingBytes / speed : Infinity;
        updateItem(item.id, { uploadedBytes, speed, eta });
      }

      if (uploadedBytes >= item.totalSize && activeUploads.current[item.id]) {
        // Complete upload
        const { data } = await api.post(`/upload/complete/${backendUploadId}`);
        updateItem(item.id, { status: "processing", jobId: data.jobId });
        startPollingStatus(item.id, backendUploadId);
      }
    } catch (error: any) {
      if (!navigator.onLine || error.message === "Network Error") {
        updateItem(item.id, { status: "failed_network" });
      } else {
        updateItem(item.id, { status: "error", error: error.message });
      }
      activeUploads.current[item.id] = false;
    }
  };

  const startPollingStatus = useCallback(
    (itemId: string, backendUploadId: string) => {
      const poll = async () => {
        if (!activeUploads.current[itemId]) return; // Stop polling if paused/cancelled

        try {
          const { data } = await api.get(`/upload/status/${backendUploadId}`);
          if (!activeUploads.current[itemId]) return; // Check again after await

          if (data.status === "completed") {
            updateItem(itemId, { status: "completed", eta: 0, speed: 0 });
            const timer = setTimeout(() => {
              setQueue((prev) => prev.filter((item) => item.id !== itemId));
              delete pollTimeouts.current[itemId];
            }, 1000);
            pollTimeouts.current[itemId] = timer;
          } else {
            const timer = setTimeout(poll, 2000);
            pollTimeouts.current[itemId] = timer;
          }
        } catch {
          delete pollTimeouts.current[itemId];
        }
      };
      poll();
    },
    [updateItem]
  );

  async function startUpload(item: UploadItem) {
    activeUploads.current[item.id] = true;
    updateItem(item.id, { status: "uploading" });

    try {
      let backendUploadId = item.backendUploadId;
      if (!backendUploadId) {
        const { data } = await api.post("/upload/init", {
          fileName: item.fileName,
          totalSize: item.totalSize,
          folderName: item.folderName
        });
        backendUploadId = data.uploadId;
        updateItem(item.id, { backendUploadId });
      }
      uploadChunks(item, backendUploadId!);
    } catch (error: any) {
      updateItem(item.id, { status: "error", error: error.message });
      activeUploads.current[item.id] = false;
    }
  }

  const addFiles = useCallback((files: File[], folderName?: string) => {
    const newItems: UploadItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      fileName: file.name,
      totalSize: file.size,
      uploadedBytes: 0,
      status: "pending",
      folderName
    }));
    setQueue((prev) => [...prev, ...newItems]);

    // Auto-start uploads
    newItems.forEach((item) => startUpload(item));
  }, []);

  const pauseUpload = async (id: string) => {
    activeUploads.current[id] = false;
    if (pollTimeouts.current[id]) {
      clearTimeout(pollTimeouts.current[id]);
      delete pollTimeouts.current[id];
    }
    updateItem(id, { status: "paused", speed: 0, eta: undefined });
    const item = queue.find((q) => q.id === id);
    if (item && item.backendUploadId) {
      await api.post(`/upload/pause/${item.backendUploadId}`).catch(() => {});
    }
  };

  const resumeUpload = async (id: string) => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;

    if (!item.file) {
      updateItem(id, { status: "error", error: "Please select the file again to resume" });
      return;
    }

    activeUploads.current[id] = true;
    updateItem(id, { status: "uploading" });

    if (item.backendUploadId) {
      await api.post(`/upload/resume/${item.backendUploadId}`).catch(() => {});
      uploadChunks(item, item.backendUploadId);
    }
  };

  const cancelUpload = async (id: string) => {
    activeUploads.current[id] = false;
    if (pollTimeouts.current[id]) {
      clearTimeout(pollTimeouts.current[id]);
      delete pollTimeouts.current[id];
    }
    const item = queue.find((q) => q.id === id);
    setQueue((prev) => prev.filter((item) => item.id !== id));

    if (item && item.backendUploadId) {
      await api.post(`/upload/cancel/${item.backendUploadId}`).catch(() => {});
    }
  };

  const attachFile = (id: string, file: File) => {
    updateItem(id, { file, error: undefined });
  };

  return {
    queue,
    addFiles,
    pauseUpload,
    resumeUpload,
    cancelUpload,
    attachFile
  };
};
