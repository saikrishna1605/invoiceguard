import { apiClient } from './client';
import type { VendorOut, VendorCreate } from './types';

export const vendorApi = {
  async getVendors(): Promise<VendorOut[]> {
    const res = await apiClient.get<VendorOut[]>('/vendors');
    return res.data;
  },

  async createVendor(data: VendorCreate): Promise<VendorOut> {
    const res = await apiClient.post<VendorOut>('/vendors', data);
    return res.data;
  },
};
