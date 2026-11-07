import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Route Handler 用。認証の確認だけに使い、DB クエリには Prisma を使う。
export async function getCurrentUser() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser は Supabase Auth に問い合わせてトークンを検証する
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
