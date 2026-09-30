import axios from 'axios';
import { getSession } from './session';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  // If we're on the server side (e.g. in a Server Action or RSC), getSession reads the cookies.
  // We can inject the token here.
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
