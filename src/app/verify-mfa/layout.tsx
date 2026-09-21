import type { Metadata } from "next";

/**
 * Exists only to carry metadata.
 *
 * page.tsx here is a client component, and a client component cannot export
 * `metadata` — the directive has to be the first thing in the file, and the
 * export is read at build time on the server. A layout is the standard way to
 * attach metadata to a client page.
 *
 * Cloudflare serves its own robots.txt with `Allow: /`, overriding
 * src/app/robots.ts entirely, so a Disallow rule there never reaches a
 * crawler. This meta tag is served by us and does apply.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function VerifyMfaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
