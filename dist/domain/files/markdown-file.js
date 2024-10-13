import { htmlFromMarkdown } from "../../lib/markdown.js";
import { removeSuffix } from "../../lib/strings.js";
import { HtmlFile } from "./html-file.js";
export class MarkdownFile extends HtmlFile {
    constructor(path, markdown) {
        const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
        const htmlPath = removeSuffix(path, ".md") + ".html";
        super(htmlPath, rawHtml);
        this.inputPath = path;
    }
}
export function replaceMarkdownHrefs(html) {
    return html.replace(/(<a[^>]+href="([^"#]+)\.)md("|#)/g, (match, before, url, after) => {
        if (url.match(/^https?:/)) {
            return match;
        }
        return before + "html" + after;
    });
}
