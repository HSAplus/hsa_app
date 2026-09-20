"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { PostHog } from "posthog-js";
import { Button } from "@/components/ui/button";

const CONSENT_STORAGE_KEY = "hsa_posthog_consent";

// Allowlist, never a denylist: the next authenticated route someone adds
// (e.g. /dashboard/settings) gets no analytics by default, instead of
// silently being instrumented until someone notices HSA/medical data in
// PostHog. This is the control that matters — autocapture/session-recording
// being off is belt-and-braces behind it.
const ALLOWLISTED_EXACT_PATHS = [
  "/",
  "/pricing",
  "/calculator",
  "/privacy",
  "/hsa-providers",
];
const ALLOWLISTED_PREFIXES = ["/vs/", "/strategy/", "/hsa-providers/"];

function isAllowlistedPath(pathname: string): boolean {
  if (ALLOWLISTED_EXACT_PATHS.includes(pathname)) return true;
  return ALLOWLISTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

type Consent = "granted" | "declined";

function readStoredConsent(): Consent | null {
  try {
    const value = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (value === "granted" || value === "declined") return value;
  } catch {
    // Private browsing / blocked storage — re-prompt this visit.
  }
  return null;
}

function storeConsent(value: Consent) {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // Best-effort; consent still applies for this page view.
  }
}

/**
 * Loads and initializes PostHog only on marketing routes, only after the
 * visitor accepts the consent banner. Not mounted/imported at module scope —
 * the SDK is dynamically imported inside the effect, so its code never ships
 * to the browser at all on a route outside the allowlist, not just "present
 * but inactive."
 */
export function PostHogProvider() {
  const pathname = usePathname() ?? "";
  const allowlisted = isAllowlistedPath(pathname);
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  const initialized = useRef(false);
  const posthogRef = useRef<PostHog | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!posthogKey || !allowlisted) return;

    let cancelled = false;

    void (async () => {
      const { default: posthog } = await import("posthog-js");
      if (cancelled) return;
      posthogRef.current = posthog;

      if (!initialized.current) {
        initialized.current = true;
        posthog.init(posthogKey, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
          autocapture: false, // non-negotiable
          disable_session_recording: true,
          capture_pageview: false, // App Router: fire $pageview manually
          capture_pageleave: true,
          person_profiles: "always",
          // Consent-gating: no network request to PostHog until the
          // visitor accepts the banner, including the /decide config call.
          opt_out_capturing_by_default: true,
          advanced_disable_decide: true,
        });

        const consent = readStoredConsent();
        if (consent === "granted") {
          posthog.opt_in_capturing();
          bannerRef.current?.remove();
        } else if (consent === "declined") {
          bannerRef.current?.remove();
        }
      }

      if (posthog.has_opted_in_capturing()) {
        posthog.capture("$pageview");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [posthogKey, allowlisted, pathname]);

  if (!posthogKey || !allowlisted) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card px-4 py-4 shadow-surface-lg sm:px-6"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          We use privacy-friendly analytics on our marketing pages to see which
          channels bring people to HSA Plus. Nothing is set until you accept,
          and your dashboard and account data are never tracked. See our{" "}
          <a href="/privacy" className="font-medium text-primary hover:underline">
            privacy policy
          </a>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              storeConsent("declined");
              bannerRef.current?.remove();
            }}
          >
            Decline
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              storeConsent("granted");
              posthogRef.current?.opt_in_capturing();
              posthogRef.current?.capture("$pageview");
              bannerRef.current?.remove();
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
