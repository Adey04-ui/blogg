import { getSql, type Sql } from "@/lib/db";
import { getRequest } from "@tanstack/react-start/server";
import { readingMinutesFrom, slugify } from "./format";
import { renderMarkdown } from "./markdown";
import { seedIfEmpty } from "./seed.server";

let ready: Promise<void> | null = null;

export function ensureBlog(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      const sql = await getSql();
      await seedIfEmpty(sql);
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

export type Settings = {
  name: string;
  tagline: string;
  description: string;
  canonicalOrigin: string;
  socialX: string;
  socialLinkedin: string;
  email: string;
  ga4Id: string;
  gscVerification: string;
  adsenseClient: string;
  slotIntro: string;
  slotMid: string;
  slotEnd: string;
  slotSidebar: string;
  adsEnabled: boolean;
  adIntro: boolean;
  adMid: boolean;
  adEnd: boolean;
  adSidebar: boolean;
  assumedRpm: number;
  consentRequired: boolean;
  ackOriginal: boolean;
  ackPolicies: boolean;
  ackOwnership: boolean;
  envLocked: {
    adsense: boolean;
    ga4: boolean;
    gsc: boolean;
    origin: boolean;
    ads: boolean;
  };
};

type SettingsRow = {
  name: string;
  tagline: string;
  description: string;
  canonical_origin: string;
  social_x: string;
  social_linkedin: string;
  email: string;
  ga4_id: string;
  gsc_verification: string;
  adsense_client: string;
  slot_intro: string;
  slot_mid: string;
  slot_end: string;
  slot_sidebar: string;
  ads_enabled: boolean;
  ad_intro: boolean;
  ad_mid: boolean;
  ad_end: boolean;
  ad_sidebar: boolean;
  assumed_rpm: string | number;
  consent_required: boolean;
  ack_original: boolean;
  ack_policies: boolean;
  ack_ownership: boolean;
};

function env(name: string): string {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : "";
}

export function mapSettings(row: SettingsRow): Settings {
  const adsEnv = env("ADS_ENABLED").toLowerCase();
  return {
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    canonicalOrigin: env("CANONICAL_ORIGIN") || row.canonical_origin,
    socialX: row.social_x,
    socialLinkedin: row.social_linkedin,
    email: row.email,
    ga4Id: env("GA4_MEASUREMENT_ID") || row.ga4_id,
    gscVerification: env("GSC_VERIFICATION") || row.gsc_verification,
    adsenseClient: env("ADSENSE_CLIENT") || row.adsense_client,
    slotIntro: env("ADSENSE_SLOT_INTRO") || row.slot_intro,
    slotMid: env("ADSENSE_SLOT_MID") || row.slot_mid,
    slotEnd: env("ADSENSE_SLOT_END") || row.slot_end,
    slotSidebar: env("ADSENSE_SLOT_SIDEBAR") || row.slot_sidebar,
    adsEnabled: adsEnv === "false" ? false : adsEnv === "true" ? true : row.ads_enabled,
    adIntro: row.ad_intro,
    adMid: row.ad_mid,
    adEnd: row.ad_end,
    adSidebar: row.ad_sidebar,
    assumedRpm: Number(row.assumed_rpm) || 0,
    consentRequired: row.consent_required,
    ackOriginal: row.ack_original,
    ackPolicies: row.ack_policies,
    ackOwnership: row.ack_ownership,
    envLocked: {
      adsense: Boolean(env("ADSENSE_CLIENT")),
      ga4: Boolean(env("GA4_MEASUREMENT_ID")),
      gsc: Boolean(env("GSC_VERIFICATION")),
      origin: Boolean(env("CANONICAL_ORIGIN")),
      ads: adsEnv === "true" || adsEnv === "false",
    },
  };
}

export async function readSettings(sql: Sql): Promise<Settings> {
  const rows = await sql<SettingsRow>`select * from site_settings where id = 1`;
  const row = rows[0];
  if (!row) throw new Error("Site settings are missing.");
  return mapSettings(row);
}

export function requestOrigin(settings: Settings): string {
  if (settings.canonicalOrigin) {
    try {
      return new URL(settings.canonicalOrigin).origin;
    } catch {
      /* fall through */
    }
  }
  try {
    return new URL(getRequest().url).origin;
  } catch {
    return "";
  }
}

export type Card = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  categoryName: string;
  categorySlug: string;
  authorName: string;
  authorSlug: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  featured: boolean;
};

type CardRow = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  category_name: string;
  category_slug: string;
  author_name: string;
  author_slug: string;
  published_at: string;
  updated_at: string;
  reading_minutes: number;
  featured: boolean;
};

const CARD_SELECT = `
  select a.slug, a.title, a.excerpt,
    a.featured_image as image, a.featured_alt as alt,
    c.name as category_name, c.slug as category_slug,
    au.name as author_name, au.slug as author_slug,
    to_char(a.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
    to_char(a.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
    a.reading_minutes, a.featured
  from articles a
  join categories c on c.id = a.category_id
  join authors au on au.id = a.author_id
`;

function toCard(row: CardRow): Card {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    image: row.image,
    alt: row.alt,
    categoryName: row.category_name,
    categorySlug: row.category_slug,
    authorName: row.author_name,
    authorSlug: row.author_slug,
    publishedAt: row.published_at,
    updatedAt: row.updated_at,
    readingMinutes: row.reading_minutes,
    featured: row.featured,
  };
}

export async function getShell() {
  await ensureBlog();
  const sql = await getSql();
  const settings = await readSettings(sql);
  const categories = await sql<{ slug: string; name: string; description: string }>`
    select slug, name, description from categories order by name
  `;
  return { settings, categories, origin: requestOrigin(settings) };
}

export async function loadHome() {
  const shell = await getShell();
  const sql = await getSql();
  const featured = (
    await sql.query<CardRow>(
      publishedCards("and a.featured = true order by a.published_at desc limit 1"),
    )
  ).map(toCard);
  const latest = (
    await sql.query<CardRow>(
      publishedCards("order by a.published_at desc limit 7"),
    )
  ).map(toCard);
  const popular = (
    await sql.query<CardRow>(
      `${CARD_SELECT}
       where a.status = 'published'
       order by (select count(*) from page_views p where p.path = '/journal/' || a.slug) desc,
         a.published_at desc
       limit 5`,
    )
  ).map(toCard);
  const hero = featured[0] ?? latest[0] ?? null;
  const rest = latest.filter((item) => item.slug !== hero?.slug);
  return { ...shell, hero, latest: rest.slice(0, 4), more: rest.slice(4), popular };
}

export async function loadCollection(opts: {
  categorySlug?: string;
  authorSlug?: string;
  tagSlug?: string;
  page: number;
  pageSize?: number;
}) {
  const shell = await getShell();
  const sql = await getSql();
  const pageSize = opts.pageSize ?? 6;
  const page = Math.max(1, opts.page);
  const offset = (page - 1) * pageSize;
  const filters: string[] = ["a.status = 'published'"];
  const params: unknown[] = [];
  if (opts.categorySlug) {
    params.push(opts.categorySlug);
    filters.push(`c.slug = $${params.length}`);
  }
  if (opts.authorSlug) {
    params.push(opts.authorSlug);
    filters.push(`au.slug = $${params.length}`);
  }
  if (opts.tagSlug) {
    params.push(opts.tagSlug);
    filters.push(
      `exists (select 1 from article_tags at join tags t on t.id = at.tag_id where at.article_id = a.id and t.slug = $${params.length})`,
    );
  }
  const where = filters.join(" and ");
  const countRows = await sql.query<{ c: number }>(
    `select count(*)::int as c from articles a
     join categories c on c.id = a.category_id
     join authors au on au.id = a.author_id
     where ${where}`,
    params,
  );
  const total = countRows[0]?.c ?? 0;
  const rows = await sql.query<CardRow>(
    `${CARD_SELECT} where ${where} order by a.published_at desc limit $${params.length + 1} offset $${params.length + 2}`,
    [...params, pageSize, offset],
  );
  let intro: { title: string; description: string; kind: string } | null = null;
  if (opts.categorySlug) {
    const cat = shell.categories.find((item) => item.slug === opts.categorySlug);
    intro = cat
      ? { title: cat.name, description: cat.description, kind: "Category" }
      : null;
  } else if (opts.authorSlug) {
    const authors = await sql.query<{ name: string; role: string; bio: string; slug: string }>(
      "select name, role, bio, slug from authors where slug = $1",
      [opts.authorSlug],
    );
    const author = authors[0];
    intro = author
      ? { title: author.name, description: `${author.role}. ${author.bio}`, kind: "Author" }
      : null;
  } else if (opts.tagSlug) {
    const tags = await sql.query<{ name: string }>("select name from tags where slug = $1", [
      opts.tagSlug,
    ]);
    intro = tags[0]
      ? {
          title: tags[0].name,
          description: `Essays tagged ${tags[0].name} in Meridian Journal.`,
          kind: "Tag",
        }
      : null;
  } else {
    intro = {
      title: "Archive",
      description: "Every published essay, newest first.",
      kind: "Archive",
    };
  }
  return {
    ...shell,
    intro,
    items: rows.map(toCard),
    page,
    pages: Math.max(1, Math.ceil(total / pageSize)),
    total,
  };
}

export async function searchPublished(query: string) {
  const shell = await getShell();
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return { ...shell, q, items: [] as Card[] };
  const sql = await getSql();
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const rows = await sql.query<CardRow>(
    `${CARD_SELECT}
     where a.status = 'published'
       and (a.title ilike $1 escape '\\' or a.excerpt ilike $1 escape '\\' or a.content ilike $1 escape '\\')
     order by a.published_at desc
     limit 20`,
    [like],
  );
  return { ...shell, q, items: rows.map(toCard) };
}

export type ArticlePayload = {
  redirectTo?: string;
  article?: {
    slug: string;
    title: string;
    seoTitle: string;
    excerpt: string;
    metaDescription: string;
    image: string;
    alt: string;
    canonicalUrl: string;
    categoryName: string;
    categorySlug: string;
    authorName: string;
    authorSlug: string;
    authorRole: string;
    authorBio: string;
    publishedAt: string;
    updatedAt: string;
    readingMinutes: number;
    tags: { slug: string; name: string }[];
    blocks: string[];
    headings: { id: string; text: string; level: 2 | 3 }[];
  };
  related?: Card[];
  origin?: string;
  settings?: Settings;
};

function publishedCards(where: string) {
  return `${CARD_SELECT} where a.status = 'published' ${where}`;
}

export async function loadArticle(slug: string): Promise<ArticlePayload> {
  const shell = await getShell();
  const sql = await getSql();
  const found = await sql.query<{
    id: number;
    slug: string;
    title: string;
    seo_title: string;
    excerpt: string;
    meta_description: string;
    content: string;
    featured_image: string;
    featured_alt: string;
    canonical_url: string;
    category_name: string;
    category_slug: string;
    author_name: string;
    author_slug: string;
    author_role: string;
    author_bio: string;
    published_at: string;
    updated_at: string;
    reading_minutes: number;
  }>(
    `select a.id, a.slug, a.title, a.seo_title, a.excerpt, a.meta_description, a.content,
      a.featured_image, a.featured_alt, a.canonical_url,
      c.name as category_name, c.slug as category_slug,
      au.name as author_name, au.slug as author_slug, au.role as author_role, au.bio as author_bio,
      to_char(a.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
      to_char(a.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
      a.reading_minutes
     from articles a
     join categories c on c.id = a.category_id
     join authors au on au.id = a.author_id
     where a.slug = $1 and a.status = 'published'`,
    [slug],
  );
  const article = found[0];
  if (!article) {
    const redirect = await sql<{ to_path: string }>`
      select to_path from redirects where from_path = ${`/journal/${slug}`} limit 1
    `;
    if (redirect[0]?.to_path) return { redirectTo: redirect[0].to_path };
    return {};
  }
  const tags = await sql<{ slug: string; name: string }>`
    select t.slug, t.name from tags t
    join article_tags at on at.tag_id = t.id
    where at.article_id = ${article.id}
    order by t.name
  `;
  const relatedRows = await sql.query<CardRow>(
    `${CARD_SELECT}
     where a.status = 'published' and a.id <> $1 and c.slug = $2
     order by a.published_at desc
     limit 3`,
    [article.id, article.category_slug],
  );
  const rendered = renderMarkdown(article.content);
  return {
    origin: shell.origin,
    settings: shell.settings,
    related: relatedRows.map(toCard),
    article: {
      slug: article.slug,
      title: article.title,
      seoTitle: article.seo_title || article.title,
      excerpt: article.excerpt,
      metaDescription: article.meta_description || article.excerpt,
      image: article.featured_image,
      alt: article.featured_alt,
      canonicalUrl: article.canonical_url,
      categoryName: article.category_name,
      categorySlug: article.category_slug,
      authorName: article.author_name,
      authorSlug: article.author_slug,
      authorRole: article.author_role,
      authorBio: article.author_bio,
      publishedAt: article.published_at,
      updatedAt: article.updated_at,
      readingMinutes: article.reading_minutes,
      tags,
      blocks: rendered.blocks,
      headings: rendered.headings,
    },
  };
}

export async function requireAdmin(userId: string) {
  await ensureBlog();
  const sql = await getSql();
  const existing = await sql<{ user_id: string }>`select user_id from site_admins`;
  if (existing.length === 0) {
    await sql`insert into site_admins (user_id) values (${userId}) on conflict do nothing`;
    return;
  }
  if (!existing.some((row) => row.user_id === userId)) {
    throw new Error("This journal already has an editor.");
  }
}

export type AdminArticle = {
  id: number;
  slug: string;
  title: string;
  status: string;
  featured: boolean;
  updatedAt: string;
  publishedAt: string | null;
  categoryName: string;
};

export async function adminArticleList(): Promise<AdminArticle[]> {
  await ensureBlog();
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    slug: string;
    title: string;
    status: string;
    featured: boolean;
    updated_at: string;
    published_at: string | null;
    category_name: string;
  }>`
    select a.id, a.slug, a.title, a.status, a.featured,
      to_char(a.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
      to_char(a.published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at,
      c.name as category_name
    from articles a
    join categories c on c.id = a.category_id
    order by a.updated_at desc
  `;
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    status: row.status,
    featured: row.featured,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
    categoryName: row.category_name,
  }));
}

export type ArticleDraft = {
  id: number | null;
  title: string;
  slug: string;
  seoTitle: string;
  excerpt: string;
  metaDescription: string;
  content: string;
  image: string;
  alt: string;
  canonicalUrl: string;
  authorId: number;
  categoryId: number;
  tagIds: number[];
  status: "draft" | "published";
  featured: boolean;
};

export async function adminArticle(id: number): Promise<ArticleDraft | null> {
  await ensureBlog();
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    title: string;
    slug: string;
    seo_title: string;
    excerpt: string;
    meta_description: string;
    content: string;
    featured_image: string;
    featured_alt: string;
    canonical_url: string;
    author_id: number;
    category_id: number;
    status: "draft" | "published";
    featured: boolean;
  }>`
    select id, title, slug, seo_title, excerpt, meta_description, content, featured_image,
      featured_alt, canonical_url, author_id, category_id, status, featured
    from articles where id = ${id}
  `;
  const row = rows[0];
  if (!row) return null;
  const tags = await sql<{ tag_id: number }>`select tag_id from article_tags where article_id = ${id}`;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    seoTitle: row.seo_title,
    excerpt: row.excerpt,
    metaDescription: row.meta_description,
    content: row.content,
    image: row.featured_image,
    alt: row.featured_alt,
    canonicalUrl: row.canonical_url,
    authorId: row.author_id,
    categoryId: row.category_id,
    tagIds: tags.map((tag) => tag.tag_id),
    status: row.status,
    featured: row.featured,
  };
}

export async function taxonomy() {
  await ensureBlog();
  const sql = await getSql();
  const authors = await sql<{ id: number; slug: string; name: string; role: string; bio: string }>`
    select id, slug, name, role, bio from authors order by name
  `;
  const categories = await sql<{ id: number; slug: string; name: string; description: string }>`
    select id, slug, name, description from categories order by name
  `;
  const tags = await sql<{ id: number; slug: string; name: string }>`
    select id, slug, name from tags order by name
  `;
  return { authors, categories, tags };
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function saveArticle(input: ArticleDraft): Promise<{ id: number; slug: string }> {
  await ensureBlog();
  const sql = await getSql();
  const title = input.title.trim();
  if (title.length < 3 || title.length > 180) throw new Error("Title should be 3–180 characters.");
  const slug = slugify(input.slug.trim() || title);
  if (!SLUG_RE.test(slug)) throw new Error("Use a slug of lowercase words and hyphens.");
  const excerpt = input.excerpt.trim();
  const meta = input.metaDescription.trim();
  const content = input.content.trim();
  if (excerpt.length < 20 || excerpt.length > 400) throw new Error("Excerpt should be 20–400 characters.");
  if (meta.length < 20 || meta.length > 180) throw new Error("Meta description should be 20–180 characters.");
  if (content.length < 40) throw new Error("Write a little more before saving.");
  const { minutes, words } = readingMinutesFrom(content);
  const status = input.status === "published" ? "published" : "draft";
  const image = input.image.trim().slice(0, 400);
  const alt = input.alt.trim().slice(0, 240);
  if (image && !alt) throw new Error("Featured images need alt text.");
  if (image && !image.startsWith("/") && !image.startsWith("https://")) {
    throw new Error("Image address must start with / or https://");
  }
  const canonical = input.canonicalUrl.trim();
  if (canonical && !canonical.startsWith("https://")) throw new Error("Canonical URL must start with https://");

  const dup = await sql<{ id: number }>`select id from articles where slug = ${slug}`;
  if (dup[0] && dup[0].id !== input.id) throw new Error("That slug is already used.");

  let id = input.id;
  if (id) {
    const current = await sql<{ slug: string; published_at: string | null }>`
      select slug, published_at::text as published_at from articles where id = ${id}
    `;
    if (!current[0]) throw new Error("Article not found.");
    if (current[0].slug !== slug) {
      const from = `/journal/${current[0].slug}`;
      const to = `/journal/${slug}`;
      await sql`
        insert into redirects (from_path, to_path) values (${from}, ${to})
        on conflict (from_path) do update set to_path = ${to}
      `;
      await sql`update redirects set to_path = ${to} where to_path = ${from} and from_path <> ${from}`;
    }
    await sql`
      update articles set
        slug = ${slug},
        title = ${title},
        seo_title = ${input.seoTitle.trim().slice(0, 180)},
        excerpt = ${excerpt},
        meta_description = ${meta},
        content = ${content},
        featured_image = ${image},
        featured_alt = ${alt},
        canonical_url = ${canonical.slice(0, 400)},
        author_id = ${input.authorId},
        category_id = ${input.categoryId},
        status = ${status},
        featured = ${input.featured},
        reading_minutes = ${minutes},
        word_count = ${words},
        published_at = case
          when ${status} = 'published' then coalesce(published_at, now())
          else published_at
        end,
        updated_at = now()
      where id = ${id}
    `;
  } else {
    const inserted = await sql<{ id: number }>`
      insert into articles (
        slug, title, seo_title, excerpt, meta_description, content, featured_image, featured_alt,
        canonical_url, author_id, category_id, status, featured, reading_minutes, word_count, published_at
      ) values (
        ${slug}, ${title}, ${input.seoTitle.trim().slice(0, 180)}, ${excerpt}, ${meta}, ${content},
        ${image}, ${alt}, ${canonical.slice(0, 400)}, ${input.authorId}, ${input.categoryId},
        ${status}, ${input.featured}, ${minutes}, ${words},
        case when ${status} = 'published' then now() else null end
      )
      returning id
    `;
    id = inserted[0]?.id ?? 0;
  }
  if (!id) throw new Error("Could not save the article.");
  await sql`delete from article_tags where article_id = ${id}`;
  for (const tagId of input.tagIds) {
    await sql`insert into article_tags (article_id, tag_id) values (${id}, ${tagId}) on conflict do nothing`;
  }
  return { id, slug };
}

export async function deleteArticle(id: number) {
  await ensureBlog();
  const sql = await getSql();
  await sql`delete from articles where id = ${id}`;
}

export async function saveSettingsPatch(patch: Partial<Settings>) {
  await ensureBlog();
  const sql = await getSql();
  const current = await readSettings(sql);
  const next = { ...current, ...patch };
  if (next.assumedRpm < 0 || next.assumedRpm > 500) throw new Error("Page RPM should be between 0 and 500.");
  await sql`
    update site_settings set
      name = ${next.name.trim().slice(0, 80) || current.name},
      tagline = ${next.tagline.trim().slice(0, 180)},
      description = ${next.description.trim().slice(0, 400)},
      canonical_origin = ${current.envLocked.origin ? current.canonicalOrigin : next.canonicalOrigin.trim().slice(0, 200)},
      social_x = ${next.socialX.trim().slice(0, 200)},
      social_linkedin = ${next.socialLinkedin.trim().slice(0, 200)},
      email = ${next.email.trim().slice(0, 160)},
      ga4_id = ${current.envLocked.ga4 ? current.ga4Id : next.ga4Id.trim().slice(0, 40)},
      gsc_verification = ${current.envLocked.gsc ? current.gscVerification : next.gscVerification.trim().slice(0, 120)},
      adsense_client = ${current.envLocked.adsense ? current.adsenseClient : next.adsenseClient.trim().slice(0, 40)},
      slot_intro = ${next.slotIntro.trim().slice(0, 40)},
      slot_mid = ${next.slotMid.trim().slice(0, 40)},
      slot_end = ${next.slotEnd.trim().slice(0, 40)},
      slot_sidebar = ${next.slotSidebar.trim().slice(0, 40)},
      ads_enabled = ${current.envLocked.ads ? current.adsEnabled : next.adsEnabled},
      ad_intro = ${next.adIntro},
      ad_mid = ${next.adMid},
      ad_end = ${next.adEnd},
      ad_sidebar = ${next.adSidebar},
      assumed_rpm = ${next.assumedRpm},
      consent_required = ${next.consentRequired},
      ack_original = ${next.ackOriginal},
      ack_policies = ${next.ackPolicies},
      ack_ownership = ${next.ackOwnership},
      updated_at = now()
    where id = 1
  `;
  return readSettings(sql);
}

export async function listRedirects() {
  await ensureBlog();
  const sql = await getSql();
  return sql<{ id: number; from_path: string; to_path: string }>`
    select id, from_path, to_path from redirects order by id desc
  `;
}

export async function addRedirect(fromPath: string, toPath: string) {
  await ensureBlog();
  const from = fromPath.trim();
  const to = toPath.trim();
  if (!from.startsWith("/") || !to.startsWith("/")) throw new Error("Paths must start with /");
  if (from === to) throw new Error("That redirect goes nowhere.");
  const sql = await getSql();
  await sql`
    insert into redirects (from_path, to_path) values (${from.slice(0, 200)}, ${to.slice(0, 200)})
    on conflict (from_path) do update set to_path = ${to.slice(0, 200)}
  `;
}

export async function removeRedirect(id: number) {
  await ensureBlog();
  const sql = await getSql();
  await sql`delete from redirects where id = ${id}`;
}

export async function saveAuthor(input: { id?: number; name: string; role: string; bio: string; slug?: string }) {
  await ensureBlog();
  const sql = await getSql();
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Name is required.");
  const slug = slugify(input.slug?.trim() || name);
  if (input.id) {
    await sql`
      update authors set name = ${name}, role = ${input.role.trim().slice(0, 80)}, bio = ${input.bio.trim().slice(0, 800)}, slug = ${slug}
      where id = ${input.id}
    `;
    return;
  }
  await sql`
    insert into authors (slug, name, role, bio) values (${slug}, ${name}, ${input.role.trim().slice(0, 80)}, ${input.bio.trim().slice(0, 800)})
  `;
}

export async function saveCategory(input: { id?: number; name: string; description: string; slug?: string }) {
  await ensureBlog();
  const sql = await getSql();
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Name is required.");
  const slug = slugify(input.slug?.trim() || name);
  if (input.id) {
    await sql`
      update categories set name = ${name}, description = ${input.description.trim().slice(0, 400)}, slug = ${slug}
      where id = ${input.id}
    `;
    return;
  }
  await sql`insert into categories (slug, name, description) values (${slug}, ${name}, ${input.description.trim().slice(0, 400)})`;
}

export async function saveTag(input: { name: string }) {
  await ensureBlog();
  const sql = await getSql();
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Name is required.");
  await sql`insert into tags (slug, name) values (${slugify(name)}, ${name}) on conflict (slug) do nothing`;
}

export async function deleteAuthor(id: number) {
  await ensureBlog();
  const sql = await getSql();
  const used = await sql<{ c: number }>`select count(*)::int as c from articles where author_id = ${id}`;
  if ((used[0]?.c ?? 0) > 0) throw new Error("This author still has articles.");
  await sql`delete from authors where id = ${id}`;
}

export async function deleteCategory(id: number) {
  await ensureBlog();
  const sql = await getSql();
  const used = await sql<{ c: number }>`select count(*)::int as c from articles where category_id = ${id}`;
  if ((used[0]?.c ?? 0) > 0) throw new Error("This category still has articles.");
  await sql`delete from categories where id = ${id}`;
}

export async function deleteTag(id: number) {
  await ensureBlog();
  const sql = await getSql();
  await sql`delete from tags where id = ${id}`;
}

export async function inbox() {
  await ensureBlog();
  const sql = await getSql();
  return sql<{ id: number; name: string; email: string; message: string; created_at: string }>`
    select id, name, email, message,
      to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from contact_messages order by id desc limit 20
  `;
}

const hits = new Map<string, { n: number; reset: number }>();

export async function saveContact(input: { name: string; email: string; message: string; trap: string }) {
  if (input.trap) return;
  const name = input.name.trim();
  const email = input.email.trim();
  const message = input.message.trim();
  if (name.length < 2 || name.length > 80) throw new Error("Please add your name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("That email does not look usable.");
  if (message.length < 10 || message.length > 4000) throw new Error("Write a message between 10 and 4000 characters.");
  const key = email.toLowerCase();
  const now = Date.now();
  const bucket = hits.get(key);
  if (!bucket || bucket.reset < now) hits.set(key, { n: 1, reset: now + 3600000 });
  else if (bucket.n >= 5) throw new Error("Please wait a while before sending another note.");
  else bucket.n += 1;
  await ensureBlog();
  const sql = await getSql();
  await sql`insert into contact_messages (name, email, message) values (${name}, ${email}, ${message})`;
}

export type ChecklistItem = {
  id: string;
  label: string;
  detail: string;
  status: "pass" | "warn" | "fail";
};

export async function adsenseChecklist(): Promise<{ items: ChecklistItem[]; settings: Settings }> {
  await ensureBlog();
  const sql = await getSql();
  const settings = await readSettings(sql);
  const stats = await sql<{
    published: number;
    avg_words: number;
    missing_meta: number;
    missing_alt: number;
  }>`
    select
      count(*) filter (where status = 'published')::int as published,
      coalesce(avg(word_count) filter (where status = 'published'), 0)::int as avg_words,
      count(*) filter (where status = 'published' and length(trim(meta_description)) < 20)::int as missing_meta,
      count(*) filter (where status = 'published' and featured_image <> '' and length(trim(featured_alt)) < 3)::int as missing_alt
    from articles
  `;
  const s = stats[0];
  const published = s?.published ?? 0;
  const clientOk = /^ca-pub-\d{10,20}$/.test(settings.adsenseClient);
  const items: ChecklistItem[] = [
    {
      id: "volume",
      label: "A body of original essays",
      detail: `${published} published. Aim for a real archive before you apply. More useful articles help; this line is not an approval.`,
      status: published >= 8 ? "pass" : published >= 4 ? "warn" : "fail",
    },
    {
      id: "depth",
      label: "Articles are substantial",
      detail: `Average length is about ${s?.avg_words ?? 0} words. Thin pages are a common reason reviews stall.`,
      status: (s?.avg_words ?? 0) >= 400 ? "pass" : "warn",
    },
    {
      id: "meta",
      label: "Search titles and descriptions",
      detail:
        (s?.missing_meta ?? 0) === 0
          ? "Every published essay has a meta description."
          : `${s?.missing_meta} published essays still need a meta description.`,
      status: (s?.missing_meta ?? 0) === 0 ? "pass" : "fail",
    },
    {
      id: "alt",
      label: "Image alt text",
      detail:
        (s?.missing_alt ?? 0) === 0
          ? "Featured images that exist have alt text."
          : `${s?.missing_alt} images are missing alt text.`,
      status: (s?.missing_alt ?? 0) === 0 ? "pass" : "fail",
    },
    {
      id: "pages",
      label: "Essential pages",
      detail: "About, contact, privacy, terms, and disclaimer are part of the public site.",
      status: "pass",
    },
    {
      id: "contact",
      label: "A way to reach the publisher",
      detail: settings.email
        ? `Contact email is ${settings.email}.`
        : "Add a contact email in settings so the site shows a real owner.",
      status: settings.email ? "pass" : "fail",
    },
    {
      id: "ads-txt",
      label: "ads.txt",
      detail: clientOk
        ? "ads.txt will advertise this publisher ID. Confirm it on the live domain after you publish."
        : "Add a publisher ID shaped like ca-pub-123… so ads.txt can name the account.",
      status: clientOk ? "pass" : "warn",
    },
    {
      id: "slots",
      label: "Ad slots, kept few",
      detail: settings.adsEnabled
        ? "Ads are enabled. Keep them labeled, limited, and away from anything that looks like a trick."
        : "Ads are off. Turn them on only after the publisher ID and slots exist, and after consent where you need it.",
      status: settings.adsEnabled && clientOk ? "pass" : "warn",
    },
    {
      id: "consent",
      label: "Privacy and consent",
      detail: settings.consentRequired
        ? "A consent choice gates AdSense and Google Analytics. The privacy page describes first-party measurement."
        : "Consent is marked optional. Make sure that matches the regions you serve.",
      status: "pass",
    },
    {
      id: "own",
      label: "You acknowledge the policy work",
      detail: settings.ackOwnership && settings.ackOriginal && settings.ackPolicies
        ? "You marked ownership, originality, and policy reading as done. Google still decides."
        : "Tick the acknowledgements when they are true. They are your notes, not a submission.",
      status:
        settings.ackOwnership && settings.ackOriginal && settings.ackPolicies ? "pass" : "warn",
    },
  ];
  return { items, settings };
}

export type RangeInput = {
  preset: "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";
  from?: string;
  to?: string;
  sample: boolean;
};

export function resolveRange(input: RangeInput) {
  const now = new Date();
  let start: Date;
  let end: Date;
  if (input.preset === "today") {
    start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    end = now;
  } else if (input.preset === "yesterday") {
    end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    start = new Date(end.getTime() - 86400000);
  } else if (input.preset === "custom" && input.from && input.to) {
    start = new Date(`${input.from}T00:00:00.000Z`);
    end = new Date(`${input.to}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      throw new Error("Choose a valid date range.");
    }
    end = new Date(end.getTime() + 86400000);
  } else {
    const days = input.preset === "90d" ? 90 : input.preset === "7d" ? 7 : 30;
    end = now;
    start = new Date(now.getTime() - days * 86400000);
  }
  const span = Math.max(end.getTime() - start.getTime(), 1);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    prevStart: new Date(start.getTime() - span).toISOString(),
    prevEnd: start.toISOString(),
  };
}

type Pair = { name: string; count: number };

const analyticsCache = new Map<string, { at: number; data: unknown }>();

export async function analyticsReport(input: RangeInput) {
  await ensureBlog();
  const key = JSON.stringify(input);
  const hit = analyticsCache.get(key);
  if (hit && Date.now() - hit.at < 20000) return hit.data as Awaited<ReturnType<typeof computeAnalytics>>;
  const data = await computeAnalytics(input);
  analyticsCache.set(key, { at: Date.now(), data });
  return data;
}

async function computeAnalytics(input: RangeInput) {
  const sql = await getSql();
  const settings = await readSettings(sql);
  const range = resolveRange(input);
  const sample = input.sample;
  const where = `created_at >= $1 and created_at < $2 and (synthetic = false or $3 = true)`;
  const args = [range.start, range.end, sample];
  const prevArgs = [range.prevStart, range.prevEnd, sample];

  const viewsRow = await sql.query<{ c: number }>(
    `select count(*)::int as c from page_views where ${where}`,
    args,
  );
  const prevViewsRow = await sql.query<{ c: number }>(
    `select count(*)::int as c from page_views where ${where}`,
    prevArgs,
  );
  const visitorsRow = await sql.query<{ c: number }>(
    `select count(distinct visitor_id)::int as c from page_views where ${where}`,
    args,
  );
  const prevVisitorsRow = await sql.query<{ c: number }>(
    `select count(distinct visitor_id)::int as c from page_views where ${where}`,
    prevArgs,
  );
  const sessionRow = await sql.query<{ sessions: number; bounces: number }>(
    `with s as (
      select session_id, count(*)::int as n from page_views where ${where} group by session_id
    )
    select count(*)::int as sessions, count(*) filter (where n = 1)::int as bounces from s`,
    args,
  );
  const prevSessionRow = await sql.query<{ sessions: number }>(
    `select count(distinct session_id)::int as sessions from page_views where ${where}`,
    prevArgs,
  );
  const fresh = await sql.query<{ new_count: number; returning_count: number }>(
    `with touched as (
       select distinct visitor_id from page_views where ${where}
     ),
     firsts as (
       select visitor_id, min(created_at) as first_at from page_views
       where synthetic = false or $3 = true
       group by visitor_id
     )
     select
       count(*) filter (where f.first_at >= $1)::int as new_count,
       count(*) filter (where f.first_at < $1)::int as returning_count
     from touched t join firsts f on f.visitor_id = t.visitor_id`,
    args,
  );
  const engage = await sql.query<{ ms: number }>(
    `select coalesce(sum(engagement_ms), 0)::int as ms from page_views where ${where}`,
    args,
  );
  const series = await sql.query<{ day: string; views: number }>(
    `select to_char(created_at at time zone 'UTC', 'YYYY-MM-DD') as day, count(*)::int as views
     from page_views where ${where} group by 1 order by 1`,
    args,
  );
  const topPages = await sql.query<{ path: string; views: number }>(
    `select path, count(*)::int as views from page_views where ${where}
     group by path order by views desc limit 8`,
    args,
  );
  const topArticles = await sql.query<{ title: string; slug: string; views: number }>(
    `select a.title, a.slug, count(p.id)::int as views
     from articles a
     join page_views p on p.path = '/journal/' || a.slug
     where p.created_at >= $1 and p.created_at < $2 and (p.synthetic = false or $3 = true)
     group by a.id order by views desc limit 8`,
    args,
  );
  const landings = await sql.query<{ path: string; views: number }>(
    `select path, count(*)::int as views from (
       select distinct on (session_id) path from page_views
       where ${where} order by session_id, created_at asc, id asc
     ) t group by path order by views desc limit 6`,
    args,
  );
  const exits = await sql.query<{ path: string; views: number }>(
    `select path, count(*)::int as views from (
       select distinct on (session_id) path from page_views
       where ${where} order by session_id, created_at desc, id desc
     ) t group by path order by views desc limit 6`,
    args,
  );
  const group = async (column: string) =>
    sql.query<Pair>(
      `select ${column} as name, count(*)::int as count from page_views where ${where}
       group by 1 order by count desc limit 6`,
      args,
    );

  const sources = await group("source");
  const devices = await group("device");
  const browsers = await group("browser");
  const systems = await group("os");
  const countries = await group("country");
  const live = await sql<{ active: number }>`
    select count(distinct session_id)::int as active from page_views
    where synthetic = false and created_at >= now() - interval '5 minutes'
  `;
  const recent = await sql<{
    path: string;
    device: string;
    source: string;
    country: string;
    created_at: string;
  }>`
    select path, device, source, country,
      to_char(created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at
    from page_views
    where synthetic = false
    order by created_at desc
    limit 12
  `;
  const manual = await sql.query<{ revenue: string | number; impressions: number }>(
    `select coalesce(sum(estimated_revenue), 0) as revenue, coalesce(sum(impressions), 0)::int as impressions
     from revenue_records where day >= $1::date and day < $2::date`,
    [range.start.slice(0, 10), range.end.slice(0, 10)],
  );
  const byArticle = await sql.query<{ article_path: string; revenue: string | number; impressions: number }>(
    `select article_path, coalesce(sum(estimated_revenue), 0) as revenue, coalesce(sum(impressions), 0)::int as impressions
     from revenue_records
     where article_path <> '' and day >= $1::date and day < $2::date
     group by article_path order by sum(estimated_revenue) desc limit 8`,
    [range.start.slice(0, 10), range.end.slice(0, 10)],
  );

  const views = viewsRow[0]?.c ?? 0;
  const sessions = sessionRow[0]?.sessions ?? 0;
  const bounces = sessionRow[0]?.bounces ?? 0;
  const engagementMs = engage[0]?.ms ?? 0;
  const rpm = settings.assumedRpm;
  const filled = fillDays(range.start, range.end, series);

  return {
    range,
    sample,
    assumedRpm: rpm,
    views,
    previousViews: prevViewsRow[0]?.c ?? 0,
    visitors: visitorsRow[0]?.c ?? 0,
    previousVisitors: prevVisitorsRow[0]?.c ?? 0,
    sessions,
    previousSessions: prevSessionRow[0]?.sessions ?? 0,
    newVisitors: fresh[0]?.new_count ?? 0,
    returningVisitors: fresh[0]?.returning_count ?? 0,
    bounces,
    bounceRate: sessions ? Math.round((bounces / sessions) * 1000) / 10 : 0,
    pagesPerSession: sessions ? Math.round((views / sessions) * 100) / 100 : 0,
    avgEngagementMs: sessions ? Math.round(engagementMs / sessions) : 0,
    series: filled.map((point) => ({
      ...point,
      model: Math.round((point.views / 1000) * rpm * 100) / 100,
    })),
    topPages,
    topArticles,
    landings,
    exits,
    sources,
    devices,
    browsers,
    systems,
    countries,
    liveActive: live[0]?.active ?? 0,
    recent,
    modelRevenue: Math.round((views / 1000) * rpm * 100) / 100,
    manualRevenue: Number(manual[0]?.revenue ?? 0),
    manualImpressions: manual[0]?.impressions ?? 0,
    revenueByArticle: byArticle.map((row) => ({
      path: row.article_path,
      revenue: Number(row.revenue),
      impressions: row.impressions,
    })),
  };
}

function fillDays(startIso: string, endIso: string, rows: { day: string; views: number }[]) {
  const map = new Map(rows.map((row) => [row.day, row.views]));
  const out: { day: string; views: number }[] = [];
  const cursor = new Date(startIso);
  cursor.setUTCHours(0, 0, 0, 0);
  const end = new Date(endIso);
  while (cursor < end && out.length < 120) {
    const day = cursor.toISOString().slice(0, 10);
    out.push({ day, views: map.get(day) ?? 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

export async function clearSample() {
  await ensureBlog();
  const sql = await getSql();
  await sql`delete from page_views where synthetic = true`;
  await sql`delete from sessions where synthetic = true`;
  analyticsCache.clear();
}

export async function addRevenue(input: {
  day: string;
  articlePath: string;
  impressions: number;
  revenue: number;
  note: string;
}) {
  await ensureBlog();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.day)) throw new Error("Use a YYYY-MM-DD day.");
  if (input.revenue < 0 || input.impressions < 0) throw new Error("Figures cannot be negative.");
  const path = input.articlePath.trim();
  if (path && !path.startsWith("/")) throw new Error("Article path must start with /");
  const sql = await getSql();
  await sql`
    insert into revenue_records (day, article_path, impressions, estimated_revenue, note)
    values (${input.day}, ${path.slice(0, 200)}, ${Math.round(input.impressions)}, ${input.revenue}, ${input.note.trim().slice(0, 240)})
  `;
  analyticsCache.clear();
}

export async function listRevenue() {
  await ensureBlog();
  const sql = await getSql();
  const rows = await sql<{
    id: number;
    day: string;
    article_path: string;
    impressions: number;
    estimated_revenue: string | number;
    note: string;
  }>`
    select id, day::text as day, article_path, impressions, estimated_revenue, note
    from revenue_records order by day desc, id desc limit 30
  `;
  return rows.map((row) => ({ ...row, estimated_revenue: Number(row.estimated_revenue) }));
}

export async function sitemapEntries() {
  const shell = await getShell();
  const sql = await getSql();
  const articles = await sql<{ slug: string; updated: string }>`
    select slug, to_char(updated_at at time zone 'UTC', 'YYYY-MM-DD') as updated
    from articles where status = 'published' order by published_at desc
  `;
  const authors = await sql<{ slug: string }>`select slug from authors order by slug`;
  const tags = await sql<{ slug: string }>`select slug from tags order by slug`;
  const staticPaths = ["", "/archive", "/about", "/contact", "/privacy", "/terms", "/disclaimer"];
  return { shell, articles, authors, tags, staticPaths };
}

export async function rssItems() {
  const shell = await getShell();
  const sql = await getSql();
  const items = await sql<{
    slug: string;
    title: string;
    excerpt: string;
    published_at: string;
  }>`
    select slug, title, excerpt,
      to_char(published_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as published_at
    from articles where status = 'published'
    order by published_at desc limit 30
  `;
  return { shell, items };
}

export async function adsText() {
  const shell = await getShell();
  return shell.settings.adsenseClient;
}

const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|monitor|wget|curl\//i;
const hitRate = new Map<string, { n: number; reset: number }>();

function classifySource(referrer: string, origin: string): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).host;
    const own = origin ? new URL(origin).host : "";
    if (own && host === own) return "direct";
    if (/google|bing\.|duckduckgo|yahoo|baidu|yandex|ecosia/i.test(host)) return "organic";
    if (/twitter|x\.com|t\.co|facebook|instagram|linkedin|reddit|youtube|tiktok|bsky/i.test(host)) return "social";
    return "referral";
  } catch {
    return "direct";
  }
}

function parseAgent(ua: string) {
  const browser = /edg\//i.test(ua)
    ? "Edge"
    : /chrome|crios/i.test(ua)
      ? "Chrome"
      : /safari/i.test(ua) && !/chrome/i.test(ua)
        ? "Safari"
        : /firefox|fxios/i.test(ua)
          ? "Firefox"
          : "Other";
  const os = /android/i.test(ua)
    ? "Android"
    : /iphone|ipad|ios/i.test(ua)
      ? "iOS"
      : /mac os/i.test(ua)
        ? "macOS"
        : /windows/i.test(ua)
          ? "Windows"
          : /linux/i.test(ua)
            ? "Linux"
            : "Other";
  const device = /ipad|tablet/i.test(ua) ? "tablet" : /mobi|iphone|android/i.test(ua) ? "mobile" : "desktop";
  return { browser, os, device };
}

export async function recordHit(input: {
  type: "page" | "engage";
  visitorId: string;
  sessionId: string;
  path: string;
  title: string;
  referrer: string;
  engagementMs: number;
  userAgent: string;
  country: string;
  origin: string;
}) {
  if (!input.userAgent || BOT_UA.test(input.userAgent)) return { ok: true, ignored: true };
  if (!/^[a-zA-Z0-9_-]{12,64}$/.test(input.visitorId)) return { ok: false };
  if (!/^[a-zA-Z0-9_-]{12,64}$/.test(input.sessionId)) return { ok: false };
  const path = input.path.slice(0, 180);
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("..")) return { ok: false };
  if (path.startsWith("/admin") || path.startsWith("/api") || path.startsWith("/login")) return { ok: true, ignored: true };

  const now = Date.now();
  const bucket = hitRate.get(input.sessionId);
  if (!bucket || bucket.reset < now) hitRate.set(input.sessionId, { n: 1, reset: now + 60000 });
  else if (bucket.n > 40) return { ok: true, ignored: true };
  else bucket.n += 1;

  await ensureBlog();
  const sql = await getSql();
  const agent = parseAgent(input.userAgent);
  const country = /^[A-Z]{2}$/.test(input.country) ? input.country : "";

  if (input.type === "engage") {
    const delta = Math.max(0, Math.min(60000, Math.round(input.engagementMs || 0)));
    if (!delta) return { ok: true };
    await sql`
      update page_views set engagement_ms = least(1800000, engagement_ms + ${delta})
      where id = (
        select id from page_views where session_id = ${input.sessionId} and synthetic = false
        order by created_at desc limit 1
      )
    `;
    await sql`
      update sessions set last_seen_at = now() where id = ${input.sessionId} and synthetic = false
    `;
    return { ok: true };
  }

  const recent = await sql<{ id: number }>`
    select id from page_views
    where session_id = ${input.sessionId} and path = ${path} and synthetic = false
      and created_at > now() - interval '10 seconds'
    limit 1
  `;
  if (recent[0]) return { ok: true, ignored: true };

  const source = classifySource(input.referrer, input.origin);
  await sql`
    insert into sessions (
      id, visitor_id, landing_path, source, device, browser, os, country, synthetic
    ) values (
      ${input.sessionId}, ${input.visitorId}, ${path}, ${source}, ${agent.device},
      ${agent.browser}, ${agent.os}, ${country}, false
    )
    on conflict (id) do update set last_seen_at = now()
  `;
  await sql`
    insert into page_views (
      session_id, visitor_id, path, title, source, device, browser, os, country, synthetic
    ) values (
      ${input.sessionId}, ${input.visitorId}, ${path}, ${input.title.slice(0, 180)}, ${source},
      ${agent.device}, ${agent.browser}, ${agent.os}, ${country}, false
    )
  `;
  return { ok: true };
}

