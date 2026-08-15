import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Auth and member-only routes: nothing to index, and keeping reset links
      // out of crawlers is worth the one line.
      disallow: ["/api/", "/dashboard", "/login", "/register", "/forgot-password", "/reset-password"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
