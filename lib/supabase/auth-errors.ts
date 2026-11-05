import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "メールアドレスまたはパスワードが正しくありません。",
  email_not_confirmed:
    "メールアドレスの確認が済んでいません。確認メールのリンクを開いてください。",
  weak_password: "パスワードが弱すぎます。もっと長く複雑なものにしてください。",
  validation_failed: "メールアドレスの形式が正しくありません。",
  email_address_invalid: "このメールアドレスは使用できません。",
  over_email_send_rate_limit:
    "メールの送信回数が上限に達しました。しばらくしてからお試しください。",
  over_request_rate_limit:
    "リクエストが多すぎます。しばらくしてからお試しください。",
  signup_disabled: "現在、新規登録を受け付けていません。",
};

export function authErrorMessage(error: AuthError) {
  return (
    (error.code && MESSAGES[error.code]) ||
    "エラーが発生しました。時間をおいてもう一度お試しください。"
  );
}
