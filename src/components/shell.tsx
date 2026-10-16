import { Link, getRouteApi } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { ConsentBanner } from "./consent";
import { Tracker } from "./tracker";

const root = getRouteApi("__root__");

export function Shell({ children }: { children: ReactNode }) {
  const { settings, categories } = root.useLoaderData();
  useEffect(() => {
    if (!settings.ga4Id || !/^G-[A-Z0-9]+$/i.test(settings.ga4Id)) return;
    const apply = () => {
      if (localStorage.getItem("meridian-consent") !== "all") return;
      if (document.querySelector("script[data-ga4]")) return;
      const src = document.createElement("script");
      src.async = true;
      src.dataset.ga4 = "1";
      src.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4Id)}`;
      document.head.appendChild(src);
      const inline = document.createElement("script");
      inline.dataset.ga4 = "1";
      inline.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(settings.ga4Id)});`;
      document.head.appendChild(inline);
    };
    apply();
    window.addEventListener("meridian-consent", apply);
    return () => window.removeEventListener("meridian-consent", apply);
  }, [settings.ga4Id]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a className="skip" href="#content">
        Skip to content
      </a>
      <header className="border-b border-line">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-4 sm:py-5">
          <Link to="/" className="shrink-0">
            <span className="block font-serif text-[1.7rem] leading-none tracking-[-0.03em]">Meridian</span>
            <span className="mt-1 block text-[0.68rem] font-medium uppercase tracking-[0.22em] text-muted">
              Journal
            </span>
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-sm md:flex" aria-label="Sections">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to="/category/$slug"
                params={{ slug: category.slug }}
                className="text-ink/80 hover:text-copper"
                activeProps={{ className: "text-copper" }}
              >
                {category.name}
              </Link>
            ))}
            <Link to="/archive" className="hover:text-copper" activeProps={{ className: "text-copper" }}>
              Archive
            </Link>
            <Link to="/about" className="hover:text-copper" activeProps={{ className: "text-copper" }}>
              About
            </Link>
          </nav>
          <form action="/search" className="ml-auto hidden sm:block md:ml-2">
            <input
              name="q"
              aria-label="Search essays"
              placeholder="Search"
              className="w-32 rounded-full border border-line bg-card px-3 py-2 text-sm outline-none placeholder:text-muted focus:w-44 lg:w-44"
            />
          </form>
          <Link to="/search" className="ml-auto min-h-11 px-2 text-sm sm:hidden" aria-label="Search essays">
            Search
          </Link>
          <ThemeToggle />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-4 overflow-x-auto px-4 pb-3 text-sm md:hidden" aria-label="Sections">
          {categories.map((category) => (
            <Link key={category.slug} to="/category/$slug" params={{ slug: category.slug }} className="shrink-0 py-1">
              {category.name}
            </Link>
          ))}
          <Link to="/archive" className="shrink-0 py-1">
            Archive
          </Link>
          <Link to="/about" className="shrink-0 py-1">
            About
          </Link>
        </nav>
      </header>
      <main id="content">{children}</main>
      <footer className="mt-16 border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2">
          <div>
            <p className="font-serif text-2xl">Meridian Journal</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{settings.tagline}</p>
          </div>
          <nav className="flex flex-wrap content-start gap-x-5 gap-y-2 text-sm" aria-label="Footer">
            <Link to="/contact" className="min-h-11 py-2 hover:text-copper">
              Contact
            </Link>
            <Link to="/privacy" className="min-h-11 py-2 hover:text-copper">
              Privacy
            </Link>
            <Link to="/terms" className="min-h-11 py-2 hover:text-copper">
              Terms
            </Link>
            <Link to="/disclaimer" className="min-h-11 py-2 hover:text-copper">
              Disclaimer
            </Link>
            <a className="min-h-11 py-2 hover:text-copper" href="/rss.xml">
              RSS
            </a>
            <Link to="/admin" className="min-h-11 py-2 hover:text-copper">
              Desk
            </Link>
            <button
              type="button"
              className="min-h-11 py-2 text-left hover:text-copper"
              onClick={() => {
                localStorage.removeItem("meridian-consent");
                window.dispatchEvent(new Event("meridian-consent-open"));
              }}
            >
              Privacy choices
            </button>
          </nav>
        </div>
        <p className="mx-auto max-w-6xl px-4 pb-8 text-xs text-muted">
          © {new Date().getUTCFullYear()} {settings.name}. Essays are opinion and craft notes, not legal, financial, or
          ranking advice.
        </p>
      </footer>
      <ConsentBanner />
      <Tracker />
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);
  return (
    <button
      type="button"
      className="min-h-11 rounded-full border border-line px-3 text-sm"
      aria-pressed={dark}
      onClick={() => {
        const next = !document.documentElement.classList.contains("dark");
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("meridian-theme", next ? "dark" : "light");
        setDark(next);
      }}
    >
      {dark ? "Light" : "Dark"}
    </button>
  );
}
