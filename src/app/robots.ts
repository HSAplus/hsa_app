import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://hsa.plus";

  return {
    rules: {
      userAgent: "*",
      // /api/hsa-providers is published on purpose — it's a public dataset,
      // and blocking it would defeat the point of offering it for citation.
      // Longer, more specific paths win over /api/, so this survives the
      // disallow below.
      allow: ["/", "/api/hsa-providers"],
      disallow: [
        "/dashboard",
        "/dashboard/",
        "/api/",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/verify-mfa",
        "/auth/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
