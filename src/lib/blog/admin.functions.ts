import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import type { ArticleDraft, RangeInput, Settings } from "./db.server";
import {
  addRedirect,
  addRevenue,
  adminArticle,
  adminArticleList,
  adsenseChecklist,
  analyticsReport,
  clearSample,
  deleteArticle,
  deleteAuthor,
  deleteCategory,
  deleteTag,
  inbox,
  listRedirects,
  listRevenue,
  readSettings,
  removeRedirect,
  requireAdmin,
  saveArticle,
  saveAuthor,
  saveCategory,
  saveSettingsPatch,
  saveTag,
  taxonomy,
} from "./db.server";
import { getSql } from "@/lib/db";
import { ensureBlog } from "./db.server";

async function editor(userId: string) {
  await requireAdmin(userId);
}

function draft(input: ArticleDraft): ArticleDraft {
  return {
    id: input.id == null || Number(input.id) === 0 ? null : Number(input.id),
    title: String(input.title ?? ""),
    slug: String(input.slug ?? ""),
    seoTitle: String(input.seoTitle ?? ""),
    excerpt: String(input.excerpt ?? ""),
    metaDescription: String(input.metaDescription ?? ""),
    content: String(input.content ?? ""),
    image: String(input.image ?? ""),
    alt: String(input.alt ?? ""),
    canonicalUrl: String(input.canonicalUrl ?? ""),
    authorId: Number(input.authorId),
    categoryId: Number(input.categoryId),
    tagIds: Array.isArray(input.tagIds) ? input.tagIds.map((id) => Number(id)) : [],
    status: input.status === "published" ? "published" : "draft",
    featured: Boolean(input.featured),
  };
}

export const listArticlesFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return adminArticleList();
  });

export const articleFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    return adminArticle(data);
  });

export const taxonomyFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return taxonomy();
  });

export const saveArticleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: ArticleDraft) => draft(input))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    return saveArticle(data);
  });

export const deleteArticleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await deleteArticle(data);
    return { ok: true as const };
  });

export const settingsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    await ensureBlog();
    return readSettings(await getSql());
  });

export const saveSettingsFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: Settings) => input)
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    return saveSettingsPatch(data);
  });

export const checklistFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return adsenseChecklist();
  });

export const redirectsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return listRedirects();
  });

export const saveRedirectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { from: string; to: string }) => ({
    from: String(input.from ?? ""),
    to: String(input.to ?? ""),
  }))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await addRedirect(data.from, data.to);
    return { ok: true as const };
  });

export const deleteRedirectFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await removeRedirect(data);
    return { ok: true as const };
  });

export const inboxFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return inbox();
  });

export const saveAuthorFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: number; name: string; role: string; bio: string }) => input)
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await saveAuthor(data);
    return { ok: true as const };
  });

export const saveCategoryFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: number; name: string; description: string }) => input)
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await saveCategory(data);
    return { ok: true as const };
  });

export const saveTagFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((name: string) => String(name ?? ""))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await saveTag({ name: data });
    return { ok: true as const };
  });

export const deleteAuthorFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await deleteAuthor(data);
    return { ok: true as const };
  });

export const deleteCategoryFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await deleteCategory(data);
    return { ok: true as const };
  });

export const deleteTagFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((id: number) => Number(id))
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await deleteTag(data);
    return { ok: true as const };
  });

export const analyticsFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: RangeInput) => input)
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    return analyticsReport({
      preset: data.preset ?? "30d",
      from: data.from,
      to: data.to,
      sample: Boolean(data.sample),
    });
  });

export const clearSampleFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    await clearSample();
    return { ok: true as const };
  });

export const revenueFn = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await editor(context.userId);
    return listRevenue();
  });

export const saveRevenueFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: { day: string; articlePath: string; impressions: number; revenue: number; note: string }) =>
      input,
  )
  .handler(async ({ context, data }) => {
    await editor(context.userId);
    await addRevenue(data);
    return { ok: true as const };
  });
