import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const root = getRouteApi("__root__");

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Meridian Journal" },
      {
        name: "description",
        content: "Meridian Journal is an independent magazine about writing, attention, and the work of being read.",
      },
    ],
  }),
  component: About,
});

function About() {
  const { settings, origin } = root.useLoaderData();
  return (
    <Shell>
      <article className="mx-auto max-w-[68ch] px-4 py-12">
        <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-copper">About</p>
        <h1 className="mt-3 font-serif text-5xl tracking-[-0.03em]">A small journal with a public editor.</h1>
        <div className="prose-journal mt-6">
          <p>
            {settings.name} publishes essays for people who write on the open web and want the work to be readable,
            findable, and honest about money. The subjects are craft, search, privacy, and measurement. The voice is
            one magazine, not a content mill.
          </p>
          <p>
            Adaeze Okonkwo edits. Jonah Pell and Mira Chen write with her. The site you are reading is the public
            half. The desk, where drafts and traffic live, is private to the editor who signs in.
          </p>
          <p>
            Write to {settings.email || "the editors"} if a piece is wrong, unclear, or useful. Corrections are part of
            the work. The updated date on an essay is there so you can see when the words moved.
          </p>
          <p>
            This publication does not promise a place in search results, an advertising account, or a revenue figure.
            Those decisions belong to readers, to search engines, and to the advertising programs you choose to apply
            to.
          </p>
        </div>
        <p className="mt-8 text-sm text-muted">Published at {origin || "this domain"}.</p>
      </article>
    </Shell>
  );
}
