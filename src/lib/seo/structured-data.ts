/**
 * Shared schema.org helpers.
 *
 * Two rules govern everything here:
 *
 * 1. Markup describes what is actually on the page. Structured data that
 *    overstates a page is a Google spam-policy violation, and the penalty
 *    (a manual action) costs far more than any rich result is worth.
 *
 * 2. Markup is only worth adding if it does something. Google retired HowTo
 *    rich results in September 2023 and restricted FAQ rich results to
 *    government and health sites the month before. Several schema types are
 *    still widely recommended in SEO advice and no longer render anything.
 *    BreadcrumbList is the one on these pages that still produces a visible
 *    result.
 */

export const SITE = "https://hsa.plus";

/** The @id the homepage publishes, so every page joins one graph. */
export const ORGANIZATION = { "@id": `${SITE}/#organization` };

/** Likewise for the product itself. */
export const WEB_APPLICATION = { "@id": `${SITE}/#webapp` };

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbs(trail: Crumb[]) {
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

/** Wraps nodes in the envelope Google expects. */
export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/**
 * An explainer page.
 *
 * Deliberately Article rather than HowTo. HowTo requires genuinely sequential
 * steps, the strategy page is an explainer with rules rather than an ordered
 * procedure, and Google removed HowTo rich results entirely in 2023 — so the
 * markup would be both a stretch and inert.
 */
export function article({
  path,
  headline,
  description,
  datePublished,
  dateModified,
}: {
  path: string;
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    "@type": "Article",
    "@id": `${SITE}${path}#article`,
    url: `${SITE}${path}`,
    headline,
    description,
    ...(datePublished ? { datePublished } : {}),
    ...(dateModified ? { dateModified } : {}),
    publisher: ORGANIZATION,
    author: ORGANIZATION,
    isPartOf: WEB_APPLICATION,
  };
}

/**
 * An interactive tool.
 *
 * Deliberately not FinancialProduct. That type describes a product being
 * offered — a loan, a savings account, a card — and a calculator is not one.
 * The subscription that *is* a product is already described as a
 * WebApplication with Offers on the homepage. FinancialProduct here would be
 * inaccurate, and it produces no rich result either way.
 */
export function webApplication({
  path,
  name,
  description,
}: {
  path: string;
  name: string;
  description: string;
}) {
  return {
    "@type": "WebApplication",
    "@id": `${SITE}${path}#app`,
    url: `${SITE}${path}`,
    name,
    description,
    applicationCategory: "FinanceApplication",
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript",
    isPartOf: WEB_APPLICATION,
    publisher: ORGANIZATION,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free to use, no account required.",
    },
  };
}
