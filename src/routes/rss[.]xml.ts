import { createFileRoute } from "@tanstack/react-router";
import { rssItems } from "@/lib/blog/db.server";
import { xmlEscape } from "@/lib/blog/xml";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { shell, items } = await rssItems();
        const origin = new URL(request.url).origin;
        const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${xmlEscape(shell.settings.name)}</title>
  <link>${xmlEscape(origin)}/</link>
  <description>${xmlEscape(shell.settings.description)}</description>
${items
  .map((item) => {
    const link = `${origin}/journal/${item.slug}`;
    const when = new Date(item.published_at);
    const pub = Number.isNaN(when.getTime()) ? "" : when.toUTCString();
    return `  <item>
    <title>${xmlEscape(item.title)}</title>
    <link>${xmlEscape(link)}</link>
    <guid>${xmlEscape(link)}</guid>
    <pubDate>${xmlEscape(pub)}</pubDate>
    <description>${xmlEscape(item.excerpt)}</description>
  </item>`;
  })
  .join("\n")}
</channel>
</rss>`;
        return new Response(body, {
          headers: { "content-type": "application/rss+xml; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
