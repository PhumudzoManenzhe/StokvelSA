import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Attach Supabase token to every request
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }

  return config;
});

// Handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — try to refresh
      const {
        data: { session },
      } = await supabase.auth.refreshSession();

      if (session) {
        // Retry original request with new token
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        return api.request(error.config);
      } else {
        // Refresh failed — redirect to login
        await supabase.auth.signOut();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
