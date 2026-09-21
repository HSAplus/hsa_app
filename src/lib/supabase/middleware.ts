import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublishableKey } from "@/lib/supabase/publishable-key";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    getSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not add logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very
  // hard to debug.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const publicPaths = [
    "/login",
    "/signup",
    "/auth",
    "/forgot-password",
    "/reset-password",
    "/privacy",
    "/verify-mfa",
    "/pricing",
    "/calculator",
    "/sitemap.xml",
    "/robots.txt",
    "/llms.txt",
    "/strategy",
    "/vs",
    // The provider directory and guides exist to be read by logged-out
    // visitors and crawlers. Without these, middleware 307s them to /login
    // before the statically generated page is ever served — so the pages
    // build correctly, render correctly, and stay invisible to everyone they
    // are written for.
    "/hsa-providers",
    // The published dataset. Explicitly allowed in robots.txt, so redirecting
    // it to a login page would be a contradiction.
    "/api/hsa-providers",
  ];
  const isPublicPath =
    request.nextUrl.pathname === "/" ||
    publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && !isPublicPath) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (
      data &&
      data.currentLevel === "aal1" &&
      data.nextLevel === "aal2"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/verify-mfa";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
