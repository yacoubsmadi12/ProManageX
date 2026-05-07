import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { Package, CheckCircle, Wrench, DollarSign, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface WorkArea { id: number; name: string; }

const empty = { name: "", serialNumber: "", type: "machinery", status: "available", condition: "good", value: "", nextMaintenanceDate: "", notes: "" };

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

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

  const { data: workAreas = [] } = useQuery<WorkArea[]>({
    queryKey: ["/api/work-areas"],
    queryFn: () => apiFetch("/work-areas"),
    enabled: showModal,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/equipment", { method: "POST", body: JSON.stringify({ ...data, value: data.value || null, nextMaintenanceDate: data.nextMaintenanceDate || null }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Equipment added successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to add equipment", variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiFetch(`/equipment/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/equipment"] });
      toast({ title: "Equipment removed" });
    },
  });

  const filtered = equipment.filter(e => !search || e.name?.toLowerCase().includes(search.toLowerCase()));
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "name", label: "Equipment Name" },
    { key: "serialNumber", label: "Serial No." },
    { key: "type", label: "Type" },
    { key: "status", label: "Status", render: (r: Equipment) => <StatusBadge status={r.status} /> },
    { key: "condition", label: "Condition", render: (r: Equipment) => <StatusBadge status={r.condition} /> },
    { key: "workAreaName", label: "Location" },
    { key: "value", label: "Value", render: (r: Equipment) => r.value ? `$${parseFloat(r.value).toLocaleString()}` : "—" },
    { key: "nextMaintenanceDate", label: "Next Maintenance", render: (r: Equipment) => r.nextMaintenanceDate || "—" },
    {
      key: "actions", label: "",
      render: (r: Equipment) => (
        <button
          onClick={() => { if (confirm("Remove this equipment?")) remove.mutate(r.id); }}
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
        <StatCard title="Total Equipment" value={stats?.total ?? 0} icon={Package} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Available" value={stats?.available ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="In Maintenance" value={stats?.maintenance ?? 0} icon={Wrench} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Total Value" value={`$${((stats?.totalValue ?? 0) / 1000).toFixed(0)}K`} icon={DollarSign} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4 flex-wrap">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search equipment..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            <option value="machinery">Machinery</option>
            <option value="vehicle">Vehicle</option>
            <option value="tool">Tool</option>
            <option value="it_equipment">IT Equipment</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>
        <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No equipment found" />
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Add Equipment" size="lg">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Equipment Name" required>
            <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} placeholder="Excavator CAT 320" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Serial Number">
              <input value={form.serialNumber} onChange={e => set("serialNumber", e.target.value)} className={inputCls} placeholder="SN-0001234" />
            </FormField>
            <FormField label="Type">
              <select value={form.type} onChange={e => set("type", e.target.value)} className={selectCls}>
                <option value="machinery">Machinery</option>
                <option value="vehicle">Vehicle</option>
                <option value="tool">Tool</option>
                <option value="it_equipment">IT Equipment</option>
                <option value="furniture">Furniture</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Status">
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="maintenance">Maintenance</option>
                <option value="scrapped">Scrapped</option>
              </select>
            </FormField>
            <FormField label="Condition">
              <select value={form.condition} onChange={e => set("condition", e.target.value)} className={selectCls}>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Value ($)">
              <input type="number" min="0" step="0.01" value={form.value} onChange={e => set("value", e.target.value)} className={inputCls} placeholder="25000" />
            </FormField>
            <FormField label="Work Area">
              <select onChange={e => setForm(p => ({ ...p, workAreaId: e.target.value }))} className={selectCls}>
                <option value="">— None —</option>
                {workAreas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Next Maintenance Date">
            <input type="date" value={form.nextMaintenanceDate} onChange={e => set("nextMaintenanceDate", e.target.value)} className={inputCls} />
          </FormField>
          <FormField label="Notes">
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} className={`${inputCls} resize-none`} rows={2} placeholder="Additional notes..." />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Adding..." : "Add Equipment"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
