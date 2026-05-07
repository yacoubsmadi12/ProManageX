import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { MapPin, Users, CheckCircle, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

const empty = { name: "", location: "", description: "", status: "active", progress: "0", teamSize: "" };

export default function WorkAreas() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: areas = [], isLoading } = useQuery<WorkArea[]>({
    queryKey: ["/api/work-areas"],
    queryFn: () => apiFetch("/work-areas"),
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/work-areas", { method: "POST", body: JSON.stringify({ ...data, teamSize: data.teamSize ? parseInt(data.teamSize) : 0, progress: data.progress || "0" }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/work-areas"] });
      toast({ title: "Work area created successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to create work area", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/work-areas/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/work-areas"] });
      toast({ title: "Work area removed" });
    },
  });

  const filtered = areas.filter(a =>
    !search || a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.location?.toLowerCase().includes(search.toLowerCase())
  );

  const active = areas.filter(a => a.status === "active").length;
  const avgProgress = areas.length > 0
    ? areas.reduce((sum, a) => sum + parseFloat(a.progress || "0"), 0) / areas.length
    : 0;

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "name", label: "Area Name" },
    { key: "location", label: "Location" },
    { key: "supervisorName", label: "Supervisor" },
    { key: "status", label: "Status", render: (r: WorkArea) => <StatusBadge status={r.status} /> },
    {
      key: "progress", label: "Progress",
      render: (r: WorkArea) => {
        const pct = parseFloat(r.progress || "0");
        return (
          <div className="flex items-center gap-2 min-w-24">
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${Math.min(100, pct)}%` }} />
            </div>
            <span className="text-xs text-gray-600 shrink-0">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
    { key: "teamSize", label: "Team Size" },
    {
      key: "actions", label: "",
      render: (r: WorkArea) => (
        <button
          onClick={() => { if (confirm("Remove this work area?")) remove.mutate(r.id); }}
          className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
        >
          Remove
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Areas" value={areas.length} icon={MapPin} iconColor="text-teal-600" iconBg="bg-teal-50" />
        <StatCard title="Active" value={active} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Avg Progress" value={`${avgProgress.toFixed(0)}%`} icon={CheckCircle} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Total Workforce" value={areas.reduce((s, a) => s + (a.teamSize || 0), 0)} icon={Users} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search work areas..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Work Area
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No work areas found" />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Add Work Area">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Area Name" required>
            <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} placeholder="Site A — Block 3" />
          </FormField>
          <FormField label="Location" required>
            <input required value={form.location} onChange={e => set("location", e.target.value)} className={inputCls} placeholder="123 Industrial Zone, City" />
          </FormField>
          <FormField label="Description">
            <textarea value={form.description} onChange={e => set("description", e.target.value)} className={`${inputCls} resize-none`} rows={2} placeholder="Brief description of this work area..." />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </FormField>
            <FormField label="Team Size">
              <input type="number" min="0" value={form.teamSize} onChange={e => set("teamSize", e.target.value)} className={inputCls} placeholder="10" />
            </FormField>
          </div>
          <FormField label="Progress (%)">
            <input type="number" min="0" max="100" value={form.progress} onChange={e => set("progress", e.target.value)} className={inputCls} placeholder="0" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Creating..." : "Add Work Area"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
