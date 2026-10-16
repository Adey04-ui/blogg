import { Link } from "@tanstack/react-router";
import { useState, type FormEvent, type ReactNode } from "react";
import { SignInGate } from "@/lib/auth/gates";
import { authClient } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { UserButton } from "@/lib/auth/gates";

const LINKS = [
  { to: "/admin", label: "Overview", exact: true },
  { to: "/admin/articles", label: "Articles" },
  { to: "/admin/library", label: "Library" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/advertising", label: "Advertising" },
  { to: "/admin/settings", label: "Settings" },
] as const;

export function AdminFrame({ children }: { children: ReactNode }) {
  const { isPending } = useCurrentUserState();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-4">
          <Link to="/" className="font-serif text-xl tracking-tight">
            Meridian
          </Link>
          <span className="text-xs uppercase tracking-[0.18em] text-muted">Desk</span>
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="Desk">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: "exact" in link && link.exact }}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-muted hover:text-ink"
                activeProps={{ className: "inline-flex min-h-11 items-center rounded-full bg-ink px-3 text-paper" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto">
            <UserButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {isPending ? (
          <p className="text-sm text-muted">Opening the desk…</p>
        ) : (
          <SignInGate fallback={<DeskSignIn />}>{children}</SignInGate>
        )}
      </div>
    </div>
  );
}

export function DeskSignIn() {
  const [mode, setMode] = useState<"signin" | "setup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setupSecret, setSetupSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "setup") {
        const response = await fetch("/api/auth/sign-up/email", {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            setupSecret,
            callbackURL: "/admin",
          }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(
            result?.message ?? result?.error?.message ?? "Could not create the admin account.",
          );
        }
        await authClient.getSession();
      } else {
        const result = await authClient.signIn.email({
          email: email.trim(),
          password,
          callbackURL: "/admin",
        });
        if (result.error) throw new Error(result.error.message ?? "Sign-in failed.");
        await authClient.getSession();
      }
      window.location.assign("/admin");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <h1 className="font-serif text-4xl tracking-tight">The desk is private.</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        Sign in to edit essays, read the traffic desk, and manage advertising. The first account is the journal owner;
        account setup requires the private setup secret configured for this deployment.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={(event) => void handleSubmit(event)}>
        {mode === "setup" && (
          <Field label="Your name">
            <input
              autoComplete="name"
              className={inputClass}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </Field>
        )}
        <Field label="Email address">
          <input
            autoComplete="email"
            className={inputClass}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </Field>
        <Field label="Password">
          <input
            autoComplete={mode === "setup" ? "new-password" : "current-password"}
            className={inputClass}
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </Field>
        {mode === "setup" && (
          <Field label="One-time setup secret">
            <input
              autoComplete="off"
              className={inputClass}
              onChange={(event) => setSetupSecret(event.target.value)}
              required
              type="password"
              value={setupSecret}
            />
          </Field>
        )}
        {error && <Notice error={error} />}
        <button
          className="min-h-11 rounded-full bg-ink px-4 text-sm text-paper hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          disabled={busy}
          type="submit"
        >
          {busy ? "Please wait…" : mode === "setup" ? "Create admin account" : "Sign in"}
        </button>
      </form>
      <p className="mt-5 text-sm text-muted">
        {mode === "signin" ? "Setting up this journal for the first time?" : "Already created the admin account?"}{" "}
        <button
          className="underline underline-offset-4 hover:text-ink"
          onClick={() => {
            setMode(mode === "signin" ? "setup" : "signin");
            setError(null);
          }}
          type="button"
        >
          {mode === "signin" ? "Set up the first account" : "Return to sign in"}
        </button>
      </p>
    </div>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-line bg-card px-3 py-2.5 text-sm text-ink outline-none";

export function Notice({ error, note }: { error?: string; note?: string }) {
  if (!error && !note) return null;
  return <p className={`text-sm ${error ? "text-danger" : "text-moss"}`}>{error || note}</p>;
}
