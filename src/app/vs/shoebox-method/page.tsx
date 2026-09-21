import type { Metadata } from "next";
import Link from "next/link";
import { Archive, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketingShell, Breadcrumbs } from "@/components/marketing/marketing-shell";
import {
  ComparisonTable,
  ProblemCards,
  type ComparisonRow,
} from "@/components/marketing/comparison-table";
import { graph, breadcrumbs } from "@/lib/seo/structured-data";

const jsonLd = graph(
  breadcrumbs([
    { name: "Home", path: "/" },
    { name: "The Shoebox Method vs HSA Plus", path: "/vs/shoebox-method" },
  ]),
);

const TITLE =
  "The Shoebox Method vs HSA Plus | Why Paper HSA Receipts Don't Survive";
const DESCRIPTION =
  "Keeping HSA receipts in a shoebox? Thermal paper fades to blank within a few years, and the IRS can question a distribution long after that. Here's what paper can't do.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://hsa.plus/vs/shoebox-method" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://hsa.plus/vs/shoebox-method",
    siteName: "HSA Plus",
    images: [{ url: "/og-image.jpg", width: 1920, height: 1080, alt: "Shoebox method vs HSA Plus" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const PROBLEMS = [
  {
    title: "Thermal Receipts Fade to Blank",
    body: "Most pharmacy and clinic receipts print on thermal paper, which has no ink — an image formed by heat. It fades on its own, faster in warmth or light, and a receipt you cannot read is a receipt you cannot claim.",
  },
  {
    title: "One Event Destroys Everything",
    body: "A single box holds every receipt with no copy anywhere else. Flood, fire, a move, a well-meaning clear-out — decades of tax-free withdrawals depend on a container nobody thinks about.",
  },
  {
    title: "You Can't Total a Shoebox",
    body: "The whole strategy rests on knowing how much you have paid out of pocket and not yet reimbursed. Paper can't answer that without emptying the box and adding it up by hand.",
  },
];

const ROWS: ComparisonRow[] = [
  { feature: "Survives 20+ years", them: "Thermal paper fades", us: "Digital, unchanged" },
  { feature: "Survives fire, flood, or a move", them: false, us: "Encrypted cloud storage" },
  { feature: "Find one expense in seconds", them: "Sort through by hand", us: "Search and filter" },
  { feature: "Running total of unreimbursed", them: false, us: "Live, always current" },
  { feature: "Checks IRS documentation requirements", them: false, us: "Automatic per expense" },
  { feature: "7-year retention tracking", them: false, us: "Countdown from tax year" },
  { feature: "Links receipt to EOB and invoice", them: "Paper-clip and hope", us: "Grouped per expense" },
  { feature: "Growth projection on unreimbursed", them: false, us: "Modeled at your return rate" },
  { feature: "Accessible from anywhere", them: false, us: true },
  { feature: "Cost", them: "Free", us: "Free forever up to 10 expenses" },
];

export default function VsShoeboxMethodPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Comparisons" },
          { label: "vs the Shoebox Method" },
        ]}
      />

      <div className="mx-auto mb-14 max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <Archive className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">
            Method Comparison
          </span>
        </div>
        <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#0C1220] dark:text-white sm:text-4xl lg:text-5xl">
          The Shoebox Method vs. HSA Plus
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-lg">
          Keeping every medical receipt in a box is the oldest HSA strategy there
          is. It has one fatal flaw: the receipts don&rsquo;t last as long as the
          strategy needs them to.
        </p>
      </div>

      <ProblemCards cards={PROBLEMS} />

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-bold text-[#0C1220] dark:text-white sm:text-2xl">
          The thermal paper problem
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          <p>
            Pick up a receipt from a pharmacy counter and look at the back. If
            it&rsquo;s smooth and slightly shiny, it&rsquo;s{" "}
            <strong className="text-[#0C1220] dark:text-white">thermal paper</strong> —
            and there is no ink on it. The text is a chemical reaction in a
            coating, triggered by heat from the print head.
          </p>
          <p>
            That reaction reverses. Heat, sunlight, humidity and simple time all
            push it back toward blank, and a receipt left in a warm attic or a
            car glovebox can become unreadable in a year or two. Even stored
            carefully in a drawer, legibility is measured in a handful of years.
          </p>
          <p>
            Now hold that against the strategy. The reason to keep the receipt at
            all is that{" "}
            <strong className="text-[#0C1220] dark:text-white">
              there is no deadline to reimburse yourself
            </strong>{" "}
            — you can pay out of pocket today, leave the money invested for
            twenty years, and take the distribution then. The receipt has to
            outlive the investment horizon. Thermal paper does not come close.
          </p>
          <p>
            This is the specific trap: the method works perfectly right up until
            the moment you need it, and the failure is silent. Nobody opens the
            box each year to check. You find out when you go looking for proof
            and find a stack of blank slips.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-bold text-[#0C1220] dark:text-white sm:text-2xl">
          What the IRS actually needs
        </h2>
        <p className="mb-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          A distribution you claim as qualified has to be supported by a record
          showing four things. A faded receipt fails all four at once, and a
          credit card statement only ever showed one of them:
        </p>
        <ul className="space-y-2 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          <li>
            <strong className="text-[#0C1220] dark:text-white">Date of service</strong>{" "}
            — when care was received, not when you paid
          </li>
          <li>
            <strong className="text-[#0C1220] dark:text-white">Provider</strong> —
            who delivered it
          </li>
          <li>
            <strong className="text-[#0C1220] dark:text-white">
              Description of the service or item
            </strong>{" "}
            — an amount alone proves nothing
          </li>
          <li>
            <strong className="text-[#0C1220] dark:text-white">Amount you owed</strong>{" "}
            after insurance
          </li>
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          A shoebox cannot tell you which of its receipts are missing one of
          these. HSA Plus checks every expense as you enter it and flags the ones
          that would not survive a question.
        </p>
      </section>

      <ComparisonTable rows={ROWS} themLabel="Shoebox" />

      {/* Peer links. Each of these pages targets a different query but
          answers the same underlying question, so a reader who lands on
          one is usually weighing the others too. */}
      <section className="mb-12">
        <h2 className="mb-3 text-sm font-bold text-[#0C1220] dark:text-white">
          Related comparisons
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/vs/spreadsheets"
            className="rounded-full border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2 text-xs font-medium text-[#64748B] dark:text-muted-foreground transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            vs Spreadsheets
          </Link>
          <Link
            href="/vs/google-drive"
            className="rounded-full border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2 text-xs font-medium text-[#64748B] dark:text-muted-foreground transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            vs Google Drive
          </Link>
          <Link
            href="/hsa-providers"
            className="rounded-full border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2 text-xs font-medium text-[#64748B] dark:text-muted-foreground transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            HSA Provider Directory
          </Link>
        </div>
      </section>
      <div className="rounded-2xl border border-[#059669]/20 bg-gradient-to-br from-[#059669]/[0.04] to-[#34d399]/[0.08] p-8 text-center dark:from-[#059669]/10 dark:to-[#34d399]/10 sm:p-12">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#059669] to-[#34d399] shadow-accent">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[#0C1220] dark:text-white sm:text-3xl">
          Photograph the box once. Keep it forever.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B] dark:text-slate-300 sm:text-base">
          Start with whatever is still legible. A photo taken today of a fading
          receipt is a permanent record; the paper underneath is on a timer.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="px-8 font-semibold shadow-accent">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/strategy/delayed-reimbursement">
            <Button variant="outline" size="lg" className="font-semibold">
              Why the receipts matter
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
