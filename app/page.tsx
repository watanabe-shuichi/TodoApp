"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import type {
  ApiErrorResponse,
  CreateTodoRequest,
  CreateTodoResponse,
  GetTodosResponse,
  Todo,
} from "@/app/api/todos/route";
import type {
  DeleteTodoResponse,
  UpdateTodoRequest,
  UpdateTodoResponse,
} from "@/app/api/todos/[id]/route";
import { UserMenu } from "@/components/user-menu";

const GENERIC_ERROR = "エラーが発生しました。時間をおいてもう一度お試しください。";

class ApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError("通信に失敗しました。接続を確認してください。");
  }
  if (!res.ok) {
    const body: ApiErrorResponse | null = await res.json().catch(() => null);
    throw new ApiError(body?.error ?? GENERIC_ERROR, res.status);
  }
  return res.json();
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export default function Home() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string>();

  useEffect(() => {
    let ignore = false;
    request<GetTodosResponse>("/api/todos")
      .then((data) => {
        if (!ignore) setTodos(data.todos);
      })
      .catch((e: ApiError) => {
        if (ignore) return;
        if (e.status === 401) router.replace("/login");
        else setError(e.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [router]);

  function handleError(e: unknown) {
    const apiError = e as ApiError;
    // セッションが切れていたらログイン画面へ戻す
    if (apiError.status === 401) router.replace("/login");
    else setError(apiError.message);
  }

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setAdding(true);
    setError(undefined);
    try {
      const body: CreateTodoRequest = { title: trimmed };
      const { todo } = await request<CreateTodoResponse>(
        "/api/todos",
        jsonInit("POST", body),
      );
      setTodos((current) => [todo, ...current]);
      setTitle("");
    } catch (e) {
      handleError(e);
    } finally {
      setAdding(false);
    }
  }

  // 同じ TODO への操作が重ならないよう、処理中はその行のボタンを無効にする
  async function withPending(id: string, action: () => Promise<void>) {
    setPendingIds((current) => new Set(current).add(id));
    setError(undefined);
    try {
      await action();
    } catch (e) {
      handleError(e);
    } finally {
      setPendingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  function handleToggle(target: Todo) {
    return withPending(target.id, async () => {
      const body: UpdateTodoRequest = { isCompleted: !target.isCompleted };
      const { todo } = await request<UpdateTodoResponse>(
        `/api/todos/${target.id}`,
        jsonInit("PATCH", body),
      );
      setTodos((current) =>
        current.map((item) => (item.id === todo.id ? todo : item)),
      );
    });
  }

  function handleDelete(target: Todo) {
    return withPending(target.id, async () => {
      const { id } = await request<DeleteTodoResponse>(
        `/api/todos/${target.id}`,
        { method: "DELETE" },
      );
      setTodos((current) => current.filter((item) => item.id !== id));
    });
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 text-zinc-100">
      <header className="flex items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="shrink-0 text-base font-semibold sm:text-lg">
          My TODO App
        </h1>
        <UserMenu />
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-6 sm:py-10">
        <div className="w-full max-w-2xl self-start rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-xl sm:p-6">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              aria-label="新しいTODO"
              placeholder="TODOを入力"
              maxLength={500}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={adding || !title.trim()}
              className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              追加
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}

          {loading ? (
            <p className="mt-6 text-center text-sm text-zinc-400">
              読み込み中…
            </p>
          ) : todos.length === 0 ? (
            <p className="mt-6 text-center text-sm text-zinc-400">
              TODOはまだありません。
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-zinc-800">
              {todos.map((todo) => {
                const pending = pendingIds.has(todo.id);
                return (
                  <li key={todo.id} className="flex items-center gap-3 py-3">
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={todo.isCompleted}
                        disabled={pending}
                        onChange={() => handleToggle(todo)}
                        className="size-5 shrink-0 accent-indigo-500"
                      />
                      <span
                        className={`min-w-0 break-words ${
                          todo.isCompleted
                            ? "text-zinc-500 line-through"
                            : "text-zinc-100"
                        }`}
                      >
                        {todo.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDelete(todo)}
                      aria-label={`「${todo.title}」を削除`}
                      className="shrink-0 rounded-lg border border-zinc-700 px-3 py-1 text-sm text-zinc-300 transition-colors hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      削除
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
