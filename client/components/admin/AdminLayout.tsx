import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavLink, Outlet } from "react-router-dom";
import { AdminGuard } from "./AdminGuard";
import { useSupabaseAdminAuth } from "@/hooks/use-supabase-admin-auth";
import { RealTimeSyncIndicator } from "@/components/RealTimeSyncIndicator";
import {
  LayoutDashboard,
  Megaphone,
  Heart,
  Building2,
  Package,
  MessageSquare,
  DollarSign,
  Link2,
  Search,
  Zap,
  Settings,
  Home,
  ChevronRight,
  LogOut,
  Shield,
  Clock,
  User,
  Database,
} from "lucide-react";

const adminSections = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    color: "text-blue-600",
  },
  {
    id: "hero",
    label: "Hero Section",
    path: "/admin/hero",
    icon: Megaphone,
    color: "text-purple-600",
  },
  {
    id: "why-choose",
    label: "Why Choose",
    path: "/admin/why-choose",
    icon: Heart,
    color: "text-pink-600",
  },
  {
    id: "walmart",
    label: "Walmart Info",
    path: "/admin/walmart",
    icon: Building2,
    color: "text-orange-600",
  },
  {
    id: "inside-box",
    label: "Product Gallery",
    path: "/admin/inside-box",
    icon: Package,
    color: "text-green-600",
  },
  {
    id: "testimonials",
    label: "Customer Reviews",
    path: "/admin/testimonials",
    icon: MessageSquare,
    color: "text-indigo-600",
  },
  {
    id: "offer-pricing",
    label: "Offer & Pricing",
    path: "/admin/offer-pricing",
    icon: DollarSign,
    color: "text-emerald-600",
  },
  {
    id: "footer",
    label: "Social Media",
    path: "/admin/footer",
    icon: Link2,
    color: "text-cyan-600",
  },
  {
    id: "seo",
    label: "SEO & Tracking",
    path: "/admin/seo",
    icon: Search,
    color: "text-slate-600",
  },
  {
    id: "popups",
    label: "Popups & Modals",
    path: "/admin/popups",
    icon: Zap,
    color: "text-yellow-600",
  },
  {
    id: "supabase-setup",
    label: "Supabase Setup",
    path: "/admin/supabase-setup",
    icon: Database,
    color: "text-emerald-600",
  },
];

export function AdminLayout() {
  const { signOut, user } = useSupabaseAdminAuth();

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Enhanced Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Snack Box Admin
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-green-600" />
                  Content Management System
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {user?.email}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Real-time sync indicator */}
              <RealTimeSyncIndicator className="hidden sm:flex" />

              {/* User Info */}
              <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-lg">
                <Shield className="w-3 h-3 text-green-600" />
                <span className="text-gray-700 font-medium">{user?.email}</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open("/", "_blank")}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                View Site
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Enhanced Sidebar */}
          <aside className="w-72 bg-white/90 backdrop-blur-md border-r border-gray-200/50 min-h-[calc(100vh-88px)] fixed shadow-lg">
            <nav className="p-6">
              <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Content Sections
                </h3>
              </div>
              <ul className="space-y-1">
                {adminSections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <li key={section.id}>
                      <NavLink
                        to={section.path}
                        end={section.path === "/admin"}
                        className={({ isActive }) =>
                          cn(
                            "group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md",
                            isActive
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-[1.02]"
                              : "text-gray-700 hover:bg-white hover:text-gray-900 hover:shadow-sm",
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={cn(
                                "p-2 rounded-lg transition-colors",
                                isActive
                                  ? "bg-white/20"
                                  : "bg-gray-100 group-hover:bg-gray-200",
                              )}
                            >
                              <IconComponent
                                className={cn(
                                  "w-4 h-4 transition-colors",
                                  isActive ? "text-white" : section.color,
                                )}
                              />
                            </div>
                            <span className="flex-1">{section.label}</span>
                            {isActive && (
                              <ChevronRight className="w-4 h-4 text-white" />
                            )}
                          </>
                        )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>

              {/* Footer in Sidebar */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-green-600 font-medium">
                      Supabase Auth
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate px-2">
                    {user?.email}
                  </p>

                  {/* Sync status in sidebar for mobile */}
                  <div className="sm:hidden flex justify-center pt-2">
                    <RealTimeSyncIndicator className="scale-90" />
                  </div>

                  <p>Snack Box CMS</p>
                  <p className="mt-1">v1.0.0</p>
                </div>
              </div>
            </nav>
          </aside>

          {/* Enhanced Main Content */}
          <main className="ml-72 flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
