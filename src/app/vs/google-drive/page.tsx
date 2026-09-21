import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FolderOpen, Sparkles } from "lucide-react";
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
    { name: "Google Drive vs HSA Plus", path: "/vs/google-drive" },
  ]),
);

const TITLE =
  "Google Drive vs HSA Plus | Why a Receipts Folder Isn't HSA Tracking";
const DESCRIPTION =
  "Storing HSA receipts in Google Drive or Dropbox? A folder holds files but knows nothing about them — no totals, no audit checks, no retention tracking. Here's the gap.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://hsa.plus/vs/google-drive" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://hsa.plus/vs/google-drive",
    siteName: "HSA Plus",
    images: [{ url: "/og-image.jpg", width: 1920, height: 1080, alt: "Google Drive vs HSA Plus" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const PROBLEMS = [
  {
    title: "Files Without Facts",
    body: "A PDF in a folder is an image of a receipt, not a record. Nothing in Drive knows the date of service, the patient, or the amount you actually owed — so nothing can add them up or check them.",
  },
  {
    title: "No Answer to the Only Question",
    body: "The strategy depends on one number: how much have you paid out of pocket and not yet reimbursed. Drive can tell you a folder has 214 files. It cannot tell you it holds $18,400.",
  },
  {
    title: "Storage Isn't Retention",
    body: "Documents need keeping for years after the reimbursement year, per expense. A folder has no idea which of its files are still needed and which stopped mattering in 2019.",
  },
];

const ROWS: ComparisonRow[] = [
  { feature: "Stores the file safely", them: true, us: true },
  { feature: "Knows date of service, provider, amount", them: false, us: "Structured per expense" },
  { feature: "Running total of unreimbursed", them: false, us: "Live, always current" },
  { feature: "Checks IRS documentation requirements", them: false, us: "Automatic per expense" },
  { feature: "Per-expense retention countdown", them: false, us: "From reimbursement tax year" },
  { feature: "Groups receipt + EOB + invoice", them: "Naming conventions", us: "One expense, many docs" },
  { feature: "Separates family members", them: "More folders", us: "Dependent profiles" },
  { feature: "Growth projection on unreimbursed", them: false, us: "Modeled at your return rate" },
  { feature: "Survives you reorganizing folders", them: "Links break", us: true },
  { feature: "Pre-filled claim forms", them: false, us: true },
  { feature: "Export everything as CSV", them: "Files only", us: true },
];

export default function VsGoogleDrivePage() {
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
          { label: "vs Google Drive" },
        ]}
      />

      <div className="mx-auto mb-14 max-w-2xl text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-1.5 dark:border-amber-500/30 dark:bg-amber-500/10">
          <FolderOpen className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-amber-700 dark:text-amber-300">
            Tool Comparison
          </span>
        </div>
        <h1 className="text-3xl font-normal leading-[1.1] tracking-tight text-[#0C1220] dark:text-white sm:text-4xl lg:text-5xl">
          Google Drive vs. HSA Plus
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[#64748B] dark:text-slate-300 sm:text-lg">
          Drive and Dropbox are excellent at holding files. That is genuinely
          most of the problem solved — and it is the easy part. The hard part is
          everything a folder doesn&rsquo;t know.
        </p>
      </div>

      <ProblemCards cards={PROBLEMS} />

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-bold text-[#0C1220] dark:text-white sm:text-2xl">
          A folder holds files. It doesn&rsquo;t hold facts.
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          <p>
            Cloud storage is a real improvement over paper. Nothing fades, a
            copy exists off-site, and you can reach it from anywhere. If
            you&rsquo;ve been scanning receipts into a Drive folder, you are
            already ahead of most people doing this.
          </p>
          <p>
            But consider what Drive actually stores:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] dark:bg-muted">
              IMG_4471.pdf
            </code>
            . It has a filename, a size, and an upload date — none of which is
            the date of service. The provider, the patient, the amount you owed
            after insurance, whether you&rsquo;ve already reimbursed yourself:
            all of that is a picture inside the file, invisible to the system
            holding it.
          </p>
          <p>
            People work around this with naming conventions —{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] dark:bg-muted">
              2024-03-14_Dr-Nguyen_Sarah_142.50.pdf
            </code>{" "}
            — and it works for a while. It degrades the way every manual
            convention degrades: one rushed upload, one file named by a spouse,
            one month where you meant to go back and rename things. Now the
            folder is partly structured and partly not, which is harder to trust
            than either.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-bold text-[#0C1220] dark:text-white sm:text-2xl">
          The number you can&rsquo;t get
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          <p>
            Delayed reimbursement works because unclaimed medical expenses are a
            standing right to withdraw tax-free, whenever you choose. That right
            is worth exactly as much as you can prove — so the number that
            matters is{" "}
            <strong className="text-[#0C1220] dark:text-white">
              how much have I paid out of pocket and not yet reimbursed
            </strong>
            .
          </p>
          <p>
            Drive cannot produce that number. It can tell you the folder holds
            214 files. Getting to a dollar figure means opening each one, reading
            the amount, checking whether you already reimbursed it, and adding up
            by hand — which is why almost nobody does it, and why the balance
            quietly drifts out of anyone&rsquo;s awareness.
          </p>
          <p>
            An expense record that knows its own amount and reimbursement status
            makes that a number on a screen. It also makes the follow-on
            questions answerable: what would this be worth if it stayed invested
            another ten years, and which receipts are missing something the IRS
            would ask for.
          </p>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="mb-4 text-xl font-bold text-[#0C1220] dark:text-white sm:text-2xl">
          Two failure modes worth knowing about
        </h2>
        <div className="space-y-4 text-sm leading-relaxed text-[#475569] dark:text-slate-300 sm:text-base">
          <p>
            <strong className="text-[#0C1220] dark:text-white">
              Links break when folders move.
            </strong>{" "}
            If a spreadsheet points at Drive files, reorganizing the folders,
            changing sharing settings, or moving files between accounts can
            sever those links silently. The files still exist; the index no
            longer finds them. Over a decade that is close to inevitable.
          </p>
          <p>
            <strong className="text-[#0C1220] dark:text-white">
              Accounts don&rsquo;t last forever either.
            </strong>{" "}
            A work Google account ends with the job. A personal account left
            unused long enough can fall under an inactivity policy. Neither
            announces itself as a threat to your tax records, and both have
            taken people&rsquo;s archives before.
          </p>
        </div>
      </section>

      <ComparisonTable rows={ROWS} themLabel="Drive" />

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
            href="/vs/shoebox-method"
            className="rounded-full border border-[#E2E8F0] dark:border-border bg-white dark:bg-card px-4 py-2 text-xs font-medium text-[#64748B] dark:text-muted-foreground transition-colors hover:border-[#059669]/40 hover:text-[#059669]"
          >
            vs the Shoebox Method
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
          Keep the files. Add what they mean.
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[#64748B] dark:text-slate-300 sm:text-base">
          Upload the same documents you already have and give them the four
          facts that make them provable. Export everything as CSV whenever you
          want &mdash; you never lose control of your records.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/signup">
            <Button size="lg" className="px-8 font-semibold shadow-accent">
              Start for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/vs/spreadsheets">
            <Button variant="outline" size="lg" className="font-semibold">
              vs Spreadsheets
            </Button>
          </Link>
        </div>
      </div>
    </MarketingShell>
  );
}
