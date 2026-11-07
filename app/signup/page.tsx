"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  async function handleSignup(email: string, password: string) {
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) return { error: authErrorMessage(error) };

    // メール確認が無効な設定なら、この時点でログイン済みになっている
    if (data.session) {
      router.replace("/");
      router.refresh();
      return;
    }
    return {
      notice:
        "確認メールを送信しました。メール内のリンクを開いて登録を完了してください。届かない場合は、すでに登録済みの可能性があります。",
    };
  }

  return (
    <AuthForm
      title="新規登録"
      submitLabel="登録する"
      passwordAutoComplete="new-password"
      passwordMinLength={6}
      footerText="すでにアカウントをお持ちの方は"
      footerLinkHref="/login"
      footerLinkLabel="ログイン"
      onSubmit={handleSignup}
    />
  );
}
