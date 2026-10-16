import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame, Field, Notice, inputClass } from "@/components/admin-frame";
import { articleFn, deleteArticleFn, saveArticleFn, taxonomyFn } from "@/lib/blog/admin.functions";
import type { ArticleDraft } from "@/lib/blog/db.server";
import { PRESET_IMAGES } from "@/lib/blog/media";
import { renderMarkdown } from "@/lib/blog/markdown";

export const Route = createFileRoute("/admin/articles/$id")({
  component: () => (
    <AdminFrame>
      <Editor id={Route.useParams().id} />
    </AdminFrame>
  ),
});

function Editor({ id }: { id: string }) {
  const navigate = useNavigate();
  const loadArticle = useServerFn(articleFn);
  const loadTax = useServerFn(taxonomyFn);
  const save = useServerFn(saveArticleFn);
  const remove = useServerFn(deleteArticleFn);
  const [draft, setDraft] = useState<ArticleDraft | null>(null);
  const [tax, setTax] = useState<Awaited<ReturnType<typeof taxonomyFn>> | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    let on = true;
    setDraft(null);
    setError("");
    loadTax()
      .then(async (library) => {
        if (!on) return;
        setTax(library);
        if (id === "new") {
          setDraft({
            id: null,
            title: "",
            slug: "",
            seoTitle: "",
            excerpt: "",
            metaDescription: "",
            content: "## \n\n",
            image: "/media/desk.jpg",
            alt: "",
            canonicalUrl: "",
            authorId: library.authors[0]?.id ?? 0,
            categoryId: library.categories[0]?.id ?? 0,
            tagIds: [],
            status: "draft",
            featured: false,
          });
          return;
        }
        const article = await loadArticle({ data: Number(id) });
        if (!on) return;
        if (!article) setError("That essay is not in the desk.");
        setDraft(article);
      })
      .catch((err: unknown) => {
        if (on) setError(err instanceof Error ? err.message : "Could not open the essay.");
      });
    return () => {
      on = false;
    };
  }, [id, loadArticle, loadTax]);

  if (!draft || !tax) {
    return error ? <p className="text-sm text-danger">{error}</p> : <p className="text-sm text-muted">Opening the essay…</p>;
  }

  const set = <K extends keyof ArticleDraft>(key: K, value: ArticleDraft[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  const rendered = renderMarkdown(draft.content);
  const serpTitle = (draft.seoTitle || draft.title || "Untitled").slice(0, 60);
  const serpDesc = (draft.metaDescription || draft.excerpt || "").slice(0, 160);

  return (
    <form
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]"
      onSubmit={(event) => {
        event.preventDefault();
        setPending(true);
        setError("");
        setNote("");
        void save({ data: draft })
          .then((saved) => {
            setNote("Saved.");
            if (id === "new") {
              void navigate({ to: "/admin/articles/$id", params: { id: String(saved.id) } });
            }
          })
          .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."))
          .finally(() => setPending(false));
      }}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-serif text-4xl">{id === "new" ? "New essay" : "Edit essay"}</h1>
          <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => setPreview((value) => !value)}>
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
        <Notice error={error} note={note} />
        {preview ? (
          <article className="prose-journal rounded-2xl border border-line bg-card p-6">
            <h2>{draft.title || "Untitled"}</h2>
            <div dangerouslySetInnerHTML={{ __html: rendered.html }} />
          </article>
        ) : (
          <>
            <Field label="Title">
              <input className={inputClass} value={draft.title} onChange={(event) => set("title", event.target.value)} required />
            </Field>
            <Field label="Slug">
              <input className={inputClass} value={draft.slug} placeholder="leave blank to build from the title" onChange={(event) => set("slug", event.target.value)} />
            </Field>
            <Field label={`Excerpt · ${draft.excerpt.length}`}>
              <textarea className={inputClass} rows={3} value={draft.excerpt} onChange={(event) => set("excerpt", event.target.value)} />
            </Field>
            <Field label="Essay, in Markdown">
              <textarea className={`${inputClass} font-mono`} rows={18} value={draft.content} onChange={(event) => set("content", event.target.value)} />
            </Field>
          </>
        )}
      </div>
      <aside className="space-y-4">
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Search preview</p>
          <p className="mt-3 text-xs text-moss">meridian.example › journal › {draft.slug || "slug"}</p>
          <p className="mt-1 text-lg text-copper">{serpTitle}</p>
          <p className="mt-1 text-sm text-muted">{serpDesc}</p>
          <p className="mt-2 text-xs text-muted">Title {serpTitle.length}/60 · description {serpDesc.length}/160. This is a sketch, not a live result.</p>
        </div>
        <Field label="SEO title">
          <input className={inputClass} value={draft.seoTitle} onChange={(event) => set("seoTitle", event.target.value)} />
        </Field>
        <Field label={`Meta description · ${draft.metaDescription.length}`}>
          <textarea className={inputClass} rows={3} value={draft.metaDescription} onChange={(event) => set("metaDescription", event.target.value)} />
        </Field>
        <Field label="Canonical URL">
          <input className={inputClass} value={draft.canonicalUrl} placeholder="optional https://" onChange={(event) => set("canonicalUrl", event.target.value)} />
        </Field>
        <Field label="Author">
          <select className={inputClass} value={draft.authorId} onChange={(event) => set("authorId", Number(event.target.value))}>
            {tax.authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select className={inputClass} value={draft.categoryId} onChange={(event) => set("categoryId", Number(event.target.value))}>
            {tax.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </Field>
        <fieldset>
          <legend className="mb-2 text-sm text-muted">Tags</legend>
          <div className="flex flex-wrap gap-2">
            {tax.tags.map((tag) => {
              const on = draft.tagIds.includes(tag.id);
              return (
                <label key={tag.id} className={`inline-flex min-h-10 items-center rounded-full border px-3 text-sm ${on ? "border-copper text-copper" : "border-line"}`}>
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={on}
                    onChange={() =>
                      set(
                        "tagIds",
                        on ? draft.tagIds.filter((item) => item !== tag.id) : [...draft.tagIds, tag.id],
                      )
                    }
                  />
                  {tag.name}
                </label>
              );
            })}
          </div>
        </fieldset>
        <Field label="Featured image URL">
          <input className={inputClass} value={draft.image} onChange={(event) => set("image", event.target.value)} />
        </Field>
        <div className="flex gap-2 overflow-x-auto">
          {PRESET_IMAGES.map((image) => (
            <button
              key={image.src}
              type="button"
              className="shrink-0"
              onClick={() => {
                set("image", image.src);
                if (!draft.alt) set("alt", image.alt);
              }}
            >
              <img src={image.src} alt="" className="h-14 w-20 rounded-lg object-cover" />
            </button>
          ))}
        </div>
        <Field label="Image alt text">
          <input className={inputClass} value={draft.alt} onChange={(event) => set("alt", event.target.value)} />
        </Field>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" checked={draft.featured} onChange={(event) => set("featured", event.target.checked)} />
          Feature on the front page
        </label>
        <Field label="Status">
          <select className={inputClass} value={draft.status} onChange={(event) => set("status", event.target.value === "published" ? "published" : "draft")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </Field>
        <button type="submit" disabled={pending} className="min-h-11 w-full rounded-full bg-ink text-sm text-paper disabled:opacity-60">
          {pending ? "Saving…" : draft.status === "published" ? "Save and publish" : "Save draft"}
        </button>
        {draft.id ? (
          <button
            type="button"
            className="min-h-11 w-full rounded-full border border-line text-sm text-danger"
            onClick={() => {
              if (!draft.id || !window.confirm("Delete this essay?")) return;
              void remove({ data: draft.id }).then(() => navigate({ to: "/admin/articles" }));
            }}
          >
            Delete
          </button>
        ) : null}
      </aside>
    </form>
  );
}
