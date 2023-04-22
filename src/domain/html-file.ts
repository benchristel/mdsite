import { buffer } from "../lib/buffer";
import { htmlFromMarkdown } from "../lib/markdown";
import { removeSuffix } from "../lib/strings";
import { trimMargin } from "../testing/formatting";
import { title } from "./title";
import { test, expect, equals } from "@benchristel/taste";
import { htmlToc } from "./toc";
import { dirname } from "path";
import { ProjectGlobalInfo } from "./project-global-info";

export type HtmlFile = {
  type: "html";
  rawHtml: string;
  title: string;
  outputPath: string;
  render: (globalInfo: ProjectGlobalInfo) => [string, Buffer];
};

export function MarkdownFile(path: string, markdown: string): HtmlFile {
  const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return HtmlFile(htmlPath, rawHtml);
}

export function HtmlFile(path: string, rawHtml: string): HtmlFile {
  const self: HtmlFile = {
    type: "html",
    rawHtml,
    title: title(path, rawHtml),
    outputPath: path,
    render: renderHtmlFile,
  };
  return self;

  function renderHtmlFile(globalInfo: ProjectGlobalInfo): [string, Buffer] {
    return [
      self.outputPath,
      buffer(
        defaultTemplate
          .replace("{{content}}", self.rawHtml)
          .replace("{{title}}", self.title)
          .replace("{{toc}}", () =>
            htmlToc(globalInfo, dirname(self.outputPath))
          )
      ),
    ];
  }
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
