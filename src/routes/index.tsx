import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { StoryCard } from "@/components/story-card";
import { fetchHome } from "@/lib/blog/public.functions";
import { formatDate } from "@/lib/blog/format";
import { jsonLd } from "@/lib/blog/markdown";

export const Route = createFileRoute("/")({
  loader: () => fetchHome(),
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData?.settings.name ?? "Meridian Journal" },
      { name: "description", content: loaderData?.settings.description ?? "" },
    ],
    links: loaderData?.origin ? [{ rel: "canonical", href: `${loaderData.origin}/` }] : [],
  }),
  component: Home,
});

function Home() {
  const data = Route.useLoaderData();
  const { hero, latest, popular, settings, origin, categories } = data;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: settings.name,
        description: settings.description,
        url: origin,
        potentialAction: {
          "@type": "SearchAction",
          target: `${origin}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        name: settings.name,
        url: origin,
        email: settings.email || undefined,
        sameAs: [settings.socialX, settings.socialLinkedin].filter(Boolean),
      },
    ],
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        <p className="max-w-xl text-lg leading-relaxed text-muted">{settings.tagline}</p>
        {hero ? (
          <section className="mt-8 grid items-center gap-8 lg:grid-cols-12">
            <Link to="/journal/$slug" params={{ slug: hero.slug }} className="group lg:col-span-7">
              <img
                src={hero.image}
                alt={hero.alt}
                width={1200}
                height={800}
                fetchPriority="high"
                decoding="async"
                className="aspect-[3/2] w-full rounded-3xl object-cover"
              />
            </Link>
            <div className="lg:col-span-5">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-copper">{hero.categoryName}</p>
              <h1 className="mt-3 font-serif text-4xl leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                <Link to="/journal/$slug" params={{ slug: hero.slug }} className="hover:text-copper">
                  {hero.title}
                </Link>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted">{hero.excerpt}</p>
              <p className="mt-4 text-sm text-muted">
                {hero.authorName} · {formatDate(hero.publishedAt)} · {hero.readingMinutes} min read
              </p>
            </div>
          </section>
        ) : (
          <h1 className="mt-8 font-serif text-5xl">The journal is quiet.</h1>
        )}

        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-serif text-3xl">Latest</h2>
            <Link to="/archive" className="text-sm text-copper">
              All essays
            </Link>
          </div>
          <div className="mt-6 grid gap-10 sm:grid-cols-2">
            {latest.map((item) => (
              <StoryCard key={item.slug} item={item} />
            ))}
          </div>
        </section>

        <section className="mt-14 grid gap-10 lg:grid-cols-[1fr_280px]">
          <div>
            <h2 className="font-serif text-3xl">Sections</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    to="/category/$slug"
                    params={{ slug: category.slug }}
                    className="flex min-h-14 items-center justify-between gap-4 py-3 hover:text-copper"
                  >
                    <span className="font-serif text-2xl">{category.name}</span>
                    <span className="text-sm text-muted">{category.description}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <aside>
            <h2 className="font-serif text-3xl">Most read</h2>
            <ol className="mt-4 space-y-4">
              {popular.map((item, index) => (
                <li key={item.slug} className="flex gap-3">
                  <span className="font-serif text-2xl text-copper">{index + 1}</span>
                  <Link to="/journal/$slug" params={{ slug: item.slug }} className="font-serif text-lg leading-snug hover:text-copper">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ol>
          </aside>
        </section>
      </div>
    </Shell>
  );
}
