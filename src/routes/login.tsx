import { createFileRoute, Link } from "@tanstack/react-router";
import { SignInGate } from "@/lib/auth/gates";
import { DeskSignIn } from "@/components/admin-frame";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Meridian Journal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <main className="mx-auto min-h-screen max-w-lg px-4 py-16">
      <SignInGate fallback={<DeskSignIn />}>
        <h1 className="font-serif text-4xl">You are signed in.</h1>
        <Link to="/admin" className="mt-6 inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-paper">
          Open the desk
        </Link>
      </SignInGate>
    </main>
  ),
});
