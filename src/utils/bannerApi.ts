import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const bannerApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/banners/pagination", {
      params: { page, limit, field, sort, search }
    });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/banners/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/banners", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/banners/update/${id}`, { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  }
};
