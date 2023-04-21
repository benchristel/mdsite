import { buffer } from "../lib/buffer";
import { htmlFromMarkdown } from "../lib/markdown";
import { removeSuffix } from "../lib/strings";
import { trimMargin } from "../testing/formatting";
import { ProjectFileSet } from "./project-file-set";
import { title } from "./title";
import { test, expect, equals } from "@benchristel/taste";
import { htmlToc } from "./toc";
import { dirname } from "path";

export type HtmlFile = {
  type: "html";
  rawHtml: string;
  title: string;
  outputPath: string;
};

export function MarkdownFile(path: string, markdown: string): HtmlFile {
  const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return {
    type: "html",
    rawHtml,
    title: title(htmlPath, rawHtml),
    outputPath: htmlPath,
  };
}

export function HtmlFile(path: string, rawHtml: string): HtmlFile {
  return {
    type: "html",
    rawHtml,
    title: title(path, rawHtml),
    outputPath: path,
  };
}

export function renderHtmlFile(
  projectFiles: ProjectFileSet,
  file: HtmlFile
): [string, Buffer] {
  return [
    file.outputPath,
    buffer(
      defaultTemplate
        .replace("{{content}}", file.rawHtml)
        .replace("{{title}}", file.title)
        .replace("{{toc}}", () =>
          htmlToc(projectFiles, dirname(file.outputPath))
        )
    ),
  ];
}

function replaceMarkdownHrefs(html: string): string {
  return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}

const defaultTemplate = trimMargin`
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{content}}
    </body>
  </html>
`;

test("replaceMarkdownHrefs", {
  "converts a .md link to a .html link"() {
    expect(
      replaceMarkdownHrefs(`<a href="foo/bar.md">link</a>`),
      equals,
      `<a href="foo/bar.html">link</a>`
    );
  },

  "converts several .md links"() {
    expect(
      replaceMarkdownHrefs(trimMargin`
        <a href="one.md">one</a>
        <a href="two.md">two</a>
      `),
      equals,
      trimMargin`
        <a href="one.html">one</a>
        <a href="two.html">two</a>
      `
    );
  },
});
