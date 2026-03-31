import { Resend } from "resend";
import type { Assignment } from "@/types";
import { formatDate } from "@/lib/utils";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const FROM = "Assignment Planner <reminders@yourdomain.com>";

export async function sendStartDateReminder(assignment: Assignment, toEmail: string) {
  return getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `Start today: ${assignment.title}`,
    html: `
      <h2>Time to start: ${assignment.title}</h2>
      <p><strong>Course:</strong> ${assignment.course}</p>
      <p><strong>Due:</strong> ${formatDate(assignment.due_date)}</p>
      <p><strong>Estimated time:</strong> ${assignment.time_estimate_hours}h</p>
      ${assignment.summary ? `<p><strong>Summary:</strong> ${assignment.summary}</p>` : ""}
      ${
        assignment.subtasks?.length
          ? `<h3>Suggested steps:</h3><ol>${assignment.subtasks
              .map((s) => `<li>${s.title}</li>`)
              .join("")}</ol>`
          : ""
      }
      <p>Good luck!</p>
    `,
  });
}

export async function sendFallbackReminder(assignment: Assignment, toEmail: string) {
  return getResend().emails.send({
    from: FROM,
    to: toEmail,
    subject: `Due tomorrow: ${assignment.title}`,
    html: `
      <h2>Due tomorrow: ${assignment.title}</h2>
      <p><strong>Course:</strong> ${assignment.course}</p>
      <p><strong>Due:</strong> ${formatDate(assignment.due_date)}</p>
      <p><strong>Estimated time:</strong> ${assignment.time_estimate_hours}h</p>
      <p>This assignment is due tomorrow and hasn't been completed yet. Don't forget!</p>
    `,
  });
}
