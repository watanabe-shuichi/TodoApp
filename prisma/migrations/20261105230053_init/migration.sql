-- CreateTable
CREATE TABLE "todos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_user_id_idx" ON "todos"("user_id");

-- シャドウDB（migrate dev の検証用）には Supabase の auth スキーマがないので、そのときだけ仮の auth.uid() を作る。
-- Supabase 本番には auth スキーマがあるため、この処理は何もしない。
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'auth') THEN
    CREATE SCHEMA auth;
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS 'SELECT NULL::uuid';
  END IF;
END
$$;

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
