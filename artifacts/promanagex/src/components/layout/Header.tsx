import { Bell, User, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/users": "User Management",
  "/contractors": "Contractor Management",
  "/contracts": "Contract Management",
  "/attendance": "Attendance & Workforce",
  "/evaluations": "Evaluations & KPIs",
  "/violations": "Violations & Penalties",
  "/work-areas": "Work Areas",
  "/equipment": "Equipment & Inventory",
  "/notifications": "Notifications",
  "/reports": "Reports & Analytics",
  "/audit-logs": "Audit Logs",
  "/settings": "Settings",
};

export function Header() {
  const [location] = useLocation();
  const title = pageTitles[location] || "ProManageX";

  const { data: dashData } = useQuery<{ unreadNotifications: number }>({
    queryKey: ["/api/dashboard/summary"],
    queryFn: () => apiFetch("/dashboard/summary"),
    refetchInterval: 30000,
  });

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
          />
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          {(dashData?.unreadNotifications ?? 0) > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}
