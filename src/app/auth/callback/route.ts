import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Initialize user's document folders on first OAuth login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Update profile with name from OAuth provider (e.g. Google)
        const fullName = user.user_metadata?.full_name || "";
        const firstName = user.user_metadata?.first_name || fullName.split(" ")[0] || "";
        const lastName = user.user_metadata?.last_name || fullName.split(" ").slice(1).join(" ") || "";

        await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
          }, { onConflict: "id" });

        // Initialize user's document folders
        const folders = ["receipt", "eob", "invoice", "cc-statement"];
        const placeholder = new Blob([""], { type: "text/plain" });

        await Promise.allSettled(
          folders.map((folder) =>
            supabase.storage
              .from("hsa-documents")
              .upload(`${user.id}/${folder}/.keep`, placeholder, {
                upsert: true,
              })
          )
        );
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
