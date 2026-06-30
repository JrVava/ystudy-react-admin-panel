import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const cmsApi = {
  getAll: async () => {
    const { data } = await api.get("/cms-pages");
    let result;
    if (data && data.data) {
      result = decrypt(data.data);
    } else {
      result = data;
    }
    return result; // Contains { success, data: CMSPage[] }
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/cms-pages/page-data/${id}`);
    let result = data.data ? decrypt(data.data) : data;
    return result; // Contains { success, data: PagePayload }
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.put(`/cms-pages/update/${id}`, { data: encrypt(payload) });
    return data;
  }
};
