import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  // Skip all proxy logic for API routes (e.g. webhook) — no auth/session checking
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next({ request });
  }

  const response = NextResponse.next({ request });

  // This part refreshes the session but won't block you
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          ),
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Secure by default: gate /dashboard behind auth unless DISABLE_AUTH=true
  // (set DISABLE_AUTH=true in the environment to keep the demo open).
  const authDisabled = process.env.DISABLE_AUTH === "true";
  if (
    !authDisabled &&
    !user &&
    request.nextUrl.pathname.startsWith("/dashboard")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  // This tells Next.js which routes to run the proxy on
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
