import api from "./api";
import { decrypt } from "./crypto";

export const recycleBinApi = {
  list: async (collectionName: string, page: number = 1, limit: number = 10) => {
    const { data } = await api.get("/recycle-bin/list", {
      params: { collection: collectionName, page, limit }
    });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  restore: async (id: string, collectionName: string) => {
    const { data } = await api.post(`/recycle-bin/restore/${id}`, null, {
      params: { collection: collectionName }
    });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  delete: async (id: string, collectionName: string) => {
    const { data } = await api.delete(`/recycle-bin/delete/${id}`, {
      params: { collection: collectionName }
    });
    const decrypted = decrypt(data.data);
    return decrypted;
  }
};
