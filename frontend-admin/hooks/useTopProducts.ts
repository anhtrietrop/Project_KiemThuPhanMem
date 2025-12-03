import useSWR from "swr";
import apiClient from "@/lib/api";

interface ProductRow {
  id: string;
  title: string;
  price: number;
  quantity: number;
  inStock: number;
}

const fetcher = (url: string) => apiClient.get(url).then((r) => r.json());

export function useTopProducts(limit = 10) {
  const { data, error, isLoading } = useSWR<ProductRow[]>(
    `/api/products?limit=${limit}&mode=admin`,
    fetcher,
    { refreshInterval: 60000, fallbackData: [] }
  );

  return {
    products: Array.isArray(data) ? data : [],
    isLoading,
    isError: error,
  };
}
