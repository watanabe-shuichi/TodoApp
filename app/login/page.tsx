"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { AuthForm } from "@/components/auth-form";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const goHome = useCallback(() => {
    router.replace("/");
    router.refresh();
  }, [router]);

  // 確認メールのリンクは /login?code=... に戻ってくる。
  // クライアントの初期化時に code がセッションに交換されるので、できていれば / へ進む。
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) goHome();
      });
  }, [goHome]);

  async function handleLogin(email: string, password: string) {
    const { error } = await createClient().auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: authErrorMessage(error) };
    goHome();
  }

  return (
    <AuthForm
      title="ログイン"
      submitLabel="ログイン"
      passwordAutoComplete="current-password"
      footerText="アカウントをお持ちでない方は"
      footerLinkHref="/signup"
      footerLinkLabel="新規登録"
      onSubmit={handleLogin}
    />
  );
}
