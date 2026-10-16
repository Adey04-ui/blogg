import { createFileRoute } from "@tanstack/react-router";
import { sitemapEntries } from "@/lib/blog/db.server";
import { xmlEscape } from "@/lib/blog/xml";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { shell, articles, authors, tags, staticPaths } = await sitemapEntries();
        const origin = shell.settings.canonicalOrigin
          ? safeOrigin(shell.settings.canonicalOrigin) || new URL(request.url).origin
          : new URL(request.url).origin;
        const urls = [
          ...staticPaths.map((path) => ({ loc: `${origin}${path || "/"}`, lastmod: "" })),
          ...shell.categories.map((category) => ({ loc: `${origin}/category/${category.slug}`, lastmod: "" })),
          ...authors.map((author) => ({ loc: `${origin}/author/${author.slug}`, lastmod: "" })),
          ...tags.map((tag) => ({ loc: `${origin}/tag/${tag.slug}`, lastmod: "" })),
          ...articles.map((article) => ({
            loc: `${origin}/journal/${article.slug}`,
            lastmod: article.updated,
          })),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url><loc>${xmlEscape(url.loc)}</loc>${url.lastmod ? `<lastmod>${xmlEscape(url.lastmod)}</lastmod>` : ""}</url>`,
  )
  .join("\n")}
</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});

function safeOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    return "";
  }
}
