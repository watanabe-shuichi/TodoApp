-- todos テーブルの RLS: ユーザーは自分の TODO のみ閲覧・追加・更新・削除できる
alter table public.todos enable row level security;

create policy "Users can view own todos"
  on public.todos for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own todos"
  on public.todos for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own todos"
  on public.todos for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own todos"
  on public.todos for delete
  to authenticated
  using ((select auth.uid()) = user_id);
