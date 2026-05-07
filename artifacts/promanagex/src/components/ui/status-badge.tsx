import { cn } from "@/lib/utils";

const colorMap: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  pending: "bg-yellow-100 text-yellow-700",
  suspended: "bg-red-100 text-red-700",
  blacklisted: "bg-red-100 text-red-700",
  open: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-100 text-gray-600",
  draft: "bg-purple-100 text-purple-700",
  expired: "bg-red-100 text-red-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-orange-100 text-orange-700",
  leave: "bg-purple-100 text-purple-700",
  available: "bg-green-100 text-green-700",
  assigned: "bg-blue-100 text-blue-700",
  maintenance: "bg-orange-100 text-orange-700",
  scrapped: "bg-gray-100 text-gray-600",
  minor: "bg-yellow-100 text-yellow-700",
  moderate: "bg-orange-100 text-orange-700",
  major: "bg-red-100 text-red-700",
  critical: "bg-red-200 text-red-800",
  good: "bg-green-100 text-green-700",
  fair: "bg-yellow-100 text-yellow-700",
  poor: "bg-red-100 text-red-700",
  tier1: "bg-blue-100 text-blue-700",
  tier2: "bg-indigo-100 text-indigo-700",
  tier3: "bg-purple-100 text-purple-700",
  preferred: "bg-green-100 text-green-700",
  employee: "bg-gray-100 text-gray-700",
  manager: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  supervisor: "bg-indigo-100 text-indigo-700",
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = colorMap[status?.toLowerCase()] || "bg-gray-100 text-gray-600";
  return (
    <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium capitalize", colorClass)}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}
