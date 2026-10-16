import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center px-6 py-16">
      <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-copper">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-[-0.03em]">This page is not in the journal.</h1>
      <p className="mt-4 leading-relaxed text-muted">
        The address may have changed. If an essay moved, the old link should have been redirected. Try the archive, or
        start again from the front.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="inline-flex min-h-11 items-center rounded-full bg-ink px-5 text-sm text-paper">
          Front page
        </Link>
        <Link to="/archive" className="inline-flex min-h-11 items-center rounded-full border border-line px-5 text-sm">
          Archive
        </Link>
      </div>
    </main>
  );
}
