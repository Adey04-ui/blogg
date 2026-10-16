import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { formatDate } from "@/lib/blog/format";
import type { Card } from "@/lib/blog/db.server";

export function StoryCard({ item }: { item: Card }) {
  return (
    <article className="group flex flex-col">
      <Link to="/journal/$slug" params={{ slug: item.slug }} className="block">
        <img
          src={item.image}
          alt={item.alt}
          width={1200}
          height={800}
          loading="lazy"
          decoding="async"
          className="aspect-[3/2] w-full rounded-2xl object-cover transition duration-200 group-hover:opacity-95"
        />
        <p className="mt-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-copper">{item.categoryName}</p>
        <h2 className="mt-1 font-serif text-[1.45rem] leading-[1.2] tracking-[-0.02em] group-hover:text-copper">
          {item.title}
        </h2>
      </Link>
      <p className="mt-2 text-sm leading-relaxed text-muted">{item.excerpt}</p>
      <p className="mt-3 text-xs text-muted">
        {item.authorName} · {formatDate(item.publishedAt)} · {item.readingMinutes} min read
      </p>
    </article>
  );
}

export function EssayIndex({
  kicker,
  title,
  description,
  items,
  page,
  pages,
  prev,
  next,
}: {
  kicker: string;
  title: string;
  description: string;
  items: Card[];
  page: number;
  pages: number;
  prev?: ReactNode;
  next?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-copper">{kicker}</p>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">{description}</p>
      {items.length === 0 ? (
        <p className="mt-10 text-muted">Nothing is filed here yet.</p>
      ) : (
        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <StoryCard key={item.slug} item={item} />
          ))}
        </div>
      )}
      {pages > 1 ? (
        <nav className="mt-10 flex items-center justify-between text-sm" aria-label="Pagination">
          <span>{prev ?? <span />}</span>
          <span className="text-muted">
            Page {page} of {pages}
          </span>
          <span>{next ?? <span />}</span>
        </nav>
      ) : null}
    </div>
  );
}
