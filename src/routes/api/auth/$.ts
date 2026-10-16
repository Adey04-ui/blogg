import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { auth } from "@/lib/auth/server";

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ message }), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

function secretMatches(submitted: string, expected: string): boolean {
  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}

async function handleAuthRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const normalizedPath = url.pathname.replace(/\/+$/, "").toLowerCase();
  const isEmailSignup =
    request.method === "POST" && normalizedPath.endsWith("/api/auth/sign-up/email");

  if (!isEmailSignup) return auth.handler(request);

  // Registration is for the journal owner only. Require a server-side setup
  // secret and allow sign-up only while the Better Auth user table is empty.
  const expectedSecret = process.env.ADMIN_SETUP_SECRET?.trim();
  if (!expectedSecret) {
    return jsonError("Initial account setup is disabled. Configure ADMIN_SETUP_SECRET first.", 403);
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.clone().json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return jsonError("Invalid sign-up request.", 400);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return jsonError("Invalid sign-up request.", 400);
  }

  const submittedSecret = typeof body.setupSecret === "string" ? body.setupSecret : "";
  if (!secretMatches(submittedSecret, expectedSecret)) {
    return jsonError("The setup secret is incorrect.", 403);
  }

  try {
    const sql = await getSql();
    const users = await sql<{ count: number }>`select count(*)::int as count from "user"`;
    if ((users[0]?.count ?? 0) > 0) {
      return jsonError("An account already exists. New account registration is closed.", 409);
    }
  } catch (error) {
    console.error("[auth] Could not verify whether initial account setup is available:", error);
    return jsonError("Account setup is temporarily unavailable.", 503);
  }

  // Do not pass the setup secret into Better Auth or persist it in any form.
  const authBody = { ...body };
  delete authBody.setupSecret;
  const headers = new Headers(request.headers);
  headers.delete("content-length");
  const sanitizedRequest = new Request(request.url, {
    method: request.method,
    headers,
    body: JSON.stringify(authBody),
    redirect: request.redirect,
    signal: request.signal,
  });

  return auth.handler(sanitizedRequest);
}

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => handleAuthRequest(request),
      POST: ({ request }) => handleAuthRequest(request),
    },
  },
});
