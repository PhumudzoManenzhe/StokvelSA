import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const createMockSupabase = () => ({
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
    signInWithPassword: async () => {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth.",
      );
    },
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => {
      throw new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth.",
      );
    },
    refreshSession: async () => ({ data: { session: null } }),
  },
});

export const supabase = url && anonKey ? createClient(url, anonKey) : createMockSupabase();
