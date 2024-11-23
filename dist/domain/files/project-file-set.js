import { OpaqueFile } from "./opaque-file.js";
import { TemplatizedHtmlFile } from "./templatized-html-file.js";
import { OrderFile } from "./order-file.js";
import { TemplatizedMarkdownFile } from "./markdown-file.js";
import { MonolithicHtmlFile } from "./monolithic-html-file.js";
import { MonolithicMarkdownFile } from "./monolithic-markdown-file.js";
export function ProjectFile(path, contents) {
    switch (true) {
        case isTemplatizedMarkdown():
            return new TemplatizedMarkdownFile(path, contents.toString());
        case isMarkdown():
            return new MonolithicMarkdownFile(path, contents.toString());
        case isTemplatizedHtml():
            return new TemplatizedHtmlFile(path, contents.toString());
        case isHtml():
            return new MonolithicHtmlFile(path, contents.toString());
        case isOrderTxt():
            return new OrderFile(path, contents.toString());
        default:
            return OpaqueFile(path, contents);
    }
    function isTemplatizedMarkdown() {
        return isMarkdown() && !monolithicHtml.test(contents.toString());
    }
    function isMarkdown() {
        return path.endsWith(".md");
    }
    function isTemplatizedHtml() {
        return isHtml() && !monolithicHtml.test(contents.toString());
    }
    function isHtml() {
        return path.endsWith(".html");
    }
    function isOrderTxt() {
        return path.endsWith("/order.txt");
    }
}
const monolithicHtml = /^\s*<(!doctype|html)/i;
export function pathAndBufferToProjectFile([srcPath, srcContents]) {
    const projectFile = ProjectFile(srcPath, srcContents);
    return [projectFile.outputPath.toString(), projectFile];
}
