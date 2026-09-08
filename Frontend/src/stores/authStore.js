import { create } from "zustand";
import { supabase } from "../lib/supabase";
import api from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  loading: true,
  initialized: false,
  initializing: false,

  // Initialize — called once on app load
  initialize: async () => {
    if (get().initialized || get().initializing) return;

    set({ initializing: true });

    try {
      const {
        data: { session },
      } = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error("Auth session request timed out")),
            5000,
          );
        }),
      ]);

      if (session) {
        set({ session });
        await get().fetchProfile();
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      set({ loading: false, initialized: true, initializing: false });
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session });

      if (event === "SIGNED_IN" && session) {
        await get().fetchProfile();
      }

      if (event === "SIGNED_OUT") {
        set({ user: null, profile: null, session: null });
      }
    });
  },

  // Fetch profile from your API
  fetchProfile: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ profile: res.data.data.user });
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  },

  // Register
  register: async ({ fullName, email, password, phone }) => {
    // Create profile in your DB
    await api.post("/auth/register", { fullName, email, password, phone });

    // Sign in via Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    set({ session: data.session });
    await get().fetchProfile();

    return data;
  },

  // Login
  login: async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    set({ session: data.session });
    await get().fetchProfile();

    return data;
  },

  // Logout
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null });
  },

  // Forgot password
  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },
}));

export default useAuthStore;
