export { htmlToc } from "./toc.impl";
import { test, expect, is, equals } from "@benchristel/taste";
import { buffer } from "../lib/files";
import { ProjectFileSet, parseProjectFiles } from "./project-file-set";
import { toc, htmlToc } from "./toc.impl";

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
    const expected: Array<string> = [];
    expect(toc(files), equals, expected);
  },

  "excludes the index.html under the given root"() {
    const files = parseProjectFiles({ "/foo/index.html": buffer("hi") });
    const expected: Array<string> = [];
    expect(toc(files, "/foo"), equals, expected);
  },

  "excludes non-html files"() {
    const files = parseProjectFiles({ "/foo.png": buffer("") });
    const expected: Array<string> = [];
    expect(toc(files), equals, expected);
  },

  "given several files"() {
    const files = parseProjectFiles({
      "/foo.html": buffer(""),
      "/bar.html": buffer(""),
    });
    const expected = [
      { type: "leaf", path: "/foo.html" },
      { type: "leaf", path: "/bar.html" },
    ];
    expect(toc(files), equals, expected);
  },

  "given an index.html file in a subdirectory"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
    });
    const expected = [
      { type: "branch", path: "/sub/index.html", contents: [] },
    ];
    expect(toc(files), equals, expected);
  },

  "given a subdirectory with several files"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
      "/sub/foo.html": buffer(""),
      "/sub/bar.html": buffer(""),
    });
    const expected = [
      {
        type: "branch",
        path: "/sub/index.html",
        contents: [
          { type: "leaf", path: "/sub/foo.html" },
          { type: "leaf", path: "/sub/bar.html" },
        ],
      },
    ];
    expect(toc(files), equals, expected);
  },

  "given a sub-subdirectory"() {
    const files = parseProjectFiles({
      "/sub/index.html": buffer(""),
      "/sub/marine/index.html": buffer(""),
      "/sub/marine/foo.html": buffer(""),
      "/sub/marine/bar.html": buffer(""),
    });
    const expected = [
      {
        type: "branch",
        path: "/sub/index.html",
        contents: [
          {
            type: "branch",
            path: "/sub/marine/index.html",
            contents: [
              { type: "leaf", path: "/sub/marine/foo.html" },
              { type: "leaf", path: "/sub/marine/bar.html" },
            ],
          },
        ],
      },
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

    const expected = `<ul><li><a href="foo.html">Foo</a></li><li><a href="bar.html">Bar</a></li></ul>`;

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
