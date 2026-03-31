import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM d, yyyy");
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  if (isPast(d)) return `${formatDistanceToNow(d)} ago`;
  return `in ${formatDistanceToNow(d)}`;
}

export function dueDateColor(dueDate: string): string {
  const d = new Date(dueDate);
  if (isPast(d)) return "text-destructive";
  if (isToday(d) || isTomorrow(d)) return "text-orange-500";
  return "text-muted-foreground";
}
