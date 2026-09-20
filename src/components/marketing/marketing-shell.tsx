import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

/**
 * Nav + footer for public marketing pages.
 *
 * Extracted for the provider pages, where the same chrome would otherwise be
 * duplicated across a hub and every generated guide. Existing marketing pages
 * still carry their own copy; they can migrate here when they're next touched.
 *
 * Server component by design — no analytics SDK, no client JS. These routes
 * are anonymous and must stay statically renderable.
 */
export function MarketingShell({
  children,
  maxWidth = "max-w-4xl",
}: {
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] dark:bg-background">
      <header className="border-b border-[#E2E8F0]/80 dark:border-border bg-white/80 dark:bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={32} />
            <span className="text-base font-bold tracking-tight text-[#0C1220] dark:text-foreground">
              HSA Plus
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/pricing">
              <Button
                variant="ghost"
                size="sm"
                className="text-[13px] text-[#64748B] dark:text-muted-foreground hover:text-[#0C1220] dark:hover:text-foreground"
              >
                Pricing
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="shadow-accent font-semibold">
                Get started free
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className={`mx-auto ${maxWidth} px-6 py-14 md:py-20`}>{children}</main>

      <footer className="border-t border-[#E2E8F0] dark:border-border bg-white dark:bg-card">
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-sm text-[#94A3B8] dark:text-muted-foreground">
            <Logo size={22} />
            <span>
              &copy; {new Date().getFullYear()} HSA Plus &middot; Tax-free wealth,
              made simple.
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] font-medium text-[#94A3B8] dark:text-muted-foreground">
            <Link href="/hsa-providers" className="hover:text-[#64748B] dark:hover:text-foreground">
              HSA Providers
            </Link>
            <Link href="/calculator" className="hover:text-[#64748B] dark:hover:text-foreground">
              Calculator
            </Link>
            <Link href="/pricing" className="hover:text-[#64748B] dark:hover:text-foreground">
              Pricing
            </Link>
            <Link
              href="/strategy/delayed-reimbursement"
              className="hover:text-[#64748B] dark:hover:text-foreground"
            >
              Delayed Reimbursement Strategy
            </Link>
            <Link href="/privacy" className="hover:text-[#64748B] dark:hover:text-foreground">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

/** Breadcrumb trail. The last item renders as plain text, not a link. */
export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] dark:text-muted-foreground mb-6"
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-[#059669] transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#0C1220] dark:text-foreground font-medium">
              {item.label}
            </span>
          )}
          {i < items.length - 1 && <span aria-hidden>/</span>}
        </span>
      ))}
    </nav>
  );
}
