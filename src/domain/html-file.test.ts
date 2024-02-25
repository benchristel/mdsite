import { test, expect, is, equals } from "@benchristel/taste";
import { HtmlFile, MarkdownFile, replaceMarkdownHrefs } from "./html-file";
import { dummyProjectGlobalInfo } from "./project-global-info";
import { trimMargin } from "../testing/formatting";

test("HtmlFile", {
  "replaces absolute hrefs with relative ones"() {
    const file = new HtmlFile(
      "/foo/bar.html",
      `<a href="/baz/kludge.html"></a>`
    );
    const [_, rendered] = file.render({
      ...dummyProjectGlobalInfo,
      template: "{{content}}",
    });
    expect(String(rendered), is, `<a href="../baz/kludge.html"></a>`);
  },

  "relativizes multiple hrefs"() {
    const file = new HtmlFile(
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
    const file = new HtmlFile("/foo/bar.html", "");
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
    const file = new HtmlFile("/foo/bar.html", "");
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
