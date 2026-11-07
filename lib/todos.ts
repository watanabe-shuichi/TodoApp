import { NextResponse } from "next/server";
import type { ApiErrorResponse, Todo } from "@/app/api/todos/route";

// レスポンスに user_id を含めないよう、返す列を明示する
export const todoSelect = {
  id: true,
  title: true,
  isCompleted: true,
  createdAt: true,
} as const;

type TodoRow = Omit<Todo, "createdAt"> & { createdAt: Date };

export function toTodo(row: TodoRow): Todo {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export function errorResponse(status: number, error: string) {
  return NextResponse.json<ApiErrorResponse>({ error }, { status });
}

// JSON として読めないボディは null として扱い、呼び出し側の検証で 400 にする
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
