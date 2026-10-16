import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { EssayIndex } from "@/components/story-card";
import { Shell } from "@/components/shell";
import { fetchCollection } from "@/lib/blog/public.functions";

export const Route = createFileRoute("/tag/$slug")({
  validateSearch: (search: Record<string, unknown>): { page?: number } => ({
    page: Math.max(1, Number(search.page) || 1),
  }),
  loaderDeps: ({ search }) => ({ page: search.page ?? 1 }),
  loader: async ({ params, deps }) => {
    const data = await fetchCollection({ data: { tagSlug: params.slug, page: deps.page } });
    if (!data.intro) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.intro?.title ?? "Tag"} — Meridian Journal` },
      { name: "description", content: loaderData?.intro?.description ?? "" },
    ],
    links: loaderData?.origin ? [{ rel: "canonical", href: `${loaderData.origin}/tag/${params.slug}` }] : [],
  }),
  component: TagPage,
});

function TagPage() {
  const data = Route.useLoaderData();
  const { slug } = Route.useParams();
  const page = Route.useSearch().page ?? 1;
  return (
    <Shell>
      <EssayIndex
        kicker="Tag"
        title={data.intro?.title ?? slug}
        description={data.intro?.description ?? ""}
        items={data.items}
        page={data.page}
        pages={data.pages}
        prev={
          page > 1 ? (
            <Link to="/tag/$slug" params={{ slug }} search={{ page: page - 1 }} className="inline-flex min-h-11 items-center">
              Previous
            </Link>
          ) : undefined
        }
        next={
          page < data.pages ? (
            <Link to="/tag/$slug" params={{ slug }} search={{ page: page + 1 }} className="inline-flex min-h-11 items-center">
              Next
            </Link>
          ) : undefined
        }
      />
    </Shell>
  );
}
