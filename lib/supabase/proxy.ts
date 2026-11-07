import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const AUTH_PAGES = ["/login", "/signup"];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // createServerClient との間に処理を挟まないこと（セッション更新が不安定になる）
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // API はリダイレクトせず、Route Handler 側で認証を確認して 401 を返す
  if (pathname === "/api" || pathname.startsWith("/api/")) {
    return response;
  }

  if (!isLoggedIn && !isAuthPage) {
    return redirectWithSession(request, response, "/login");
  }
  if (isLoggedIn && isAuthPage) {
    return redirectWithSession(request, response, "/");
  }
  return response;
}

// 更新されたセッションの Cookie を、リダイレクトのレスポンスにも引き継ぐ
function redirectWithSession(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url, { headers: response.headers });
}
