import config from "./config";
import { getSession } from "next-auth/react";

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Get session token for authentication
    const session = await getSession();

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(session?.user?.email
          ? { Authorization: `Bearer ${session.user.email}` }
          : {}),
        ...options.headers,
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  },

  // Convenience methods
  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "GET" }),

  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: "DELETE" }),

  // Special method for FormData (file uploads) - doesn't set Content-Type header
  postFormData: (endpoint: string, formData: FormData) => {
    const url = `${apiClient.baseUrl}${endpoint}`;
    return fetch(url, {
      method: "POST",
      body: formData,
    });
  },
};

export default apiClient;
