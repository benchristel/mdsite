import { test, expect, is, equals } from "@benchristel/taste";
import { FileSet } from "../lib/files";
import { contains, removePrefix, removeSuffix } from "../lib/strings";
import { relative } from "path";

export function toc(files: FileSet, root: string = "/"): TreeOfContents {
  return Object.keys(files)
    .filter(
      (path) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map((path) =>
      path.endsWith("/index.html")
        ? {
            type: "branch",
            path,
            contents: toc(files, removeSuffix(path, "index.html")),
          }
        : { type: "leaf", path }
    );
}

export function htmlToc(files: FileSet, linkOrigin: string): string {
  const theToc = toc(files);
  if (theToc.length === 0) {
    return "";
  }

  return htmlForToc(files, theToc, linkOrigin);
}

function htmlForToc(
  files: FileSet,
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
        const linkTitle = title(files, node.path, relativePath);
        return `<li><a href="${relativePath}">${linkTitle}</a>${subToc}</li>`;
      })
      .join("") +
    "</ul>"
  );
}

function title(files: FileSet, path: string, _default: string) {
  return files[path]?.match(/<title>([^<]+)<\/title>/)?.[1] ?? _default;
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
    const files = { "/index.html": "hi" };
    const expected: Array<string> = [];
    expect(toc(files), equals, expected);
  },

  "excludes non-html files"() {
    const files = { "/foo.png": "" };
    const expected: Array<string> = [];
    expect(toc(files), equals, expected);
  },

  "given several files"() {
    const files = {
      "/foo.html": "yo",
      "/bar.html": "sup",
    };
    const expected = [
      { type: "leaf", path: "/foo.html" },
      { type: "leaf", path: "/bar.html" },
    ];
    expect(toc(files), equals, expected);
  },

  "given an index.html file in a subdirectory"() {
    const files = {
      "/sub/index.html": "hi",
    };
    const expected = [
      { type: "branch", path: "/sub/index.html", contents: [] },
    ];
    expect(toc(files), equals, expected);
  },

  "given a subdirectory with several files"() {
    const files = {
      "/sub/index.html": "hi",
      "/sub/foo.html": "yo",
      "/sub/bar.html": "sup",
    };
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
    const files = {
      "/sub/index.html": "",
      "/sub/marine/index.html": "",
      "/sub/marine/foo.html": "",
      "/sub/marine/bar.html": "",
    };
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
    const files = {
      "/foo.html": "<title>This Is Foo</title>",
    };

    const expected = `<ul><li><a href="foo.html">This Is Foo</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "generates a list of multiple links"() {
    const files = {
      "/foo.html": "<title>Foo</title>",
      "/bar.html": "<title>Bar</title>",
    };

    const expected = `<ul><li><a href="foo.html">Foo</a></li><li><a href="bar.html">Bar</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "defaults link titles to the path"() {
    const files = {
      "/foo.html": "no title here",
    };

    const expected = `<ul><li><a href="foo.html">foo.html</a></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },

  "creates relative links, starting from the linkOrigin"() {
    const files = {
      "/foo.html": "no title here",
    };

    const expected = `<ul><li><a href="../../../foo.html">../../../foo.html</a></li></ul>`;

    expect(htmlToc(files, "/one/two/three"), is, expected);
  },

  recurses() {
    const files = {
      "/bar/index.html": "<title>Bar</title>",
      "/bar/baz.html": "<title>Baz</title>",
    };

    const expected = `<ul><li><a href="bar/index.html">Bar</a><ul><li><a href="bar/baz.html">Baz</a></li></ul></li></ul>`;

    expect(htmlToc(files, "/"), is, expected);
  },
});
