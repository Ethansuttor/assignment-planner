"use client";

import { useState } from "react";
import { Subtask } from "@/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface Props {
  assignmentId: string;
  initialSubtasks: Subtask[];
  onUpdate?: (subtasks: Subtask[]) => void;
}

export default function SubtaskChecklist({ assignmentId, initialSubtasks, onUpdate }: Props) {
  const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks);
  const [saving, setSaving] = useState(false);

  async function toggle(id: string) {
    const updated = subtasks.map((s) => (s.id === id ? { ...s, done: !s.done } : s));
    setSubtasks(updated);
    setSaving(true);

    try {
      await fetch(`/api/assignments/${assignmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subtasks: updated }),
      });
      onUpdate?.(updated);
    } catch {
      // Revert on error
      setSubtasks(subtasks);
    } finally {
      setSaving(false);
    }
  }

  const completed = subtasks.filter((s) => s.done).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Steps ({completed}/{subtasks.length})</h3>
        {saving && <span className="text-xs text-muted-foreground">Saving…</span>}
      </div>
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div key={subtask.id} className="flex items-start gap-3">
            <Checkbox
              id={subtask.id}
              checked={subtask.done}
              onCheckedChange={() => toggle(subtask.id)}
              className="mt-0.5"
            />
            <Label
              htmlFor={subtask.id}
              className={cn(
                "text-sm leading-snug cursor-pointer",
                subtask.done && "line-through text-muted-foreground"
              )}
            >
              {subtask.title}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
