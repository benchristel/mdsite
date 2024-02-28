import { htmlFromMarkdown } from "../../lib/markdown";
import { removeSuffix } from "../../lib/strings";
import { HtmlFile } from "./html-file";
export function MarkdownFile(path, markdown) {
    const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
    const htmlPath = removeSuffix(path, ".md") + ".html";
    return new HtmlFile(htmlPath, rawHtml);
}
export function replaceMarkdownHrefs(html) {
    return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}