import { Assignment } from "@/types";
import { isThisWeek, parseISO } from "date-fns";

export default function WorkloadBanner({ assignments }: { assignments: Assignment[] }) {
  const thisWeek = assignments.filter(
    (a) => a.status !== "complete" && isThisWeek(parseISO(a.due_date), { weekStartsOn: 1 })
  );

  const totalHours = thisWeek.reduce((sum, a) => sum + (a.time_estimate_hours ?? 0), 0);

  if (thisWeek.length === 0) return null;

  const intensity =
    totalHours <= 5 ? "light" : totalHours <= 12 ? "moderate" : "heavy";
  const colors = {
    light: "bg-green-50 border-green-200 text-green-800",
    moderate: "bg-orange-50 border-orange-200 text-orange-800",
    heavy: "bg-red-50 border-red-200 text-red-800",
  };

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${colors[intensity]}`}>
      <strong>This week:</strong> {thisWeek.length} assignment{thisWeek.length !== 1 ? "s" : ""} · ~{totalHours.toFixed(1)}h of work
    </div>
  );
}
