import { useState } from "react";
import { User, Bell, Shield, Database, Globe, Save, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { toast } = useToast();
  const [profile, setProfile] = useState({ firstName: "Admin", lastName: "User", email: "admin@company.com", phone: "", department: "", timezone: "UTC" });
  const [notifications, setNotifications] = useState({ contractExpiry: true, violations: true, attendance: false, reports: true, emailDigest: true });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast({ title: "Settings saved", description: "Your preferences have been updated." });
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Profile Settings</h2>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[
            { label: "First Name", key: "firstName" as const },
            { label: "Last Name", key: "lastName" as const },
            { label: "Email Address", key: "email" as const },
            { label: "Phone Number", key: "phone" as const },
            { label: "Department", key: "department" as const },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
              <input
                value={profile[key]}
                onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Timezone</label>
            <select
              value={profile.timezone}
              onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Asia/Dubai">Dubai (GST)</option>
              <option value="Asia/Riyadh">Riyadh (AST)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Bell className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Notification Preferences</h2>
        </div>
        <div className="p-6 divide-y divide-gray-50">
          {[
            { key: "contractExpiry" as const, label: "Contract Expiry Alerts", desc: "Get notified 30 days before contracts expire" },
            { key: "violations" as const, label: "New Violations", desc: "Be alerted when a new violation is reported" },
            { key: "attendance" as const, label: "Daily Attendance Summary", desc: "Receive an attendance overview every morning" },
            { key: "reports" as const, label: "Report Completion", desc: "Notification when a report is ready" },
            { key: "emailDigest" as const, label: "Weekly Email Digest", desc: "Weekly summary of key metrics via email" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))}
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${notifications[key] ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications[key] ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Security</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Two-Factor Authentication</p>
              <p className="text-xs text-gray-400 mt-0.5">Add an extra layer of security to your account</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Managed by Replit</span>
          </div>
          <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Active Sessions</p>
              <p className="text-xs text-gray-400 mt-0.5">View and manage your active login sessions</p>
            </div>
            <button className="text-xs text-blue-600 font-medium hover:text-blue-700">View Sessions</button>
          </div>
          <div className="flex items-center justify-between py-3 border border-gray-100 rounded-xl px-4">
            <div>
              <p className="text-sm font-medium text-gray-800">Sign Out of All Devices</p>
              <p className="text-xs text-gray-400 mt-0.5">Revoke access on all other devices immediately</p>
            </div>
            <a href="/api/logout" className="text-xs text-red-600 font-medium hover:text-red-700">Sign Out All</a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800">System Information</h2>
        </div>
        <div className="p-6 grid grid-cols-2 gap-4">
          {[
            { label: "Platform Version", value: "v2.4.0" },
            { label: "Database", value: "PostgreSQL 15" },
            { label: "Environment", value: "Production" },
            { label: "Last Updated", value: new Date().toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-400 font-medium">{label}</p>
              <p className="text-sm text-gray-800 font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${saved ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
