import api from "./api";
import { encrypt, decrypt } from "./crypto";

export const dynamicFormApi = {
  get: async () => {
    const { data } = await api.get("/dynamic-forms");
    const decrypted = decrypt(data.data);
    return decrypted.data;
  },
  update: async (payload: any) => {
    const { data } = await api.post("/dynamic-forms/update", { data: encrypt(payload) });
    return decrypt(data.data);
  }
};
