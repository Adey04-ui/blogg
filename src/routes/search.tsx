import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/shell";
import { StoryCard } from "@/components/story-card";
import { fetchSearch } from "@/lib/blog/public.functions";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q: typeof search.q === "string" ? search.q.slice(0, 80) : "",
  }),
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ deps }) => fetchSearch({ data: deps.q }),
  head: () => ({
    meta: [
      { title: "Search — Meridian Journal" },
      { name: "description", content: "Search published essays." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const data = Route.useLoaderData();
  const [q, setQ] = useState(data.q);
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-serif text-5xl tracking-tight">Search</h1>
        <form action="/search" className="mt-6 flex max-w-xl gap-2">
          <input
            name="q"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            aria-label="Search essays"
            className="min-h-11 w-full rounded-full border border-line bg-card px-4 text-sm"
          />
          <button type="submit" className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper">
            Search
          </button>
        </form>
        <p className="mt-4 text-sm text-muted">Search results are not indexed.</p>
        {data.q && data.items.length === 0 ? (
          <p className="mt-8">No essays matched “{data.q}”.</p>
        ) : (
          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {data.items.map((item) => (
              <StoryCard key={item.slug} item={item} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
