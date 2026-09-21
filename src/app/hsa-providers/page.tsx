import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, Breadcrumbs } from "@/components/marketing/marketing-shell";
import { ProviderDirectory } from "@/components/providers/provider-directory";
import { hubStructuredData } from "@/lib/providers/structured-data";
import {
  getAllProviders,
  ORG_TYPE_LABELS,
  TIER_LABELS,
  roleLabel,
  searchIndex,
  type ProviderListItem,
} from "@/lib/providers/queries";

export const metadata: Metadata = {
  title: "HSA Providers Directory | Every HSA Custodian & Administrator",
  description:
    "Search every HSA provider — custodians, administrators, banks and TPAs. See who holds your money, who reviews your claims, and how to get reimbursed at each one.",
  alternates: { canonical: "https://hsa.plus/hsa-providers" },
  openGraph: {
    title: "HSA Providers Directory | Every HSA Custodian & Administrator",
    description:
      "Search every HSA provider and find out how reimbursement actually works at yours.",
    url: "https://hsa.plus/hsa-providers",
    siteName: "HSA Plus",
    images: [{ url: "/og-image.jpg", width: 1920, height: 1080, alt: "HSA Providers Directory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HSA Providers Directory",
    description: "Search every HSA provider and find out how reimbursement actually works at yours.",
  },
};

// The registry changes on a human timescale, not a request one. Rebuilding
// daily keeps edits in Supabase reaching the site without a deploy, while
// still serving every visitor a static page.
export const revalidate = 86400;

function ProviderRow({ p }: { p: ProviderListItem }) {
  const orgLabel = p.org_type ? ORG_TYPE_LABELS[p.org_type] : null;

  // The row is a link only when there's a guide to link to. Linking all 800 to
  // a page that doesn't exist is the fastest way to a directory full of 404s.
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-semibold text-[#0C1220] dark:text-foreground">
            {p.name}
          </span>
          {p.former_names.length > 0 && (
            // Surfaced rather than hidden: someone holding PayFlex paperwork
            // needs to recognize this row as theirs.
            <span className="text-xs text-[#94A3B8] dark:text-muted-foreground">
              formerly {p.former_names.join(", ")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#64748B] dark:text-muted-foreground">
          <span>{roleLabel(p)}</span>
          {orgLabel && (
            <>
              <span aria-hidden>&middot;</span>
              <span>{orgLabel}</span>
            </>
          )}
          {p.submission_tier === "self_directed" && (
            <>
              <span aria-hidden>&middot;</span>
              <span className="text-[#059669] dark:text-[#34d399]">
                No claim needed
              </span>
            </>
          )}
        </div>
      </div>

      {p.has_guide ? (
        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#059669] dark:text-[#34d399]">
          Read guide
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      ) : (
        <span className="shrink-0 text-xs text-[#94A3B8] dark:text-muted-foreground">
          {TIER_LABELS[p.submission_tier] ?? p.submission_tier}
        </span>
      )}
    </>
  );

  const className =
    "flex items-center gap-4 border-b border-[#E2E8F0]/60 dark:border-border/40 px-5 py-4 text-sm transition-colors last:border-b-0";

  return (
    <div
      data-search={searchIndex(p)}
      data-org-type={p.org_type ?? ""}
      className="bg-white dark:bg-card"
    >
      {p.has_guide ? (
        <Link
          href={`/hsa-providers/${p.slug}`}
          className={`${className} hover:bg-[#059669]/[0.04] dark:hover:bg-[#059669]/10`}
        >
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </div>
  );
}

export default async function HsaProvidersPage() {
  const providers = await getAllProviders();
  const guided = providers.filter((p) => p.has_guide);

  // Only offer filters that would actually narrow anything.
  const orgTypeCounts = new Map<string, number>();
  for (const p of providers) {
    if (p.org_type) {
      orgTypeCounts.set(p.org_type, (orgTypeCounts.get(p.org_type) ?? 0) + 1);
    }
  }
  const orgTypes = [...orgTypeCounts.entries()]
    .map(([value, count]) => ({
      value,
      label: ORG_TYPE_LABELS[value] ?? value,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <MarketingShell maxWidth="max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubStructuredData(guided)) }}
      />

      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "HSA Providers" }]} />

      <div className="mx-auto mb-12 max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#059669]/30 bg-[#059669]/[0.06] px-4 py-1.5 dark:border-[#059669]/30 dark:bg-[#059669]/10">
          <Building2 className="h-3.5 w-3.5 text-[#059669] dark:text-[#34d399]" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-[#059669] dark:text-[#34d399]">
            Provider Directory
          </span>
        </div>
        <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#0C1220] dark:text-white sm:text-4xl lg:text-5xl">
          Every HSA provider, and how reimbursement actually works
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-lg">
          Some providers hold your money. Some review your claims. A few do both,
          and one of the largest does neither in the way you&rsquo;d expect. Find
          yours and see what that means for getting paid back.
        </p>
      </div>

      {/* The distinction most provider comparisons get wrong, stated up front —
          it's the thing that makes the rest of the directory legible. */}
      <div className="mb-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-5">
          <h2 className="mb-2 text-sm font-bold text-[#0C1220] dark:text-white">
            Custodian
          </h2>
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
            Holds the money and files your 1099-SA. Doesn&rsquo;t decide whether
            an expense qualifies &mdash; that&rsquo;s on you.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-5">
          <h2 className="mb-2 text-sm font-bold text-[#0C1220] dark:text-white">
            Administrator
          </h2>
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
            Reviews claims and approves or denies them. Usually wants
            documentation attached when you submit.
          </p>
        </div>
        <div className="rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-5">
          <h2 className="mb-2 text-sm font-bold text-[#0C1220] dark:text-white">
            Why it matters
          </h2>
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
            It determines whether anyone checks your receipts &mdash; and
            therefore who is left holding the proof if the IRS asks.
          </p>
        </div>
      </div>

      {guided.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-1 text-lg font-bold text-[#0C1220] dark:text-white">
            Detailed guides
          </h2>
          <p className="mb-5 text-sm text-[#64748B] dark:text-muted-foreground">
            Researched and reviewed by hand, with sources and a review date.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {guided.map((p) => (
              <Link
                key={p.id}
                href={`/hsa-providers/${p.slug}`}
                className="group rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card p-5 transition-colors hover:border-[#059669]/40"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="font-bold text-[#0C1220] dark:text-white">
                    {p.name}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#94A3B8] transition-colors group-hover:text-[#059669]" />
                </div>
                {p.guide_summary && (
                  <p className="line-clamp-3 text-xs leading-relaxed text-[#64748B] dark:text-slate-400">
                    {p.guide_summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1 text-lg font-bold text-[#0C1220] dark:text-white">
          All providers
        </h2>
        <p className="mb-5 text-sm text-[#64748B] dark:text-muted-foreground">
          Searching a former name works &mdash; providers rebrand and merge
          constantly, and your paperwork may predate the change.
        </p>

        {providers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#E2E8F0] dark:border-border p-10 text-center">
            <p className="text-sm text-[#64748B] dark:text-muted-foreground">
              The provider directory is being updated. Please check back shortly.
            </p>
          </div>
        ) : (
          <ProviderDirectory total={providers.length} orgTypes={orgTypes}>
            <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border shadow-surface">
              {providers.map((p) => (
                <ProviderRow key={p.id} p={p} />
              ))}
            </div>
          </ProviderDirectory>
        )}
      </section>

      <div className="mt-16 rounded-2xl border border-[#059669]/20 bg-gradient-to-br from-[#059669]/[0.04] to-[#34d399]/[0.08] p-8 text-center dark:from-[#059669]/10 dark:to-[#34d399]/10 sm:p-12">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0C1220] dark:text-white sm:text-3xl">
          Your provider won&rsquo;t keep your receipts forever
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B] dark:text-slate-300 sm:text-base">
          Portal document retention is finite, and access ends when your account
          does. The IRS window doesn&rsquo;t close on the same schedule. Keep your
          own archive, independent of whoever administers your account this year.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="px-8 font-semibold shadow-accent">
              Start free
              <Sparkles className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/strategy/delayed-reimbursement">
            <Button variant="outline" size="lg" className="font-semibold">
              The delayed reimbursement strategy
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
