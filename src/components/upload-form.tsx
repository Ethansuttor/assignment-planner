"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UploadForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [course, setCourse] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("course", course);
    formData.append("due_date", dueDate);

    if (mode === "file" && file) {
      formData.append("file", file);
    } else if (mode === "text" && text.trim()) {
      formData.append("text", text.trim());
    } else {
      setError("Please provide a file or paste assignment text.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mode toggle */}
      <div className="flex rounded-lg border overflow-hidden">
        <button
          type="button"
          onClick={() => setMode("file")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            mode === "file" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          Upload PDF
        </button>
        <button
          type="button"
          onClick={() => setMode("text")}
          className={cn(
            "flex-1 py-2 text-sm font-medium transition-colors",
            mode === "text" ? "bg-primary text-primary-foreground" : "hover:bg-accent"
          )}
        >
          Paste text
        </button>
      </div>

      {mode === "file" ? (
        <div
          onClick={() => fileRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            file ? "border-primary bg-primary/5" : "hover:border-primary/50"
          )}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-primary" />
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <p className="text-sm">Click to upload PDF</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Label>Assignment text</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the assignment description here…"
            className="min-h-[160px]"
            required={mode === "text"}
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="course">Course</Label>
          <Input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. CS 101"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="due_date">Due date</Label>
          <Input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing…
          </>
        ) : (
          "Analyze assignment"
        )}
      </Button>

      {loading && (
        <Card>
          <CardContent className="py-4">
            <p className="text-sm text-center text-muted-foreground">
              Gemini is analyzing your assignment… This takes about 5–10 seconds.
            </p>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
