import { createFileRoute } from "@tanstack/react-router";
import { recordHit } from "@/lib/blog/db.server";

export const Route = createFileRoute("/api/collect")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Record<string, unknown> = {};
        try {
          body = JSON.parse(await request.text()) as Record<string, unknown>;
        } catch {
          return new Response(null, { status: 400 });
        }
        const country =
          request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "";
        await recordHit({
          type: body.type === "engage" ? "engage" : "page",
          visitorId: String(body.visitorId ?? ""),
          sessionId: String(body.sessionId ?? ""),
          path: String(body.path ?? ""),
          title: String(body.title ?? ""),
          referrer: String(body.referrer ?? ""),
          engagementMs: Number(body.engagementMs ?? 0),
          userAgent: request.headers.get("user-agent") ?? "",
          country,
          origin: new URL(request.url).origin,
        });
        return new Response(null, { status: 204 });
      },
    },
  },
});
