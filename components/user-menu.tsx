"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authErrorMessage } from "@/lib/supabase/auth-errors";
import { createClient } from "@/lib/supabase/client";

export function UserMenu() {
  const router = useRouter();
  const [email, setEmail] = useState<string>();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email));
  }, []);

  async function handleLogout() {
    setSigningOut(true);
    setError(undefined);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setError(authErrorMessage(error));
      setSigningOut(false);
      return;
    }
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-xs sm:gap-3 sm:text-sm">
      {error && (
        <span role="alert" className="text-red-400">
          {error}
        </span>
      )}
      <span className="min-w-0 truncate text-zinc-400">{email}</span>
      <button
        type="button"
        onClick={handleLogout}
        disabled={signingOut}
        className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        ログアウト
      </button>
    </div>
  );
}
