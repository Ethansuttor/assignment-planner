import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Nav from "@/components/nav";
import AssignmentCard from "@/components/assignment-card";
import WorkloadBanner from "@/components/workload-banner";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Assignment } from "@/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("assignments")
    .select("*")
    .eq("user_id", user.id)
    .order("due_date", { ascending: true });

  const assignments = (data ?? []) as Assignment[];
  const active = assignments.filter((a) => a.status !== "complete");
  const completed = assignments.filter((a) => a.status === "complete");

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assignments</h1>
          <Button asChild size="sm">
            <Link href="/add">
              <PlusCircle className="h-4 w-4" />
              Add
            </Link>
          </Button>
        </div>

        <WorkloadBanner assignments={assignments} />

        {active.length === 0 && completed.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-muted-foreground">No assignments yet.</p>
            <Button asChild>
              <Link href="/add">Add your first assignment</Link>
            </Button>
          </div>
        )}

        {active.length > 0 && (
          <section className="space-y-3">
            {active.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </section>
        )}

        {completed.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Completed
            </h2>
            {completed.map((a) => (
              <AssignmentCard key={a.id} assignment={a} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
