import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Package, CheckCircle, Wrench, DollarSign, Search, Plus } from "lucide-react";
import { useState } from "react";

interface Equipment {
  id: number;
  name: string;
  serialNumber: string;
  type: string;
  status: string;
  condition: string;
  workAreaName: string;
  value: string;
  nextMaintenanceDate: string;
}

interface EquipmentStats {
  total: number;
  available: number;
  maintenance: number;
  totalValue: number;
}

export default function Equipment() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: ["/api/equipment", typeFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (typeFilter) params.set("type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      return apiFetch(`/equipment${params.size > 0 ? `?${params}` : ""}`);
    },
  });

  const { data: stats } = useQuery<EquipmentStats>({
    queryKey: ["/api/equipment/stats"],
    queryFn: () => apiFetch("/equipment/stats"),
  });

  const filtered = equipment.filter(e =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "name", label: "Equipment Name" },
    { key: "serialNumber", label: "Serial No." },
    { key: "type", label: "Type" },
    {
      key: "status", label: "Status",
      render: (r: Equipment) => <StatusBadge status={r.status} />,
    },
    {
      key: "condition", label: "Condition",
      render: (r: Equipment) => <StatusBadge status={r.condition} />,
    },
    { key: "workAreaName", label: "Location" },
    {
      key: "value", label: "Value",
      render: (r: Equipment) => r.value ? `$${parseFloat(r.value).toLocaleString()}` : "-",
    },
    {
      key: "nextMaintenanceDate", label: "Next Maintenance",
      render: (r: Equipment) => r.nextMaintenanceDate || "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Equipment" value={stats?.total ?? 0} icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Available" value={stats?.available ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="In Maintenance" value={stats?.maintenance ?? 0} icon={Wrench} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard
          title="Total Value"
          value={`$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search equipment..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="machinery">Machinery</option>
            <option value="vehicle">Vehicle</option>
            <option value="tool">Tool</option>
            <option value="it_equipment">IT Equipment</option>
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No equipment found" />
      </div>
    </div>
  );
}
