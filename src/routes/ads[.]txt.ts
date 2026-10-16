import { createFileRoute } from "@tanstack/react-router";
import { adsText } from "@/lib/blog/db.server";

export const Route = createFileRoute("/ads.txt")({
  server: {
    handlers: {
      GET: async () => {
        const client = await adsText();
        const pub = client.replace(/^ca-/, "");
        const body = /^pub-\d{10,20}$/.test(pub)
          ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
          : "# Add a Google AdSense publisher ID in the desk. This file updates when that ID is saved.\n";
        return new Response(body, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=300" },
        });
      },
    },
  },
});
