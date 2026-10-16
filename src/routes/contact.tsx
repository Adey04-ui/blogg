import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { sendContact } from "@/lib/blog/public.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Meridian Journal" },
      { name: "description", content: "Write to the editors of Meridian Journal." },
    ],
  }),
  component: Contact,
});

function Contact() {
  const send = useServerFn(sendContact);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <Shell>
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="font-serif text-5xl tracking-tight">Contact</h1>
        <p className="mt-4 text-muted">
          Notes about a story, a correction, or a partnership. The form stores your name, email, and message so the
          editor can reply. It does not join a mailing list.
        </p>
        {sent ? (
          <p className="mt-8 rounded-2xl border border-line bg-card p-5">Received. If a reply is needed, it will come by email.</p>
        ) : (
          <form
            className="mt-8 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              setPending(true);
              setError("");
              void send({
                data: {
                  name: String(form.get("name") ?? ""),
                  email: String(form.get("email") ?? ""),
                  message: String(form.get("message") ?? ""),
                  trap: String(form.get("company") ?? ""),
                },
              })
                .then(() => setSent(true))
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not send."))
                .finally(() => setPending(false));
            }}
          >
            <label className="block text-sm">
              Name
              <input name="name" required className="mt-1 min-h-11 w-full rounded-xl border border-line bg-card px-3" />
            </label>
            <label className="block text-sm">
              Email
              <input name="email" type="email" required className="mt-1 min-h-11 w-full rounded-xl border border-line bg-card px-3" />
            </label>
            <label className="block text-sm">
              Message
              <textarea name="message" required rows={6} className="mt-1 w-full rounded-xl border border-line bg-card px-3 py-2" />
            </label>
            <label className="absolute left-[-9999px]" aria-hidden="true">
              Company
              <input name="company" tabIndex={-1} autoComplete="off" />
            </label>
            {error ? <p className="text-sm text-danger">{error}</p> : null}
            <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper disabled:opacity-60">
              {pending ? "Sending…" : "Send"}
            </button>
          </form>
        )}
      </div>
    </Shell>
  );
}
