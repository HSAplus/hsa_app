"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-[#64748B] hover:text-[#0C1220] hover:bg-[#F1F5F9] transition-colors"
        aria-label={open ? "Close menu" : "Open menu"}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-[#E2E8F0] shadow-surface-lg z-50">
          <nav className="mx-auto max-w-6xl px-6 py-4 flex flex-col gap-1">
            {[
              { href: "#features", label: "Features" },
              { href: "#growth", label: "Growth" },
              { href: "#how-it-works", label: "How It Works" },
              { href: "/calculator", label: "Calculator" },
              { href: "/privacy", label: "Privacy" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-[#64748B] hover:text-[#0C1220] hover:bg-[#F1F5F9] transition-colors"
              >
                {item.label}
              </a>
            ))}
            <div className="border-t border-[#E2E8F0] mt-2 pt-3 flex flex-col gap-2">
              <Link href="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" className="w-full justify-center text-sm font-medium">
                  Sign in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                <Button className="w-full justify-center text-sm font-semibold shadow-accent">
                  Get started free
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
