import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sanitizeAttributionInput } from "@/lib/attribution";

const ATTRIBUTION_COOKIE_NAME = "hsa_attr";

async function applyOAuthAttribution(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTRIBUTION_COOKIE_NAME)?.value;

  // Single-use: clear it regardless of whether we end up applying it.
  cookieStore.set(ATTRIBUTION_COOKIE_NAME, "", { maxAge: 0, path: "/" });

  if (!raw) return;

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }

  // Cookie contents are fully attacker-controllable.
  const attribution = sanitizeAttributionInput(parsed);
  if (Object.keys(attribution).length === 0) return;

  // Guard on signup_attributed_at IS NULL, not "is this a new user" — this
  // callback fires on every Google sign-in, not just signup. Without this
  // guard a returning user's original attribution gets overwritten on every
  // login. (The DB also enforces this via protect_signup_attribution().)
  const { data: profile } = await supabase
    .from("profiles")
    .select("signup_attributed_at")
    .eq("id", userId)
    .maybeSingle();

  if (!profile || profile.signup_attributed_at) return;

  await supabase
    .from("profiles")
    .update({ ...attribution, signup_attributed_at: new Date().toISOString() })
    .eq("id", userId);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Profile row + storage folders are created by the DB trigger (handle_new_user)
      // which fires on auth.users insert. No need to duplicate that work here.

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await applyOAuthAttribution(supabase, user.id);
      }

      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const needsMfa = aal?.currentLevel === "aal1" && aal?.nextLevel === "aal2";
      const destination = needsMfa ? "/verify-mfa" : next;

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${destination}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${destination}`);
      } else {
        return NextResponse.redirect(`${origin}${destination}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
