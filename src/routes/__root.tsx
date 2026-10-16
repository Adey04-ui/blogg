import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { fetchShell } from "@/lib/blog/public.functions";
import appCss from "../styles.css?url";

const themeBoot = `try{if(localStorage.getItem("meridian-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export const Route = createRootRoute({
  loader: () => fetchShell(),
  head: ({ loaderData }) => {
    const name = loaderData?.settings.name ?? "Meridian Journal";
    const description = loaderData?.settings.description ?? "";
    const gsc = loaderData?.settings.gscVerification ?? "";
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: name },
        { name: "description", content: description },
        { name: "theme-color", content: "#f3eee6" },
        ...(gsc ? [{ name: "google-site-verification", content: gsc }] : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,560;9..144,650&display=swap",
        },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
        { rel: "alternate", type: "application/rss+xml", title: name, href: "/rss.xml" },
      ],
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}
