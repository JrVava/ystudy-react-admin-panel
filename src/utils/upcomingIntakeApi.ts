import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const upcomingIntakeApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/upcoming-intakes/pagination", {
      params: { page, limit, field, sort, search }
    });
    return decrypt(data.data);
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/upcoming-intakes/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/upcoming-intakes/add", { data: encrypt(payload) });
    return decrypt(data.data);
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/upcoming-intakes/update/${id}`, { data: encrypt(payload) });
    return decrypt(data.data);
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/upcoming-intakes/delete/${id}`);
    return decrypt(data.data);
  }
};
