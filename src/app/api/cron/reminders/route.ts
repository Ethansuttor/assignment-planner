import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { sendStartDateReminder, sendFallbackReminder } from "@/lib/resend";
import { format, addDays } from "date-fns";
import type { Assignment } from "@/types";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role client to bypass RLS
  const supabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = format(new Date(), "yyyy-MM-dd");
  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  // Get all incomplete assignments where today is start date or tomorrow is due date
  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("*, user_settings!inner(email, reminders_enabled)")
    .neq("status", "complete")
    .or(`suggested_start_date.eq.${today},due_date.eq.${tomorrow}`);

  if (error) {
    console.error("Cron: failed to fetch assignments", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results = { sent: 0, skipped: 0, errors: 0 };

  for (const row of assignments ?? []) {
    const settings = row.user_settings as { email: string | null; reminders_enabled: boolean };
    if (!settings.reminders_enabled || !settings.email) {
      results.skipped++;
      continue;
    }

    const assignment = row as Assignment;
    let reminderType: "start_date" | "day_before" = "start_date";
    if (row.due_date === tomorrow) reminderType = "day_before";

    // Check if already sent
    const { data: existing } = await supabase
      .from("reminder_log")
      .select("id")
      .eq("assignment_id", assignment.id)
      .eq("reminder_type", reminderType)
      .maybeSingle();

    if (existing) {
      results.skipped++;
      continue;
    }

    try {
      if (reminderType === "start_date") {
        await sendStartDateReminder(assignment, settings.email);
      } else {
        await sendFallbackReminder(assignment, settings.email);
      }

      await supabase.from("reminder_log").insert({
        assignment_id: assignment.id,
        user_id: assignment.user_id,
        reminder_type: reminderType,
      });

      results.sent++;
    } catch (err) {
      console.error("Cron: failed to send reminder", err);
      results.errors++;
    }
  }

  return NextResponse.json({ ok: true, ...results });
}
