import useSWR from "swr";
import apiClient from "@/lib/api";

interface OrderRow {
  id: string;
  dateTime: string;
  customerName: string;
  status: string;
  total: number;
}

const fetcher = (url: string) => apiClient.get(url).then((r) => r.json());

export function useRecentOrders(limit = 10) {
  const { data, error, isLoading } = useSWR<OrderRow[]>(
    `/api/orders?limit=${limit}&sort=dateTime&order=desc`,
    fetcher,
    { refreshInterval: 30000, fallbackData: [] }
  );

  return {
    orders: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
  };
}
