import type { MetadataRoute } from "next";

const BASE = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Public pages only — anything behind auth has nothing to offer a crawler.
const ROUTES = ["", "/projects", "/events", "/gamejams", "/workshops", "/resources", "/achievements"];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
