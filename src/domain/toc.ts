import { test, expect, equals } from "@benchristel/taste";
import { FileSet } from "../lib/files";
import { contains, removePrefix, removeSuffix } from "../lib/strings";

export function toc(files: FileSet, root: string = "/"): TreeOfContents {
  return Object.keys(files)
    .filter(
      (path) =>
        path.startsWith(root) &&
        path.endsWith(".html") &&
        path !== root + "index.html" &&
        !contains("/", removeSuffix(removePrefix(path, root), "/index.html"))
    )
    .map((path) => {
      if (path.endsWith("/index.html")) {
        return {
          type: "branch",
          path,
          contents: toc(files, path.replace(/index\.html$/, "")),
        };
      }
      return { type: "leaf", path };
    });
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
