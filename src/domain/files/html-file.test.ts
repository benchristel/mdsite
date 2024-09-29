import { test, expect, is, equals } from "@benchristel/taste";
import { HtmlFile } from "./html-file.js";
import { MarkdownFile, replaceMarkdownHrefs } from "./markdown-file.js";
import { trimMargin } from "../../testing/formatting.js";
import { Project } from "../project.js";

test("HtmlFile", {
  "replaces absolute hrefs with relative ones"() {
    const project = new Project({}, "{{content}}");
    const file = new HtmlFile(
      "/foo/bar.html",
      `<a href="/baz/kludge.html"></a>`
    );

    const [_, rendered] = file.render(project);

    expect(String(rendered), is, `<a href="../baz/kludge.html"></a>`);
  },

  "relativizes multiple hrefs"() {
    const project = new Project({}, "{{content}}");
    const file = new HtmlFile(
      "/foo/bar.html",
      `<a href="/a/b.html"></a><a href="/foo/d.html"></a>`
    );

    const [_, rendered] = file.render(project);

    expect(
      String(rendered),
      is,
      `<a href="../a/b.html"></a><a href="d.html"></a>`
    );
  },

  "relativizes links in the template"() {
    const project = new Project(
      {},
      `<link rel="stylesheet" href="/assets/style.css">`
    );
    const file = new HtmlFile("/foo/bar.html", "");

    const [_, rendered] = file.render(project);

    expect(
      String(rendered),
      is,
      `<link rel="stylesheet" href="../assets/style.css">`
    );
  },

  "relativizes script src attributes"() {
    const project = new Project(
      {},
      `<script type="module" src="/js/main.js"></script>`
    );
    const file = new HtmlFile("/foo/bar.html", "");

    const [_, rendered] = file.render(project);

    expect(
      String(rendered),
      is,
      `<script type="module" src="../js/main.js"></script>`
    );
  },

  "leaves links in code tags alone"() {
    const project = new Project({}, "{{content}}");
    const file = new MarkdownFile(
      "/foo/bar.md",
      '`<a href="/baz/kludge.html"></a>`'
    );

    const [_, rendered] = file.render(project);

    expect(
      String(rendered),
      is,
      `<p><code>&lt;a href=&quot;/baz/kludge.html&quot;&gt;&lt;/a&gt;</code></p>`
    );
  },
});

test("HtmlFile.title", {
  "extracts the title from an h1 tag"() {
    expect(new HtmlFile("", "<h1>foo</h1>").title, is, "foo");
  },

  "extracts the title from an h1 tag with an id"() {
    expect(new HtmlFile("", `<h1 id="the-id">foo</h1>`).title, is, "foo");
  },

  "extracts the title from an h1 tag with child tags"() {
    expect(new HtmlFile("", `<h1><code>foo</code></h1>`).title, is, "foo");
  },

  "uses the title from the first h1 tag if there are several"() {
    expect(
      new HtmlFile("", `<h1>the title</h1><h1>not this</h1>`).title,
      is,
      "the title"
    );
  },

  "defaults to the filename if there is no h1"() {
    expect(new HtmlFile("dir/file.html", `<p>whoa</p>`).title, is, "file.html");
  },

  "defaults to the filename if the h1 is empty"() {
    expect(new HtmlFile("file.html", `<h1></h1>`).title, is, "file.html");
  },

  "defaults to the name of the containing directory if the filename is index.html"() {
    expect(new HtmlFile("stuff/index.html", "").title, is, "stuff");
  },

  "defaults to index.html for the root index"() {
    expect(new HtmlFile("/index.html", "").title, is, "index.html");
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

  "does not mess with https external links"() {
    const externalLink = `<a href="https://github.com/benchristel/mdsite/README.md">docs</a>`;
    expect(replaceMarkdownHrefs(externalLink), equals, externalLink);
  },

  "does not mess with http external links"() {
    const externalLink = `<a href="http://example.com/test.md">docs</a>`;
    expect(replaceMarkdownHrefs(externalLink), equals, externalLink);
  },

  "isn't fooled by a file named 'http'"() {
    const externalLink = `<a href="http.md">docs</a>`;
    expect(
      replaceMarkdownHrefs(externalLink),
      equals,
      `<a href="http.html">docs</a>`
    );
  },

  "isn't fooled by a directory named 'http:'"() {
    const externalLink = `<a href="./http://foo.md">docs</a>`;
    expect(
      replaceMarkdownHrefs(externalLink),
      equals,
      `<a href="./http://foo.html">docs</a>`
    );
  },
});
