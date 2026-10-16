import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame, Field, Notice, inputClass } from "@/components/admin-frame";
import {
  deleteAuthorFn,
  deleteCategoryFn,
  deleteTagFn,
  saveAuthorFn,
  saveCategoryFn,
  saveTagFn,
  taxonomyFn,
} from "@/lib/blog/admin.functions";

export const Route = createFileRoute("/admin/library")({
  component: () => (
    <AdminFrame>
      <Library />
    </AdminFrame>
  ),
});

function Library() {
  const load = useServerFn(taxonomyFn);
  const saveAuthor = useServerFn(saveAuthorFn);
  const saveCategory = useServerFn(saveCategoryFn);
  const saveTag = useServerFn(saveTagFn);
  const removeAuthor = useServerFn(deleteAuthorFn);
  const removeCategory = useServerFn(deleteCategoryFn);
  const removeTag = useServerFn(deleteTagFn);
  const [data, setData] = useState<Awaited<ReturnType<typeof load>> | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const refresh = () =>
    load()
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not load the library."));

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-10">
      <h1 className="font-serif text-4xl">Library</h1>
      <Notice error={error} note={note} />
      <section>
        <h2 className="font-serif text-2xl">Authors</h2>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {(data?.authors ?? []).map((author) => (
            <li key={author.id} className="flex items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">{author.name}</p>
                <p className="text-sm text-muted">{author.role}</p>
              </div>
              <button type="button" className="text-sm text-danger" onClick={() => void removeAuthor({ data: author.id }).then(refresh).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not delete."))}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void saveAuthor({
              data: {
                name: String(form.get("name") ?? ""),
                role: String(form.get("role") ?? ""),
                bio: String(form.get("bio") ?? ""),
              },
            })
              .then(() => {
                setNote("Author saved.");
                event.currentTarget.reset();
                return refresh();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."));
          }}
        >
          <Field label="Name">
            <input name="name" className={inputClass} required />
          </Field>
          <Field label="Role">
            <input name="role" className={inputClass} />
          </Field>
          <Field label="Bio">
            <textarea name="bio" className={`${inputClass} sm:col-span-2`} rows={3} />
          </Field>
          <button className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper sm:col-span-2" type="submit">
            Add author
          </button>
        </form>
      </section>
      <section>
        <h2 className="font-serif text-2xl">Categories</h2>
        <ul className="mt-3 space-y-2">
          {(data?.categories ?? []).map((category) => (
            <li key={category.id} className="flex items-center justify-between gap-3 text-sm">
              <span>
                {category.name} <span className="text-muted">— {category.description}</span>
              </span>
              <button type="button" className="text-danger" onClick={() => void removeCategory({ data: category.id }).then(refresh).catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not delete."))}>
                Delete
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void saveCategory({
              data: { name: String(form.get("name") ?? ""), description: String(form.get("description") ?? "") },
            })
              .then(() => {
                setNote("Category saved.");
                event.currentTarget.reset();
                return refresh();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."));
          }}
        >
          <Field label="Name">
            <input name="name" className={inputClass} required />
          </Field>
          <Field label="Description">
            <input name="description" className={inputClass} />
          </Field>
          <button className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper" type="submit">
            Add category
          </button>
        </form>
      </section>
      <section>
        <h2 className="font-serif text-2xl">Tags</h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {(data?.tags ?? []).map((tag) => (
            <li key={tag.id}>
              <button type="button" className="rounded-full border border-line px-3 py-2 text-sm" onClick={() => void removeTag({ data: tag.id }).then(refresh)}>
                {tag.name} ×
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            void saveTag({ data: String(form.get("name") ?? "") })
              .then(() => {
                setNote("Tag saved.");
                event.currentTarget.reset();
                return refresh();
              })
              .catch((err: unknown) => setError(err instanceof Error ? err.message : "Could not save."));
          }}
        >
          <input name="name" aria-label="New tag" className={inputClass} required />
          <button className="min-h-11 rounded-full bg-ink px-5 text-sm text-paper" type="submit">
            Add
          </button>
        </form>
      </section>
    </div>
  );
}
