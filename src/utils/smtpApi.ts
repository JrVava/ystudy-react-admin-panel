import api from "./api";
import { decrypt, encrypt } from "./crypto";

export const smtpApi = {
  getSmtp: async () => {
    const { data } = await api.get("/smtp/get");
    const decrypted = decrypt(data.data);
    console.log("decrypted", decrypted);
    return decrypted;
  },
  createSMTP: async (payload: any) => {
    const { data } = await api.post("/smtp/add", { data: encrypt(payload) });
    const decrypted = decrypt(data.data);
    return decrypted;
  },
  getById: async (id: string) => {
    const { data } = await api.get(`/smtp/smtp-edit/${id}`);
    const result = data.data ? decrypt(data.data) : data;
    return result; // Returns decrypted JSON: { success: true, data: { slug, faqs: [...] } }
  },
  updateSMTP: async (payload: any) => {
    const { data } = await api.post(`/smtp/update`, { data: encrypt(payload) });
    const result = data.data ? decrypt(data.data) : data;
    return result;
  }
};
