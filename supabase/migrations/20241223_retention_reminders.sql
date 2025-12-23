-- Add retention_reminder_level to track which emails have been sent
-- Levels: 
-- 0 = No reminders sent
-- 1 = 60-day reminder sent
-- 2 = 30-day reminder sent
-- 3 = 7-day reminder sent

alter table cases 
add column if not exists retention_reminder_level int default 0;

-- Add deletion status and grace period tracking
alter table cases 
add column if not exists deletion_status text default 'active' check (deletion_status in ('active', 'pending_deletion', 'deleted'));

alter table cases
add column if not exists grace_until timestamp with time zone;

-- Ensure we have an index on retention_until for performant cron queries
create index if not exists idx_cases_retention_until on cases(retention_until);
