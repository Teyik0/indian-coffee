import { Elysia } from "elysia";
import { env } from "@/api/lib/env";
import { menuService } from "../menu/service";

function xmlEscape(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

interface SitemapEntry {
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  path: string;
  priority: string;
}

const STATIC_ROUTES: SitemapEntry[] = [
  { changefreq: "weekly", path: "/", priority: "1.0" },
  { changefreq: "weekly", path: "/menu", priority: "0.9" },
  { changefreq: "monthly", path: "/gallery", priority: "0.7" },
  { changefreq: "monthly", path: "/contact", priority: "0.8" },
  { changefreq: "yearly", path: "/legal", priority: "0.2" },
  { changefreq: "yearly", path: "/privacy", priority: "0.2" },
];

/**
 * Sitemap et robots manquaient totalement : les moteurs ne découvraient ni les
 * pages de catégories ni la carte, et rien n'empêchait l'exploration du
 * back-office autrement que par un en-tête de réponse.
 */
export const seoRouter = new Elysia({ name: "seo" })
  .get("/sitemap.xml", async ({ set }) => {
    const categories = await menuService.getPublic({});
    const lastmod = new Date().toISOString().slice(0, 10);
    const entries: SitemapEntry[] = [
      ...STATIC_ROUTES,
      ...categories.map((category) => ({
        changefreq: "weekly" as const,
        path: `/menu/${category.slug}`,
        priority: "0.6",
      })),
    ];

    set.headers["content-type"] = "application/xml; charset=utf-8";
    set.headers["cache-control"] = "public, max-age=0, s-maxage=3600";
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${xmlEscape(`${env.APP_URL}${entry.path}`)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
  })
  .get("/robots.txt", ({ set }) => {
    set.headers["content-type"] = "text/plain; charset=utf-8";
    set.headers["cache-control"] = "public, max-age=0, s-maxage=86400";
    return `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${env.APP_URL}/sitemap.xml
`;
  });
