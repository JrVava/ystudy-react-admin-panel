import api from "./api";
import { encrypt, decrypt } from "./crypto";

export type DegreeMatchStatus = "Under process" | "completed" | "reviwed" | "reviewed" | "pending" | "failed";

export interface DegreeMatchItem {
  _id: string;
  residencyStatus?: string;
  highestQualification?: string;
  subjectsInterest?: string;
  study?: string;
  salaryLevel?: string;
  situation?: string;
  ageRange?: string;
  languageConfident?: string;
  HouseholdIncome?: string;
  career?: string;
  responsibilities?: string;
  firstName?: string;
  email?: string;
  phone?: string;
  bestTimeToCall?: string;
  status: DegreeMatchStatus;
  is_agree?: boolean;
  isNotificationSend?: boolean;
  isNotificationSendToAdmin?: boolean;
  is_notification_send?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedDegreeMatchResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: DegreeMatchItem[];
}

export const degreeMatchApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string
  ): Promise<PaginatedDegreeMatchResponse> => {
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

    const { data } = await api.get("/degree-match/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getStatuses: async (): Promise<string[]> => {
    try {
      const { data } = await api.get("/degree-match/statuses");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch degree match statuses, using default fallback list", err);
    }
    return ["Under process", "completed", "reviwed", "pending", "failed"];
  },

  updateStatus: async (
    id: string,
    status: DegreeMatchStatus | string
  ): Promise<{ success: boolean; message: string; status: DegreeMatchStatus }> => {
    const payload = { data: encrypt({ status }) };
    const { data } = await api.post(`/degree-match/update-status/${id}`, payload);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
