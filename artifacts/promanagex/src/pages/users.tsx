import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { Users, ShieldCheck, UserCheck, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

const empty = { firstName: "", lastName: "", email: "", phone: "", role: "employee", department: "", status: "active" };

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", roleFilter],
    queryFn: () => apiFetch(`/users${roleFilter ? `?role=${roleFilter}` : ""}`),
  });

  const createUser = useMutation({
    mutationFn: (data: typeof form) => apiFetch("/users", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User created successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to create user", variant: "destructive" }),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => apiFetch(`/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/users"] });
      toast({ title: "User deleted" });
    },
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
            {u.firstName?.[0] || "?"}
          </div>
          <span>{[u.firstName, u.lastName].filter(Boolean).join(" ") || "—"}</span>
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "role", label: "Role", render: (u: User) => <StatusBadge status={u.role} /> },
    { key: "department", label: "Department" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status", render: (u: User) => <StatusBadge status={u.status} /> },
    {
      key: "createdAt", label: "Joined",
      render: (u: User) => new Date(u.createdAt).toLocaleDateString(),
    },
    {
      key: "actions", label: "",
      render: (u: User) => (
        <button
          onClick={() => { if (confirm("Delete this user?")) deleteUser.mutate(u.id); }}
          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      ),
    },
  ];

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

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
            <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="supervisor">Supervisor</option>
            <option value="employee">Employee</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No users found" />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Add New User">
        <form onSubmit={e => { e.preventDefault(); createUser.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="First Name" required>
              <input required value={form.firstName} onChange={e => set("firstName", e.target.value)} className={inputCls} placeholder="John" />
            </FormField>
            <FormField label="Last Name" required>
              <input required value={form.lastName} onChange={e => set("lastName", e.target.value)} className={inputCls} placeholder="Smith" />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} placeholder="john@company.com" />
          </FormField>
          <FormField label="Phone">
            <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} placeholder="+1 555 000 0000" />
          </FormField>
          <FormField label="Department">
            <input value={form.department} onChange={e => set("department", e.target.value)} className={inputCls} placeholder="Engineering" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Role">
              <select value={form.role} onChange={e => set("role", e.target.value)} className={selectCls}>
                <option value="employee">Employee</option>
                <option value="supervisor">Supervisor</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </FormField>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createUser.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {createUser.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
