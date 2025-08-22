import { DatabaseSetupInfo } from "@/components/DatabaseSetupInfo";
import { DatabaseDiagnosis } from "@/components/DatabaseDiagnosis";
import { AdminSystemTest } from "@/components/AdminSystemTest";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Settings,
  Users,
  BarChart3,
  Zap,
  Search,
  Megaphone,
  Package,
  MessageSquare,
  DollarSign,
  Link2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "SEO & Tracking",
      description: "Configure meta tags and analytics",
      icon: Search,
      color: "from-purple-500 to-purple-600",
      path: "/admin/seo",
      priority: "high",
    },
    {
      title: "Hero Section",
      description: "Edit main landing content",
      icon: Megaphone,
      color: "from-blue-500 to-blue-600",
      path: "/admin/hero",
      priority: "high",
    },
    {
      title: "Product Gallery",
      description: "Manage product images",
      icon: Package,
      color: "from-green-500 to-green-600",
      path: "/admin/inside-box",
      priority: "medium",
    },
    {
      title: "Customer Reviews",
      description: "Manage testimonials",
      icon: MessageSquare,
      color: "from-indigo-500 to-indigo-600",
      path: "/admin/testimonials",
      priority: "medium",
    },
    {
      title: "Offer & Pricing",
      description: "Update pricing and CTAs",
      icon: DollarSign,
      color: "from-emerald-500 to-emerald-600",
      path: "/admin/offer-pricing",
      priority: "high",
    },
    {
      title: "Social Media",
      description: "Configure social links",
      icon: Link2,
      color: "from-cyan-500 to-cyan-600",
      path: "/admin/footer",
      priority: "low",
    },
    {
      title: "Popups & Modals",
      description: "Manage popup content",
      icon: Zap,
      color: "from-yellow-500 to-yellow-600",
      path: "/admin/popups",
      priority: "medium",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Welcome to Admin Dashboard
              </h2>
              <p className="text-blue-100 text-lg">
                Manage your website content, SEO, and tracking settings with
                ease.
              </p>
            </div>
          </div>
        </div>
        {/* Background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
      </div>

      {/* Database Setup Info */}
      <DatabaseSetupInfo />

      {/* Database Diagnosis Tool */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-lg font-semibold text-gray-700">
            Database Status & Fix Tool
          </span>
        </div>
        <DatabaseDiagnosis />
      </div>

      {/* System Test Suite */}
      <AdminSystemTest />

      {/* Enhanced Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Admin Sections
            </CardTitle>
            <div className="p-2 bg-blue-500 rounded-lg">
              <Settings className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">10</div>
            <p className="text-xs text-blue-700 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Sections available
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              System Status
            </CardTitle>
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">Active</div>
            <p className="text-xs text-green-700 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              All systems operational
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Data Mode
            </CardTitle>
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">Live</div>
            <p className="text-xs text-purple-700 flex items-center gap-1 mt-1">
              <Sparkles className="w-3 h-3" />
              Real-time updates
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">
              Last Updated
            </CardTitle>
            <div className="p-2 bg-orange-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">Now</div>
            <p className="text-xs text-orange-700 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              Content synchronized
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
          <Badge variant="secondary" className="text-xs">
            {quickActions.length} sections available
          </Badge>
        </div>

        {/* Priority sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              High Priority
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {quickActions
              .filter((action) => action.priority === "high")
              .map((action) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={action.path}
                    className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => navigate(action.path)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 bg-gradient-to-r ${action.color} rounded-xl shadow-lg`}
                        >
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>

        {/* Other sections */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">
              Other Sections
            </span>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            {quickActions
              .filter((action) => action.priority !== "high")
              .map((action) => {
                const IconComponent = action.icon;
                return (
                  <Card
                    key={action.path}
                    className="group border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(action.path)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 bg-gradient-to-r ${action.color} rounded-lg`}
                        >
                          <IconComponent className="w-4 h-4 text-white" />
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors ml-auto" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1 text-sm group-hover:text-gray-700 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
