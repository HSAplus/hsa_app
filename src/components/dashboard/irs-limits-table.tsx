"use client";

import { useMemo, useState } from "react";
import { HSA_LIMITS } from "@/lib/hsa-constants";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function IrsLimitsTable() {
  const [showAll, setShowAll] = useState(false);
  const currentYear = new Date().getFullYear();

  const years = useMemo(() => {
    return Object.keys(HSA_LIMITS)
      .map(Number)
      .sort((a, b) => b - a);
  }, []);

  const displayYears = showAll ? years : years.slice(0, 5);

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#F1F5F9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg p-1.5 bg-gradient-to-br from-violet-500 to-purple-400">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#0F172A] font-sans">
              IRS HSA Contribution Limits
            </h2>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] bg-violet-50 text-violet-700"
          >
            {years[0]} — {years[years.length - 1]}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <th className="text-left px-5 py-2.5 font-medium text-[#64748B]">
                Year
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-[#64748B]">
                Individual
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-[#64748B]">
                Family
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-[#64748B]">
                55+ Catch-up
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-[#64748B]">
                Individual + Catch-up
              </th>
              <th className="text-right px-5 py-2.5 font-medium text-[#64748B]">
                Family + Catch-up
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {displayYears.map((year) => {
              const limits = HSA_LIMITS[year];
              const isCurrent = year === currentYear;
              return (
                <tr
                  key={year}
                  className={`hover:bg-[#FAFAFA] transition-colors ${
                    isCurrent ? "bg-[#059669]/5" : ""
                  }`}
                >
                  <td className="px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-semibold ${
                          isCurrent ? "text-[#059669]" : "text-[#0F172A]"
                        }`}
                      >
                        {year}
                      </span>
                      {isCurrent && (
                        <Badge
                          variant="secondary"
                          className="text-[9px] px-1 py-0 h-3.5 bg-[#059669]/10 text-[#059669]"
                        >
                          Current
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-[#0F172A]">
                    {formatMoney(limits.individual)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-[#0F172A]">
                    {formatMoney(limits.family)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-[#64748B]">
                    +{formatMoney(limits.catchUp55)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-[#059669] font-medium">
                    {formatMoney(limits.individual + limits.catchUp55)}
                  </td>
                  <td className="px-5 py-2.5 text-right font-mono tabular-nums text-[#059669] font-medium">
                    {formatMoney(limits.family + limits.catchUp55)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Show more/less */}
      {years.length > 5 && (
        <div className="px-6 py-2 border-t border-[#F1F5F9]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-[12px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors w-full justify-center py-1"
          >
            {showAll ? (
              <>
                Show recent years only <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Show all {years.length} years{" "}
                <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Footer note */}
      <div className="px-6 py-3 border-t border-[#F1F5F9] bg-[#F8FAFC] rounded-b-xl">
        <p className="text-[11px] text-[#94A3B8]">
          Source: IRS Revenue Procedures. Catch-up contributions are available for individuals
          age 55 and older who are not yet enrolled in Medicare.
        </p>
      </div>
    </div>
  );
}
