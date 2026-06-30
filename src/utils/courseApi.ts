import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const courseApi = {
  getPaginated: async (page: number = 1, limit: number = 10) => {
    const { data } = await api.get("/courses/pagination", {
      params: { page, limit }
    });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  getList: async () => {
    const { data } = await api.get("/courses/list");
    const decrypted = decrypt(data.data);
    return decrypted.data; // Array of { _id, title, slug }
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/courses/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/courses/add", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/courses/update/${id}`, { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  }
};
