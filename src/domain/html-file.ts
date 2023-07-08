import { buffer } from "../lib/buffer.js";
import { htmlFromMarkdown } from "../lib/markdown.js";
import { removeSuffix } from "../lib/strings.js";
import { trimMargin } from "../testing/formatting.js";
import { title } from "./title.js";
import { test, expect, equals, is, curry } from "@benchristel/taste";
import { dirname, relative } from "path";
import {
  ProjectGlobalInfo,
  dummyProjectGlobalInfo,
} from "./project-global-info.js";
import { expandAll } from "./macros";
import { pass, pipe } from "../lib/functional.js";

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

export function HtmlFile(outputPath: string, rawHtml: string): HtmlFile {
  return {
    type: "html",
    rawHtml,
    title: title(outputPath, rawHtml),
    outputPath,
    render,
  };

  function render(globalInfo: ProjectGlobalInfo): [string, Buffer] {
    const renderedHtml = pass(
      globalInfo.template,
      pipe(
        expandAll({
          content: rawHtml,
          globalInfo,
          outputPath,
        }),
        relativizeLinks(outputPath)
      )
    );
    return [outputPath, buffer(renderedHtml)];
  }
}

const relativizeLinks = curry((fromPath: string, html: string): string => {
  return html.replace(
    /((?:href|src)=")(\/[^"]+)/g,
    (_, prefix, path) => prefix + relative(dirname(fromPath), path)
  );
}, "relativizeLinks");

test("HtmlFile", {
  "replaces absolute hrefs with relative ones"() {
    const file = HtmlFile("/foo/bar.html", `<a href="/baz/kludge.html"></a>`);
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: "{{content}}",
    });
    expect(String(rendered), is, `<a href="../baz/kludge.html"></a>`);
  },

  "relativizes multiple hrefs"() {
    const file = HtmlFile(
      "/foo/bar.html",
      `<a href="/a/b.html"></a><a href="/foo/d.html"></a>`
    );
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: "{{content}}",
    });
    expect(
      String(rendered),
      is,
      `<a href="../a/b.html"></a><a href="d.html"></a>`
    );
  },

  "relativizes links in the template"() {
    const file = HtmlFile("/foo/bar.html", "");
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: `<link rel="stylesheet" href="/assets/style.css">`,
    });
    expect(
      String(rendered),
      is,
      `<link rel="stylesheet" href="../assets/style.css">`
    );
  },

  "relativizes script src attributes"() {
    const file = HtmlFile("/foo/bar.html", "");
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: `<script type="module" src="/js/main.js"></script>`,
    });
    expect(
      String(rendered),
      is,
      `<script type="module" src="../js/main.js"></script>`
    );
  },

  "leaves links in code tags alone"() {
    const file = MarkdownFile(
      "/foo/bar.md",
      '`<a href="/baz/kludge.html"></a>`'
    );
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: "{{content}}",
    });
    expect(
      String(rendered),
      is,
      `<p><code>&lt;a href=&quot;/baz/kludge.html&quot;&gt;&lt;/a&gt;</code></p>`
    );
  },
});

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
