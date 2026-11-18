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
    updateUser: async () => ({
      error: new Error(
        "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable auth.",
      ),
    }),
    refreshSession: async () => ({ data: { session: null } }),
  },
});

// A misconfigured URL used to throw from createClient, which runs while this
// module is being imported. That happens before React mounts, so the entire app
// died with a blank white page and nothing in the UI to explain it. Falling back
// to the mock instead means a wrong env var shows up as "auth is not configured"
// on screen, where it can actually be read and fixed.
const createClientSafely = (supabaseUrl, key) => {
  if (!supabaseUrl || !key) return null;
  try {
    return createClient(supabaseUrl, key);
  } catch (error) {
    console.error(
      `[supabase] VITE_SUPABASE_URL is not usable (${error.message}). Auth is disabled until it is corrected.`,
    );
    return null;
  }
};

export const supabase = createClientSafely(url, anonKey) ?? createMockSupabase();

