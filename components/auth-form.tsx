"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

export type AuthResult = { error?: string; notice?: string } | void;

type Props = {
  title: string;
  submitLabel: string;
  passwordAutoComplete: "current-password" | "new-password";
  passwordMinLength?: number;
  footerText: string;
  footerLinkHref: string;
  footerLinkLabel: string;
  onSubmit: (email: string, password: string) => Promise<AuthResult>;
};

const inputClass =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export function AuthForm({
  title,
  submitLabel,
  passwordAutoComplete,
  passwordMinLength,
  footerText,
  footerLinkHref,
  footerLinkLabel,
  onSubmit,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AuthResult>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setResult(undefined);
    setResult(await onSubmit(email, password));
    setSubmitting(false);
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-semibold text-zinc-100">
          {title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm text-zinc-300"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-zinc-300"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={passwordMinLength}
              autoComplete={passwordAutoComplete}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {passwordMinLength && (
              <p className="mt-1 text-xs text-zinc-500">
                {passwordMinLength}文字以上
              </p>
            )}
          </div>

          {result?.error && (
            <p role="alert" className="text-sm text-red-400">
              {result.error}
            </p>
          )}
          {result?.notice && (
            <p role="status" className="text-sm text-emerald-400">
              {result.notice}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "処理中…" : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {footerText}{" "}
          <Link
            href={footerLinkHref}
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
