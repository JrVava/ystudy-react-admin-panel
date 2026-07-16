import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const locationApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/location/pagination", {
      params: { page, limit, field, sort, search }
    });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  getList: async () => {
    const { data } = await api.get("/location/list");
    const decrypted = decrypt(data.data);
    return decrypted.data; // Array of { _id, title, slug, status }
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/location/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/location/add", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/location/update/${id}`, { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/location/delete/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted;
  }
};
