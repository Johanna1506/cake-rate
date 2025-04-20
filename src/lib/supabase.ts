import { createClient } from "@supabase/supabase-js";

// Configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
  throw new Error("Missing Supabase environment variables");
}

// Configuration d'authentification
const authConfig = {
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: true,
  storageKey: "supabase.auth.token",
  storage: window.localStorage,
};

// Client unique pour l'application
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: authConfig,
});

// Client pour les opérations serveur (sans configuration d'authentification)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
