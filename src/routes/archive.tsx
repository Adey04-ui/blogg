import { createFileRoute, Link } from "@tanstack/react-router";
import { EssayIndex } from "@/components/story-card";
import { Shell } from "@/components/shell";
import { fetchCollection } from "@/lib/blog/public.functions";

export const Route = createFileRoute("/archive")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: ({ deps }) => fetchCollection({ data: { page: deps.page } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title:
          loaderData && loaderData.page > 1
            ? `Archive, page ${loaderData.page} — Meridian Journal`
            : "Archive — Meridian Journal",
      },
      { name: "description", content: "Every published essay in Meridian Journal, newest first." },
    ],
    links: loaderData?.origin
      ? [{ rel: "canonical", href: `${loaderData.origin}/archive${loaderData.page > 1 ? `?page=${loaderData.page}` : ""}` }]
      : [],
  }),
  component: Archive,
});

function Archive() {
  const data = Route.useLoaderData();
  const page = Route.useSearch().page ?? 1;
  return (
    <Shell>
      <EssayIndex
        kicker="Archive"
        title={data.intro?.title ?? "Archive"}
        description={data.intro?.description ?? ""}
        items={data.items}
        page={data.page}
        pages={data.pages}
        prev={
          page > 1 ? (
            <Link to="/archive" search={{ page: page - 1 }} className="inline-flex min-h-11 items-center">
              Previous
            </Link>
          ) : undefined
        }
        next={
          page < data.pages ? (
            <Link to="/archive" search={{ page: page + 1 }} className="inline-flex min-h-11 items-center">
              Next
            </Link>
          ) : undefined
        }
      />
    </Shell>
  );
}
