import api from "./api";
import { encrypt, decrypt } from "./crypto";

export type AdviserCallStatus = "Under process" | "completed" | "reviwed" | "reviewed" | "pending" | "failed";

export interface AdviserCallItem {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  contactMethod?: string;
  topic?: string;
  preferredDay?: string;
  preferredTimeSlot?: string;
  discuss?: string;
  is_agree?: boolean;
  status: AdviserCallStatus;
  isNotificationSend?: boolean;
  isNotificationSendToAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedAdviserCallResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: AdviserCallItem[];
}

export const adviserCallApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string
  ): Promise<PaginatedAdviserCallResponse> => {
    const params: Record<string, any> = {
      page,
      limit,
      field,
      sort
    };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (status && status.trim() && status !== "ALL") {
      params.status = status.trim();
    }

    const { data } = await api.get("/adviser-call/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getStatuses: async (): Promise<string[]> => {
    try {
      const { data } = await api.get("/adviser-call/statuses");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch adviser call statuses, using fallback list", err);
    }
    return ["Under process", "completed", "reviwed", "pending", "failed"];
  },

  updateStatus: async (
    id: string,
    status: AdviserCallStatus | string
  ): Promise<{ success: boolean; message: string; status: AdviserCallStatus }> => {
    const payload = { data: encrypt({ status }) };
    const { data } = await api.post(`/adviser-call/update-status/${id}`, payload);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
