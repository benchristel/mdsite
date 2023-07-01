import { buffer } from "../lib/buffer";
import { htmlFromMarkdown } from "../lib/markdown";
import { removeSuffix } from "../lib/strings";
import { trimMargin } from "../testing/formatting";
import { title } from "./title";
import { test, expect, equals } from "@benchristel/taste";
import { htmlToc } from "./toc";
import { dirname } from "path";
import { ProjectGlobalInfo } from "./project-global-info";
import { homeLink, nextLink, prevLink, upLink } from "./links";

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
    render,
  };
  return self;

  function render(globalInfo: ProjectGlobalInfo): [string, Buffer] {
    return [
      self.outputPath,
      buffer(
        globalInfo.template
          .replace("{{content}}", self.rawHtml)
          .replace(/{{title}}/g, self.title)
          .replace(/{{toc}}/g, () =>
            htmlToc(globalInfo, dirname(self.outputPath))
          )
          .replace(/{{next}}/g, () => nextLink(globalInfo, self.outputPath))
          .replace(/{{prev}}/g, () => prevLink(globalInfo, self.outputPath))
          .replace(/{{up}}/g, () => upLink(self.outputPath))
          .replace(/{{home}}/g, () => homeLink(self.outputPath))
          .replace(/{{macro ([^}]+)}}/g, "{{$1}}")
      ),
    ];
  }
}

function replaceMarkdownHrefs(html: string): string {
  return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}

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
