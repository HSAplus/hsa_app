import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AlertTriangle, ArrowRight, ExternalLink, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, Breadcrumbs } from "@/components/marketing/marketing-shell";
import {
  getGuidedProviderSlugs,
  getProviderGuide,
  ORG_TYPE_LABELS,
  TIER_LABELS,
  roleLabel,
} from "@/lib/providers/queries";
import { guideStructuredData } from "@/lib/providers/structured-data";

export const revalidate = 86400;

/**
 * Only providers with has_guide = true get a page. The other ~780 registry
 * rows appear on the hub but are never generated — 800 near-identical pages
 * is thin content, and Google treats it as such.
 */
export async function generateStaticParams() {
  const slugs = await getGuidedProviderSlugs();
  return slugs.map((slug) => ({ slug }));
}

/**
 * Left true deliberately.
 *
 * generateStaticParams runs at build time, but the hub page revalidates daily
 * and starts linking to a provider the moment has_guide flips true in the
 * database. With dynamicParams = false that link would 404 until someone
 * happened to deploy — a broken link on a page we're actively trying to rank.
 *
 * With it true, a newly-published guide renders on first request and is cached
 * from then on. Slugs that aren't guided still 404 via notFound() below, so
 * this doesn't open the door to thin pages.
 */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderGuide(slug);
  if (!provider) return {};

  const title = `${provider.name} HSA: How to Get Reimbursed | HSA Plus`;
  const description =
    provider.guide_summary?.slice(0, 160) ??
    `How reimbursement works at ${provider.name}, what documentation you need, and what to keep for your own records.`;

  return {
    title,
    description,
    alternates: { canonical: `https://hsa.plus/hsa-providers/${provider.slug}` },
    openGraph: {
      title,
      description,
      url: `https://hsa.plus/hsa-providers/${provider.slug}`,
      siteName: "HSA Plus",
      type: "article",
      images: [{ url: "/og-image.jpg", width: 1920, height: 1080, alt: `${provider.name} HSA reimbursement guide` }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function formatReviewDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const DOCS_REQUIRED_LABELS: Record<string, string> = {
  none: "Not required at submission",
  always: "Required every time",
  varies: "Varies by account type or plan",
  over_threshold: "Required above a dollar threshold",
};

export default async function ProviderGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getProviderGuide(slug);

  if (!provider) notFound();

  const facts: { label: string; value: string }[] = [
    { label: "Role", value: roleLabel(provider) },
    ...(provider.org_type
      ? [{ label: "Type", value: ORG_TYPE_LABELS[provider.org_type] ?? provider.org_type }]
      : []),
    {
      label: "Reimbursement",
      value: TIER_LABELS[provider.submission_tier] ?? provider.submission_tier,
    },
    ...(provider.docs_required
      ? [
          {
            label: "Documentation",
            value: DOCS_REQUIRED_LABELS[provider.docs_required] ?? provider.docs_required,
          },
        ]
      : []),
    ...(provider.account_types.length > 0
      ? [{ label: "Accounts", value: provider.account_types.map((a) => a.toUpperCase()).join(", ") }]
      : []),
  ];

  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(guideStructuredData(provider)) }}
      />

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "HSA Providers", href: "/hsa-providers" },
          { label: provider.name },
        ]}
      />

      <article>
        <header className="mb-10">
          <h1 className="text-3xl font-normal leading-[1.15] tracking-tight text-[#0C1220] dark:text-white sm:text-4xl lg:text-5xl">
            {provider.name}: how to get reimbursed
          </h1>

          {provider.former_names.length > 0 && (
            <p className="mt-3 text-sm text-[#64748B] dark:text-slate-400">
              Formerly {provider.former_names.join(", ")}
            </p>
          )}

          {provider.guide_summary && (
            <p className="mt-4 text-base leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-lg">
              {provider.guide_summary}
            </p>
          )}

          {provider.last_reviewed && (
            // Shown, not buried. A guide about a company that renamed itself
            // two years ago has to be honest about when it was last checked.
            <p className="mt-5 text-xs text-[#94A3B8] dark:text-muted-foreground">
              Last reviewed {formatReviewDate(provider.last_reviewed)}
              {provider.website_url && (
                <>
                  {" "}&middot;{" "}
                  <a
                    href={provider.website_url}
                    rel="nofollow noopener"
                    target="_blank"
                    className="inline-flex items-center gap-1 hover:text-[#059669]"
                  >
                    Verify at {provider.name}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </p>
          )}
        </header>

        <dl className="mb-10 grid gap-px overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border bg-[#E2E8F0] dark:bg-border sm:grid-cols-2 lg:grid-cols-3">
          {facts.map((f) => (
            <div key={f.label} className="bg-white dark:bg-card px-5 py-4">
              <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#94A3B8] dark:text-muted-foreground">
                {f.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-[#0C1220] dark:text-foreground">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        {/* The single most consequential thing we can tell a Via Benefits or
            Inspira user. A wrong fax number sends their PHI to a stranger. */}
        {provider.routing_varies_by_employer && (
          <div className="mb-10 flex gap-4 rounded-2xl border border-amber-300 bg-amber-50/60 p-5 dark:border-amber-500/30 dark:bg-amber-500/10">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-[#0C1220] dark:text-white">
                Your submission details are set by your employer
              </h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#64748B] dark:text-slate-300">
                {provider.name} assigns claim fax numbers and mailing addresses
                per employer plan, so there is no single correct one. Take yours
                from your own plan documents or from the claim form generated in
                your portal &mdash; not from a general-purpose benefits site.
                Medical documentation sent to the wrong destination cannot be
                recalled.
              </p>
            </div>
          </div>
        )}

        {provider.guide_body && (
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-xl sm:prose-h2:text-2xl
              prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-lg
              prose-p:leading-relaxed prose-p:text-[#475569] dark:prose-p:text-slate-300
              prose-li:text-[#475569] dark:prose-li:text-slate-300
              prose-strong:text-[#0C1220] dark:prose-strong:text-white
              prose-a:text-[#059669] prose-a:no-underline hover:prose-a:underline
              prose-table:text-sm prose-th:text-[#0C1220] dark:prose-th:text-white"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {provider.guide_body}
            </ReactMarkdown>
          </div>
        )}

        {provider.sources.length > 0 && (
          <section className="mt-14 border-t border-[#E2E8F0] dark:border-border pt-8">
            <h2 className="mb-4 text-sm font-bold text-[#0C1220] dark:text-white">
              Sources
            </h2>
            <ul className="space-y-2">
              {provider.sources.map((s) => (
                <li key={s.url} className="text-xs text-[#64748B] dark:text-muted-foreground">
                  <a
                    href={s.url}
                    rel="nofollow noopener"
                    target="_blank"
                    className="inline-flex items-center gap-1 hover:text-[#059669]"
                  >
                    {s.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {s.accessed && <span className="ml-2 opacity-70">accessed {s.accessed}</span>}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-[#94A3B8] dark:text-muted-foreground">
              HSA Plus is not affiliated with {provider.name}. Provider details
              change; confirm anything you&rsquo;re relying on against your own
              plan documents. This is general information, not tax advice.
            </p>
          </section>
        )}
      </article>

      <div className="mt-14 rounded-2xl border border-[#059669]/20 bg-gradient-to-br from-[#059669]/[0.04] to-[#34d399]/[0.08] p-8 text-center dark:from-[#059669]/10 dark:to-[#34d399]/10 sm:p-12">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent">
          <ShieldCheck className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0C1220] dark:text-white sm:text-3xl">
          Keep the proof somewhere {provider.name} can&rsquo;t delete
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B] dark:text-slate-300 sm:text-base">
          Portal retention is finite and access ends with the account, but the
          burden of proof stays with you for years afterward. HSA Plus keeps your
          receipts audit-ready and independent of whoever administers your
          account.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="px-8 font-semibold shadow-accent">
              Start free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/hsa-providers">
            <Button variant="outline" size="lg" className="font-semibold">
              All providers
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
