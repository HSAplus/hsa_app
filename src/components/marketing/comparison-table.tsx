import { Check, X } from "lucide-react";

export interface ComparisonRow {
  feature: string;
  /** A string renders as text; a boolean renders as a check or cross. */
  them: string | boolean;
  us: string | boolean;
}

function Cell({
  value,
  emphasis,
}: {
  value: string | boolean;
  emphasis?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={`mx-auto h-4 w-4 ${emphasis ? "text-[#059669] dark:text-[#34d399]" : "text-[#059669]"}`}
        aria-label="Yes"
      />
    ) : (
      <X className="mx-auto h-4 w-4 text-[#CBD5E1] dark:text-slate-600" aria-label="No" />
    );
  }
  return <>{value}</>;
}

/**
 * Side-by-side comparison used by the /vs/ pages.
 *
 * Extracted when the second and third of these pages were written rather than
 * copied a third time. /vs/spreadsheets still has its own inline copy — it is
 * a live page that ranks, and a visual regression there costs more than the
 * duplication does.
 */
export function ComparisonTable({
  rows,
  themLabel,
  usLabel = "HSA Plus",
}: {
  rows: ComparisonRow[];
  themLabel: string;
  usLabel?: string;
}) {
  return (
    <div className="mb-16 overflow-hidden rounded-2xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card shadow-surface">
      <div className="grid grid-cols-[1fr_120px_140px] items-center border-b border-[#E2E8F0] dark:border-border bg-[#F8FAFC] dark:bg-muted/50 px-6 py-4 text-xs font-semibold uppercase tracking-wider sm:grid-cols-[1.2fr_1fr_1fr]">
        <span className="text-[#64748B] dark:text-muted-foreground">Capability</span>
        <span className="text-center text-[#64748B] dark:text-muted-foreground">
          {themLabel}
        </span>
        <span className="text-center font-bold text-[#059669] dark:text-[#34d399]">
          {usLabel}
        </span>
      </div>

      {rows.map((row, i) => (
        <div
          key={row.feature}
          className={`grid grid-cols-[1fr_120px_140px] items-center px-6 py-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-muted/20 sm:grid-cols-[1.2fr_1fr_1fr] ${
            i < rows.length - 1
              ? "border-b border-[#E2E8F0]/60 dark:border-border/40"
              : ""
          } ${i % 2 === 0 ? "" : "bg-[#FAFAF8] dark:bg-muted/10"}`}
        >
          <span className="pr-2 text-sm font-medium text-[#0C1220] dark:text-foreground">
            {row.feature}
          </span>
          <div className="px-2 text-center text-xs text-[#64748B] dark:text-slate-400 sm:text-sm">
            <Cell value={row.them} />
          </div>
          <div className="px-2 text-center text-xs font-semibold text-[#059669] dark:text-[#34d399] sm:text-sm">
            <Cell value={row.us} emphasis />
          </div>
        </div>
      ))}
    </div>
  );
}

/** The three-card "what goes wrong" block above each comparison. */
export function ProblemCards({
  cards,
}: {
  cards: { title: string; body: string }[];
}) {
  return (
    <div className="mb-16 grid gap-6 md:grid-cols-3">
      {cards.map((c) => (
        <div
          key={c.title}
          className="rounded-2xl border border-red-200 bg-red-50/40 p-6 dark:border-red-900/30 dark:bg-red-950/10"
        >
          <h2 className="mb-2 text-base font-bold text-[#0C1220] dark:text-white">
            {c.title}
          </h2>
          <p className="text-xs leading-relaxed text-[#64748B] dark:text-slate-400 sm:text-sm">
            {c.body}
          </p>
        </div>
      ))}
    </div>
  );
}
