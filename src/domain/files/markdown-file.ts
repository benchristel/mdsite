import { htmlFromMarkdown } from "../../lib/markdown.js";
import { removeSuffix } from "../../lib/strings.js";
import { TemplatizedHtmlFile } from "./templatized-html-file.js";

export class TemplatizedMarkdownFile extends TemplatizedHtmlFile {
  readonly inputPath: string;

  constructor(path: string, markdown: string) {
    const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
    const htmlPath = removeSuffix(path, ".md") + ".html";
    super(htmlPath, rawHtml);
    this.inputPath = path;
  }
}

export function replaceMarkdownHrefs(html: string): string {
  return html.replace(
    /(<a[^>]+href="([^"#]+)\.)md("|#)/g,
    (match, before, url, after) => {
      if (url.match(/^https?:/)) {
        return match;
      }
      return before + "html" + after;
    }
  );
}
