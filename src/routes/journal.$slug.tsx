import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { ArticleView } from "@/components/article-view";
import { Shell } from "@/components/shell";
import { fetchArticle } from "@/lib/blog/public.functions";

export const Route = createFileRoute("/journal/$slug")({
  loader: async ({ params }) => {
    const data = await fetchArticle({ data: params.slug });
    if (data.redirectTo) throw redirect({ href: data.redirectTo, statusCode: 301 });
    if (!data.article || !data.settings || data.origin == null || !data.related) throw notFound();
    return {
      article: data.article,
      related: data.related,
      origin: data.origin,
      settings: data.settings,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Essay — Meridian Journal" }] };
    const { article, origin, settings } = loaderData;
    const canonical = article.canonicalUrl || `${origin}/journal/${article.slug}`;
    const image = article.image.startsWith("http") ? article.image : `${origin}${article.image}`;
    return {
      meta: [
        { title: `${article.seoTitle} — ${settings.name}` },
        { name: "description", content: article.metaDescription },
        { property: "og:title", content: article.seoTitle },
        { property: "og:description", content: article.metaDescription },
        { property: "og:type", content: "article" },
        { property: "og:url", content: canonical },
        ...(article.image ? [{ property: "og:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: () => (
    <Shell>
      <ArticleView data={Route.useLoaderData()} />
    </Shell>
  ),
});
