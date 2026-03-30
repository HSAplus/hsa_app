"use client";

import { Sparkles } from "lucide-react";

interface UpgradeBadgeProps {
  message?: string;
  className?: string;
}

export function UpgradeBadge({
  message = "Upgrade to Plus",
  className = "",
}: UpgradeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-200 px-2.5 py-1 text-[11px] font-medium text-amber-700 ${className}`}
    >
      <Sparkles className="h-3 w-3" />
      {message}
    </span>
  );
}

interface UpgradeBlockProps {
  feature: string;
  description?: string;
  className?: string;
}

export function UpgradeBlock({
  feature,
  description,
  className = "",
}: UpgradeBlockProps) {
  return (
    <div
      className={`rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-4 text-center ${className}`}
    >
      <div className="inline-flex items-center justify-center rounded-full bg-amber-100 p-2 mb-2">
        <Sparkles className="h-4 w-4 text-amber-600" />
      </div>
      <p className="text-sm font-medium text-[#0F172A]">{feature}</p>
      {description && (
        <p className="text-xs text-[#64748B] mt-1">{description}</p>
      )}
      <p className="text-[11px] font-medium text-amber-700 mt-2">
        Upgrade to HSA Plus &mdash; $5/mo
      </p>
    </div>
  );
}
