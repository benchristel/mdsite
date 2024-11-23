import { htmlFromMarkdown } from "../../lib/markdown.js";
import { removeSuffix } from "../../lib/strings.js";
import { replaceMarkdownHrefs } from "./markdown-file.js";
import { MonolithicHtmlFile } from "./monolithic-html-file.js";
export class MonolithicMarkdownFile extends MonolithicHtmlFile {
    constructor(path, markdown) {
        const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
        const htmlPath = removeSuffix(path, ".md") + ".html";
        super(htmlPath, rawHtml);
        this.inputPath = path;
    }
}
