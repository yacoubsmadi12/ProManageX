import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { DataTable } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Modal, FormField, inputCls, selectCls } from "@/components/ui/modal";
import { Clock, CheckCircle, XCircle, AlertCircle, Search, Plus } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
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

interface User { id: string; firstName: string; lastName: string; }
interface WorkArea { id: number; name: string; }

const today = new Date().toISOString().split("T")[0];
const empty = { userId: "", workAreaId: "", date: today, checkIn: "", checkOut: "", status: "present", overtimeHours: "", notes: "" };

export default function Attendance() {
  const [dateFilter, setDateFilter] = useState(today);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(empty);
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: records = [], isLoading } = useQuery<AttendanceRecord[]>({
    queryKey: ["/api/attendance", dateFilter],
    queryFn: () => apiFetch(`/attendance${dateFilter ? `?date=${dateFilter}` : ""}`),
  });

  const { data: todayData } = useQuery<TodayAttendance>({
    queryKey: ["/api/attendance/today"],
    queryFn: () => apiFetch("/attendance/today"),
    refetchInterval: 60000,
  });

  const { data: stats } = useQuery<AttendanceStats>({
    queryKey: ["/api/attendance/stats"],
    queryFn: () => apiFetch("/attendance/stats"),
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiFetch("/users"),
    enabled: showModal,
  });

  const { data: workAreas = [] } = useQuery<WorkArea[]>({
    queryKey: ["/api/work-areas"],
    queryFn: () => apiFetch("/work-areas"),
    enabled: showModal,
  });

  const create = useMutation({
    mutationFn: (data: typeof form) =>
      apiFetch("/attendance", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          workAreaId: data.workAreaId ? parseInt(data.workAreaId) : null,
          checkIn: data.checkIn ? new Date(`${data.date}T${data.checkIn}`).toISOString() : null,
          checkOut: data.checkOut ? new Date(`${data.date}T${data.checkOut}`).toISOString() : null,
          overtimeHours: data.overtimeHours || null,
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/attendance"] });
      toast({ title: "Attendance record added" });
      setShowModal(false);
      setForm(empty);
    },
    onError: () => toast({ title: "Failed to add record", variant: "destructive" }),
  });

  const filtered = records.filter(r => !search || r.userName?.toLowerCase().includes(search.toLowerCase()));
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const pieData = [
    { name: "Present", value: todayData?.present ?? 0, color: "#22c55e" },
    { name: "Absent", value: todayData?.absent ?? 0, color: "#ef4444" },
    { name: "Late", value: todayData?.late ?? 0, color: "#f97316" },
    { name: "On Leave", value: todayData?.onLeave ?? 0, color: "#a855f7" },
  ].filter(d => d.value > 0);

  const columns = [
    { key: "userName", label: "Employee" },
    { key: "workAreaName", label: "Work Area" },
    { key: "date", label: "Date" },
    { key: "checkIn", label: "Check In", render: (r: AttendanceRecord) => r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "—" },
    { key: "checkOut", label: "Check Out", render: (r: AttendanceRecord) => r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "—" },
    { key: "status", label: "Status", render: (r: AttendanceRecord) => <StatusBadge status={r.status} /> },
    { key: "overtimeHours", label: "Overtime", render: (r: AttendanceRecord) => r.overtimeHours ? `${parseFloat(r.overtimeHours).toFixed(1)}h` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Present Today" value={todayData?.present ?? 0} icon={CheckCircle} iconColor="text-green-600" iconBg="bg-green-50" subtitle={`${(todayData?.attendanceRate ?? 0).toFixed(1)}% rate`} />
        <StatCard title="Absent" value={todayData?.absent ?? 0} icon={XCircle} iconColor="text-red-600" iconBg="bg-red-50" />
        <StatCard title="Late" value={todayData?.late ?? 0} icon={AlertCircle} iconColor="text-orange-600" iconBg="bg-orange-50" />
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
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
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
              <input type="text" placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <DataTable data={filtered as Record<string, unknown>[]} columns={columns as never} loading={isLoading} emptyMessage="No attendance records" />
        </div>
      </div>

      <Modal open={showModal} onClose={() => { setShowModal(false); setForm(empty); }} title="Add Attendance Record">
        <form onSubmit={e => { e.preventDefault(); create.mutate(form); }} className="space-y-4">
          <FormField label="Employee" required>
            <select required value={form.userId} onChange={e => set("userId", e.target.value)} className={selectCls}>
              <option value="">— Select Employee —</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
            </select>
          </FormField>
          <FormField label="Work Area">
            <select value={form.workAreaId} onChange={e => set("workAreaId", e.target.value)} className={selectCls}>
              <option value="">— None —</option>
              {workAreas.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date" required>
              <input required type="date" value={form.date} onChange={e => set("date", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Status" required>
              <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="leave">On Leave</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Check In Time">
              <input type="time" value={form.checkIn} onChange={e => set("checkIn", e.target.value)} className={inputCls} />
            </FormField>
            <FormField label="Check Out Time">
              <input type="time" value={form.checkOut} onChange={e => set("checkOut", e.target.value)} className={inputCls} />
            </FormField>
          </div>
          <FormField label="Overtime Hours">
            <input type="number" min="0" step="0.5" value={form.overtimeHours} onChange={e => set("overtimeHours", e.target.value)} className={inputCls} placeholder="0" />
          </FormField>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setForm(empty); }}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={create.isPending}
              className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-60">
              {create.isPending ? "Saving..." : "Save Record"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
