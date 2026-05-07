import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Users, Briefcase, FileText, Clock, Star,
  AlertTriangle, MapPin, Package, Bell, BarChart3, ScrollText,
  Settings, ChevronLeft, ChevronRight, Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/users", label: "User Management", icon: Users },
  { path: "/contractors", label: "Contractors", icon: Briefcase },
  { path: "/contracts", label: "Contracts", icon: FileText },
  { path: "/attendance", label: "Attendance", icon: Clock },
  { path: "/evaluations", label: "Evaluations & KPIs", icon: Star },
  { path: "/violations", label: "Violations", icon: AlertTriangle },
  { path: "/work-areas", label: "Work Areas", icon: MapPin },
  { path: "/equipment", label: "Equipment", icon: Package },
  { path: "/notifications", label: "Notifications", icon: Bell },
  { path: "/reports", label: "Reports", icon: BarChart3 },
  { path: "/audit-logs", label: "Audit Logs", icon: ScrollText },
];

export function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "flex flex-col bg-slate-900 text-white transition-all duration-300 shrink-0",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-400" />
            <span className="font-bold text-lg text-white">ProManageX</span>
          </div>
        )}
        {collapsed && <Building2 className="w-7 h-7 text-blue-400 mx-auto" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-slate-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === "/" ? location === "/" : location.startsWith(path);
          return (
            <Link key={path} href={path}>
              <div className={cn(
                "flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg cursor-pointer transition-all",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}>
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <Link href="/settings">
          <div className={cn(
            "flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer text-slate-400 hover:text-white hover:bg-slate-800 transition-all",
          )}>
            <Settings className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </div>
        </Link>
      </div>
    </aside>
  );
}
