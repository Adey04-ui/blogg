import { createServerFn } from "@tanstack/react-start";
import {
  getShell,
  loadArticle,
  loadCollection,
  loadHome,
  saveContact,
  searchPublished,
} from "./db.server";

export const fetchShell = createServerFn({ method: "GET" }).handler(async () => getShell());

export const fetchHome = createServerFn({ method: "GET" }).handler(async () => loadHome());

export const fetchCollection = createServerFn({ method: "GET" })
  .validator((input: { categorySlug?: string; authorSlug?: string; tagSlug?: string; page?: number }) => ({
    categorySlug: input?.categorySlug,
    authorSlug: input?.authorSlug,
    tagSlug: input?.tagSlug,
    page: Math.max(1, Number(input?.page) || 1),
  }))
  .handler(async ({ data }) => loadCollection(data));

export const fetchSearch = createServerFn({ method: "GET" })
  .validator((q: string) => (typeof q === "string" ? q.slice(0, 80) : ""))
  .handler(async ({ data }) => searchPublished(data));

export const fetchArticle = createServerFn({ method: "GET" })
  .validator((slug: string) => {
    if (typeof slug !== "string" || !/^[a-z0-9-]+$/.test(slug)) throw new Error("Unknown article");
    return slug;
  })
  .handler(async ({ data }) => loadArticle(data));

export const sendContact = createServerFn({ method: "POST" })
  .validator((input: { name: string; email: string; message: string; trap?: string }) => ({
    name: String(input?.name ?? ""),
    email: String(input?.email ?? ""),
    message: String(input?.message ?? ""),
    trap: String(input?.trap ?? ""),
  }))
  .handler(async ({ data }) => {
    await saveContact(data);
    return { ok: true as const };
  });
