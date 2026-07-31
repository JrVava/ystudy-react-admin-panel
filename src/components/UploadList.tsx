import type { UploadItem } from "../utils/queueUtils";
import { UploadItemCard } from "./UploadItemCard";

interface UploadListProps {
  queue: UploadItem[];
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  onAttachFile: (id: string, file: File) => void;
}

export const UploadList = ({ queue, onPause, onResume, onCancel, onAttachFile }: UploadListProps) => {
  if (queue.length === 0) return null;

  return (
    <div className="upload-list animate-fade-in" style={{ marginBottom: "2rem" }}>
      <h3
        style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "1rem",
          color: "var(--text-secondary)",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}
      >
        Active Upload Queue ({queue.filter((q) => q.status !== "completed").length} remaining)
      </h3>
      <div className="list-container" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
        {queue.map((item) => (
          <UploadItemCard
            key={item.id}
            item={item}
            onPause={onPause}
            onResume={onResume}
            onCancel={onCancel}
            onAttachFile={onAttachFile}
          />
        ))}
      </div>
    </div>
  );
};
