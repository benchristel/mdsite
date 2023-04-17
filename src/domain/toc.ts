import { test, expect, is, equals, debug } from "@benchristel/taste";
import { buffer } from "../lib/files";
import { contains, removePrefix, removeSuffix } from "../lib/strings";
import { relative } from "path";
import {
  HtmlFile,
  ProjectFileSet,
  TransformedFile,
  parseProjectFiles,
} from "./project-file-set";

export function toc(files: ProjectFileSet, root: string = "/"): TreeOfContents {
  return Object.values(files)
    .flatMap(
      (file): Array<TransformedFile | HtmlFile> =>
        file.fate !== "preserve" ? [file] : []
    )
    .filter(
      ({ htmlPath: path }) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map(({ htmlPath: path }) =>
      path.endsWith("/index.html")
        ? {
            type: "branch",
            path,
            contents: toc(files, removeSuffix(path, "index.html")),
          }
        : { type: "leaf", path }
    );
}

export function htmlToc(files: ProjectFileSet, linkOrigin: string): string {
  const theToc = toc(files);
  if (theToc.length === 0) {
    return "";
  }

  return htmlForToc(files, theToc, linkOrigin);
}

function htmlForToc(
  files: ProjectFileSet,
  toc: TreeOfContents,
  linkOrigin: string
): string {
  return (
    "<ul>" +
    toc
      .map((node) => {
        const subToc =
          node.type === "leaf"
            ? ""
            : htmlForToc(files, node.contents, linkOrigin);
        const relativePath = relative(linkOrigin, node.path);
        const file = files[node.path];
        const linkTitle =
          (file.fate !== "preserve" && file.title) || relativePath;
        return `<li><a href="${relativePath}">${linkTitle}</a>${subToc}</li>`;
      })
      .join("") +
    "</ul>"
  );
}

export type TreeOfContents = Array<Node>;

export type Node = Branch | Leaf;

export type Branch = { type: "branch"; path: string; contents: TreeOfContents };

export type Leaf = { type: "leaf"; path: string };

test("toc", {
  "given an empty set of files"() {
    expect(toc({}), equals, []);
  },

  "excludes the root index.html file"() {
    const files = parseProjectFiles({ "/index.html": buffer("hi") });
    const expected: Array<string> = [];
    expect(toc(files), equals, expected);
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

    expect(htmlToc(files, "/one/two/three"), is, expected);
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
