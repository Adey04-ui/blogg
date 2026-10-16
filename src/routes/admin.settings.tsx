import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame, Field, Notice, inputClass } from "@/components/admin-frame";
import {
  deleteRedirectFn,
  redirectsFn,
  saveRedirectFn,
  saveSettingsFn,
  settingsFn,
} from "@/lib/blog/admin.functions";
import type { Settings } from "@/lib/blog/db.server";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <AdminFrame>
      <SettingsDesk />
    </AdminFrame>
  ),
});

function SettingsDesk() {
  const load = useServerFn(settingsFn);
  const save = useServerFn(saveSettingsFn);
  const loadRedirects = useServerFn(redirectsFn);
  const saveRedirect = useServerFn(saveRedirectFn);
  const removeRedirect = useServerFn(deleteRedirectFn);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [redirects, setRedirects] = useState<{ id: number; from_path: string; to_path: string }[]>([]);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const refreshRedirects = () =>
    loadRedirects()
      .then(setRedirects)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load redirects."));

  useEffect(() => {
    void load()
      .then(setDraft)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not open settings."));
    void refreshRedirects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The public name of the journal, how a reader reaches you, and where a retired path should land. Publisher
          IDs and ad placements live on the{" "}
          <Link to="/admin/advertising" className="text-copper">
            advertising desk
          </Link>
          .
        </p>
      </div>
      <Notice error={error} note={note} />
      {draft ? (
        <form
          className="space-y-8"
          onSubmit={(event) => {
            event.preventDefault();
            setSaving(true);
            setError("");
            setNote("");
            void save({ data: draft })
              .then((saved) => {
                setDraft(saved);
                setNote("Settings saved.");
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."))
              .finally(() => setSaving(false));
          }}
        >
          <section className="grid gap-3 sm:grid-cols-2">
            <h2 className="font-serif text-2xl sm:col-span-2">The journal</h2>
            <Field label="Name">
              <input
                className={inputClass}
                value={draft.name}
                required
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              />
            </Field>
            <Field label="Contact email">
              <input
                className={inputClass}
                type="email"
                value={draft.email}
                autoComplete="email"
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Tagline">
                <input
                  className={inputClass}
                  value={draft.tagline}
                  onChange={(event) => setDraft({ ...draft, tagline: event.target.value })}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea
                  className={inputClass}
                  rows={3}
                  value={draft.description}
                  onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                />
              </Field>
            </div>
            <Field label="X profile URL">
              <input
                className={inputClass}
                value={draft.socialX}
                inputMode="url"
                placeholder="https://"
                onChange={(event) => setDraft({ ...draft, socialX: event.target.value })}
              />
            </Field>
            <Field label="LinkedIn URL">
              <input
                className={inputClass}
                value={draft.socialLinkedin}
                inputMode="url"
                placeholder="https://"
                onChange={(event) => setDraft({ ...draft, socialLinkedin: event.target.value })}
              />
            </Field>
            <Field label="Canonical origin">
              <input
                className={inputClass}
                value={draft.canonicalOrigin}
                disabled={draft.envLocked.origin}
                inputMode="url"
                placeholder="https://example.com"
                onChange={(event) => setDraft({ ...draft, canonicalOrigin: event.target.value })}
              />
            </Field>
            {draft.envLocked.origin ? (
              <p className="text-xs text-muted sm:col-span-2">The public origin is set by the host.</p>
            ) : (
              <p className="text-xs text-muted sm:col-span-2">
                Used for the sitemap, the feed, and canonical links. Leave blank to use the address of the current visit.
              </p>
            )}
          </section>

          <section className="grid gap-3 sm:grid-cols-2">
            <h2 className="font-serif text-2xl sm:col-span-2">Measurement</h2>
            <p className="text-sm leading-relaxed text-muted sm:col-span-2">
              Google Analytics loads only after a reader allows measurement, and only if this ID is present. Search
              Console verification is a token, not a ranking.
            </p>
            <Field label="GA4 measurement ID">
              <input
                className={inputClass}
                value={draft.ga4Id}
                disabled={draft.envLocked.ga4}
                autoComplete="off"
                spellCheck={false}
                placeholder="G-"
                onChange={(event) => setDraft({ ...draft, ga4Id: event.target.value })}
              />
            </Field>
            <Field label="Search Console verification">
              <input
                className={inputClass}
                value={draft.gscVerification}
                disabled={draft.envLocked.gsc}
                autoComplete="off"
                spellCheck={false}
                onChange={(event) => setDraft({ ...draft, gscVerification: event.target.value })}
              />
            </Field>
          </section>

          <button
            className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper disabled:opacity-60"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving…" : "Save the journal"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">{error ? "" : "Opening settings…"}</p>
      )}

      <section>
        <h2 className="font-serif text-2xl">Redirects</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Both paths start with a slash. A request for the old path is sent to the new one. This does not rewrite links
          already printed in an essay.
        </p>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {redirects.length === 0 ? <li className="py-3 text-sm text-muted">No redirects yet.</li> : null}
          {redirects.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span>
                <span className="text-muted">{row.from_path}</span>
                <span> → {row.to_path}</span>
              </span>
              <button
                type="button"
                className="min-h-11 shrink-0 px-2 text-danger"
                onClick={() =>
                  void removeRedirect({ data: row.id })
                    .then(() => {
                      setNote("Redirect removed.");
                      return refreshRedirects();
                    })
                    .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not delete."))
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const data = new FormData(form);
            setError("");
            void saveRedirect({
              data: { from: String(data.get("from") ?? ""), to: String(data.get("to") ?? "") },
            })
              .then(() => {
                setNote("Redirect saved.");
                form.reset();
                return refreshRedirects();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save the redirect."));
          }}
        >
          <Field label="From">
            <input name="from" className={inputClass} required placeholder="/old-path" spellCheck={false} />
          </Field>
          <Field label="To">
            <input name="to" className={inputClass} required placeholder="/journal/new-slug" spellCheck={false} />
          </Field>
          <button className="min-h-11 rounded-full border border-line px-5 text-sm sm:col-span-2" type="submit">
            Add redirect
          </button>
        </form>
      </section>
    </div>
  );
}
