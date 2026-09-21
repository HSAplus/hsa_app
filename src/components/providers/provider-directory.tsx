"use client";

import { useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";

/**
 * Search and filter over the full provider list.
 *
 * The rows are passed in as server-rendered `children` and filtered by
 * toggling `hidden` on the DOM nodes, rather than being re-rendered from a
 * client-side copy of the data. With 800+ providers, holding the array in
 * client state would serialize the whole registry into the RSC payload a
 * second time — the markup is already in the HTML, so this halves the page
 * weight and keeps the rows server components.
 *
 * Each row carries `data-search` (name + aliases + former names, lowercased)
 * and `data-org-type`. Those attributes are the filter's entire interface with
 * the markup.
 */
export function ProviderDirectory({
  children,
  total,
  orgTypes,
}: {
  children: React.ReactNode;
  total: number;
  orgTypes: { value: string; label: string; count: number }[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [visible, setVisible] = useState(total);
  const [activeOrgType, setActiveOrgType] = useState<string | null>(null);

  const applyFilters = useCallback((query: string, orgType: string | null) => {
    const container = containerRef.current;
    if (!container) return;

    const q = query.trim().toLowerCase();
    const rows = container.querySelectorAll<HTMLElement>("[data-search]");
    let shown = 0;

    for (const row of rows) {
      const matchesQuery = !q || (row.dataset.search ?? "").includes(q);
      const matchesOrg = !orgType || row.dataset.orgType === orgType;
      const show = matchesQuery && matchesOrg;
      row.hidden = !show;
      if (show) shown++;
    }

    setVisible(shown);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    applyFilters(e.target.value, activeOrgType);
  };

  const handleOrgType = (value: string) => {
    const next = activeOrgType === value ? null : value;
    setActiveOrgType(next);
    applyFilters(inputRef.current?.value ?? "", next);
  };

  const clear = () => {
    if (inputRef.current) inputRef.current.value = "";
    setActiveOrgType(null);
    applyFilters("", null);
    inputRef.current?.focus();
  };

  const isFiltered = visible !== total;

  return (
    <div>
      <div className="relative mb-4">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8] dark:text-muted-foreground"
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          onChange={handleSearch}
          placeholder="Search by name — try a former name like PayFlex"
          aria-label="Search HSA providers"
          className="w-full rounded-xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-card py-3 pl-11 pr-11 text-sm text-[#0C1220] dark:text-foreground placeholder:text-[#94A3B8] dark:placeholder:text-muted-foreground focus:border-[#059669] focus:outline-none focus:ring-2 focus:ring-[#059669]/20"
        />
        {isFiltered && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear filters"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[#94A3B8] hover:bg-slate-100 hover:text-[#64748B] dark:hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {orgTypes.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => handleOrgType(t.value)}
            aria-pressed={activeOrgType === t.value}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeOrgType === t.value
                ? "border-[#059669] bg-[#059669] text-white"
                : "border-[#E2E8F0] dark:border-border bg-white dark:bg-card text-[#64748B] dark:text-muted-foreground hover:border-[#059669]/40"
            }`}
          >
            {t.label}
            <span className="ml-1.5 opacity-60">{t.count}</span>
          </button>
        ))}
      </div>

      {/* aria-live so screen reader users hear the count change as they type */}
      <p
        aria-live="polite"
        className="mb-4 text-xs text-[#64748B] dark:text-muted-foreground"
      >
        {isFiltered
          ? `Showing ${visible} of ${total} providers`
          : `${total} providers`}
      </p>

      <div ref={containerRef}>{children}</div>

      {visible === 0 && (
        <div className="rounded-2xl border border-dashed border-[#E2E8F0] dark:border-border p-10 text-center">
          <p className="text-sm text-[#64748B] dark:text-muted-foreground">
            No providers match that search.
          </p>
          <p className="mt-2 text-xs text-[#94A3B8] dark:text-muted-foreground">
            Administrators rename and merge often — try a shorter search, or the
            name on your account statement.
          </p>
          <button
            type="button"
            onClick={clear}
            className="mt-4 text-xs font-semibold text-[#059669] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
