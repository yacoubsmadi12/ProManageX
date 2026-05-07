import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { AlertTriangle, DollarSign, CheckCircle, Search, Plus } from "lucide-react";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Violation {
  id: number;
  userName: string;
  category: string;
  severity: string;
  status: string;
  date: string;
  description: string;
  penalty: string;
}

interface ViolationStats {
  total: number;
  open: number;
  resolved: number;
  totalPenalties: number;
  byCategory: { category: string; count: number }[];
}

export default function Violations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: violations = [], isLoading } = useQuery<Violation[]>({
    queryKey: ["/api/violations", statusFilter],
    queryFn: () => apiFetch(`/violations${statusFilter ? `?status=${statusFilter}` : ""}`),
  });

  const { data: stats } = useQuery<ViolationStats>({
    queryKey: ["/api/violations/stats"],
    queryFn: () => apiFetch("/violations/stats"),
  });

  const filtered = violations.filter(v =>
    !search || v.userName?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "category", label: "Category" },
    {
      key: "severity", label: "Severity",
      render: (r: Violation) => <StatusBadge status={r.severity} />,
    },
    {
      key: "status", label: "Status",
      render: (r: Violation) => <StatusBadge status={r.status} />,
    },
    { key: "date", label: "Date" },
    {
      key: "penalty", label: "Penalty",
      render: (r: Violation) => r.penalty ? `$${parseFloat(r.penalty).toLocaleString()}` : "-",
    },
    { key: "description", label: "Description", className: "max-w-48 truncate" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Violations" value={stats?.total ?? 0} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Open" value={stats?.open ?? 0} icon={AlertTriangle} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Total Penalties" value={`$${((stats?.totalPenalties ?? 0)).toLocaleString()}`} icon={DollarSign} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">By Category</h3>
          {(stats?.byCategory ?? []).filter(c => c.count > 0).length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No violations yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={(stats?.byCategory ?? []).filter(c => c.count > 0)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search violations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Report Violation
            </button>
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No violations found" />
        </div>
      </div>
    </div>
  );
}
