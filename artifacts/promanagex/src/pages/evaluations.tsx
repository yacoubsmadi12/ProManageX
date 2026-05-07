import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { Star, TrendingUp, Award, ClipboardList, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Evaluation {
  id: number;
  userName: string;
  period: string;
  kpiScore: string;
  attendanceScore: string;
  qualityScore: string;
  punctualityScore: string;
  overallScore: string;
  status: string;
}

interface Ranking {
  userId: number;
  userName: string;
  averageScore: number;
  rank: number;
}

interface KpiDashboard {
  averageKpi: number;
  topPerformers: number;
  totalEvaluations: number;
  pendingEvaluations: number;
}

interface User { id: string; firstName: string; lastName: string; }

const currentPeriod = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;
const empty = { userId: "", period: currentPeriod, kpiScore: "", attendanceScore: "", qualityScore: "", punctualityScore: "", overallScore: "", status: "draft", comments: "" };

export default function Evaluations() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: evaluations = [], isLoading } = useQuery<Evaluation[]>({
    queryKey: ["/api/evaluations"],
    queryFn: () => apiFetch("/evaluations"),
  });

  const { data: rankings = [] } = useQuery<Ranking[]>({
    queryKey: ["/api/evaluations/rankings"],
    queryFn: () => apiFetch("/evaluations/rankings"),
  });

  const { data: kpiData } = useQuery<KpiDashboard>({
    queryKey: ["/api/evaluations/kpi-dashboard"],
    queryFn: () => apiFetch("/evaluations/kpi-dashboard"),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiFetch("/users"),
    enabled: showModal,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) => {
      const scores = [data.kpiScore, data.attendanceScore, data.qualityScore, data.punctualityScore]
        .map(s => parseFloat(s) || 0);
      const overall = data.overallScore || (scores.reduce((a, b) => a + b, 0) / 4).toFixed(2);
      return apiFetch("/evaluations", {
        method: "POST",
        body: JSON.stringify({ ...data, overallScore: overall }),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/evaluations"] });
      toast({ title: "Evaluation created successfully" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to create evaluation", variant: "destructive" }),
  });

  const filtered = evaluations.filter(e =>
    !search || e.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "period", label: "Period" },
    { key: "kpiScore", label: "KPI", render: (e: Evaluation) => <ScoreChip value={e.kpiScore} /> },
    { key: "attendanceScore", label: "Attendance", render: (e: Evaluation) => <ScoreChip value={e.attendanceScore} /> },
    { key: "qualityScore", label: "Quality", render: (e: Evaluation) => <ScoreChip value={e.qualityScore} /> },
    {
      key: "overallScore", label: "Overall",
      render: (e: Evaluation) => (
        <span className="font-bold text-blue-700 text-sm">{parseFloat(e.overallScore || "0").toFixed(1)}%</span>
      ),
    },
    { key: "status", label: "Status", render: (e: Evaluation) => <StatusBadge status={e.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg KPI Score" value={`${(kpiData?.averageKpi ?? 0).toFixed(1)}%`} icon={Star} iconColor="text-yellow-600" iconBg="bg-yellow-50" />
        <StatCard title="Top Performers" value={kpiData?.topPerformers ?? 0} icon={Award} iconColor="text-green-600" iconBg="bg-green-50" subtitle="Score ≥ 80%" />
        <StatCard title="Total Evaluations" value={kpiData?.totalEvaluations ?? 0} icon={ClipboardList} iconColor="text-blue-600" iconBg="bg-blue-50" />
        <StatCard title="Pending" value={kpiData?.pendingEvaluations ?? 0} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Top Rankings</h3>
          {rankings.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">No evaluations yet</div>
          ) : (
            <div className="space-y-3">
              {rankings.slice(0, 8).map((r) => (
                <div key={r.userId} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                      r.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                      r.rank === 2 ? "bg-gray-200 text-gray-700" :
                      r.rank === 3 ? "bg-orange-100 text-orange-700" :
                      "bg-blue-50 text-blue-600"
                    }`}>{r.rank}</span>
                    <span className="text-sm text-gray-700 truncate max-w-28">{r.userName}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">{r.averageScore.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> New Evaluation
            </button>
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No evaluations found" />
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="New Evaluation" size="lg">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Employee" required>
            <select required value={form.userId} onChange={e => set("userId", e.target.value)} className={selectCls}>
              <option value="">— Select Employee —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </FormField>
          <FormField label="Evaluation Period" required>
            <input required value={form.period} onChange={e => set("period", e.target.value)} className={inputCls} placeholder="2025-Q1" />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="KPI Score (0–100)">
              <input type="number" min="0" max="100" step="0.1" value={form.kpiScore} onChange={e => set("kpiScore", e.target.value)} className={inputCls} placeholder="85" />
            </FormField>
            <FormField label="Attendance Score (0–100)">
              <input type="number" min="0" max="100" step="0.1" value={form.attendanceScore} onChange={e => set("attendanceScore", e.target.value)} className={inputCls} placeholder="90" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Quality Score (0–100)">
              <input type="number" min="0" max="100" step="0.1" value={form.qualityScore} onChange={e => set("qualityScore", e.target.value)} className={inputCls} placeholder="80" />
            </FormField>
            <FormField label="Punctuality Score (0–100)">
              <input type="number" min="0" max="100" step="0.1" value={form.punctualityScore} onChange={e => set("punctualityScore", e.target.value)} className={inputCls} placeholder="95" />
            </FormField>
          </div>
          <FormField label="Status">
            <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
            </select>
          </FormField>
          <FormField label="Comments">
            <textarea value={form.comments} onChange={e => set("comments", e.target.value)} className={`${inputCls} resize-none`} rows={3} placeholder="Evaluator comments and notes..." />
          </FormField>
          <p className="text-xs text-gray-400">Overall score will be automatically calculated as the average of all scores if not specified.</p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Creating..." : "Create Evaluation"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function ScoreChip({ value }: { value: string }) {
  const num = parseFloat(value || "0");
  const color = num >= 80 ? "text-green-600 bg-green-50" : num >= 60 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50";
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>{num.toFixed(1)}</span>;
}
