import { Icon } from "@/components/icon-sprite";

function describeSource(url: URL): string {
  const host = url.hostname.replace(/^(www|m|vm|vt)\./, "");
  if (host.endsWith("instagram.com")) return "Ver en Instagram";
  if (host.endsWith("tiktok.com")) return "Ver en TikTok";
  return `Ver original (${host})`;
}

/**
 * Enlace a la fuente original de una receta importada por URL. Es un <a>
 * https normal con target="_blank" a propósito: en iOS/Android los universal
 * links de instagram.com y tiktok.com abren la app instalada en vez de la
 * pestaña del navegador (en desktop simplemente abre el sitio en otra pestaña).
 */
export function SourceLinkButton({ sourceUrl }: { sourceUrl: string | null }) {
  if (!sourceUrl) return null;

  let url: URL;
  try {
    url = new URL(sourceUrl);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  return (
    <a
      href={url.toString()}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-surface px-6 text-sm font-bold text-ink transition-colors hover:bg-border-light"
    >
      <Icon name="external" size={16} />
      {describeSource(url)}
    </a>
  );
}
