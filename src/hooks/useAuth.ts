import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import type { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!ignore) {
          if (session?.user) {
            await ensureProfile(session.user);
            setUser(session.user);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        if (!ignore) setUser(null); // On error, treat as unauthenticated
      } finally {
        if (!ignore) setLoading(false); // <-- This is the KEY, always turns loading off!
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await ensureProfile(session.user);
          setUser(session.user);
        } else {
          setUser(null);
        }
        setLoading(false); // <-- Also KEY!
      }
    );
    return () => {
      ignore = true;
      subscription.unsubscribe();
    };
  }, []);

  const ensureProfile = async (authUser: User) => {
    if (!authUser) return;
    const { data: existing, error } = await supabase
      .from("users")
      .select("id")
      .eq("id", authUser.id)
      .single();

    if (!existing && (!error || error.code === "PGRST116")) {
      await supabase.from("users").insert({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "User",
        fitness_goal: "muscle_gain",
        experience_level: "beginner",
        gym_frequency: 3
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return { data, error };
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
    return { error };
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` }
    });
    setLoading(false);
    return { data, error };
  };

  return { user, loading, signIn, signUp, signInWithGoogle, signOut };
};
