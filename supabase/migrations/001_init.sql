-- Assignment Planner — Initial Schema
create extension if not exists "pgcrypto";

-- Assignments table
create table public.assignments (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  title                text not null,
  course               text not null default '',
  due_date             date not null,
  suggested_start_date date,
  time_estimate_hours  numeric(4,1),
  summary              text,
  subtasks             jsonb not null default '[]'::jsonb,
  difficulty           text check (difficulty in ('easy', 'medium', 'hard')),
  status               text not null default 'pending'
                       check (status in ('pending', 'in_progress', 'complete')),
  raw_text             text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- Reminder log table
create table public.reminder_log (
  id              uuid primary key default gen_random_uuid(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  reminder_type   text not null check (reminder_type in ('start_date', 'day_before', 'due_day')),
  sent_at         timestamptz not null default now()
);

-- User settings table
create table public.user_settings (
  user_id            uuid primary key references auth.users(id) on delete cascade,
  email              text,
  difficulty_weights jsonb not null default '{"easy":0.8,"medium":1.0,"hard":1.3}'::jsonb,
  reminders_enabled  boolean not null default true,
  updated_at         timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger assignments_updated_at
  before update on public.assignments
  for each row execute function public.set_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- Indexes
create index on public.assignments(user_id, due_date asc);
create index on public.assignments(status);
create index on public.reminder_log(assignment_id, reminder_type);

-- Row-Level Security
alter table public.assignments    enable row level security;
alter table public.reminder_log   enable row level security;
alter table public.user_settings  enable row level security;

create policy "Users manage own assignments"
  on public.assignments for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users view own reminder log"
  on public.reminder_log for select
  using (auth.uid() = user_id);

create policy "Users manage own settings"
  on public.user_settings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
