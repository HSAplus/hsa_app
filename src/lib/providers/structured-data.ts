import type { PublicProvider } from "@/lib/claims/types";
import type { ProviderListItem } from "@/lib/providers/queries";

const SITE = "https://hsa.plus";

/** Matches the @id the homepage already publishes, so the graph joins up. */
const ORGANIZATION = { "@id": `${SITE}/#organization` };

function breadcrumbs(trail: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE}${item.path}`,
    })),
  };
}

/**
 * Structured data for the directory hub.
 *
 * The ItemList deliberately contains only providers with a published guide,
 * not all 845. An ItemList is a promise that each entry is a thing worth
 * navigating to; listing 840 rows that have no page of their own would be a
 * promise we can't keep, and it would add roughly half a megabyte of JSON to
 * a page that is already the heaviest on the site.
 */
export function hubStructuredData(guided: ProviderListItem[]) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE}/hsa-providers#page`,
        url: `${SITE}/hsa-providers`,
        name: "HSA Providers Directory",
        description:
          "Every HSA provider — custodians, administrators, banks and TPAs — and how reimbursement actually works at each one.",
        isPartOf: { "@id": `${SITE}/#webapp` },
        publisher: ORGANIZATION,
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: guided.length,
          itemListElement: guided.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.name,
            url: `${SITE}/hsa-providers/${p.slug}`,
          })),
        },
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "HSA Providers", path: "/hsa-providers" },
      ]),
    ],
  };
}

/**
 * Structured data for a single provider guide.
 *
 * dateModified is last_reviewed — the date a human actually verified the
 * content — rather than a build timestamp. A rebuild is not a review, and
 * telling Google otherwise would be claiming freshness we haven't earned.
 *
 * The provider itself is described as a separate entity rather than as the
 * article's author or publisher. We are not affiliated with them and the
 * guide is not their statement; conflating the two in the graph would imply
 * an endorsement that does not exist.
 */
export function guideStructuredData(provider: PublicProvider) {
  const url = `${SITE}/hsa-providers/${provider.slug}`;

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    name: provider.name,
  };
  if (provider.website_url) organization.url = provider.website_url;
  if (provider.legal_name) organization.legalName = provider.legal_name;
  if (provider.former_names.length > 0) {
    // Helps disambiguate "PayFlex" queries onto the Inspira entity.
    organization.alternateName = [...provider.former_names, ...provider.aliases];
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        url,
        headline: `${provider.name}: how to get reimbursed`,
        description: provider.guide_summary ?? undefined,
        ...(provider.last_reviewed ? { dateModified: provider.last_reviewed } : {}),
        publisher: ORGANIZATION,
        author: ORGANIZATION,
        isPartOf: { "@id": `${SITE}/hsa-providers#page` },
        about: organization,
        ...(provider.sources.length > 0
          ? { citation: provider.sources.map((s) => s.url) }
          : {}),
      },
      breadcrumbs([
        { name: "Home", path: "/" },
        { name: "HSA Providers", path: "/hsa-providers" },
        { name: provider.name, path: `/hsa-providers/${provider.slug}` },
      ]),
    ],
  };
}
