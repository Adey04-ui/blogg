import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { AdminFrame } from "@/components/admin-frame";
import { checklistFn, inboxFn, listArticlesFn } from "@/lib/blog/admin.functions";
import { formatDate } from "@/lib/blog/format";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <AdminFrame>
      <Overview />
    </AdminFrame>
  ),
});

function Overview() {
  const articles = useServerFn(listArticlesFn);
  const checklist = useServerFn(checklistFn);
  const messages = useServerFn(inboxFn);
  const [error, setError] = useState("");
  const [published, setPublished] = useState(0);
  const [drafts, setDrafts] = useState(0);
  const [pass, setPass] = useState(0);
  const [total, setTotal] = useState(0);
  const [notes, setNotes] = useState<{ id: number; name: string; email: string; message: string; created_at: string }[]>([]);

  useEffect(() => {
    let on = true;
    Promise.all([articles(), checklist(), messages()])
      .then(([list, check, inbox]) => {
        if (!on) return;
        setPublished(list.filter((item) => item.status === "published").length);
        setDrafts(list.filter((item) => item.status === "draft").length);
        setPass(check.items.filter((item) => item.status === "pass").length);
        setTotal(check.items.length);
        setNotes(inbox);
      })
      .catch((err: unknown) => {
        if (on) setError(err instanceof Error ? err.message : "Could not open the desk.");
      });
    return () => {
      on = false;
    };
  }, [articles, checklist, messages]);

  return (
    <div>
      <h1 className="font-serif text-4xl tracking-tight">Overview</h1>
      <p className="mt-2 max-w-xl text-sm text-muted">
        Publish from here. Traffic and advertising live in their own rooms. Nothing on this desk is a promise of search
        placement or ad approval.
      </p>
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Published</p>
          <p className="mt-2 font-serif text-4xl">{published}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Drafts</p>
          <p className="mt-2 font-serif text-4xl">{drafts}</p>
        </div>
        <div className="metric-card">
          <p className="text-xs uppercase tracking-[0.14em] text-muted">Readiness checks passing</p>
          <p className="mt-2 font-serif text-4xl">
            {pass}
            <span className="text-lg text-muted">/{total || "–"}</span>
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/admin/articles/$id" params={{ id: "new" }} className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-paper">
          New essay
        </Link>
        <Link to="/admin/analytics" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm">
          Traffic
        </Link>
        <Link to="/admin/advertising" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm">
          AdSense checklist
        </Link>
      </div>
      <section className="mt-10">
        <h2 className="font-serif text-2xl">Recent notes</h2>
        {notes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No contact messages yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {notes.map((note) => (
              <li key={note.id} className="py-4">
                <p className="text-sm">
                  {note.name} · {note.email}
                </p>
                <p className="mt-1 text-sm text-muted">{note.message}</p>
                <p className="mt-1 text-xs text-muted">{formatDate(note.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
