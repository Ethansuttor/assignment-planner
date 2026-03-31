"use client";

import Link from "next/link";
import { Assignment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate, formatRelative, dueDateColor, cn } from "@/lib/utils";
import { Clock, Calendar, BookOpen } from "lucide-react";

const difficultyVariant = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const;

const statusLabel = {
  pending: "Not started",
  in_progress: "In progress",
  complete: "Complete",
} as const;

export default function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const completedSubtasks = assignment.subtasks.filter((s) => s.done).length;
  const totalSubtasks = assignment.subtasks.length;
  const progress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

  return (
    <Link href={`/assignment/${assignment.id}`}>
      <Card className={cn("hover:shadow-md transition-shadow cursor-pointer", assignment.status === "complete" && "opacity-60")}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base leading-tight">{assignment.title}</CardTitle>
            {assignment.difficulty && (
              <Badge variant={difficultyVariant[assignment.difficulty]} className="shrink-0 capitalize">
                {assignment.difficulty}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5" />
            <span>{assignment.course}</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className={cn("flex items-center gap-1", dueDateColor(assignment.due_date))}>
              <Calendar className="h-3.5 w-3.5" />
              <span>Due {formatRelative(assignment.due_date)}</span>
            </div>
            {assignment.time_estimate_hours && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{assignment.time_estimate_hours}h</span>
              </div>
            )}
          </div>
          {totalSubtasks > 0 && (
            <div className="space-y-1">
              <Progress value={progress} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{completedSubtasks}/{totalSubtasks} steps · {statusLabel[assignment.status]}</p>
            </div>
          )}
          {assignment.suggested_start_date && assignment.status === "pending" && (
            <p className="text-xs text-muted-foreground">
              Start by {formatDate(assignment.suggested_start_date)}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
