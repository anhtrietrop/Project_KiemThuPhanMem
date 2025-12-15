import config from './config';
import { getSession } from 'next-auth/react';

export const apiClient = {
  baseUrl: config.apiBaseUrl,

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Get NextAuth session for user ID
    const session = await getSession();
    const userId = session?.user?.id;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(userId && { 'X-User-Id': userId }),
        ...options.headers,
      },
    };

    return fetch(url, { ...defaultOptions, ...options });
  },

  // Convenience methods
  get: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, data?: T, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: T, options?: RequestInit) =>
    apiClient.request(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: (endpoint: string, options?: RequestInit) =>
    apiClient.request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
