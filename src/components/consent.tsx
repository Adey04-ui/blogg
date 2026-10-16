import { useEffect, useState } from "react";

export function ConsentBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setOpen(!localStorage.getItem("meridian-consent"));
    sync();
    window.addEventListener("meridian-consent-open", sync);
    return () => window.removeEventListener("meridian-consent-open", sync);
  }, []);

  if (!open) return null;

  const choose = (value: "all" | "essential") => {
    localStorage.setItem("meridian-consent", value);
    window.dispatchEvent(new Event("meridian-consent"));
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Meridian keeps a first-party count of pages opened, without storing your IP address. Advertising and Google
          Analytics, when configured, stay off unless you allow them. You can change this later in the footer.
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" className="min-h-11 rounded-full border border-line px-4 text-sm" onClick={() => choose("essential")}>
            Essential only
          </button>
          <button type="button" className="min-h-11 rounded-full bg-ink px-4 text-sm text-paper" onClick={() => choose("all")}>
            Allow measurement & ads
          </button>
        </div>
      </div>
    </div>
  );
}
