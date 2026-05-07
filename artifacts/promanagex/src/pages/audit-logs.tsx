import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { ScrollText, Search } from "lucide-react";
import { useState } from "react";

interface AuditLog {
  id: number;
  userId: number;
  action: string;
  entity: string;
  entityId: number;
  details: string;
  ipAddress: string;
  createdAt: string;
}

const actionColor: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
};

export default function AuditLogs() {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/audit-logs"],
    queryFn: () => apiFetch("/audit-logs?limit=200"),
  });

  const filtered = logs.filter(l =>
    !search ||
    l.action?.toLowerCase().includes(search.toLowerCase()) ||
    l.entity?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      key: "action", label: "Action",
      render: (r: AuditLog) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${actionColor[r.action] || "bg-gray-100 text-gray-600"}`}>
          {r.action}
        </span>
      ),
    },
    { key: "entity", label: "Entity" },
    { key: "entityId", label: "Entity ID" },
    { key: "details", label: "Details", className: "max-w-64 truncate" },
    { key: "ipAddress", label: "IP Address" },
    {
      key: "createdAt", label: "Timestamp",
      render: (r: AuditLog) => new Date(r.createdAt).toLocaleString(),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-700">{logs.length} log entries</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No audit logs found" />
      </div>
    </div>
  );
}
