"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  ShieldAlert,
  Clock,
  BarChart3,
  FileCheck,
  Package,
  X,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Notification, NotificationPriority } from "@/lib/notifications";

interface NotificationBellProps {
  notifications: Notification[];
}

const PRIORITY_STYLES: Record<NotificationPriority, { dot: string; icon: string; bg: string }> = {
  critical: { dot: "bg-red-500", icon: "text-red-600", bg: "bg-red-50" },
  warning: { dot: "bg-amber-500", icon: "text-amber-600", bg: "bg-amber-50" },
  info: { dot: "bg-emerald-500", icon: "text-emerald-600", bg: "bg-emerald-50" },
};

const TYPE_ICONS: Record<string, typeof AlertTriangle> = {
  retention_deadline: AlertTriangle,
  audit_readiness: ShieldAlert,
  balance_stale: Clock,
  contribution_limit: BarChart3,
  expense_limit: Package,
  claim_update: FileCheck,
};

export function NotificationBell({ notifications }: NotificationBellProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);

  const active = notifications.filter((n) => !dismissed.has(n.id));
  const count = active.length;

  function dismissAll() {
    setDismissed(new Set(notifications.map((n) => n.id)));
  }

  function dismissOne(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative text-[#64748B] h-8 w-8 p-0"
          aria-label={count > 0 ? `${count} notifications` : "No notifications"}
        >
          <Bell className="h-3.5 w-3.5" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white leading-none">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[360px] p-0 overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-[#E2E8F0] px-4 py-3">
          <h3 className="text-sm font-semibold text-[#0C1220]">
            Notifications
          </h3>
          {count > 0 && (
            <button
              onClick={dismissAll}
              className="text-xs text-[#64748B] hover:text-[#0C1220] transition-colors"
            >
              Dismiss all
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {active.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-[#0C1220]">All clear</p>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                No alerts right now
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#E2E8F0]">
              {active.map((n) => {
                const styles = PRIORITY_STYLES[n.priority];
                const Icon = TYPE_ICONS[n.type] ?? Bell;

                const content = (
                  <div className="flex items-start gap-3 px-4 py-3 hover:bg-[#F8FAFC] transition-colors group">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${styles.bg}`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${styles.icon}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`h-1.5 w-1.5 rounded-full shrink-0 ${styles.dot}`}
                        />
                        <p className="text-xs font-semibold text-[#0C1220] truncate">
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                        {n.description}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        dismissOne(n.id);
                      }}
                      className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-[#64748B]"
                      aria-label={`Dismiss "${n.title}"`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );

                return (
                  <li key={n.id}>
                    {n.href ? (
                      <Link href={n.href} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      content
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
