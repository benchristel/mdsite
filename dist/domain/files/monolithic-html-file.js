import { buffer } from "../../lib/buffer.js";
import { pass, pipe } from "../../lib/functional.js";
import { expandAllMacros } from "../macros/index.js";
import { TemplatizedHtmlFile } from "./templatized-html-file.js";
export class MonolithicHtmlFile extends TemplatizedHtmlFile {
    constructor() {
        super(...arguments);
        this.render = (project) => {
            const { rawHtml: content, outputPath, inputPath, title } = this;
            const renderedHtml = pass(content, pipe(expandAllMacros({
                content,
                globalInfo: project,
                outputPath,
                inputPath,
                title,
            }), this.relativizeLinks));
            return [outputPath.toString(), buffer(renderedHtml)];
        };
    }
}