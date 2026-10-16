import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame, Field, inputClass } from "@/components/admin-frame";
import { analyticsFn, clearSampleFn, revenueFn, saveRevenueFn, saveSettingsFn, settingsFn } from "@/lib/blog/admin.functions";
import { countryLabel, delta, formatDate, formatDuration, money } from "@/lib/blog/format";

type Report = Awaited<ReturnType<typeof analyticsFn>>;
const PRESETS = [
  ["today", "Today"],
  ["yesterday", "Yesterday"],
  ["7d", "Last 7 days"],
  ["30d", "Last 30 days"],
  ["90d", "Last 90 days"],
] as const;

export const Route = createFileRoute("/admin/analytics")({
  component: () => (
    <AdminFrame>
      <Analytics />
    </AdminFrame>
  ),
});

function Analytics() {
  const load = useServerFn(analyticsFn);
  const clear = useServerFn(clearSampleFn);
  const loadSettings = useServerFn(settingsFn);
  const saveSettings = useServerFn(saveSettingsFn);
  const loadRevenue = useServerFn(revenueFn);
  const saveRevenue = useServerFn(saveRevenueFn);
  const [preset, setPreset] = useState<(typeof PRESETS)[number][0] | "custom">("30d");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sample, setSample] = useState(true);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [rpm, setRpm] = useState("4.5");
  const [records, setRecords] = useState<Awaited<ReturnType<typeof revenueFn>>>([]);
  const [Charts, setCharts] = useState<typeof import("@/components/traffic-charts").TrafficCharts | null>(null);

  useEffect(() => {
    void import("@/components/traffic-charts").then((mod) => setCharts(() => mod.TrafficCharts));
  }, []);

  useEffect(() => {
    let on = true;
    setError("");
    load({ data: { preset, from, to, sample } })
      .then((data) => {
        if (!on) return;
        setReport(data);
        setRpm(String(data.assumedRpm));
      })
      .catch((err: unknown) => {
        if (on) setError(err instanceof Error ? err.message : "Could not load analytics.");
      });
    return () => {
      on = false;
    };
  }, [from, load, preset, sample, to]);

  useEffect(() => {
    void loadRevenue().then(setRecords).catch(() => setRecords([]));
  }, [loadRevenue]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-4xl">Traffic</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          A visitor is a browser holding a random id in local storage. A session is that browser’s activity, and it
          expires after 30 minutes idle. Unique visitors are distinct visitor ids with a page view in the range. Bounce
          rate is the share of sessions with a single page view. Engagement time is visible time the page reported,
          averaged per session. These are first-party definitions. If Google Analytics is connected, its numbers stay
          in Google Analytics and are not mixed in here.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            className={`min-h-11 rounded-full px-4 text-sm ${preset === key ? "bg-ink text-paper" : "border border-line"}`}
            onClick={() => setPreset(key)}
          >
            {label}
          </button>
        ))}
        <button type="button" className={`min-h-11 rounded-full px-4 text-sm ${preset === "custom" ? "bg-ink text-paper" : "border border-line"}`} onClick={() => setPreset("custom")}>
          Custom
        </button>
        <button type="button" className={`min-h-11 rounded-full px-4 text-sm ${sample ? "bg-copper text-paper" : "border border-line"}`} onClick={() => setSample((value) => !value)}>
          {sample ? "Sample history on" : "Sample history off"}
        </button>
      </div>
      {preset === "custom" ? (
        <div className="flex flex-wrap gap-3">
          <Field label="From">
            <input type="date" className={inputClass} value={from} onChange={(event) => setFrom(event.target.value)} />
          </Field>
          <Field label="To">
            <input type="date" className={inputClass} value={to} onChange={(event) => setTo(event.target.value)} />
          </Field>
        </div>
      ) : null}
      {sample ? (
        <p className="rounded-2xl border border-line bg-card p-4 text-sm leading-relaxed">
          Sample history is included so the desk is readable before real visits arrive. It is generated, labeled, and
          not income. Hide it to see only visits this site has recorded.
          <button
            type="button"
            className="ml-3 underline"
            onClick={() => {
              if (!window.confirm("Delete the sample history?")) return;
              void clear().then(() => setSample(false));
            }}
          >
            Delete sample history
          </button>
        </p>
      ) : null}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {report ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label="Page views" value={String(report.views)} change={delta(report.views, report.previousViews)} />
            <Metric label="Unique visitors" value={String(report.visitors)} change={delta(report.visitors, report.previousVisitors)} hint="Distinct first-party visitor ids" />
            <Metric label="Sessions" value={String(report.sessions)} change={delta(report.sessions, report.previousSessions)} hint="30-minute idle timeout" />
            <Metric label="New visitors" value={String(report.newVisitors)} hint={`${report.returningVisitors} returning`} />
            <Metric label="Bounce rate" value={`${report.bounceRate}%`} hint="Single-page sessions" />
            <Metric label="Pages / session" value={String(report.pagesPerSession)} />
            <Metric label="Avg. engagement" value={formatDuration(report.avgEngagementMs)} hint="Visible time reported by the page" />
            <Metric label="Active now" value={String(report.liveActive)} hint="Near-real-time: sessions seen in 5 minutes. Not an exact live count." />
          </div>
          {Charts && report.series.length > 0 ? <Charts series={report.series} /> : <div className="h-56 rounded-2xl bg-line/50" />}
          <div className="grid gap-6 lg:grid-cols-2">
            <Breakdown title="Sources" rows={report.sources} />
            <Breakdown title="Devices" rows={report.devices} />
            <Breakdown title="Browsers" rows={report.browsers} />
            <Breakdown title="Systems" rows={report.systems} />
            <Breakdown title="Countries" rows={report.countries.map((row) => ({ ...row, name: countryLabel(row.name) }))} note="Shown when a country code was stored. IP addresses are not kept." />
            <List title="Top essays" rows={report.topArticles.map((row) => ({ name: row.title, count: row.views }))} />
            <List title="Top pages" rows={report.topPages.map((row) => ({ name: row.path, count: row.views }))} />
            <List title="Landing pages" rows={report.landings.map((row) => ({ name: row.path, count: row.views }))} />
            <List title="Exit pages" rows={report.exits.map((row) => ({ name: row.path, count: row.views }))} />
          </div>
          <section className="rounded-2xl border border-line p-4">
            <h2 className="font-serif text-2xl">Near-real-time</h2>
            <p className="mt-1 text-sm text-muted">Recent recorded page views. Estimated, and empty until someone browses with sample history excluded from this list.</p>
            <ul className="mt-3 divide-y divide-line text-sm">
              {report.recent.length === 0 ? <li className="py-2 text-muted">No live page views yet.</li> : null}
              {report.recent.map((row, index) => (
                <li key={`${row.path}-${index}`} className="flex flex-wrap justify-between gap-2 py-2">
                  <span>{row.path}</span>
                  <span className="text-muted">
                    {row.source} · {row.device} · {formatDate(row.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className="rounded-2xl border border-line p-4">
            <h2 className="font-serif text-2xl">Estimated advertising revenue</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              This is not AdSense reporting. The model is (page views ÷ 1,000) × an assumed page RPM of {report.assumedRpm}.
              For this range that is {money(report.modelRevenue)}. Actual earnings depend on impressions, geography,
              advertiser demand, and invalid-traffic adjustments. {sample ? "Sample page views are inside this model, so the figure is not money earned." : ""}
            </p>
            <form
              className="mt-4 flex flex-wrap items-end gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                void loadSettings().then((settings) =>
                  saveSettings({ data: { ...settings, assumedRpm: Number(rpm) || 0 } }),
                );
              }}
            >
              <Field label="Assumed page RPM (USD)">
                <input className={inputClass} value={rpm} onChange={(event) => setRpm(event.target.value)} inputMode="decimal" />
              </Field>
              <button className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper" type="submit">
                Save assumption
              </button>
            </form>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Recorded revenue" value={money(report.manualRevenue)} hint="Typed or imported by you. Not inferred from traffic." />
              <Metric label="Recorded impressions" value={String(report.manualImpressions)} />
              <Metric
                label="Impression RPM"
                value={report.manualImpressions > 0 ? money((report.manualRevenue / report.manualImpressions) * 1000) : "—"}
                hint="Only when you entered impressions."
              />
            </div>
            {report.revenueByArticle.length > 0 ? (
              <List title="Recorded revenue by path" rows={report.revenueByArticle.map((row) => ({ name: `${row.path} · ${money(row.revenue)}`, count: row.impressions }))} />
            ) : (
              <p className="mt-4 text-sm text-muted">No recorded revenue rows in this range.</p>
            )}
            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void saveRevenue({
                  data: {
                    day: String(form.get("day") ?? ""),
                    articlePath: String(form.get("path") ?? ""),
                    impressions: Number(form.get("impressions") ?? 0),
                    revenue: Number(form.get("revenue") ?? 0),
                    note: String(form.get("note") ?? ""),
                  },
                }).then(() => loadRevenue().then(setRecords));
              }}
            >
              <Field label="Day">
                <input type="date" name="day" required className={inputClass} />
              </Field>
              <Field label="Article path (optional)">
                <input name="path" placeholder="/journal/slug" className={inputClass} />
              </Field>
              <Field label="Impressions">
                <input name="impressions" type="number" min={0} defaultValue={0} className={inputClass} />
              </Field>
              <Field label="Revenue (USD)">
                <input name="revenue" type="number" min={0} step="0.01" required className={inputClass} />
              </Field>
              <Field label="Note">
                <input name="note" className={`${inputClass} sm:col-span-2`} placeholder="Copied from the AdSense report" />
              </Field>
              <button className="min-h-11 rounded-full border border-line px-5 text-sm sm:col-span-2" type="submit">
                Add recorded revenue
              </button>
            </form>
            <ul className="mt-4 text-sm text-muted">
              {records.slice(0, 8).map((row) => (
                <li key={row.id}>
                  {row.day} · {money(row.estimated_revenue)} · {row.article_path || "site"} {row.note ? `· ${row.note}` : ""}
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : (
        <p className="text-sm text-muted">Gathering the counts…</p>
      )}
    </div>
  );
}

function Metric({ label, value, change, hint }: { label: string; value: string; change?: number | null; hint?: string }) {
  return (
    <div className="metric-card">
      <p className="text-xs uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl">{value}</p>
      {change != null ? (
        <p className={`text-xs ${change >= 0 ? "text-moss" : "text-danger"}`}>
          {change > 0 ? "+" : ""}
          {change}% vs the previous window
        </p>
      ) : change === null ? (
        <p className="text-xs text-muted">No earlier window to compare</p>
      ) : null}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

function Breakdown({ title, rows, note }: { title: string; rows: { name: string; count: number }[]; note?: string }) {
  const max = Math.max(1, ...rows.map((row) => row.count));
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      {note ? <p className="text-xs text-muted">{note}</p> : null}
      <ul className="mt-3 space-y-2">
        {rows.map((row) => (
          <li key={row.name || "unknown"}>
            <div className="flex justify-between text-sm">
              <span>{row.name || "Unknown"}</span>
              <span className="text-muted">{row.count}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-line">
              <div className="h-1.5 rounded-full bg-copper" style={{ width: `${(row.count / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function List({ title, rows }: { title: string; rows: { name: string; count: number }[] }) {
  return (
    <section>
      <h2 className="font-serif text-2xl">{title}</h2>
      <ol className="mt-3 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.name} className="flex justify-between gap-3 border-b border-line py-1">
            <span>{row.name}</span>
            <span className="text-muted">{row.count}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
