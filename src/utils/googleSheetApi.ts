import api from "./api";
import { decrypt, encrypt } from "./crypto";

export const googleSheetApi = {
  getAll: async () => {
    const { data } = await api.get("/google-sheet-provider/get");
    const result = data.data ? decrypt(data.data) : data;
    return result;
  },
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get(`/google-sheet-provider/pagination`, {
      params: { page, limit, field, sort, search }
    });
    const result = data.data ? decrypt(data.data) : data;
    return result;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/google-sheet-provider/edit/${id}`);
    const result = data.data ? decrypt(data.data) : data;
    return result;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/google-sheet-provider/add", { data: encrypt(payload) });
    const result = data.data ? decrypt(data.data) : data;
    return result;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/google-sheet-provider/update/${id}`, { data: encrypt(payload) });
    const result = data.data ? decrypt(data.data) : data;
    return result;
  },
  delete: async (id: string) => {
    const { data } = await api.post(`/google-sheet-provider/delete/${id}`);
    const result = data.data ? decrypt(data.data) : data;
    return result;
  }
};
