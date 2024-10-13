import { basename, dirname, relative } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
import { curry } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import { expandAll } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";
import { OutputPath } from "../output-path.js";
export class HtmlFile {
    constructor(outputPath, rawHtml) {
        this.type = "html";
        this.render = (project) => {
            const { rawHtml: content, outputPath, inputPath, title } = this;
            const renderedHtml = pass(project.template, pipe(expandAll({
                content,
                globalInfo: project,
                outputPath,
                inputPath,
                title,
            }), relativizeLinks(this.outputPath)));
            return [this.outputPath.toString(), buffer(renderedHtml)];
        };
        this.rawHtml = rawHtml;
        this.outputPath = OutputPath.of(outputPath);
        this.inputPath = outputPath.toString();
        this.title = this.getTitle();
    }
    getTitle() {
        const $ = cheerio.load(this.rawHtml);
        return text($("h1").slice(0, 1)) || this.defaultTitleFromPath();
    }
    defaultTitleFromPath() {
        const path = this.outputPath;
        if (path.is("/index.html")) {
            return "index.html";
        }
        if (path.basename() === "index.html") {
            // TODO: move to parentDir() method on OutputPath?
            return basename(path.dirname());
        }
        return path.basename();
    }
}
const relativizeLinks = curry((fromPath, html) => {
    return html.replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(fromPath.toString()), path));
}, "relativizeLinks");
