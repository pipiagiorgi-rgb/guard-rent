-- Create feedback table
create table if not exists feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete set null,
    type text check (type in ('bug', 'feature', 'general')) not null,
    message text not null,
    page_url text,
    user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table feedback enable row level security;

-- Policies
create policy "Users can insert feedback"
    on feedback for insert
    with check (true);

create policy "Admins can view feedback"
    on feedback for select
    using (auth.uid() in (
        select id from auth.users where email = 'pipia.giorgi@gmail.com'
    ));
