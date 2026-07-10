import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const lookupApi = (type: string) => {
  const prefix = `/${type}`;
  return {
    getPaginated: async (page: number = 1, limit: number = 50) => {
      const { data } = await api.get(`${prefix}/pagination`, {
        params: { page, limit }
      });
      const decrypted = decrypt(data.data);
      return decrypted;
    },
    getById: async (id: string) => {
      const { data } = await api.get(`${prefix}/edit/${id}`);
      const decrypted = decrypt(data.data);
      return decrypted.data;
    },
    create: async (payload: any) => {
      const { data } = await api.post(`${prefix}/add`, { data: encrypt(payload) });
      const decrypted = decrypt(data.data);
      return decrypted;
    },
    update: async (id: string, payload: any) => {
      const { data } = await api.post(`${prefix}/update/${id}`, { data: encrypt(payload) });
      const decrypted = decrypt(data.data);
      return decrypted;
    },
    delete: async (id: string) => {
      const { data } = await api.delete(`${prefix}/delete/${id}`);
      const decrypted = decrypt(data.data);
      return decrypted;
    }
  };
};
