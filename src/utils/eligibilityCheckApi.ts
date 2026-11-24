import api from "./api";
import { encrypt, decrypt } from "./crypto";

export type EligibilityCheckerStatus = "Under process" | "completed" | "reviwed" | "reviewed" | "pending" | "failed";

export interface EligibilityCheckerItem {
  _id: string;
  residencyStatus?: string;
  studiedBefore?: string;
  study?: string;
  household?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  bestTimeToCall?: string;
  is_agree?: boolean;
  isNotificationSend?: boolean;
  isNotificationSendToAdmin?: boolean;
  status: EligibilityCheckerStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedEligibilityCheckerResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: EligibilityCheckerItem[];
}

export const eligibilityCheckApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string
  ): Promise<PaginatedEligibilityCheckerResponse> => {
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

    const { data } = await api.get("/eligibility-checker/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getStatuses: async (): Promise<string[]> => {
    try {
      const { data } = await api.get("/eligibility-checker/statuses");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch eligibility checker statuses, using fallback list", err);
    }
    return ["Under process", "completed", "reviwed", "pending", "failed"];
  },

  updateStatus: async (
    id: string,
    status: EligibilityCheckerStatus | string
  ): Promise<{ success: boolean; message: string; status: EligibilityCheckerStatus }> => {
    const payload = { data: encrypt({ status }) };
    const { data } = await api.post(`/eligibility-checker/update-status/${id}`, payload);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
