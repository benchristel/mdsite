export { htmlToc } from "./toc.impl";
import { test, expect, is, equals } from "@benchristel/taste";
import { buffer } from "../lib/files";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { toc, htmlToc, leaf, branch } from "./toc.impl";

{
  // htmlToc() generates an HTML "tree of contents" with <ul> and <li>
  // elements, and links.
  htmlToc satisfies (
    // files: the set of files in the project
    files: ProjectFileSet,
    // linkOrigin: a directory path. Paths in link hrefs will be relative to
    // linkOrigin. Links are always generated with relative paths, so sites
    // can be deployed to a subdirectory of a domain.
    linkOrigin: string,
    // root: a directory, which defaults to linkOrigin. The generated tree of
    // contents will include only files under the given root.
    root: string | undefined
  ) => string;
}

test("toc", {
  "given an empty set of files"() {
    expect(toc({}), equals, []);
  },

  "excludes the root index.html file"() {
    const files = parseProjectFiles({ "/index.html": buffer("hi") });
    expect(toc(files), equals, []);
  },

  "excludes the index.html under the given root"() {
    const files = parseProjectFiles({ "/foo/index.html": buffer("hi") });
    expect(toc(files, "/foo"), equals, []);
  },

  "excludes non-html files"() {
    const files = parseProjectFiles({ "/foo.png": buffer("") });
    expect(toc(files), equals, []);
  },

  "given several files"() {
    const files = parseProjectFiles({
      "/aaa.html": buffer(""),
      "/bbb.html": buffer(""),
    });
    const expected = [
      leaf({ path: "/aaa.html", title: "aaa.html" }),
      leaf({ path: "/bbb.html", title: "bbb.html" }),
    ];
    expect(toc(files), equals, expected);
  },

  "given an index.html file in a subdirectory"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
    });
    const expected = [branch({ path: "/sub/index.html", title: "index.html" })];
    expect(toc(files), equals, expected);
  },

  "given a subdirectory with several files"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
      "/sub/aaa.html": buffer(""),
      "/sub/bbb.html": buffer(""),
    });
    const expected = [
      branch(
        { path: "/sub/index.html", title: "index.html" },
        leaf({ path: "/sub/aaa.html", title: "aaa.html" }),
        leaf({ path: "/sub/bbb.html", title: "bbb.html" })
      ),
    ];
    expect(toc(files), equals, expected);
  },

  "given a sub-subdirectory"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
      "/sub/marine/index.html": buffer(""),
      "/sub/marine/aaa.html": buffer(""),
      "/sub/marine/bbb.html": buffer(""),
      "/sub/marine/ccc.html": buffer(""),
    });
    const expected = [
      branch(
        { path: "/sub/index.html", title: "index.html" },
        branch(
          { path: "/sub/marine/index.html", title: "index.html" },
          leaf({ path: "/sub/marine/aaa.html", title: "aaa.html" }),
          leaf({ path: "/sub/marine/bbb.html", title: "bbb.html" }),
          leaf({ path: "/sub/marine/ccc.html", title: "ccc.html" })
        )
      ),
    ];
    expect(toc(files), equals, expected);
  },

  "sorts sibling leaves by title"() {
    const files = parseProjectFiles({
      "/aaa.html": buffer("<h1>3</h1>"),
      "/bbb.html": buffer("<h1>1</h1>"),
      "/ccc.html": buffer("<h1>4</h1>"),
      "/ddd.html": buffer("<h1>2</h1>"),
    });
    const expected = [
      leaf({ path: "/bbb.html", title: "1" }),
      leaf({ path: "/ddd.html", title: "2" }),
      leaf({ path: "/aaa.html", title: "3" }),
      leaf({ path: "/ccc.html", title: "4" }),
    ];
    expect(toc(files), equals, expected);
  },

  "sorts sibling branches by index.html title"() {
    const files = parseProjectFiles({
      "/bbb/foo.html": buffer(""),
      "/ddd/foo.html": buffer(""),
      "/aaa/foo.html": buffer(""),
      "/ccc/foo.html": buffer(""),
    });
    const expected = [
      branch(
        { path: "/aaa/index.html", title: "Index of aaa" },
        leaf({ path: "/aaa/foo.html", title: "foo.html" })
      ),
      branch(
        { path: "/bbb/index.html", title: "Index of bbb" },
        leaf({ path: "/bbb/foo.html", title: "foo.html" })
      ),
      branch(
        { path: "/ccc/index.html", title: "Index of ccc" },
        leaf({ path: "/ccc/foo.html", title: "foo.html" })
      ),
      branch(
        { path: "/ddd/index.html", title: "Index of ddd" },
        leaf({ path: "/ddd/foo.html", title: "foo.html" })
      ),
    ];
    expect(toc(files), equals, expected);
  },
});

test("htmlToc", {
  "given an empty set of files"() {
    expect(htmlToc({}, "/"), is, "");
  },

  "given a tree with one file"() {
    const files = parseProjectFiles({
      "/foo.html": buffer("<h1>This Is Foo</h1>"),
    });

    const expected = `<ul><li><a href="foo.html">This Is Foo</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "generates a list of multiple links"() {
    const files = parseProjectFiles({
      "/foo.html": buffer("<h1>Foo</h1>"),
      "/bar.html": buffer("<h1>Bar</h1>"),
    });

    const expected = `<ul><li><a href="bar.html">Bar</a></li><li><a href="foo.html">Foo</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "defaults link titles to the path"() {
    const files = parseProjectFiles({
      "/foo.html": buffer("no title here"),
    });

    const expected = `<ul><li><a href="foo.html">foo.html</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "creates relative links, starting from the linkOrigin"() {
    const files = parseProjectFiles({
      "/foo.html": buffer("<h1>Foo</h1>"),
    });

    const expected = `<ul><li><a href="../../../foo.html">Foo</a></li></ul>`;

    expect(htmlToc(files, "/one/two/three", "/"), is, expected);
  },

  recurses() {
    const files = parseProjectFiles({
      "/bar/index.html": buffer("<h1>Bar</h1>"),
      "/bar/baz.html": buffer("<h1>Baz</h1>"),
    });

    const expected = `<ul><li><a href="bar/index.html">Bar</a><ul><li><a href="bar/baz.html">Baz</a></li></ul></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },
});
