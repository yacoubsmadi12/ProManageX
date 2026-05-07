import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { AlertTriangle, DollarSign, CheckCircle, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

interface User { id: string; firstName: string; lastName: string; }

const today = new Date().toISOString().split("T")[0];
const empty = { userId: "", category: "safety", severity: "minor", status: "open", date: today, description: "", penalty: "" };

export default function Violations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: violations = [], isLoading } = useQuery<Violation[]>({
    queryKey: ["/api/violations", statusFilter],
    queryFn: () => apiFetch(`/violations${statusFilter ? `?status=${statusFilter}` : ""}`),
  });

  const { data: stats } = useQuery<ViolationStats>({
    queryKey: ["/api/violations/stats"],
    queryFn: () => apiFetch("/violations/stats"),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiFetch("/users"),
    enabled: showModal,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/violations", { method: "POST", body: JSON.stringify({ ...data, penalty: data.penalty || null }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/violations"] });
      toast({ title: "Violation reported successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to report violation", variant: "destructive" }),
  });

  const filtered = violations.filter(v =>
    !search || v.userName?.toLowerCase().includes(search.toLowerCase()) ||
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "category", label: "Category" },
    { key: "severity", label: "Severity", render: (r: Violation) => <StatusBadge status={r.severity} /> },
    { key: "status", label: "Status", render: (r: Violation) => <StatusBadge status={r.status} /> },
    { key: "date", label: "Date" },
    { key: "penalty", label: "Penalty", render: (r: Violation) => r.penalty ? `$${parseFloat(r.penalty).toLocaleString()}` : "—" },
    { key: "description", label: "Description", className: "max-w-48 truncate" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Violations" value={stats?.total ?? 0} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Open" value={stats?.open ?? 0} icon={AlertTriangle} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Resolved" value={stats?.resolved ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Total Penalties" value={`$${(stats?.totalPenalties ?? 0).toLocaleString()}`} icon={DollarSign} iconColor="text-purple-600" iconBg="bg-purple-50" />
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
              <input type="text" placeholder="Search violations..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Status</option>
              <option value="open">Open</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Report
            </button>
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No violations found" />
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Report Violation">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Employee">
            <select value={form.userId} onChange={e => set("userId", e.target.value)} className={selectCls}>
              <option value="">— Select Employee —</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Category" required>
              <select value={form.category} onChange={e => set("category", e.target.value)} className={selectCls}>
                <option value="safety">Safety</option>
                <option value="attendance">Attendance</option>
                <option value="conduct">Conduct</option>
                <option value="quality">Quality</option>
                <option value="policy">Policy</option>
              </select>
            </FormField>
            <FormField label="Severity" required>
              <select value={form.severity} onChange={e => set("severity", e.target.value)} className={selectCls}>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="major">Major</option>
                <option value="critical">Critical</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input required type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Penalty ($)">
              <input type="number" min="0" step="0.01" value={form.penalty} onChange={e => set("penalty", e.target.value)} className={inputCls} placeholder="0.00" />
            </FormField>
          </div>
          <FormField label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </FormField>
          <FormField label="Description" required>
            <textarea required value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Describe the violation in detail..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Reporting..." : "Report Violation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
