import { buffer } from "../../lib/buffer.js";
import { title } from "./title.js";
import { curry } from "@benchristel/taste";
import { dirname, relative } from "path";
import { expandAll } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";
export class HtmlFile {
    constructor(outputPath, rawHtml) {
        this.type = "html";
        this.render = (globalInfo) => {
            const { rawHtml: content, outputPath } = this;
            const renderedHtml = pass(globalInfo.template, pipe(expandAll({ content, globalInfo, outputPath }), relativizeLinks(this.outputPath)));
            return [this.outputPath, buffer(renderedHtml)];
        };
        this.rawHtml = rawHtml;
        this.title = title(outputPath, rawHtml);
        this.outputPath = outputPath;
    }
}
const relativizeLinks = curry((fromPath, html) => {
    return html.replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(fromPath), path));
}, "relativizeLinks");