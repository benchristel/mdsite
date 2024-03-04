import { basename, dirname, relative } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
import { curry } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import { expandAll } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";
export class HtmlFile {
    constructor(outputPath, rawHtml) {
        this.type = "html";
        this.render = (globalInfo) => {
            const { rawHtml: content, outputPath } = this;
            const renderedHtml = pass(globalInfo.template, pipe(expandAll({ content, globalInfo, outputPath, title: this.title }), relativizeLinks(this.outputPath)));
            return [this.outputPath, buffer(renderedHtml)];
        };
        this.rawHtml = rawHtml;
        this.outputPath = outputPath;
        this.title = this.getTitle();
    }
    getTitle() {
        const $ = cheerio.load(this.rawHtml);
        return text($("h1").slice(0, 1)) || this.defaultTitleFromPath();
    }
    defaultTitleFromPath() {
        const path = this.outputPath;
        if (path === "/index.html") {
            return "index.html";
        }
        if (basename(path) === "index.html") {
            return basename(dirname(path));
        }
        return basename(path);
    }
}
const relativizeLinks = curry((fromPath, html) => {
    return html.replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(fromPath), path));
}, "relativizeLinks");
