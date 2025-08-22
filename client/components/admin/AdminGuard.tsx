import { ReactNode } from "react";
import { useSupabaseAdminAuth } from "@/hooks/use-supabase-admin-auth";
import { AdminLogin } from "./AdminLogin";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdminAuthenticated, isLoading, authError } = useSupabaseAdminAuth();

  console.log("🛡️ AdminGuard state:", {
    isLoading,
    isAdminAuthenticated,
    authError,
  });

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
          <p className="text-gray-400 text-sm mt-2">
            This should complete within 3 seconds...
          </p>
          {authError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm max-w-md mx-auto">
              {authError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAdminAuthenticated) {
    console.log("🔐 Showing login screen");
    return <AdminLogin />;
  }

  // Show admin panel if authenticated
  console.log("✅ Showing admin panel");
  return <>{children}</>;
}
