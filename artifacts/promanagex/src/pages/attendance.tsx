import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Clock, CheckCircle, XCircle, AlertCircle, Search } from "lucide-react";
import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AttendanceRecord {
  id: number;
  userName: string;
  workAreaName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: string;
  overtimeHours: string;
}

interface TodayAttendance {
  date: string;
  present: number;
  absent: number;
  late: number;
  onLeave: number;
  total: number;
  attendanceRate: number;
}

interface AttendanceStats {
  presentRate: number;
  absentRate: number;
  lateRate: number;
  overtimeHours: number;
}

export default function Attendance() {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance", dateFilter],
    queryFn: () => apiFetch(`/attendance${dateFilter ? `?date=${dateFilter}` : ""}`),
  });

  const { data: today } = useQuery<TodayAttendance>({
    queryKey: ["/api/attendance/today"],
    queryFn: () => apiFetch("/attendance/today"),
    refetchInterval: 60000,
  });

  const { data: stats } = useQuery<AttendanceStats>({
    queryKey: ["/api/attendance/stats"],
    queryFn: () => apiFetch("/attendance/stats"),
  });

  const filtered = records.filter(r =>
    !search || r.userName?.toLowerCase().includes(search.toLowerCase())
  );

  const pieData = [
    { name: "Present", value: today?.present ?? 0, color: "#22c55e" },
    { name: "Absent", value: today?.absent ?? 0, color: "#ef4444" },
    { name: "Late", value: today?.late ?? 0, color: "#f97316" },
    { name: "On Leave", value: today?.onLeave ?? 0, color: "#a855f7" },
  ].filter(d => d.value > 0);

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "workAreaName", label: "Work Area" },
    { key: "date", label: "Date" },
    {
      key: "checkIn", label: "Check In",
      render: (r: AttendanceRecord) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "-",
    },
    {
      key: "checkOut", label: "Check Out",
      render: (r: AttendanceRecord) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "-",
    },
    {
      key: "status", label: "Status",
      render: (r: AttendanceRecord) => <StatusBadge status={r.status} />,
    },
    {
      key: "overtimeHours", label: "Overtime",
      render: (r: AttendanceRecord) => r.overtimeHours ? `${parseFloat(r.overtimeHours).toFixed(1)}h` : "-",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present Today" value={today?.present ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" subtitle={`${(today?.attendanceRate ?? 0).toFixed(1)}% rate`} />
        <StatCard title="Absent" value={today?.absent ?? 0} icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Late" value={today?.late ?? 0} icon={AlertCircle} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Overtime Hours" value={(stats?.overtimeHours ?? 0).toFixed(0)} icon={Clock} iconColor="text-purple-600" iconBg="bg-purple-50" subtitle="Total this month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Breakdown</h3>
          {pieData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No data for today</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
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
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No attendance records" />
        </div>
      </div>
    </div>
  );
}
