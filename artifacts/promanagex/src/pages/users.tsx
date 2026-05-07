import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Users, ShieldCheck, UserCheck, Search, Plus } from "lucide-react";
import { useState } from "react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", roleFilter],
    queryFn: () => apiFetch(`/users${roleFilter ? `?role=${roleFilter}` : ""}`),
  });

  const filtered = users.filter(u =>
    !search ||
    u.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === "admin").length;
  const activeCount = users.filter(u => u.status === "active").length;

  const columns = [
    {
      key: "name", label: "Name",
      render: (u: User) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
            {(u.firstName?.[0] || "?")}
          </div>
          <span>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    {
      key: "role", label: "Role",
      render: (u: User) => <StatusBadge status={u.role} />,
    },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone" },
    {
      key: "status", label: "Status",
      render: (u: User) => <StatusBadge status={u.status} />,
    },
    {
      key: "createdAt", label: "Joined",
      render: (u: User) => new Date(u.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={users.length} icon={Users} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Active" value={activeCount} icon={UserCheck} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Admins" value={adminCount} icon={ShieldCheck} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard title="Departments" value={new Set(users.map(u => u.department).filter(Boolean)).size} icon={Users} iconColor="text-indigo-600" iconBg="bg-indigo-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No users found" />
      </div>
    </div>
  );
}
