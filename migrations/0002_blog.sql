-- Meridian Journal: public content, redirects, first-party analytics, manual revenue.

create table if not exists site_settings (
  id integer primary key default 1,
  name text not null,
  tagline text not null,
  description text not null,
  canonical_origin text not null default '',
  social_x text not null default '',
  social_linkedin text not null default '',
  email text not null default '',
  ga4_id text not null default '',
  gsc_verification text not null default '',
  adsense_client text not null default '',
  slot_intro text not null default '',
  slot_mid text not null default '',
  slot_end text not null default '',
  slot_sidebar text not null default '',
  ads_enabled boolean not null default false,
  ad_intro boolean not null default true,
  ad_mid boolean not null default true,
  ad_end boolean not null default true,
  ad_sidebar boolean not null default true,
  assumed_rpm numeric not null default 4.50,
  consent_required boolean not null default true,
  ack_original boolean not null default false,
  ack_policies boolean not null default false,
  ack_ownership boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

create table if not exists authors (
  id serial primary key,
  slug text not null unique,
  name text not null,
  role text not null default '',
  bio text not null default ''
);

create table if not exists categories (
  id serial primary key,
  slug text not null unique,
  name text not null,
  description text not null default ''
);

create table if not exists tags (
  id serial primary key,
  slug text not null unique,
  name text not null
);

create table if not exists articles (
  id serial primary key,
  slug text not null unique,
  title text not null,
  seo_title text not null default '',
  excerpt text not null,
  meta_description text not null,
  content text not null,
  featured_image text not null default '',
  featured_alt text not null default '',
  canonical_url text not null default '',
  author_id integer not null references authors (id),
  category_id integer not null references categories (id),
  status text not null default 'draft',
  featured boolean not null default false,
  reading_minutes integer not null default 1,
  word_count integer not null default 0,
  published_at timestamptz,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint articles_status check (status in ('draft', 'published'))
);

create index if not exists articles_status_published_idx on articles (status, published_at desc);
create index if not exists articles_category_idx on articles (category_id);
create index if not exists articles_author_idx on articles (author_id);

create table if not exists article_tags (
  article_id integer not null references articles (id) on delete cascade,
  tag_id integer not null references tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

create table if not exists redirects (
  id serial primary key,
  from_path text not null unique,
  to_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists site_admins (
  user_id text primary key,
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  visitor_id text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_path text not null,
  source text not null default 'direct',
  device text not null default 'desktop',
  browser text not null default 'Other',
  os text not null default 'Other',
  country text not null default '',
  synthetic boolean not null default false
);

create index if not exists sessions_last_seen_idx on sessions (last_seen_at);
create index if not exists sessions_visitor_idx on sessions (visitor_id);

create table if not exists page_views (
  id bigserial primary key,
  session_id text not null,
  visitor_id text not null,
  path text not null,
  title text not null default '',
  source text not null default 'direct',
  device text not null default 'desktop',
  browser text not null default '',
  os text not null default '',
  country text not null default '',
  engagement_ms integer not null default 0,
  synthetic boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at);
create index if not exists page_views_path_created_idx on page_views (path, created_at);
create index if not exists page_views_session_idx on page_views (session_id, created_at);
create index if not exists page_views_visitor_idx on page_views (visitor_id, created_at);

create table if not exists revenue_records (
  id serial primary key,
  day date not null,
  article_path text not null default '',
  impressions integer not null default 0,
  estimated_revenue numeric not null default 0,
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists revenue_day_idx on revenue_records (day);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists app_flags (
  key text primary key,
  value text not null
);
