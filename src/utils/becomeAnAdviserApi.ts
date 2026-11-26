import api from "./api";
import { encrypt, decrypt } from "./crypto";

export type BecomeAnAdviserStatus = "Under process" | "completed" | "reviwed" | "reviewed" | "pending" | "failed";

export interface BecomeAnAdviserItem {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  bestDescription?: string;
  audienceEnquiry?: string;
  status: BecomeAnAdviserStatus;
  isNotificationSend?: boolean;
  isNotificationSendToAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedBecomeAnAdviserResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: BecomeAnAdviserItem[];
}

export const becomeAnAdviserApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string
  ): Promise<PaginatedBecomeAnAdviserResponse> => {
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

    const { data } = await api.get("/become-an-adviser/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getStatuses: async (): Promise<string[]> => {
    try {
      const { data } = await api.get("/become-an-adviser/statuses");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch become an adviser statuses, using fallback list", err);
    }
    return ["Under process", "completed", "reviwed", "pending", "failed"];
  },

  updateStatus: async (
    id: string,
    status: BecomeAnAdviserStatus | string
  ): Promise<{ success: boolean; message: string; status: BecomeAnAdviserStatus }> => {
    const payload = { data: encrypt({ status }) };
    const { data } = await api.post(`/become-an-adviser/update-status/${id}`, payload);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
