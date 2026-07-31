import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const studentStoryApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/student-stories/pagination", {
      params: { page, limit, field, sort, search }
    });
    return decrypt(data.data);
  },
  getList: async () => {
    const { data } = await api.get("/student-stories/list");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/student-stories/edit/${id}`);
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  create: async (payload: any) => {
    const { data } = await api.post("/student-stories/add", { data: encrypt(payload) });
    return decrypt(data.data);
  },
  update: async (id: string, payload: any) => {
    const { data } = await api.post(`/student-stories/update/${id}`, { data: encrypt(payload) });
    return decrypt(data.data);
  },
  delete: async (id: string) => {
    const { data } = await api.delete(`/student-stories/delete/${id}`);
    return decrypt(data.data);
  }
};
