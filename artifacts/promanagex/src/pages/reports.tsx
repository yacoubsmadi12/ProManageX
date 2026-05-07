import { FileBarChart, Download, FileText, Users, Clock, AlertTriangle } from "lucide-react";

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
  { id: "payroll", title: "Payroll Overview", description: "Salary, deductions, and overtime breakdown", icon: FileBarChart, color: "text-green-600", bg: "bg-green-50" },
  { id: "kpi", title: "KPI Report", description: "Employee performance evaluations and department KPIs", icon: FileBarChart, color: "text-yellow-600", bg: "bg-yellow-50" },
  { id: "headcount", title: "Headcount Report", description: "Staff by department, role, and work area", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <div key={t.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${t.bg}`}>
              <t.icon className={`w-5 h-5 ${t.color}`} />
            </div>
            <h3 className="font-semibold text-gray-900">{t.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{t.description}</p>
            <div className="flex gap-2 mt-4">
              <button className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors">
                Generate
              </button>
              <button className="flex items-center gap-1 text-sm border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
