import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ixenrccdlmupgbecwnrq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_gWalrVkfU7i4rinQGgGQtw_ywc8_nEL";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
