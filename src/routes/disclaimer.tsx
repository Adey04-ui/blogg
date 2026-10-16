import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — Meridian Journal" },
      { name: "description", content: "What Meridian Journal does not promise." },
    ],
  }),
  component: () => (
    <Shell>
      <article className="prose-journal mx-auto max-w-[68ch] px-4 py-12">
        <h1>Disclaimer</h1>
        <p>
          Meridian Journal is an independent publication. Essays reflect the author’s judgment at the time of writing.
          They can be wrong, and they go out of date. Check anything that matters against a primary source.
        </p>
        <p>
          Nothing here is legal advice, financial advice, or a guarantee of income. Advertising estimates on the desk
          are models or figures an editor typed from a report. They are not a statement from Google, and they are not
          a prediction.
        </p>
        <p>
          Technical search hygiene — titles, sitemaps, speed, structured data — makes a site easier to understand. It
          does not promise a ranking. Approval for an advertising program belongs to that program.
        </p>
        <p>
          When advertisements are enabled, they are labeled. A click is never required. If a placement feels confusing,
          write to the editor and it will be reviewed.
        </p>
      </article>
    </Shell>
  ),
});
