import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const guideApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/guide/pagination", {
      params: { page, limit, field, sort, search }
    });
    return decrypt(data.data);
  },
  getList: async () => {
    const { data } = await api.get("/guide/list");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/guide/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/guide/add", { data: encrypt(payload) });
    return decrypt(data.data);
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/guide/update/${id}`, { data: encrypt(payload) });
    return decrypt(data.data);
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/guide/delete/${id}`);
    return decrypt(data.data);
  }
};
