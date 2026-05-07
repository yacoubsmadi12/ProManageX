import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { MapPin, Users, CheckCircle, Search, Plus } from "lucide-react";
import { useState } from "react";

interface WorkArea {
  id: number;
  name: string;
  location: string;
  supervisorName: string;
  status: string;
  progress: string;
  teamSize: number;
  description: string;
}

export default function WorkAreas() {
  const [search, setSearch] = useState("");

  const { data: areas = [], isLoading } = useQuery<WorkArea[]>({
    queryKey: ["/api/work-areas"],
    queryFn: () => apiFetch("/work-areas"),
  });

  const filtered = areas.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.location?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Area Name" },
    { key: "location", label: "Location" },
    { key: "supervisorName", label: "Supervisor" },
    {
      key: "status", label: "Status",
      render: (r: WorkArea) => <StatusBadge status={r.status} />,
    },
    {
      key: "progress", label: "Progress",
      render: (r: WorkArea) => {
        const pct = parseFloat(r.progress || "0");
        return (
          <div className="flex items-center gap-2 min-w-24">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{ width: `${Math.min(100, pct)}%` }}
              />
            </div>
            <span className="text-xs text-gray-600 shrink-0">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
    { key: "teamSize", label: "Team Size" },
  ];

  const active = areas.filter(a => a.status === "active").length;
  const avgProgress = areas.length > 0
    ? areas.reduce((sum, a) => sum + parseFloat(a.progress || "0"), 0) / areas.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Areas" value={areas.length} icon={MapPin} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatCard title="Active" value={active} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Avg Progress" value={`${avgProgress.toFixed(0)}%`} icon={CheckCircle} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Teams" value={areas.reduce((s, a) => s + (a.teamSize || 0), 0)} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" subtitle="Total workforce" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search work areas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Work Area
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No work areas found" />
      </div>
    </div>
  );
}
