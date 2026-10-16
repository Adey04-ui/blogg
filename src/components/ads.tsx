import { useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/blog/db.server";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  settings,
  position,
  slot,
}: {
  settings: Settings;
  position: "intro" | "mid" | "end" | "sidebar";
  slot: string;
}) {
  const enabled =
    settings.adsEnabled &&
    Boolean(settings.adsenseClient) &&
    (position === "intro"
      ? settings.adIntro
      : position === "mid"
        ? settings.adMid
        : position === "end"
          ? settings.adEnd
          : settings.adSidebar);
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(position === "intro");
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const read = () => setAllowed(localStorage.getItem("meridian-consent") === "all");
    read();
    window.addEventListener("meridian-consent", read);
    return () => window.removeEventListener("meridian-consent", read);
  }, []);

  useEffect(() => {
    if (!enabled || position === "intro") return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setReady(true);
      },
      { rootMargin: "240px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, position]);

  useEffect(() => {
    if (!enabled || !allowed || !ready || !slot) return;
    if (!document.querySelector("script[data-adsense]")) {
      const script = document.createElement("script");
      script.async = true;
      script.dataset.adsense = "1";
      script.crossOrigin = "anonymous";
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(settings.adsenseClient)}`;
      document.head.appendChild(script);
    }
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* AdSense rejects duplicate pushes on soft navigations; the reserved frame stays. */
    }
  }, [allowed, enabled, ready, settings.adsenseClient, slot]);

  if (!enabled) return null;

  return (
    <aside ref={ref} className="my-8" aria-label="Advertisement" data-ad-position={position}>
      <p className="mb-2 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted">Advertisement</p>
      <div className={`ad-frame ${position === "sidebar" ? "min-h-[250px]" : "min-h-[120px]"}`}>
        {allowed && ready && slot ? (
          <ins
            className="adsbygoogle block w-full"
            style={{ display: "block", minHeight: position === "sidebar" ? 250 : 120 }}
            data-ad-client={settings.adsenseClient}
            data-ad-slot={slot}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          <span>{allowed ? "Advertisement" : "Ad space reserved"}</span>
        )}
      </div>
    </aside>
  );
}
