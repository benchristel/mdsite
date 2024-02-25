import { htmlFromMarkdown } from "../../lib/markdown";
import { removeSuffix } from "../../lib/strings";
import { HtmlFile } from "./html-file";

export function MarkdownFile(path: string, markdown: string): HtmlFile {
  const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return new HtmlFile(htmlPath, rawHtml);
}

export function replaceMarkdownHrefs(html: string): string {
  return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}
