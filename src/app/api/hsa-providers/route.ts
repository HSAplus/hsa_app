import { NextResponse } from "next/server";
import { getAllProviders } from "@/lib/providers/queries";

/**
 * Public, unauthenticated JSON of the HSA provider registry.
 *
 * Open on purpose. There is no free, licensable dataset of HSA providers — we
 * had to assemble this one — so publishing it is the kind of thing that earns
 * citations and links back, which is the same goal the guide pages serve.
 *
 * Reads hsa_providers_public, so internal routing configuration (fax numbers,
 * mailing addresses, API endpoints) is excluded by the view rather than by
 * anything this handler remembers to do.
 */
export const revalidate = 86400;

export async function GET() {
  const providers = await getAllProviders();

  return NextResponse.json(
    {
      // Attribution is the entire point of publishing this.
      source: "https://hsa.plus/hsa-providers",
      license: "Free to use with attribution to HSA Plus (https://hsa.plus).",
      disclaimer:
        "Provider details change frequently. Verify against your own plan documents before relying on any entry. Not tax advice.",
      count: providers.length,
      providers,
    },
    {
      headers: {
        // Cross-origin reads are the intended use.
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    }
  );
}
