"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Nav from "@/components/nav";
import SubtaskChecklist from "@/components/subtask-checklist";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatRelative, dueDateColor } from "@/lib/utils";
import { Clock, Calendar, BookOpen, CheckCircle2, Trash2, ArrowLeft } from "lucide-react";
import type { Assignment } from "@/types";
import Link from "next/link";

const difficultyVariant = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
} as const;

export default function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/assignments/${id}`)
      .then((r) => r.json())
      .then((d) => setAssignment(d.assignment))
      .finally(() => setLoading(false));
  }, [id]);

  async function markComplete() {
    if (!assignment) return;
    setUpdating(true);
    const res = await fetch(`/api/assignments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: assignment.status === "complete" ? "pending" : "complete" }),
    });
    const data = await res.json();
    setAssignment(data.assignment);
    setUpdating(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this assignment?")) return;
    await fetch("/api/assignments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </main>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-background">
        <Nav />
        <main className="max-w-2xl mx-auto px-4 py-6">
          <p className="text-muted-foreground">Assignment not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        <Link href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold leading-tight">{assignment.title}</h1>
          {assignment.difficulty && (
            <Badge variant={difficultyVariant[assignment.difficulty]} className="capitalize shrink-0">
              {assignment.difficulty}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            {assignment.course}
          </div>
          <div className={`flex items-center gap-1.5 ${dueDateColor(assignment.due_date)}`}>
            <Calendar className="h-4 w-4" />
            Due {formatRelative(assignment.due_date)} ({formatDate(assignment.due_date)})
          </div>
          {assignment.time_estimate_hours && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="h-4 w-4" />
              ~{assignment.time_estimate_hours}h estimated
            </div>
          )}
        </div>

        {assignment.suggested_start_date && (
          <p className="text-sm text-muted-foreground">
            Suggested start: <strong>{formatDate(assignment.suggested_start_date)}</strong>
          </p>
        )}

        {assignment.summary && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{assignment.summary}</p>
            </CardContent>
          </Card>
        )}

        {assignment.subtasks.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <SubtaskChecklist
                assignmentId={assignment.id}
                initialSubtasks={assignment.subtasks}
                onUpdate={(subtasks) => setAssignment({ ...assignment, subtasks })}
              />
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            onClick={markComplete}
            disabled={updating}
            variant={assignment.status === "complete" ? "outline" : "default"}
            className="flex-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            {assignment.status === "complete" ? "Mark incomplete" : "Mark complete"}
          </Button>
          <Button variant="outline" size="icon" onClick={handleDelete} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
}
