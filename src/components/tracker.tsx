import { useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

function id(prefix: string, store: Storage) {
  const key = `meridian-${prefix}`;
  let value = store.getItem(key);
  if (!value) {
    value = `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 20)}`;
    store.setItem(key, value);
  }
  return value;
}

export function Tracker() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return;
    if (navigator.webdriver) return;
    const visitorId = id("v", localStorage);
    const seen = Number(sessionStorage.getItem("meridian-seen") || 0);
    let sessionId = sessionStorage.getItem("meridian-s");
    if (!sessionId || Date.now() - seen > 30 * 60 * 1000) {
      sessionId = `s-${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
      sessionStorage.setItem("meridian-s", sessionId);
    }
    sessionStorage.setItem("meridian-seen", String(Date.now()));

    const send = (body: Record<string, unknown>) => {
      const payload = JSON.stringify(body);
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/collect", new Blob([payload], { type: "application/json" }));
      } else {
        void fetch("/api/collect", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: payload,
          keepalive: true,
        });
      }
    };

    send({
      type: "page",
      visitorId,
      sessionId,
      path: pathname,
      title: document.title,
      referrer: document.referrer,
    });

    let accrued = 0;
    let lastTick = Date.now();
    const timer = window.setInterval(() => {
      const now = Date.now();
      if (document.visibilityState === "visible") accrued += now - lastTick;
      lastTick = now;
      sessionStorage.setItem("meridian-seen", String(now));
      if (accrued >= 15000) {
        const engagementMs = accrued;
        accrued = 0;
        send({ type: "engage", visitorId, sessionId, path: pathname, engagementMs });
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}
