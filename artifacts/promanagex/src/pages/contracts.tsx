import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { FileText, DollarSign, AlertTriangle, Clock, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface Contractor { id: number; name: string; companyName: string; }

const today = new Date().toISOString().split("T")[0];
const empty = { title: "", contractorId: "", status: "draft", startDate: today, endDate: "", value: "", description: "" };

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: contracts = [], isLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts", statusFilter],
    queryFn: () => apiFetch(`/contracts${statusFilter ? `?status=${statusFilter}` : ""}`),
  });

  const { data: stats } = useQuery<ContractStats>({
    queryKey: ["/api/contracts/stats"],
    queryFn: () => apiFetch("/contracts/stats"),
  });

  const { data: contractors = [] } = useQuery<Contractor[]>({
    queryKey: ["/api/contractors"],
    queryFn: () => apiFetch("/contractors"),
    enabled: showModal,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/contracts", { method: "POST", body: JSON.stringify({ ...data, contractorId: data.contractorId ? parseInt(data.contractorId) : null }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({ title: "Contract created successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to create contract", variant: "destructive" }),
  });

  const filtered = contracts.filter(c =>
    !search || c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.contractorName?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "title", label: "Contract Title" },
    { key: "contractorName", label: "Contractor" },
    { key: "status", label: "Status", render: (row: Contract) => <StatusBadge status={row.status} /> },
    { key: "startDate", label: "Start Date" },
    { key: "endDate", label: "End Date" },
    {
      key: "value", label: "Value",
      render: (row: Contract) => <span className="font-semibold">${parseFloat(row.value || "0").toLocaleString()}</span>,
    },
    {
      key: "paidAmount", label: "Paid",
      render: (row: Contract) => (
        <div>
          <div className="text-sm font-medium">${parseFloat(row.paidAmount || "0").toLocaleString()}</div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (parseFloat(row.paidAmount || "0") / Math.max(1, parseFloat(row.value || "1"))) * 100)}%` }} />
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
        <StatCard title="Total Value" value={`$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`} icon={DollarSign} iconColor="text-purple-600" iconBg="bg-purple-50" />
        <StatCard title="Expiring Soon" value={stats?.expiringThisMonth ?? 0} icon={AlertTriangle} iconColor="text-yellow-600" iconBg="bg-yellow-50" subtitle="Next 30 days" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search contracts..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="expired">Expired</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No contracts found" />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="New Contract" size="lg">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Contract Title" required>
            <input required value={form.title} onChange={e => set("title", e.target.value)} className={inputCls} placeholder="e.g. Construction Services Q1 2025" />
          </FormField>
          <FormField label="Contractor">
            <select value={form.contractorId} onChange={e => set("contractorId", e.target.value)} className={selectCls}>
              <option value="">— Select Contractor —</option>
              {contractors.map(c => (
                <option key={c.id} value={c.id}>{c.companyName} ({c.name})</option>
              ))}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Start Date" required>
              <input required type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="End Date" required>
              <input required type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Contract Value ($)">
              <input type="number" min="0" step="0.01" value={form.value} onChange={e => set("value", e.target.value)} className={inputCls} placeholder="50000" />
            </FormField>
            <FormField label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="terminated">Terminated</option>
              </select>
            </FormField>
          </div>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Contract scope and details..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Creating..." : "Create Contract"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
