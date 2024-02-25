import { buffer } from "../lib/buffer.js";
import { htmlFromMarkdown } from "../lib/markdown.js";
import { removeSuffix } from "../lib/strings.js";
import { title } from "./title.js";
import { curry } from "@benchristel/taste";
import { dirname, relative } from "path";
import { expandAll } from "./macros/index.js";
import { pass, pipe } from "../lib/functional.js";
export function MarkdownFile(path, markdown) {
    const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
    const htmlPath = removeSuffix(path, ".md") + ".html";
    return HtmlFile(htmlPath, rawHtml);
}
export function HtmlFile(outputPath, rawHtml) {
    return {
        type: "html",
        rawHtml,
        title: title(outputPath, rawHtml),
        outputPath,
        render,
    };
    function render(globalInfo) {
        const renderedHtml = pass(globalInfo.template, pipe(expandAll({
            content: rawHtml,
            globalInfo,
            outputPath,
        }), relativizeLinks(outputPath)));
        return [outputPath, buffer(renderedHtml)];
    }
}
const relativizeLinks = curry((fromPath, html) => {
    return html.replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(fromPath), path));
}, "relativizeLinks");
export function replaceMarkdownHrefs(html) {
    return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}
