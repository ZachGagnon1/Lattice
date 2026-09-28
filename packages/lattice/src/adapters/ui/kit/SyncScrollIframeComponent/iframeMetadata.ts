export interface IframeMetadata {
  language: string;
  title: string;
}

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export function createIframeSource(metadata: IframeMetadata): string {
  const language = escapeHtml(metadata.language);
  const title = escapeHtml(metadata.title);

  return `<!doctype html><html lang="${language}" xmlns="http://www.w3.org/1999/xhtml"><head><title>${title}</title></head><body></body></html>`;
}

export function syncIframeMetadata(
  document: Pick<Document, "documentElement" | "title">,
  metadata: IframeMetadata,
) {
  document.documentElement.lang = metadata.language;
  document.title = metadata.title;
}
