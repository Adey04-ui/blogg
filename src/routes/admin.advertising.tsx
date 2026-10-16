import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame, Field, Notice, inputClass } from "@/components/admin-frame";
import { checklistFn, saveSettingsFn } from "@/lib/blog/admin.functions";
import type { ChecklistItem, Settings } from "@/lib/blog/db.server";

export const Route = createFileRoute("/admin/advertising")({
  component: () => (
    <AdminFrame>
      <Advertising />
    </AdminFrame>
  ),
});

const TONE: Record<ChecklistItem["status"], { label: string; className: string }> = {
  pass: { label: "In place", className: "text-moss" },
  warn: { label: "Needs a look", className: "text-copper" },
  fail: { label: "Missing", className: "text-danger" },
};

function Advertising() {
  const load = useServerFn(checklistFn);
  const save = useServerFn(saveSettingsFn);
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [draft, setDraft] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    load().then((result) => {
      setItems(result.items);
      setDraft(result.settings);
    });

  useEffect(() => {
    void refresh().catch((err: unknown) =>
      setError(err instanceof Error ? err.message : "Could not open the checklist."),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pass = items.filter((item) => item.status === "pass").length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-4xl tracking-tight">Advertising</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          A private checklist for a small publisher. Saving here records your notes and the IDs this site will use. It
          does not apply to Google, and it does not mean an account will be approved.
        </p>
      </div>
      <Notice error={error} note={note} />
      {draft ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Checks in place</p>
              <p className="mt-2 font-serif text-4xl">
                {pass}
                <span className="text-lg text-muted">/{items.length}</span>
              </p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Ads on essays</p>
              <p className="mt-2 font-serif text-4xl">{draft.adsEnabled ? "On" : "Off"}</p>
            </div>
            <div className="metric-card">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Publisher ID</p>
              <p className="mt-2 truncate font-serif text-2xl">{draft.adsenseClient || "Not set"}</p>
            </div>
          </div>

          <ol className="divide-y divide-line border-y border-line">
            {items.map((item) => {
              const tone = TONE[item.status];
              return (
                <li key={item.id} className="grid gap-1 py-4 sm:grid-cols-[8.5rem_1fr] sm:gap-6">
                  <p className={`text-xs font-medium uppercase tracking-[0.14em] ${tone.className}`}>{tone.label}</p>
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <form
            className="space-y-8"
            onSubmit={(event) => {
              event.preventDefault();
              if (!draft) return;
              setSaving(true);
              setError("");
              setNote("");
              void save({ data: draft })
                .then(() => refresh())
                .then(() => setNote("Advertising notes saved."))
                .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."))
                .finally(() => setSaving(false));
            }}
          >
            <section className="space-y-4">
              <h2 className="font-serif text-2xl">Account and slots</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted">
                Use a publisher ID shaped like <span className="text-ink">ca-pub-</span> followed by digits. Slot IDs
                come from the ad units you create. Leave ads off until both exist.{" "}
                <a className="text-copper" href="/ads.txt">
                  View ads.txt
                </a>
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Publisher ID">
                  <input
                    className={inputClass}
                    value={draft.adsenseClient}
                    disabled={draft.envLocked.adsense}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft({ ...draft, adsenseClient: event.target.value })}
                  />
                </Field>
                <Field label="Intro slot">
                  <input
                    className={inputClass}
                    value={draft.slotIntro}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft({ ...draft, slotIntro: event.target.value })}
                  />
                </Field>
                <Field label="Mid-article slot">
                  <input
                    className={inputClass}
                    value={draft.slotMid}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft({ ...draft, slotMid: event.target.value })}
                  />
                </Field>
                <Field label="End slot">
                  <input
                    className={inputClass}
                    value={draft.slotEnd}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft({ ...draft, slotEnd: event.target.value })}
                  />
                </Field>
                <Field label="Sidebar slot">
                  <input
                    className={inputClass}
                    value={draft.slotSidebar}
                    autoComplete="off"
                    spellCheck={false}
                    onChange={(event) => setDraft({ ...draft, slotSidebar: event.target.value })}
                  />
                </Field>
              </div>
              {draft.envLocked.adsense ? (
                <p className="text-xs text-muted">The publisher ID is set by the host and cannot be edited here.</p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-2">
                <Check
                  checked={draft.adsEnabled}
                  disabled={draft.envLocked.ads}
                  onChange={(adsEnabled) => setDraft({ ...draft, adsEnabled })}
                  label="Show reserved ad spaces on essays"
                />
                <Check
                  checked={draft.adIntro}
                  onChange={(adIntro) => setDraft({ ...draft, adIntro })}
                  label="Intro placement"
                />
                <Check checked={draft.adMid} onChange={(adMid) => setDraft({ ...draft, adMid })} label="Mid-article placement" />
                <Check checked={draft.adEnd} onChange={(adEnd) => setDraft({ ...draft, adEnd })} label="End placement" />
                <Check
                  checked={draft.adSidebar}
                  onChange={(adSidebar) => setDraft({ ...draft, adSidebar })}
                  label="Sidebar placement"
                />
                <Check
                  checked={draft.consentRequired}
                  onChange={(consentRequired) => setDraft({ ...draft, consentRequired })}
                  label="Ask before measurement and ads"
                />
              </div>
              {draft.envLocked.ads ? (
                <p className="text-xs text-muted">The host decides whether ads are on. Placements can still be edited.</p>
              ) : null}
            </section>

            <section className="space-y-3">
              <h2 className="font-serif text-2xl">Your acknowledgements</h2>
              <p className="max-w-2xl text-sm leading-relaxed text-muted">
                Tick these only when they are true. They stay on this desk. They are not a submission.
              </p>
              <Check
                checked={draft.ackOriginal}
                onChange={(ackOriginal) => setDraft({ ...draft, ackOriginal })}
                label="The essays are original work I have the right to publish."
              />
              <Check
                checked={draft.ackPolicies}
                onChange={(ackPolicies) => setDraft({ ...draft, ackPolicies })}
                label="I have read the policies of any advertising program I intend to apply to."
              />
              <Check
                checked={draft.ackOwnership}
                onChange={(ackOwnership) => setDraft({ ...draft, ackOwnership })}
                label="I publish this journal, or I am editing it for the publisher."
              />
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper disabled:opacity-60"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save advertising notes"}
              </button>
              <Link to="/admin/settings" className="inline-flex min-h-11 items-center text-sm text-copper">
                Journal settings
              </Link>
            </div>
          </form>
        </>
      ) : (
        <p className="text-sm text-muted">{error ? "" : "Opening the checklist…"}</p>
      )}
    </div>
  );
}

function Check({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 items-start gap-3 py-1 text-sm leading-snug">
      <input
        type="checkbox"
        className="mt-1 size-4 accent-copper"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
