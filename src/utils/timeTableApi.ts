import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const timeTableApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/time-tables/pagination", {
      params: { page, limit, field, sort, search }
    });
    return data;
  },
  getList: async () => {
    const { data } = await api.get("/time-tables/listing");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/time-tables/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/time-tables/add", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/time-tables/update/${id}`, { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  delete: async (id: string) => {
    const { data } = await api.post(`/time-tables/delete/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted;
  }
};
