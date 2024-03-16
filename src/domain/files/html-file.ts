import { basename, dirname, relative } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
import { curry } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import type { ProjectGlobalInfo } from "../project-global-info.js";
import { expandAll } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";

export class HtmlFile {
  readonly type = "html";
  readonly rawHtml: string;
  readonly title: string;
  readonly outputPath: string;
  readonly inputPath: string;

  constructor(outputPath: string, rawHtml: string) {
    this.rawHtml = rawHtml;
    this.outputPath = outputPath;
    this.inputPath = outputPath;
    this.title = this.getTitle();
  }

  render = (project: ProjectGlobalInfo): [string, Buffer] => {
    const { rawHtml: content, outputPath, inputPath, title } = this;
    const renderedHtml = pass(
      project.template,
      pipe(
        expandAll({
          content,
          globalInfo: project,
          outputPath,
          inputPath,
          title,
        }),
        relativizeLinks(this.outputPath)
      )
    );
    return [this.outputPath, buffer(renderedHtml)];
  };

  private getTitle(): string {
    const $ = cheerio.load(this.rawHtml);
    return text($("h1").slice(0, 1)) || this.defaultTitleFromPath();
  }

  private defaultTitleFromPath() {
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

const relativizeLinks = curry((fromPath: string, html: string): string => {
  return html.replace(
    /((?:href|src)=")(\/[^"]+)/g,
    (_, prefix, path) => prefix + relative(dirname(fromPath), path)
  );
}, "relativizeLinks");
