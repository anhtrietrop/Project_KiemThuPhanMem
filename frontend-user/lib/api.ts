import config from "./config";
import { getSession } from "next-auth/react";

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Get NextAuth session for user ID
    const session = await getSession();
    const userId = (session?.user as any)?.id;

    const headers = {
      "Content-Type": "application/json",
      ...(userId && { "X-User-Id": userId }),
      ...(options.headers || {}),
    };

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    try {
      if (!this.baseUrl) throw new Error("apiBaseUrl is not configured");
      const response = await fetch(url, fetchOptions);
      return response;
    } catch (err) {
      // Provide a clearer message in logs to help debugging network/CORS issues
      // Keep original error for callers to handle
      // eslint-disable-next-line no-console
      console.error("apiClient.request failed:", url, err);
      throw err instanceof Error ? err : new Error(String(err));
    }
  },

  // Convenience methods
  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, data?: T, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: T, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "DELETE" }),
};

export default apiClient;
