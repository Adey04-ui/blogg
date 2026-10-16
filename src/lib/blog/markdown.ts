export type Heading = { id: string; text: string; level: 2 | 3 };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "\u0026amp;")
    .replace(/</g, "\u0026lt;")
    .replace(/>/g, "\u0026gt;")
    .replace(/"/g, "\u0026quot;");
}

function safeUrl(url: string): boolean {
  return (
    url.startsWith("/") ||
    url.startsWith("https://") ||
    url.startsWith("http://") ||
    url.startsWith("#")
  );
}

function inline(source: string): string {
  let text = escapeHtml(source);
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt: string, url: string) => {
    if (!safeUrl(url)) return alt;
    return `<img src="${url}" alt="${alt}" loading="lazy" decoding="async" />`;
  });
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    if (!safeUrl(url)) return label;
    const external = url.startsWith("http");
    const extra = external ? ' rel="noopener noreferrer" target="_blank"' : "";
    return `<a href="${url}"${extra}>${label}</a>`;
  });
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
  return text;
}

export function renderMarkdown(markdown: string): {
  html: string;
  blocks: string[];
  headings: Heading[];
} {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: string[] = [];
  const headings: Heading[] = [];
  const used = new Map<string, number>();
  let i = 0;

  const headingId = (text: string) => {
    const base = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    return n === 0 ? base : `${base}-${n}`;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    if (!line.trim()) {
      i += 1;
      continue;
    }
    const heading = /^(#{2,3})\s+(.+)$/.exec(line);
    if (heading) {
      const level = heading[1].length as 2 | 3;
      const text = heading[2].trim();
      const id = headingId(text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
      headings.push({ id, text: text.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"), level });
      blocks.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i += 1;
      continue;
    }
    if (line.startsWith("> ")) {
      const parts: string[] = [];
      while (i < lines.length && (lines[i] ?? "").startsWith("> ")) {
        parts.push((lines[i] ?? "").slice(2));
        i += 1;
      }
      blocks.push(`<blockquote><p>${inline(parts.join(" "))}</p></blockquote>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i] ?? "")) {
        items.push(`<li>${inline((lines[i] ?? "").replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }
    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i] ?? "")) {
        items.push(`<li>${inline((lines[i] ?? "").replace(/^\d+\.\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ol>${items.join("")}</ol>`);
      continue;
    }
    const para = [line];
    i += 1;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{2,3})\s+/.test(lines[i] ?? "") &&
      !(lines[i] ?? "").startsWith("> ") &&
      !/^[-*]\s+/.test(lines[i] ?? "") &&
      !/^\d+\.\s+/.test(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i += 1;
    }
    blocks.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return { html: blocks.join("\n"), blocks, headings };
}

export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
