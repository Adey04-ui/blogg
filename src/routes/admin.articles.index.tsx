import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin-frame";
import { listArticlesFn } from "@/lib/blog/admin.functions";
import { formatDate } from "@/lib/blog/format";
import type { AdminArticle } from "@/lib/blog/db.server";

export const Route = createFileRoute("/admin/articles/")({
  component: () => (
    <AdminFrame>
      <ArticleList />
    </AdminFrame>
  ),
});

function ArticleList() {
  const load = useServerFn(listArticlesFn);
  const [rows, setRows] = useState<AdminArticle[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let on = true;
    load()
      .then((items) => {
        if (on) setRows(items);
      })
      .catch((err: unknown) => {
        if (on) setError(err instanceof Error ? err.message : "Could not list articles.");
      });
    return () => {
      on = false;
    };
  }, [load]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-serif text-4xl">Articles</h1>
        <Link to="/admin/articles/$id" params={{ id: "new" }} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-paper">
          New essay
        </Link>
      </div>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.14em] text-muted">
            <tr>
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Status</th>
              <th className="py-2 font-medium">Section</th>
              <th className="py-2 font-medium">Updated</th>
            </tr>
          </thead>
          <tbody>
            {(rows ?? []).map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="py-3">
                  <Link to="/admin/articles/$id" params={{ id: String(row.id) }} className="font-medium hover:text-copper">
                    {row.title}
                  </Link>
                  {row.featured ? <span className="ml-2 text-xs text-copper">Featured</span> : null}
                </td>
                <td className="py-3 capitalize">{row.status}</td>
                <td className="py-3">{row.categoryName}</td>
                <td className="py-3 text-muted">{formatDate(row.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows && rows.length === 0 ? <p className="mt-4 text-sm text-muted">No articles yet.</p> : null}
      </div>
    </div>
  );
}
