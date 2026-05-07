import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import {
  Users, Briefcase, FileText, Clock, AlertTriangle,
  Package, MapPin, TrendingUp, Bell, CheckCircle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface DashboardSummary {
  totalUsers: number;
  totalContractors: number;
  activeContracts: number;
  contractValue: number;
  presentToday: number;
  openViolations: number;
  equipmentTotal: number;
  workAreas: number;
  expiringContracts: number;
  unreadNotifications: number;
}

interface ActivityItem {
  id: number;
  type: string;
  description: string;
  createdAt: string;
}

interface TrendItem {
  label: string;
  value: number;
  secondaryValue?: number;
}

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
    queryFn: () => apiFetch("/dashboard/summary"),
    refetchInterval: 30000,
  });

  const { data: activity = [] } = useQuery<ActivityItem[]>({
    queryKey: ["/api/dashboard/activity"],
    queryFn: () => apiFetch("/dashboard/activity"),
  });

  const { data: trend = [] } = useQuery<TrendItem[]>({
    queryKey: ["/api/dashboard/attendance-trend"],
    queryFn: () => apiFetch("/dashboard/attendance-trend"),
  });

  const { data: contractorPerf = [] } = useQuery<{ contractorName: string; score: number }[]>({
    queryKey: ["/api/dashboard/contractor-performance"],
    queryFn: () => apiFetch("/dashboard/contractor-performance"),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-xl border border-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={summary?.totalUsers ?? 0} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Active Contractors" value={summary?.totalContractors ?? 0} icon={Briefcase} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
        <StatCard title="Active Contracts" value={summary?.activeContracts ?? 0} icon={FileText} iconColor="text-purple-600" iconBg="bg-purple-50" subtitle={`$${((summary?.contractValue ?? 0) / 1000).toFixed(0)}K value`} />
        <StatCard title="Present Today" value={summary?.presentToday ?? 0} icon={Clock} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Open Violations" value={summary?.openViolations ?? 0} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Equipment" value={summary?.equipmentTotal ?? 0} icon={Package} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Work Areas" value={summary?.workAreas ?? 0} icon={MapPin} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatCard title="Expiring Contracts" value={summary?.expiringContracts ?? 0} icon={Bell} iconColor="text-yellow-600" iconBg="bg-yellow-50" subtitle="Next 30 days" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Attendance Trend (7 days)</h3>
          {trend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No attendance data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Present" />
                <Line type="monotone" dataKey="secondaryValue" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} name="Absent" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Contractor Performance</h3>
          {contractorPerf.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No contractor data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={contractorPerf.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="contractorName" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
        {activity.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No recent activity</div>
        ) : (
          <div className="space-y-3">
            {activity.slice(0, 8).map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{item.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
