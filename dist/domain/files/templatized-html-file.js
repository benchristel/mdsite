import { basename, dirname, relative } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
import { buffer } from "../../lib/buffer.js";
import { expandAllMacros } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";
import { OutputPath } from "../output-path.js";
export class TemplatizedHtmlFile {
    constructor(outputPath, rawHtml) {
        this.type = "html";
        this.render = (project) => {
            const { rawHtml: content, outputPath, inputPath, title } = this;
            const renderedHtml = pass(project.template, pipe(expandAllMacros({
                content,
                globalInfo: project,
                outputPath,
                inputPath,
                title,
            }), this.relativizeLinks));
            return [outputPath.toString(), buffer(renderedHtml)];
        };
        this.relativizeLinks = (html) => {
            const fromPath = this.outputPath;
            return html.replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(fromPath.toString()), path));
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
