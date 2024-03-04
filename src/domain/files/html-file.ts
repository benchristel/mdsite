import { basename, dirname, relative } from "path";
import * as cheerio from "cheerio";
import { text } from "cheerio";
import { curry } from "@benchristel/taste";
import { buffer } from "../../lib/buffer.js";
import type { ProjectGlobalInfo } from "../project-global-info.js";
import { expandAll } from "../macros/index.js";
import { pass, pipe } from "../../lib/functional.js";

export class HtmlFile implements HtmlFile {
  readonly type = "html";
  readonly rawHtml: string;
  readonly title: string;
  readonly outputPath: string;

  constructor(outputPath: string, rawHtml: string) {
    this.rawHtml = rawHtml;
    this.title = title(outputPath, rawHtml);
    this.outputPath = outputPath;
  }

  render = (globalInfo: ProjectGlobalInfo): [string, Buffer] => {
    const { rawHtml: content, outputPath } = this;
    const renderedHtml = pass(
      globalInfo.template,
      pipe(
        expandAll({ content, globalInfo, outputPath, title: this.title }),
        relativizeLinks(this.outputPath)
      )
    );
    return [this.outputPath, buffer(renderedHtml)];
  };
}

const relativizeLinks = curry((fromPath: string, html: string): string => {
  return html.replace(
    /((?:href|src)=")(\/[^"]+)/g,
    (_, prefix, path) => prefix + relative(dirname(fromPath), path)
  );
}, "relativizeLinks");

function title(path: string, html: string): string {
  const $ = cheerio.load(html);
  return text($("h1").slice(0, 1)) || defaultTitle(path);
}

function defaultTitle(path: string) {
  if (path === "/index.html") {
    return "index.html";
  }
  if (basename(path) === "index.html") {
    return basename(dirname(path));
  }
  return basename(path);
}
