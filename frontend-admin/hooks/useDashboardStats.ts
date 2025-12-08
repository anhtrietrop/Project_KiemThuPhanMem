import useSWR from "swr";
import apiClient from "@/lib/api";

interface SummaryStats {
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  ordersProcessing: number;
  ordersDelivered: number;
  ordersCancelled: number;
  lowStockProducts: number;
}

const fetcher = (url: string) => apiClient.get(url).then((r) => r.json());

export function useDashboardStats() {
  const { data, error, isLoading } = useSWR<SummaryStats>("/api/admin/dashboard/overview", fetcher, {
    refreshInterval: 60000, // refresh every 60s
  });

  return {
    stats: data,
    isLoading,
    isError: error,
  };
}
