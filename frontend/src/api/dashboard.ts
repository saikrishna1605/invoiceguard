import { apiClient } from './client';
import type { DashboardStats, AlertOut } from './types';

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>('/dashboard/stats');
    return res.data;
  },

  async getAlerts(): Promise<AlertOut[]> {
    const res = await apiClient.get<AlertOut[]>('/dashboard/alerts');
    return res.data;
  },
};
