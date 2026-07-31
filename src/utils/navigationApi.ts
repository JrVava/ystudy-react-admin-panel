import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const navigationApi = {
  getAll: async () => {
    const { data } = await api.get("/navigations");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  getFlat: async () => {
    const { data } = await api.get("/navigations/flat");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/navigations", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/navigations/update/${id}`, { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/navigations/delete/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  reorder: async (items: { id: string; parentId: string | null; position: number }[]) => {
    const { data } = await api.put("/navigations/reorder", { data: encrypt({ items }) });
    const decrypted = decrypt(data.data);
    return decrypted.data;
  }
};
