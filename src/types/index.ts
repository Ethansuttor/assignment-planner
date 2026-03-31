export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type AssignmentStatus = "pending" | "in_progress" | "complete";
export type Difficulty = "easy" | "medium" | "hard";

export type Assignment = {
  id: string;
  user_id: string;
  title: string;
  course: string;
  due_date: string;
  suggested_start_date: string | null;
  time_estimate_hours: number | null;
  summary: string | null;
  subtasks: Subtask[];
  difficulty: Difficulty | null;
  status: AssignmentStatus;
  raw_text: string | null;
  created_at: string;
  updated_at: string;
};

export type ReminderLog = {
  id: string;
  assignment_id: string;
  user_id: string;
  reminder_type: "start_date" | "day_before" | "due_day";
  sent_at: string;
};

export type UserSettings = {
  user_id: string;
  email: string | null;
  difficulty_weights: { easy: number; medium: number; hard: number };
  reminders_enabled: boolean;
  updated_at: string;
};

export type GeminiResponse = {
  title: string;
  summary: string;
  time_estimate_hours: number;
  subtasks: string[];
  difficulty: Difficulty;
};
