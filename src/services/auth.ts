import { supabase } from "../lib/supabase";
import { User, Session } from "@supabase/supabase-js";

interface SignUpOptions {
  data?: {
    name?: string;
    role?: string;
  };
}

// Créer une fonction pour vérifier si la session est expirée
const isSessionExpired = (session: Session | null): boolean => {
  if (!session) return true;
  if (!session.expires_at) return true;

  const expiryTime = new Date(session.expires_at * 1000);
  const now = new Date();

  // Si la session expire dans moins de 5 minutes, on la considère comme expirée
  const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
  return expiryTime < fiveMinutesFromNow;
};

// Variable pour stocker la dernière session
let cachedSession: Session | null = null;
let cachedUser: User | null = null;

export const auth = {
  supabase,

  async signUp(email: string, password: string, options?: SignUpOptions) {
    console.log('Attempting sign up with:', {
      email,
      password: password ? '***' : undefined,
      options
    });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: options?.data?.name,
          },
        },
      });

      console.log('Sign up response:', {
        data: data ? {
          user: data.user ? {
            id: data.user.id,
            email: data.user.email,
            created_at: data.user.created_at
          } : null,
          session: data.session ? {
            access_token: data.session.access_token ? '***' : null,
            refresh_token: data.session.refresh_token ? '***' : null,
            expires_at: data.session.expires_at
          } : null
        } : null,
        error: error ? {
          name: error.name,
          message: error.message,
          status: error.status
        } : null
      });

      if (data?.session) {
        cachedSession = data.session;
        cachedUser = data.user;
      }

      return { data, error };
    } catch (err) {
      console.error('Sign up error:', err);
      return { data: null, error: err };
    }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data?.session) {
      cachedSession = data.session;
      cachedUser = data.user;
    }

    return { data, error };
  },

  async signOut() {
    try {
      // On efface d'abord le stockage local
      localStorage.clear();

      // On efface le cache
      cachedSession = null;
      cachedUser = null;

      // On tente la déconnexion
      const { error } = await supabase.auth.signOut();

      return { error };
    } catch (err) {
      console.error("Exception during sign out:", err);
      return { error: err };
    }
  },

  async getCurrentUser() {
    // Si nous avons déjà l'utilisateur en cache, on le renvoie
    if (cachedUser && cachedSession && !isSessionExpired(cachedSession)) {
      return cachedUser;
    }

    try {
      // Sinon, on le récupère depuis Supabase
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth service: error getting user", error);
        cachedUser = null;
        return null;
      }

      cachedUser = user;
      return user;
    } catch (err) {
      console.error("Auth service: exception getting user", err);
      cachedUser = null;
      return null;
    }
  },

  async getSession() {
    // Si nous avons déjà une session en cache et qu'elle n'est pas expirée, on la renvoie
    if (cachedSession && !isSessionExpired(cachedSession)) {
      return cachedSession;
    }

    try {
      // Sinon, on la récupère depuis Supabase
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Auth service: error getting session", error);
        cachedSession = null;
        return null;
      }

      cachedSession = session;
      return session;
    } catch (err) {
      console.error("Auth service: exception getting session", err);
      cachedSession = null;
      return null;
    }
  },

  async refreshSession() {
    if (!cachedSession) {
      return { session: null, error: new Error("No session to refresh") };
    }

    try {
      // Rafraîchir explicitement la session
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error("Auth service: error refreshing session", error);
        return { session: null, error };
      }

      cachedSession = data.session;
      cachedUser = data.user;

      return { session: data.session, error: null };
    } catch (err) {
      console.error("Auth service: exception refreshing session", err);
      return { session: null, error: err };
    }
  },

  async resendConfirmationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return { error };
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  },

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    return { error };
  },
};
