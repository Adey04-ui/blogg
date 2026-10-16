import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Meridian Journal" },
      { name: "description", content: "Terms for reading and sharing Meridian Journal." },
    ],
  }),
  component: () => (
    <Shell>
      <article className="prose-journal mx-auto max-w-[68ch] px-4 py-12">
        <h1>Terms</h1>
        <p>
          Read the journal freely. Quote it with a link and the author’s name. Do not republish a whole essay as if it
          were yours, and do not scrape the site to train a model or to fill another site.
        </p>
        <p>
          The essays are opinion and craft notes. They are not legal, financial, medical, or advertising advice, and
          they are not a promise about search rankings or ad-program approval.
        </p>
        <p>
          The desk is for the editor. Do not attempt to post, delete, or reconfigure the site without permission. We
          may remove comments or messages that are abusive, or that try to break the site.
        </p>
        <p>If you keep using the site, you accept these terms. If you do not, you can simply leave.</p>
      </article>
    </Shell>
  ),
});
