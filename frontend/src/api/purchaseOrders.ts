import { apiClient } from './client';
import type { PurchaseOrderOut, PurchaseOrderCreate } from './types';

export const purchaseOrderApi = {
  async getPurchaseOrders(): Promise<PurchaseOrderOut[]> {
    const res = await apiClient.get<PurchaseOrderOut[]>('/purchase-orders');
    return res.data;
  },

  async createPurchaseOrder(data: PurchaseOrderCreate): Promise<PurchaseOrderOut> {
    const res = await apiClient.post<PurchaseOrderOut>('/purchase-orders', data);
    return res.data;
  },
};
