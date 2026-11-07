import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/supabase/server";
import { errorResponse, readJson, todoSelect, toTodo } from "@/lib/todos";
import type { Todo } from "../route";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NOT_FOUND_MESSAGE = "TODOが見つかりません。";

export type UpdateTodoRequest = { isCompleted: boolean };
export type UpdateTodoResponse = { todo: Todo };

export type DeleteTodoResponse = { id: string };

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/todos/[id]">,
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse(401, "ログインが必要です。");

  const { id } = await ctx.params;
  if (!UUID_PATTERN.test(id)) return errorResponse(404, NOT_FOUND_MESSAGE);

  const body = (await readJson(request)) as Partial<UpdateTodoRequest> | null;
  if (typeof body?.isCompleted !== "boolean") {
    return errorResponse(400, "isCompleted は true か false で指定してください。");
  }

  // 他のユーザーの TODO には一致しないよう、必ず user_id でも絞り込む
  const [row] = await getPrisma().todo.updateManyAndReturn({
    where: { id, userId: user.id },
    data: { isCompleted: body.isCompleted },
    select: todoSelect,
  });
  if (!row) return errorResponse(404, NOT_FOUND_MESSAGE);

  return NextResponse.json<UpdateTodoResponse>({ todo: toTodo(row) });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/todos/[id]">,
) {
  const user = await getCurrentUser();
  if (!user) return errorResponse(401, "ログインが必要です。");

  const { id } = await ctx.params;
  if (!UUID_PATTERN.test(id)) return errorResponse(404, NOT_FOUND_MESSAGE);

  // 他のユーザーの TODO には一致しないよう、必ず user_id でも絞り込む
  const { count } = await getPrisma().todo.deleteMany({
    where: { id, userId: user.id },
  });
  if (count === 0) return errorResponse(404, NOT_FOUND_MESSAGE);

  return NextResponse.json<DeleteTodoResponse>({ id });
}
