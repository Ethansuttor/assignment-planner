import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeAssignment } from "@/lib/gemini";
import { extractTextFromPdf } from "@/lib/pdf";
import { calcStartDate } from "@/lib/start-date";
import { format } from "date-fns";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let text = "";
  let course = "";
  let dueDate = "";

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    course = (formData.get("course") as string) ?? "";
    dueDate = (formData.get("due_date") as string) ?? "";

    const file = formData.get("file") as File | null;
    const pastedText = formData.get("text") as string | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      text = await extractTextFromPdf(buffer);
    } else if (pastedText) {
      text = pastedText;
    } else {
      return NextResponse.json({ error: "No file or text provided" }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Expected multipart/form-data" }, { status: 400 });
  }

  if (!text.trim()) {
    return NextResponse.json({ error: "Could not extract text from the provided content" }, { status: 400 });
  }

  if (!dueDate) {
    return NextResponse.json({ error: "due_date is required" }, { status: 400 });
  }

  const geminiResult = await analyzeAssignment(text, course, dueDate);

  const suggestedStartDate = calcStartDate(dueDate, geminiResult.time_estimate_hours);

  const subtasks = geminiResult.subtasks.map((title) => ({
    id: randomUUID(),
    title,
    done: false,
  }));

  const { data: assignment, error } = await supabase
    .from("assignments")
    .insert({
      user_id: user.id,
      title: geminiResult.title,
      course,
      due_date: dueDate,
      suggested_start_date: format(suggestedStartDate, "yyyy-MM-dd"),
      time_estimate_hours: geminiResult.time_estimate_hours,
      summary: geminiResult.summary,
      subtasks,
      difficulty: geminiResult.difficulty,
      status: "pending",
      raw_text: text,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save assignment" }, { status: 500 });
  }

  return NextResponse.json({ assignment }, { status: 201 });
}
