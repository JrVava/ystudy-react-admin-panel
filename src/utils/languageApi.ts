import api from "./api";
import { encrypt, decrypt } from "./crypto";

export interface LanguageItem {
  _id: string;
  name: string;
  code: string;
  nativeName?: string;
  direction?: "ltr" | "rtl";
  isDefault?: boolean;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LanguageInput {
  name: string;
  code: string;
  nativeName?: string;
  direction?: "ltr" | "rtl";
  isDefault?: boolean;
  status?: boolean;
}

export interface PaginatedLanguageResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: LanguageItem[];
}

export const languageApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = "",
    status?: string
  ): Promise<PaginatedLanguageResponse> => {
    const params: Record<string, any> = {
      page,
      limit,
      field,
      sort
    };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    if (status !== undefined && status !== "" && status !== "ALL") {
      params.status = status;
    }

    const { data } = await api.get("/languages/pagination", { params });
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getAll: async (): Promise<LanguageItem[]> => {
    const { data } = await api.get("/languages/list");
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted?.data || [];
  },

  getById: async (id: string): Promise<LanguageItem> => {
    const { data } = await api.get(`/languages/edit/${id}`);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted?.data;
  },

  add: async (payload: LanguageInput): Promise<{ success: boolean; message: string; languageId: string }> => {
    const body = { data: encrypt(payload) };
    const { data } = await api.post("/languages/add", body);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  update: async (id: string, payload: Partial<LanguageInput>): Promise<{ success: boolean; message: string }> => {
    const body = { data: encrypt(payload) };
    const { data } = await api.post(`/languages/update/${id}`, body);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  updateStatus: async (
    id: string,
    status?: boolean
  ): Promise<{ success: boolean; message: string; status: boolean }> => {
    const body = status !== undefined ? { data: encrypt({ status }) } : undefined;
    const { data } = await api.post(`/languages/update-status/${id}`, body);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete(`/languages/delete/${id}`);
    const decrypted = data && data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
