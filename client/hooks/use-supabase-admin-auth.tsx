import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User, Session } from "@supabase/supabase-js";

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isAdminAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined,
);

export function SupabaseAdminAuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Simplified admin check function
  const checkAdminAccess = async (user: User): Promise<boolean> => {
    try {
      console.log("🔍 Checking admin access for:", user.email);

      // For now, let's allow any authenticated user to be admin for testing
      // You can modify this later to check the admin_users table
      return true;

      /* Uncomment this when you want to check the admin_users table:
      const { data, error } = await supabase
        .from("admin_users")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .single();

      if (error) {
        console.log("❌ Admin check error:", error.code);
        return false;
      }

      return !!data;
      */
    } catch (error) {
      console.error("❌ Admin check failed:", error);
      return false;
    }
  };

  // Sign in function
  const signIn = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("🔐 Attempting to sign in:", email);
      setIsLoading(true);
      setAuthError(null);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Sign in error:", error);
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log("✅ Sign in successful:", data.user.email);
        // The auth state change handler will take care of the rest
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Sign in failed" };
    } catch (error) {
      console.error("❌ Sign in exception:", error);
      setIsLoading(false);
      return { success: false, error: "Authentication failed" };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      console.log("🚪 Signing out...");
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  // Main auth state effect
  useEffect(() => {
    let mounted = true;

    console.log("🚀 Setting up authentication...");

    // Absolute failsafe - clear loading after 2 seconds no matter what
    const absoluteFailsafe = setTimeout(() => {
      if (mounted) {
        console.warn("🚨 ABSOLUTE FAILSAFE: Clearing loading state");
        setIsLoading(false);
      }
    }, 2000);

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log("📋 Getting initial session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          console.log("📋 Found session for:", session.user.email);
          const hasAccess = await checkAdminAccess(session.user);

          if (hasAccess) {
            console.log("✅ Initial session has admin access");
            setUser(session.user);
            setSession(session);
            setIsAdminAuthenticated(true);
            setAuthError(null);
          } else {
            console.log("❌ Initial session denied admin access");
            setAuthError("You do not have admin access");
            await supabase.auth.signOut();
          }
        } else {
          console.log("📋 No initial session found");
        }
      } catch (error) {
        console.error("❌ Error getting initial session:", error);
        if (mounted) {
          setAuthError("Failed to check authentication");
        }
      } finally {
        if (mounted) {
          console.log("✅ Initial auth check complete");
          clearTimeout(absoluteFailsafe);
          setIsLoading(false);
        }
      }
    };

    // Start the auth check
    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("🔄 Auth state change:", event);

      try {
        if (event === "SIGNED_IN" && session?.user) {
          console.log("✅ User signed in:", session.user.email);

          const hasAccess = await checkAdminAccess(session.user);

          if (hasAccess) {
            console.log("✅ User granted admin access");
            setUser(session.user);
            setSession(session);
            setIsAdminAuthenticated(true);
            setAuthError(null);
          } else {
            console.log("❌ User denied admin access");
            setAuthError("You do not have admin access to this system");
            setUser(null);
            setSession(null);
            setIsAdminAuthenticated(false);
            await supabase.auth.signOut();
          }
        } else if (event === "SIGNED_OUT") {
          console.log("🚪 User signed out");
          setUser(null);
          setSession(null);
          setIsAdminAuthenticated(false);
          setAuthError(null);
        }
      } catch (error) {
        console.error("❌ Auth state change error:", error);
        setAuthError("Authentication error");
        setUser(null);
        setSession(null);
        setIsAdminAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(absoluteFailsafe);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdminAuthenticated,
        isLoading,
        authError,
        signIn,
        signOut,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useSupabaseAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error(
      "useSupabaseAdminAuth must be used within a SupabaseAdminAuthProvider",
    );
  }
  return context;
}
