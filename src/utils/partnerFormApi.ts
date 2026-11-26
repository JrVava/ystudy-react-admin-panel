import api from "./api";
import { encrypt, decrypt } from "./crypto";

export type PartnerFormStatus = "Under process" | "completed" | "reviwed" | "reviewed" | "pending" | "failed";

export type PartnerFormModule =
  "becomeAnAdviser" | "influencers" | "affiliatePartners" | "business" | "referAFriend" | string;

export interface PartnerFormModuleOption {
  label: string;
  value: string;
}

export interface PartnerFormItem {
  _id: string;
  module?: PartnerFormModule;
  fullName?: string;
  email?: string;
  phone?: string;
  bestDescription?: string;
  audienceEnquiry?: string;
  status: PartnerFormStatus;
  isNotificationSend?: boolean;
  isNotificationSendToAdmin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedPartnerFormResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  selectedModule?: string;
  data: PartnerFormItem[];
}

export const partnerFormApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string,
    module?: string
  ): Promise<PaginatedPartnerFormResponse> => {
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
    if (module && module.trim()) {
      params.module = module.trim();
    }

    const { data } = await api.get("/partner-form/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getStatuses: async (): Promise<string[]> => {
    try {
      const { data } = await api.get("/partner-form/statuses");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch partner form statuses, using fallback list", err);
    }
    return ["Under process", "completed", "reviwed", "pending", "failed"];
  },

  getModules: async (): Promise<PartnerFormModuleOption[]> => {
    try {
      const { data } = await api.get("/partner-form/modules");
      const decrypted = data && data.data ? decrypt(data.data) : data;
      if (decrypted && decrypted.data && Array.isArray(decrypted.data)) {
        return decrypted.data;
      }
    } catch (err) {
      console.warn("Failed to fetch partner form modules, using fallback list", err);
    }
    return [
      { label: "Become An Adviser", value: "becomeAnAdviser" },
      { label: "Influencers", value: "influencers" },
      { label: "Affiliate Partners", value: "affiliatePartners" },
      { label: "Business", value: "business" },
      { label: "Refer A friend", value: "referAFriend" }
    ];
  },

  updateStatus: async (
    id: string,
    status: PartnerFormStatus | string
  ): Promise<{ success: boolean; message: string; status: PartnerFormStatus }> => {
    const payload = { data: encrypt({ status }) };
    const { data } = await api.post(`/partner-form/update-status/${id}`, payload);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
