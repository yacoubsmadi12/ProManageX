import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { Briefcase, AlertTriangle, Users, Plus, Search, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Contractor {
  id: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  classification: string;
  status: string;
  blacklisted: boolean;
  performanceScore: string;
  createdAt: string;
}

interface ContractorStats {
  total: number;
  active: number;
  pending: number;
  blacklisted: number;
}

const empty = { name: "", companyName: "", email: "", phone: "", nationalId: "", taxNumber: "", classification: "tier1", status: "active", address: "" };

export default function Contractors() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: contractors = [], isLoading } = useQuery<Contractor[]>({
    queryKey: ["/api/contractors", statusFilter],
    queryFn: () => apiFetch(`/contractors${statusFilter ? `?status=${statusFilter}` : ""}`),
  });

  const { data: stats } = useQuery<ContractorStats>({
    queryKey: ["/api/contractors/stats"],
    queryFn: () => apiFetch("/contractors/stats"),
  });

  const create = useMutation({
    mutationFn: (data: typeof form) => apiFetch("/contractors", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/contractors"] });
      toast({ title: "Contractor added successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to add contractor", variant: "destructive" }),
  });

  const toggleBlacklist = useMutation({
    mutationFn: (c: Contractor) => apiFetch(`/contractors/${c.id}/blacklist`, {
      method: "PATCH",
      body: JSON.stringify({ blacklisted: !c.blacklisted }),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/contractors"] });
      toast({ title: "Contractor updated" });
    },
  });

  const filtered = contractors.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "companyName", label: "Company" },
    { key: "name", label: "Contact Person" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "classification", label: "Classification", render: (row: Contractor) => <StatusBadge status={row.classification} /> },
    { key: "status", label: "Status", render: (row: Contractor) => <StatusBadge status={row.blacklisted ? "blacklisted" : row.status} /> },
    {
      key: "performanceScore", label: "Score",
      render: (row: Contractor) => (
        <span className="font-semibold text-blue-600">
          {row.performanceScore ? `${parseFloat(row.performanceScore).toFixed(1)}%` : "N/A"}
        </span>
      ),
    },
    {
      key: "actions", label: "Actions",
      render: (row: Contractor) => (
        <button
          onClick={() => toggleBlacklist.mutate(row)}
          className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
            row.blacklisted ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
          }`}
        >
          {row.blacklisted ? "Unblacklist" : "Blacklist"}
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Contractors" value={stats?.total ?? 0} icon={Briefcase} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Active" value={stats?.active ?? 0} icon={Users} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Pending" value={stats?.pending ?? 0} icon={RefreshCw} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
        <StatCard title="Blacklisted" value={stats?.blacklisted ?? 0} icon={AlertTriangle} iconColor="text-red-600" iconBg="bg-red-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search contractors..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Contractor
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No contractors found" />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Add New Contractor">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contact Name" required>
              <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} placeholder="John Smith" />
            </FormField>
            <FormField label="Company Name" required>
              <input required value={form.companyName} onChange={e => set("companyName", e.target.value)} className={inputCls} placeholder="Acme Corp" />
            </FormField>
          </div>
          <FormField label="Email" required>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} className={inputCls} placeholder="john@acme.com" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Phone">
              <input value={form.phone} onChange={e => set("phone", e.target.value)} className={inputCls} placeholder="+1 555 000 0000" />
            </FormField>
            <FormField label="National ID">
              <input value={form.nationalId} onChange={e => set("nationalId", e.target.value)} className={inputCls} placeholder="ID Number" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tax Number">
              <input value={form.taxNumber} onChange={e => set("taxNumber", e.target.value)} className={inputCls} placeholder="Tax Number" />
            </FormField>
            <FormField label="Classification">
              <select value={form.classification} onChange={e => set("classification", e.target.value)} className={selectCls}>
                <option value="tier1">Tier 1</option>
                <option value="tier2">Tier 2</option>
                <option value="tier3">Tier 3</option>
                <option value="preferred">Preferred</option>
              </select>
            </FormField>
          </div>
          <FormField label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </FormField>
          <FormField label="Address">
            <input value={form.address} onChange={e => set("address", e.target.value)} className={inputCls} placeholder="123 Main St, City" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Adding..." : "Add Contractor"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
