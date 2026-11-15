import api from "./api";
import { encrypt, decrypt } from "./crypto";

export interface StudyRoute {
  _id?: string;
  title: string;
  description: string;
  slug: string;
  link: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const studyRouteApi = {
  getPaginated: async (
    page: number = 1,
    limit: number = 10,
    field: string = "createdAt",
    sort: string = "desc",
    search: string = ""
  ) => {
    const { data } = await api.get("/study-routes/pagination", {
      params: { page, limit, field, sort, search }
    });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getList: async () => {
    const { data } = await api.get("/study-routes/list");
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/study-routes/edit/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted.data;
  },

  create: async (payload: { title: string; description: string; slug: string; link?: string; status?: boolean }) => {
    const { data } = await api.post("/study-routes/add", { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  update: async (
    id: string,
    payload: {
      title?: string;
      description?: string;
      slug?: string;
      link?: string;
      status?: boolean;
    }
  ) => {
    const { data } = await api.post(`/study-routes/update/${id}`, { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/study-routes/delete/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  toggleStatus: async (id: string) => {
    const { data } = await api.put(`/study-routes/toggle-status/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
