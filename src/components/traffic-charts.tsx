import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrafficCharts({
  series,
}: {
  series: { day: string; views: number; model: number }[];
}) {
  const data = series.map((point) => ({ ...point, label: point.day.slice(5) }));
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <figure className="rounded-2xl border border-line bg-card p-4">
        <figcaption className="mb-3 text-sm text-muted">Page views by day</figcaption>
        <div className="h-56 text-copper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 11 }} interval="preserveStartEnd" stroke="currentColor" />
              <YAxis width={36} tick={{ fill: "currentColor", fontSize: 11 }} stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="views" fill="var(--copper)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
      <figure className="rounded-2xl border border-line bg-card p-4">
        <figcaption className="mb-3 text-sm text-muted">Modeled revenue by day, from assumed page RPM</figcaption>
        <div className="h-56 text-moss">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="label" tick={{ fill: "currentColor", fontSize: 11 }} interval="preserveStartEnd" stroke="currentColor" />
              <YAxis width={40} tick={{ fill: "currentColor", fontSize: 11 }} stroke="currentColor" />
              <Tooltip />
              <Bar dataKey="model" fill="var(--moss)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </figure>
    </div>
  );
}
