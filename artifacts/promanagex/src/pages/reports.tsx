import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { FileBarChart, Download, Clock, AlertTriangle, Users, FileText, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportTemplate {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const templates: ReportTemplate[] = [
  { id: "attendance", title: "Attendance Report", description: "Daily/weekly/monthly attendance summary with trends", icon: Clock, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "contractors", title: "Contractor Performance", description: "Performance scores and contract compliance overview", icon: FileText, color: "text-indigo-600", bg: "bg-indigo-50" },
  { id: "violations", title: "Violations Summary", description: "Violation categories, severity, and resolution status", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  { id: "kpi", title: "KPI Report", description: "Employee performance evaluations and department KPIs", icon: FileBarChart, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "headcount", title: "Headcount Report", description: "Staff by department, role, and work area", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "equipment", title: "Equipment Report", description: "Asset inventory, value, and maintenance schedule", icon: FileBarChart, color: "text-green-600", bg: "bg-green-50" },
];

interface SavedReport {
  id: number;
  type: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function Reports() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const { data: savedReports = [], refetch } = useQuery<SavedReport[]>({
    queryKey: ["/api/reports"],
    queryFn: () => apiFetch("/reports"),
  });

  const generate = useMutation({
    mutationFn: (type: string) =>
      apiFetch("/reports", {
        method: "POST",
        body: JSON.stringify({ type, title: templates.find(t => t.id === type)?.title ?? type }),
      }),
    onMutate: (type) => setGenerating(type),
    onSuccess: (_, type) => {
      setGenerating(null);
      setGenerated(prev => new Set([...prev, type]));
      refetch();
      toast({ title: "Report generated", description: "Your report is ready." });
      setTimeout(() => setGenerated(prev => { const s = new Set(prev); s.delete(type); return s; }), 3000);
    },
    onError: () => {
      setGenerating(null);
      toast({ title: "Failed to generate report", variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => {
          const isGenerating = generating === t.id;
          const isDone = generated.has(t.id);
          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${t.bg}`}>
                <t.icon className={`w-5 h-5 ${t.color}`} />
              </div>
              <h3 className="font-semibold text-gray-900">{t.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{t.description}</p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => generate.mutate(t.id)}
                  disabled={isGenerating || isDone}
                  className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all font-medium ${
                    isDone ? "bg-green-600 text-white" :
                    "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-70`}
                >
                  {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isDone ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                  {isGenerating ? "Generating..." : isDone ? "Generated!" : "Generate"}
                </button>
                <button className="flex items-center gap-1 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {savedReports.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Generated Reports</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {savedReports.slice(0, 10).map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileBarChart className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {r.status}
                  </span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
