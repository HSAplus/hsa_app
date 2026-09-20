"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

export const ATTRIBUTION_STORAGE_KEY = "hsa_attribution";

/**
 * Records how a visitor arrived, once per tab. First touch wins: an
 * internal navigation later in the session must not overwrite the real
 * entry point. Session-scoped only — see privacy policy §7.
 */
export function AttributionCapture() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY)) {
        return;
      }
    } catch {
      // sessionStorage throws in Safari private mode / some embedded
      // webviews. Attribution capture is best-effort — never break the app.
      return;
    }

    const record = captureAttribution({
      referrer: document.referrer,
      currentHost: window.location.hostname,
      landingPath: window.location.pathname,
      searchParams: new URLSearchParams(window.location.search),
    });

    if (record.signup_channel === "internal") {
      return;
    }

    try {
      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(record));
    } catch {
      // Best-effort; nothing else to do if storage is unavailable.
    }
  }, []);

  return null;
}
