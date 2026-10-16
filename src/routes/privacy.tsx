import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const root = getRouteApi("__root__");

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Meridian Journal" },
      {
        name: "description",
        content: "What Meridian Journal stores about visits, messages, and optional advertising.",
      },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const { settings } = root.useLoaderData();
  return (
    <Shell>
      <article className="prose-journal mx-auto max-w-[68ch] px-4 py-12">
        <h1>Privacy</h1>
        <p>
          This page describes {settings.name} as it behaves today. It is not legal advice. If you publish in a region
          with specific rules, have a qualified person read it before you rely on it.
        </p>
        <h2>What the journal needs to open</h2>
        <p>
          The site serves pages, images, and a theme choice stored in your browser. That choice stays on your device.
        </p>
        <h2>First-party measurement</h2>
        <p>
          Public pages can record that a page was opened: a random visitor id and a random session id kept in this
          browser, the path, a coarse device and browser label, the referring site, and a country code when the host
          already provides one. Raw IP addresses are not stored. Sessions expire after 30 minutes of quiet. The desk
          shows these counts only to a signed-in editor. Admin pages are not counted.
        </p>
        <h2>Optional advertising and Google Analytics</h2>
        <p>
          Google AdSense and Google Analytics 4 load only after you choose “Allow measurement & ads”, and only if the
          editor has entered the relevant ids. Those products are run by Google and follow Google’s own policies. You
          can withdraw the choice from the footer.
        </p>
        <h2>Contact messages</h2>
        <p>
          If you write through the contact form, we store your name, email, and message so we can reply. We do not add
          you to a list.
        </p>
        <h2>Reach the editor</h2>
        <p>Email {settings.email || "the address on the contact page"}.</p>
      </article>
    </Shell>
  );
}
