import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/supabase/server";
import { errorResponse, readJson, todoSelect, toTodo } from "@/lib/todos";

const MAX_TITLE_LENGTH = 500;

export type Todo = {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
};

export type ApiErrorResponse = { error: string };

export type GetTodosResponse = { todos: Todo[] };

export type CreateTodoRequest = { title: string };
export type CreateTodoResponse = { todo: Todo };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return errorResponse(401, "ログインが必要です。");

  const rows = await getPrisma().todo.findMany({
    where: { userId: user.id },
    select: todoSelect,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json<GetTodosResponse>({ todos: rows.map(toTodo) });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return errorResponse(401, "ログインが必要です。");

  const body = (await readJson(request)) as Partial<CreateTodoRequest> | null;
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return errorResponse(400, "タイトルを入力してください。");
  if (title.length > MAX_TITLE_LENGTH) {
    return errorResponse(
      400,
      `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください。`,
    );
  }

  const row = await getPrisma().todo.create({
    data: { title, userId: user.id },
    select: todoSelect,
  });

  return NextResponse.json<CreateTodoResponse>(
    { todo: toTodo(row) },
    { status: 201 },
  );
}
