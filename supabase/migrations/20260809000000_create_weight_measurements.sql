create extension if not exists pgcrypto;

create table public.weight_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric(6, 2) not null check (weight >= 50 and weight <= 1000),
  measured_at timestamptz not null,
  measurement_date date not null,
  created_at timestamptz not null default now()
);

create index weight_measurements_user_date_idx
  on public.weight_measurements (user_id, measurement_date desc, measured_at desc);

alter table public.weight_measurements enable row level security;

create policy "Users can view their own measurements"
  on public.weight_measurements for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own measurements"
  on public.weight_measurements for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own measurements"
  on public.weight_measurements for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own measurements"
  on public.weight_measurements for delete
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.weight_measurements from anon;
grant select, insert, update, delete on table public.weight_measurements to authenticated;
