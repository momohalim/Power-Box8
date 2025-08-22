import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface AdminSessionContextType {
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
  isAdminRoute: boolean;
  setIsAdminRoute: (value: boolean) => void;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(
  undefined,
);

// Simple admin password - in production, this should be environment-based
const ADMIN_PASSWORD = "admin123";
const ADMIN_SESSION_KEY = "snackbox_admin_session";
const ADMIN_TOKEN_KEY = "snackbox_admin_token";

export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  // Check for existing admin session on load
  useEffect(() => {
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    const savedToken = localStorage.getItem(ADMIN_TOKEN_KEY);

    if (savedSession === "true" && savedToken) {
      setIsAdminAuthenticated(true);
      setAdminToken(savedToken);
    }

    // Check if current path is admin route
    const checkAdminRoute = () => {
      setIsAdminRoute(window.location.pathname.startsWith("/admin"));
    };

    checkAdminRoute();

    // Listen for route changes
    const handleLocationChange = () => {
      checkAdminRoute();
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const loginAdmin = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      setIsAdminAuthenticated(true);
      setAdminToken(token);

      // Persist session
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem(ADMIN_TOKEN_KEY, token);

      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setAdminToken(null);

    // Clear persisted session
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  return (
    <AdminSessionContext.Provider
      value={{
        isAdminAuthenticated,
        adminToken,
        loginAdmin,
        logoutAdmin,
        isAdminRoute,
        setIsAdminRoute,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (context === undefined) {
    throw new Error(
      "useAdminSession must be used within an AdminSessionProvider",
    );
  }
  return context;
}
