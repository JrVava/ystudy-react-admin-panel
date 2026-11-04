import api from "./api";
import { encrypt, decrypt } from "./crypto";

export interface TableColumn {
  id?: string;
  key: string;
  header: string;
}

export interface TableRow {
  id?: string;
  isHighlighted?: boolean;
  cells?: string[];
  [key: string]: any;
}

export interface RepaymentThresholdsPlan {
  _id?: string;
  columns: TableColumn[];
  rows: TableRow[];
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const repaymentThresholdsPlanApi = {
  getPaginated: async (page: number = 1, limit: number = 10, field: string = "createdAt", sort: string = "desc") => {
    const { data } = await api.get("/repayment-thresholds-plans/pagination", {
      params: { page, limit, field, sort }
    });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  getAll: async () => {
    const { data } = await api.get("/repayment-thresholds-plans/list");
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get(`/repayment-thresholds-plans/edit/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted.data;
  },

  create: async (payload: { columns: TableColumn[]; rows: TableRow[]; status?: boolean }) => {
    const { data } = await api.post("/repayment-thresholds-plans/add", { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  update: async (id: string, payload: { columns?: TableColumn[]; rows?: TableRow[]; status?: boolean }) => {
    const { data } = await api.post(`/repayment-thresholds-plans/update/${id}`, { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  addColumn: async (id: string, payload: { header: string; key?: string; defaultValue?: string }) => {
    const { data } = await api.post(`/repayment-thresholds-plans/add-column/${id}`, { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  removeColumn: async (id: string, payload: { key?: string; index?: number }) => {
    const { data } = await api.post(`/repayment-thresholds-plans/remove-column/${id}`, { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  addRow: async (id: string, payload: { row: TableRow }) => {
    const { data } = await api.post(`/repayment-thresholds-plans/add-row/${id}`, { data: encrypt(payload) });
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  deleteRow: async (id: string, rowIndex: number | string) => {
    const { data } = await api.delete(`/repayment-thresholds-plans/delete-row/${id}/${rowIndex}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  toggleStatus: async (id: string) => {
    const { data } = await api.put(`/repayment-thresholds-plans/toggle-status/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  },

  delete: async (id: string) => {
    const { data } = await api.delete(`/repayment-thresholds-plans/delete/${id}`);
    const decrypted = data.data ? decrypt(data.data) : data;
    return decrypted;
  }
};
