import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { AdSlot } from "./ads";
import { formatDate } from "@/lib/blog/format";
import { jsonLd } from "@/lib/blog/markdown";
import type { ArticlePayload } from "@/lib/blog/db.server";

export function ArticleView({ data }: { data: Required<Pick<ArticlePayload, "article" | "related" | "origin" | "settings">> }) {
  const { article, related, origin, settings } = data;
  const canonical = article.canonicalUrl || `${origin}/journal/${article.slug}`;
  const image = article.image.startsWith("http") ? article.image : `${origin}${article.image}`;
  const share = encodeURIComponent(canonical);
  const [copied, setCopied] = useState(false);
  const mid = Math.floor(article.blocks.length / 2);
  const showMid = settings.adMid && article.blocks.length > 6;

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: article.title,
        description: article.metaDescription,
        image: article.image ? image : undefined,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        author: { "@type": "Person", name: article.authorName, url: `${origin}/author/${article.authorSlug}` },
        publisher: { "@type": "Organization", name: settings.name, url: origin },
        mainEntityOfPage: canonical,
        wordCount: undefined,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: origin },
          {
            "@type": "ListItem",
            position: 2,
            name: article.categoryName,
            item: `${origin}/category/${article.categorySlug}`,
          },
          { "@type": "ListItem", position: 3, name: article.title, item: canonical },
        ],
      },
    ],
  };

  return (
    <article className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ld) }} />
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link to="/" className="hover:text-copper">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/category/$slug" params={{ slug: article.categorySlug }} className="hover:text-copper">
              {article.categoryName}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink">{article.title}</li>
        </ol>
      </nav>
      <header className="mx-auto mt-6 max-w-[68ch]">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-copper">{article.categoryName}</p>
        <h1 className="mt-3 font-serif text-[2.4rem] leading-[1.08] tracking-[-0.03em] sm:text-5xl">{article.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">{article.excerpt}</p>
        <p className="mt-5 text-sm text-muted">
          <Link to="/author/$slug" params={{ slug: article.authorSlug }} className="text-ink underline-offset-4 hover:underline">
            {article.authorName}
          </Link>
          {" · "}
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          {article.updatedAt.slice(0, 10) !== article.publishedAt.slice(0, 10) ? (
            <>
              {" · Updated "}
              <time dateTime={article.updatedAt}>{formatDate(article.updatedAt)}</time>
            </>
          ) : null}
          {" · "}
          {article.readingMinutes} min read
        </p>
      </header>
      {article.image ? (
        <figure className="mx-auto mt-8 max-w-4xl">
          <img
            src={article.image}
            alt={article.alt}
            width={1200}
            height={800}
            fetchPriority="high"
            decoding="async"
            className="aspect-[3/2] w-full rounded-2xl object-cover"
          />
        </figure>
      ) : null}
      <div className="mx-auto mt-10 grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-center">
        <div>
          {article.headings.length >= 3 ? (
            <details className="mb-8 rounded-2xl border border-line bg-card p-4 lg:hidden">
              <summary className="cursor-pointer text-sm font-medium">On this page</summary>
              <Toc headings={article.headings} />
            </details>
          ) : null}
          <div className="prose-journal">
            {article.blocks.map((html, index) => (
              <div key={index}>
                <div dangerouslySetInnerHTML={{ __html: html }} />
                {index === 1 ? <AdSlot settings={settings} position="intro" slot={settings.slotIntro} /> : null}
                {showMid && index === mid ? <AdSlot settings={settings} position="mid" slot={settings.slotMid} /> : null}
              </div>
            ))}
          </div>
          <AdSlot settings={settings} position="end" slot={settings.slotEnd} />
          {article.tags.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Tags">
              {article.tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    to="/tag/$slug"
                    params={{ slug: tag.slug }}
                    className="inline-flex min-h-11 items-center rounded-full border border-line px-3 text-sm hover:border-copper"
                  >
                    {tag.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <a className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={`https://twitter.com/intent/tweet?url=${share}&text=${encodeURIComponent(article.title)}`}>
              Share on X
            </a>
            <a className="inline-flex min-h-11 items-center underline-offset-4 hover:underline" href={`https://www.linkedin.com/sharing/share-offsite/?url=${share}`}>
              LinkedIn
            </a>
            <button
              type="button"
              className="min-h-11 underline-offset-4 hover:underline"
              onClick={() => {
                void navigator.clipboard.writeText(canonical).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                });
              }}
            >
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <aside className="mt-10 rounded-2xl border border-line bg-card p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-copper">{article.authorRole}</p>
            <h2 className="mt-2 font-serif text-2xl">
              <Link to="/author/$slug" params={{ slug: article.authorSlug }}>
                {article.authorName}
              </Link>
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{article.authorBio}</p>
          </aside>
        </div>
        <aside className="hidden lg:block">
          {article.headings.length >= 3 ? (
            <nav className="sticky top-8" aria-label="On this page">
              <p className="text-xs uppercase tracking-[0.16em] text-muted">On this page</p>
              <Toc headings={article.headings} />
            </nav>
          ) : null}
          <div className="sticky top-8 mt-8">
            <AdSlot settings={settings} position="sidebar" slot={settings.slotSidebar} />
          </div>
        </aside>
      </div>
      {related.length > 0 ? (
        <section className="mx-auto mt-16 max-w-6xl border-t border-line pt-8">
          <h2 className="font-serif text-3xl">Continue reading</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <Link to="/journal/$slug" params={{ slug: item.slug }} className="group block">
                  <img src={item.image} alt="" width={1200} height={800} loading="lazy" className="aspect-[3/2] rounded-xl object-cover" />
                  <p className="mt-3 font-serif text-xl leading-snug group-hover:text-copper">{item.title}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}

function Toc({ headings }: { headings: { id: string; text: string; level: 2 | 3 }[] }) {
  return (
    <ol className="mt-3 space-y-2 text-sm">
      {headings.map((heading) => (
        <li key={heading.id} className={heading.level === 3 ? "pl-3" : ""}>
          <a href={`#${heading.id}`} className="text-muted hover:text-copper">
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}
