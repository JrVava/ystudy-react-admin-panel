import api from "./api";
import { encrypt, decrypt } from "./crypto";

export interface FormSendEmailToUserItem {
  _id: string;
  formName: string;
  sendEmail: boolean;
  sendEmailToAdmin?: boolean;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedFormSendEmailResponse {
  success: boolean;
  total: number;
  page: number;
  totalPages: number;
  data: FormSendEmailToUserItem[];
}

export const formSendEmailApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ): Promise<PaginatedFormSendEmailResponse> => {
    const { data } = await api.get("/form-send-email-to-user/pagination", {
      params: { page, limit, field, sort, search: search.trim() || undefined }
    });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  updateStatus: async (
    id: string,
    status?: boolean
  ): Promise<{ success: boolean; message: string; status: boolean }> => {
    const payload = status !== undefined ? { data: encrypt({ status }) } : undefined;
    const { data } = await api.post(`/form-send-email-to-user/update-status/${id}`, payload);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  updateSendEmail: async (
    id: string,
    sendEmail?: boolean
  ): Promise<{ success: boolean; message: string; sendEmail: boolean }> => {
    const payload = sendEmail !== undefined ? { data: encrypt({ sendEmail }) } : undefined;
    const { data } = await api.post(`/form-send-email-to-user/update-send-email/${id}`, payload);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  updateSendEmailToAdmin: async (
    id: string,
    sendEmailToAdmin?: boolean
  ): Promise<{ success: boolean; message: string; sendEmail: boolean }> => {
    const payload = sendEmailToAdmin !== undefined ? { data: encrypt({ sendEmailToAdmin }) } : undefined;
    const { data } = await api.post(`/form-send-email-to-user/update-send-email-to-admin/${id}`, payload);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
