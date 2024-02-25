import { buffer } from "../lib/buffer.js";
import { htmlFromMarkdown } from "../lib/markdown.js";
import { removeSuffix } from "../lib/strings.js";
import { title } from "./title.js";
import { curry } from "@benchristel/taste";
import { dirname, relative } from "path";
import { ProjectGlobalInfo } from "./project-global-info.js";
import { expandAll } from "./macros/index.js";
import { pass, pipe } from "../lib/functional.js";

export function MarkdownFile(path: string, markdown: string): HtmlFile {
  const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return new HtmlFile(htmlPath, rawHtml);
}

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
        expandAll({
          content,
          globalInfo,
          outputPath,
        }),
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

export function replaceMarkdownHrefs(html: string): string {
  return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}
