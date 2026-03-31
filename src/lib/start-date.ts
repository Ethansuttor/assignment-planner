import { subDays } from "date-fns";

export function calcStartDate(dueDate: Date | string, hours: number): Date {
  const due = typeof dueDate === "string" ? new Date(dueDate) : dueDate;
  const days = hours <= 2 ? 1 : hours <= 5 ? 2 : hours <= 10 ? 4 : 7;
  return subDays(due, days);
}
