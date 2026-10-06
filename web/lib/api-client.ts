import axios from 'axios';
import { getSession } from './session';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch (err) {
    // ignore
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;

      if (error.response?.status === 401) {
        if (!currentPath.startsWith('/auth') && !currentPath.startsWith('/login')) {
          const safeReturnTo = encodeURIComponent(currentPath);
          window.location.href = `/auth/error?code=session_expired&returnTo=${safeReturnTo}`;
        }
      } else if (error.response?.status === 403) {
        if (currentPath !== '/unauthorized') {
          const safeReturnTo = encodeURIComponent(currentPath);
          window.location.href = `/unauthorized?reason=role&returnTo=${safeReturnTo}`;
        }
      }
    }
    return Promise.reject(error);
  }
);


