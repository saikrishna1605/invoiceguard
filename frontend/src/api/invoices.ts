import { apiClient } from './client';
import type { InvoiceOut, InvoiceSummary, DecisionRequest } from './types';

export const invoiceApi = {
  async getInvoices(status?: string): Promise<InvoiceSummary[]> {
    const params = status && status !== 'all' ? { status } : {};
    const res = await apiClient.get<InvoiceSummary[]>('/invoices', { params });
    return res.data;
  },

  async getInvoice(id: number): Promise<InvoiceOut> {
    const res = await apiClient.get<InvoiceOut>(`/invoices/${id}`);
    return res.data;
  },

  async uploadInvoice(file: File): Promise<InvoiceOut> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await apiClient.post<InvoiceOut>('/invoices/upload', formData);
    return res.data;
  },

  async submitInvoiceText(rawText: string): Promise<InvoiceOut> {
    const formData = new FormData();
    formData.append('raw_text', rawText);
    const res = await apiClient.post<InvoiceOut>('/invoices/submit-text', formData);
    return res.data;
  },

  async approveInvoice(id: number, payload: DecisionRequest): Promise<InvoiceOut> {
    const res = await apiClient.post<InvoiceOut>(`/invoices/${id}/approve`, payload);
    return res.data;
  },

  async rejectInvoice(id: number, payload: DecisionRequest): Promise<InvoiceOut> {
    const res = await apiClient.post<InvoiceOut>(`/invoices/${id}/reject`, payload);
    return res.data;
  },

  async checkHealth(): Promise<{ service: string; status: string }> {
    const res = await apiClient.get<{ service: string; status: string }>('/');
    return res.data;
  },
};
