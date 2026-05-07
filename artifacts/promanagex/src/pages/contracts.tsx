import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { FileText, DollarSign, AlertTriangle, Clock, Plus, Search } from "lucide-react";
import { useState } from "react";

interface Contract {
  id: number;
  title: string;
  contractorName: string;
  status: string;
  startDate: string;
  endDate: string;
  value: string;
  paidAmount: string;
}

interface ContractStats {
  total: number;
  active: number;
  expired: number;
  draft: number;
  totalValue: number;
  paidAmount: number;
  expiringThisMonth: number;
}

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts", statusFilter],
    queryFn: () => apiFetch(`/contracts${statusFilter ? `?status=${statusFilter}` : ""}`),
  });

  const { data: stats } = useQuery<ContractStats>({
    queryKey: ["/api/contracts/stats"],
    queryFn: () => apiFetch("/contracts/stats"),
  });

  const filtered = contracts.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.contractorName?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "title", label: "Contract Title" },
    { key: "contractorName", label: "Contractor" },
    {
      key: "status", label: "Status",
      render: (row: Contract) => <StatusBadge status={row.status} />,
    },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    {
      key: "value", label: "Value",
      render: (row: Contract) => (
        <span className="font-semibold">${parseFloat(row.value || "0").toLocaleString()}</span>
      ),
    },
    {
      key: "paidAmount", label: "Paid",
      render: (row: Contract) => (
        <div>
          <div className="text-sm font-medium">${parseFloat(row.paidAmount || "0").toLocaleString()}</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div
              className="bg-blue-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, (parseFloat(row.paidAmount || "0") / Math.max(1, parseFloat(row.value || "1"))) * 100)}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Contracts" value={stats?.total ?? 0} icon={FileText} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Active" value={stats?.active ?? 0} icon={Clock} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard
          title="Total Value"
          value={`$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`}
          icon={DollarSign}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard title="Expiring Soon" value={stats?.expiringThisMonth ?? 0} icon={AlertTriangle} iconColor="text-yellow-600" iconBg="bg-yellow-50" subtitle="Next 30 days" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search contracts..."
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
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No contracts found" />
      </div>
    </div>
  );
}
