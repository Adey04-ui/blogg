import type { Sql } from "@/lib/db";
import { readingMinutesFrom } from "./format";
import { SEED_ARTICLES } from "./seed-content";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AUTHORS = [
  {
    slug: "adaeze-okonkwo",
    name: "Adaeze Okonkwo",
    role: "Editor",
    bio: "Adaeze edits Meridian and writes about the sentences people actually finish. She previously ran a small city magazine and still prefers a printed proof.",
  },
  {
    slug: "jonah-pell",
    name: "Jonah Pell",
    role: "Staff writer",
    bio: "Jonah covers search, measurement, and the unglamorous maintenance that keeps a site legible. He believes a number without a method is a mood.",
  },
  {
    slug: "mira-chen",
    name: "Mira Chen",
    role: "Contributing writer",
    bio: "Mira writes about type, privacy, and the practical ethics of publishing on a small site. She reads proofs on a phone, in sunlight, on purpose.",
  },
];

const CATEGORIES = [
  {
    slug: "craft",
    name: "Craft",
    description: "Structure, type, and the sentences that hold a reader.",
  },
  {
    slug: "search",
    name: "Search",
    description: "Being found without superstition: titles, links, speed, and stable addresses.",
  },
  {
    slug: "publishing",
    name: "Publishing",
    description: "The responsibilities of a small site: privacy, originality, and ownership.",
  },
  {
    slug: "measurement",
    name: "Measurement",
    description: "Traffic, assumptions, and the difference between a model and a payment.",
  },
];

const TAGS = [
  ["writing", "Writing"],
  ["typography", "Typography"],
  ["web-vitals", "Web Vitals"],
  ["mobile", "Mobile"],
  ["privacy", "Privacy"],
  ["adsense", "AdSense"],
  ["linking", "Linking"],
  ["analytics", "Analytics"],
] as const;

export async function seedIfEmpty(sql: Sql): Promise<void> {
  const flagged = await sql<{ value: string }>`select value from app_flags where key = 'seed'`;
  if (flagged[0]?.value === "1") return;

  const settings = await sql`select id from site_settings where id = 1`;
  if (settings.length === 0) {
    await sql`
      insert into site_settings (
        id, name, tagline, description, email
      ) values (
        1,
        'Meridian Journal',
        'Essays on writing, attention, and the work of being read.',
        'Meridian Journal is an independent magazine for writers and small publishers. The essays cover craft, search, privacy, and honest measurement.',
        'editors@meridianjournal.example'
      )
    `;
  }

  for (const author of AUTHORS) {
    await sql`
      insert into authors (slug, name, role, bio)
      values (${author.slug}, ${author.name}, ${author.role}, ${author.bio})
      on conflict (slug) do nothing
    `;
  }
  for (const category of CATEGORIES) {
    await sql`
      insert into categories (slug, name, description)
      values (${category.slug}, ${category.name}, ${category.description})
      on conflict (slug) do nothing
    `;
  }
  for (const [slug, name] of TAGS) {
    await sql`
      insert into tags (slug, name) values (${slug}, ${name})
      on conflict (slug) do nothing
    `;
  }

  const authorRows = await sql<{ id: number; slug: string }>`select id, slug from authors`;
  const categoryRows = await sql<{ id: number; slug: string }>`select id, slug from categories`;
  const tagRows = await sql<{ id: number; slug: string }>`select id, slug from tags`;
  const authorId = new Map(authorRows.map((row) => [row.slug, row.id]));
  const categoryId = new Map(categoryRows.map((row) => [row.slug, row.id]));
  const tagId = new Map(tagRows.map((row) => [row.slug, row.id]));

  for (const article of SEED_ARTICLES) {
    const { minutes, words } = readingMinutesFrom(article.content);
    const published = new Date(Date.now() - article.daysAgo * 86400000).toISOString();
    const updated = new Date(Date.now() - Math.max(article.daysAgo - 1, 0) * 86400000).toISOString();
    await sql`
      insert into articles (
        slug, title, seo_title, excerpt, meta_description, content,
        featured_image, featured_alt, author_id, category_id, status, featured,
        reading_minutes, word_count, published_at, updated_at
      ) values (
        ${article.slug},
        ${article.title},
        ${article.seoTitle},
        ${article.excerpt},
        ${article.meta},
        ${article.content},
        ${article.image},
        ${article.alt},
        ${authorId.get(article.author) ?? 0},
        ${categoryId.get(article.category) ?? 0},
        'published',
        ${article.featured},
        ${minutes},
        ${words},
        ${published},
        ${updated}
      )
      on conflict (slug) do nothing
    `;
    const idRow = await sql<{ id: number }>`select id from articles where slug = ${article.slug}`;
    const id = idRow[0]?.id;
    if (!id) continue;
    for (const tag of article.tags) {
      const tid = tagId.get(tag);
      if (!tid) continue;
      await sql`
        insert into article_tags (article_id, tag_id) values (${id}, ${tid})
        on conflict do nothing
      `;
    }
  }

  const existingViews = await sql<{ c: number }>`select count(*)::int as c from page_views`;
  if ((existingViews[0]?.c ?? 0) === 0) {
    await seedSampleTraffic(sql);
  }

  await sql`
    insert into app_flags (key, value) values ('seed', '1')
    on conflict (key) do update set value = '1'
  `;
}

async function seedSampleTraffic(sql: Sql): Promise<void> {
  const articles = await sql<{ slug: string; title: string }>`
    select slug, title from articles where status = 'published'
  `;
  const pages = [
    ...articles.map((article) => ({
      path: `/journal/${article.slug}`,
      title: article.title,
      weight: 8,
    })),
    { path: "/", title: "Meridian Journal", weight: 10 },
    { path: "/archive", title: "Archive", weight: 3 },
    { path: "/about", title: "About", weight: 2 },
    { path: "/category/craft", title: "Craft", weight: 3 },
    { path: "/category/search", title: "Search", weight: 3 },
    { path: "/category/publishing", title: "Publishing", weight: 2 },
    { path: "/privacy", title: "Privacy", weight: 1 },
  ];
  const weightSum = pages.reduce((sum, page) => sum + page.weight, 0);
  const rand = mulberry32(20261013);
  const pick = <T,>(items: readonly T[]): T => items[Math.floor(rand() * items.length)] as T;
  const pickPage = () => {
    let cursor = rand() * weightSum;
    for (const page of pages) {
      cursor -= page.weight;
      if (cursor <= 0) return page;
    }
    return pages[0];
  };

  const devices = [
    ["mobile", 58],
    ["desktop", 36],
    ["tablet", 6],
  ] as const;
  const sources = [
    ["organic", 46],
    ["direct", 28],
    ["social", 14],
    ["referral", 12],
  ] as const;
  const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Chrome", "Safari"] as const;
  const osByDevice: Record<string, readonly string[]> = {
    mobile: ["iOS", "Android", "Android", "iOS"],
    tablet: ["iOS", "Android"],
    desktop: ["Windows", "macOS", "Linux", "Windows", "macOS"],
  };
  const countries = ["US", "US", "GB", "DE", "NG", "IN", "CA", "AU", "FR", "NL"] as const;

  const weighted = (pairs: readonly (readonly [string, number])[]) => {
    const total = pairs.reduce((sum, pair) => sum + pair[1], 0);
    let cursor = rand() * total;
    for (const [name, weight] of pairs) {
      cursor -= weight;
      if (cursor <= 0) return name;
    }
    return pairs[0][0];
  };

  type Row = {
    sessionId: string;
    visitorId: string;
    path: string;
    title: string;
    source: string;
    device: string;
    browser: string;
    os: string;
    country: string;
    createdAt: string;
    engagement: number;
  };

  const rows: Row[] = [];
  const sessions: Row[] = [];
  let sessionCounter = 0;
  for (let day = 89; day >= 0; day -= 1) {
    const recency = day < 7 ? 1.55 : day < 30 ? 1.2 : 1;
    const sessionCount = Math.round((6 + rand() * 10) * recency);
    for (let s = 0; s < sessionCount; s += 1) {
      sessionCounter += 1;
      const visitorId = `sample-${Math.floor(rand() * 380).toString(16).padStart(4, "0")}`;
      const sessionId = `sample-s-${sessionCounter}`;
      const device = weighted(devices);
      const source = weighted(sources);
      const browser = pick(browsers);
      const os = pick(osByDevice[device] ?? ["Other"]);
      const country = pick(countries);
      const length = rand() < 0.46 ? 1 : rand() < 0.75 ? 2 : 3;
      const startHour = Math.floor(rand() * 24);
      const start = new Date();
      start.setUTCHours(startHour, Math.floor(rand() * 60), Math.floor(rand() * 60), 0);
      start.setUTCDate(start.getUTCDate() - day);
      const first = pickPage();
      for (let v = 0; v < length; v += 1) {
        const page = v === 0 ? first : pickPage();
        const at = new Date(start.getTime() + v * (40000 + rand() * 90000));
        const engagement =
          length === 1 ? Math.floor(rand() * 18000) : Math.floor(20000 + rand() * 70000);
        const row: Row = {
          sessionId,
          visitorId,
          path: page.path,
          title: page.title,
          source,
          device,
          browser,
          os,
          country,
          createdAt: at.toISOString(),
          engagement,
        };
        rows.push(row);
        if (v === 0) sessions.push(row);
      }
    }
  }

  const chunk = 40;
  for (let i = 0; i < sessions.length; i += chunk) {
    const slice = sessions.slice(i, i + chunk);
    const values: unknown[] = [];
    const tuples = slice.map((row) => {
      const base = values.length;
      values.push(
        row.sessionId,
        row.visitorId,
        row.createdAt,
        row.createdAt,
        row.path,
        row.source,
        row.device,
        row.browser,
        row.os,
        row.country,
      );
      const p = (n: number) => `$${base + n}`;
      return `(${p(1)}, ${p(2)}, ${p(3)}, ${p(4)}, ${p(5)}, ${p(6)}, ${p(7)}, ${p(8)}, ${p(9)}, ${p(10)}, true)`;
    });
    await sql.query(
      `insert into sessions (
        id, visitor_id, started_at, last_seen_at, landing_path, source, device, browser, os, country, synthetic
      ) values ${tuples.join(",")} on conflict (id) do nothing`,
      values,
    );
  }

  for (let i = 0; i < rows.length; i += chunk) {
    const slice = rows.slice(i, i + chunk);
    const values: unknown[] = [];
    const tuples = slice.map((row) => {
      const base = values.length;
      values.push(
        row.sessionId,
        row.visitorId,
        row.path,
        row.title,
        row.source,
        row.device,
        row.browser,
        row.os,
        row.country,
        row.engagement,
        row.createdAt,
      );
      const p = (n: number) => `$${base + n}`;
      return `(${p(1)}, ${p(2)}, ${p(3)}, ${p(4)}, ${p(5)}, ${p(6)}, ${p(7)}, ${p(8)}, ${p(9)}, ${p(10)}, true, ${p(11)})`;
    });
    await sql.query(
      `insert into page_views (
        session_id, visitor_id, path, title, source, device, browser, os, country, engagement_ms, synthetic, created_at
      ) values ${tuples.join(",")}`,
      values,
    );
  }
}
