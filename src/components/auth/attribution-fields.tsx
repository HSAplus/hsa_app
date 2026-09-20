"use client";

import { useEffect, useRef } from "react";
import { ATTRIBUTION_STORAGE_KEY } from "@/components/attribution-capture";
import type { CapturedAttribution } from "@/lib/attribution";

const FIELDS: (keyof CapturedAttribution)[] = [
  "signup_channel",
  "signup_referrer_host",
  "signup_landing_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Hidden inputs that hand the sessionStorage attribution record to the
 * password signup form so the server action can merge it into
 * raw_user_meta_data. Populated client-side on mount since the signup page
 * itself is a server component with no access to sessionStorage. Uses
 * uncontrolled inputs (set via ref, not React state) so form submission sees
 * the values without a render-triggering effect.
 */
export function AttributionFields() {
  const refs = useRef<Partial<Record<keyof CapturedAttribution, HTMLInputElement | null>>>({});

  useEffect(() => {
    let attribution: CapturedAttribution | null = null;
    try {
      const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (raw) attribution = JSON.parse(raw);
    } catch {
      // Best-effort; signup proceeds with unattributed fields.
    }
    if (!attribution) return;

    for (const field of FIELDS) {
      const input = refs.current[field];
      if (input) input.value = attribution[field] ?? "";
    }
  }, []);

  return (
    <>
      {FIELDS.map((field) => (
        <input
          key={field}
          type="hidden"
          name={field}
          ref={(el) => {
            refs.current[field] = el;
          }}
        />
      ))}
    </>
  );
}
