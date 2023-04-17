import { basename } from "path";

export function title(path: string, html: string): string {
  return html.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1] ?? basename(path);
}
