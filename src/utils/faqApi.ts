import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const faqApi = {
  getPaginated: async (page: number = 1, limit: number = 100) => {
    const { data } = await api.get(`/faqs/pagination?page=${page}&limit=${limit}`);
    return data; // Returns unencrypted JSON: { success: true, data: [...] }
  },
  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/faqs/edit/${slug}`);
    let result = data.data ? decrypt(data.data) : data;
    return result; // Returns decrypted JSON: { success: true, data: { slug, faqs: [...] } }
  },
  create: async (payload: { slug: string; status?: boolean; faqs: { question: string; answer: string }[] }) => {
    const { data } = await api.post("/faqs", { data: encrypt(payload) });
    let result = data.data ? decrypt(data.data) : data;
    return result;
  },
  update: async (slug: string, payload: { status?: boolean; faqs: { question: string; answer: string }[] }) => {
    const { data } = await api.post(`/faqs/update/${slug}`, { data: encrypt(payload) });
    let result = data.data ? decrypt(data.data) : data;
    return result;
  },
  delete: async (slug: string) => {
    const { data } = await api.post(`/faqs/delete/${slug}`);
    let result = data.data ? decrypt(data.data) : data;
    return result;
  }
};
