import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Star, TrendingUp, Award, ClipboardList, Search } from "lucide-react";
import { useState } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

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
  trend: string;
}

interface KpiDashboard {
  averageKpi: number;
  topPerformers: number;
  totalEvaluations: number;
  pendingEvaluations: number;
}

export default function Evaluations() {
  const [search, setSearch] = useState("");

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

  const filtered = evaluations.filter(e =>
    !search || e.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "period", label: "Period" },
    {
      key: "kpiScore", label: "KPI",
      render: (e: Evaluation) => <ScoreChip value={e.kpiScore} />,
    },
    {
      key: "attendanceScore", label: "Attendance",
      render: (e: Evaluation) => <ScoreChip value={e.attendanceScore} />,
    },
    {
      key: "qualityScore", label: "Quality",
      render: (e: Evaluation) => <ScoreChip value={e.qualityScore} />,
    },
    {
      key: "overallScore", label: "Overall",
      render: (e: Evaluation) => (
        <span className="font-bold text-blue-700 text-sm">
          {parseFloat(e.overallScore || "0").toFixed(1)}%
        </span>
      ),
    },
    {
      key: "status", label: "Status",
      render: (e: Evaluation) => <StatusBadge status={e.status} />,
    },
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
              <input
                type="text"
                placeholder="Search employee..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No evaluations found" />
        </div>
      </div>
    </div>
  );
}

function ScoreChip({ value }: { value: string }) {
  const num = parseFloat(value || "0");
  const color = num >= 80 ? "text-green-600 bg-green-50" : num >= 60 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {num.toFixed(1)}
    </span>
  );
}
