import { test, expect, is, equals } from "@benchristel/taste";
import { ProjectFileSet } from "./project-file-set.js";
import { HtmlFile } from "./html-file.js";
import { OrderFile } from "./order-file.js";
import { trimMargin } from "../testing/formatting.js";
import { basename, dirname, join } from "path";

type Rank = Array<string | number>;

export function sortHtmlFiles(files: ProjectFileSet): Array<string> {
  return Object.values(files)
    .filter((f): f is HtmlFile => f.type === "html")
    .map((f) => [f, orderTxtRank(f, files)] as const)
    .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
    .map(([f]) => f.outputPath);
}

function orderTxtRank(f: HtmlFile, files: ProjectFileSet): Rank {
  let d = f.outputPath;

  const rank: Rank = [];
  do {
    let filename = basename(d);
    d = dirname(d);

    rank.unshift(
      // index.html files should come before any of their siblings,
      // so we "promote" them to the top.
      indexPromotion(filename),
      orderFileIndex(d, filename, files),
      titleForOutputPath(join(d, filename), files),
      filename
    );
  } while (d !== "/");

  return rank;
}

function indexPromotion(filename: string): "index" | "not-index" {
  return filename === "index.html" ? "index" : "not-index";
}

function orderFileIndex(dir: string, filename: string, files: ProjectFileSet) {
  const orderFile = files[join(dir, "order.txt")];
  const orderFileIndex =
    orderFile?.type === "order"
      ? orderFile.filenames.indexOf(filename)
      : Infinity;

  return orderFileIndex < 0 ? Infinity : orderFileIndex;
}

function byRank(rankA: Rank, rankB: Rank): -1 | 0 | 1 {
  for (let i = 0; i < rankA.length && i < rankB.length; i++) {
    if (rankA[i] < rankB[i]) return -1;
    if (rankA[i] > rankB[i]) return 1;
  }
  return 0;
}

test("orderTxtRank", {
  "is [index, Infinity, <title>, <filename>] given /index.html"() {
    const files = {
      "/index.html": HtmlFile("/index.html", "<h1>Hi</h1>"),
    };

    const rank = orderTxtRank(files["/index.html"], files);

    expect(rank, equals, ["index", Infinity, "Hi", "index.html"]);
  },

  "is [not-index, Infinity, <title>, <filename>] given a non-index file"() {
    const files = {
      "/foo.html": HtmlFile("/foo.html", "<h1>Foo</h1>"),
    };

    const rank = orderTxtRank(files["/foo.html"], files);

    expect(rank, equals, ["not-index", Infinity, "Foo", "foo.html"]);
  },

  "defaults the title if the file contains none"() {
    const files = {
      "/foo.html": HtmlFile("/foo.html", "no title here"),
    };

    const rank = orderTxtRank(files["/foo.html"], files);

    expect(rank, equals, ["not-index", Infinity, "foo.html", "foo.html"]);
  },

  "gives a file listed first in order.txt an index of 0"() {
    const files = {
      "/order.txt": OrderFile("/order.txt", "foo.html"),
      "/foo.html": HtmlFile("/foo.html", "<h1>Foo</h1>"),
    };

    const rank = orderTxtRank(files["/foo.html"], files);

    expect(rank, equals, ["not-index", 0, "Foo", "foo.html"]);
  },

  "gives a file listed second in order.txt an index of 1"() {
    const files = {
      "/order.txt": OrderFile("/order.txt", "a.html\nfoo.html"),
      "/foo.html": HtmlFile("/foo.html", "<h1>Foo</h1>"),
    };

    const rank = orderTxtRank(files["/foo.html"], files);

    expect(rank, equals, ["not-index", 1, "Foo", "foo.html"]);
  },

  "gives a file not listed in order.txt an index of Infinity"() {
    const files = {
      "/order.txt": OrderFile("/order.txt", ""),
      "/foo.html": HtmlFile("/foo.html", "<h1>Foo</h1>"),
    };

    const rank = orderTxtRank(files["/foo.html"], files);

    expect(rank, equals, ["not-index", Infinity, "Foo", "foo.html"]);
  },

  "ranks files by parent directory first"() {
    const files = {
      "/a/foo.html": HtmlFile("/a/foo.html", "<h1>Foo</h1>"),
    };

    const rank = orderTxtRank(files["/a/foo.html"], files);

    expect(rank, equals, [
      "not-index",
      Infinity,
      "a",
      "a",
      "not-index",
      Infinity,
      "Foo",
      "foo.html",
    ]);
  },
});

function titleForOutputPath(path: string, files: ProjectFileSet): string {
  const file = files[path] ?? files[join(path, "index.html")];
  switch (file?.type) {
    case "html":
      return file.title;
    default:
      return basename(path);
  }
}

test("titleForOutputPath", {
  "returns the basename of the path string when the requested file does not exist"() {
    const files = {};
    expect(titleForOutputPath("/foo.html", files), is, "foo.html");
  },

  "returns the title of an HTML file with no <h1>"() {
    const files = {
      "/foo.html": HtmlFile("/foo.html", ""),
    };
    expect(titleForOutputPath("/foo.html", files), is, "foo.html");
  },

  "returns the title of an HTML file with an <h1>"() {
    const files = {
      "/foo.html": HtmlFile("/foo.html", "<h1>The Title</h1>"),
    };
    expect(titleForOutputPath("/foo.html", files), is, "The Title");
  },

  "returns the title of an index file given its directory"() {
    const files = {
      "/index.html": HtmlFile("/index.html", "<h1>The Title</h1>"),
    };
    expect(titleForOutputPath("/", files), is, "The Title");
  },
});

test("sortHtmlFiles", {
  "gets the output path of one file"() {
    const files = {
      "": HtmlFile("/foo.html", ""),
    };
    expect(sortHtmlFiles(files), equals, ["/foo.html"]);
  },

  "returns an empty array given no files"() {
    const files = {};
    expect(sortHtmlFiles(files), equals, []);
  },

  "returns a lone path"() {
    const files = {
      "/foo/bar.html": HtmlFile("/foo/bar.html", ""),
    };
    expect(sortHtmlFiles(files), equals, ["/foo/bar.html"]);
  },

  "orders files by filename in the absence of titles or order.txt files"() {
    const files = {
      "/ddd.html": HtmlFile("/ddd.html", ""),
      "/aaa.html": HtmlFile("/aaa.html", ""),
      "/ccc.html": HtmlFile("/ccc.html", ""),
      "/bbb.html": HtmlFile("/bbb.html", ""),
    };
    expect(sortHtmlFiles(files), equals, [
      "/aaa.html",
      "/bbb.html",
      "/ccc.html",
      "/ddd.html",
    ]);
  },

  "keeps siblings together"() {
    const files = {
      "/aaa/index.html": HtmlFile("/aaa/index.html", "<h1>A</h1>"),
      "/aaa/zzz.html": HtmlFile("/aaa/zzz.html", "<h1>Z</h1>"),
      "/bbb.html": HtmlFile("/bbb.html", "<h1>B</h1>"),
    };
    expect(sortHtmlFiles(files), equals, [
      "/aaa/index.html",
      "/aaa/zzz.html",
      "/bbb.html",
    ]);
  },

  "orders files by title in the absence of order.txt files"() {
    const files = {
      "/three.html": HtmlFile("/three.html", "<h1>3</h1>"),
      "/one.html": HtmlFile("/one.html", "<h1>1</h1>"),
      "/four.html": HtmlFile("/four.html", "<h1>4</h1>"),
      "/two.html": HtmlFile("/two.html", "<h1>2</h1>"),
    };
    expect(sortHtmlFiles(files), equals, [
      "/one.html",
      "/two.html",
      "/three.html",
      "/four.html",
    ]);
  },

  "obeys order.txt"() {
    const files = {
      "/order.txt": OrderFile(
        "/order.txt",
        trimMargin`
        one.html
        two.html
        three.html
        four.html
      `
      ),
      "/three.html": HtmlFile("/three.html", ""),
      "/one.html": HtmlFile("/one.html", ""),
      "/four.html": HtmlFile("/four.html", ""),
      "/two.html": HtmlFile("/two.html", ""),
    };
    expect(sortHtmlFiles(files), equals, [
      "/one.html",
      "/two.html",
      "/three.html",
      "/four.html",
    ]);
  },

  "obeys order.txt in different directories"() {
    const files = {
      "/order.txt": OrderFile(
        "/order.txt",
        trimMargin`
        aaa
        bbb
      `
      ),
      "/bbb/order.txt": OrderFile(
        "/bbb/order.txt",
        trimMargin`
        one.html
        two.html
        three.html
        four.html
      `
      ),
      "/aaa/order.txt": OrderFile(
        "/aaa/order.txt",
        trimMargin`
        one.html
        two.html
        three.html
        four.html
      `
      ),
      "/bbb/three.html": HtmlFile("/bbb/three.html", ""),
      "/bbb/one.html": HtmlFile("/bbb/one.html", ""),
      "/bbb/four.html": HtmlFile("/bbb/four.html", ""),
      "/bbb/two.html": HtmlFile("/bbb/two.html", ""),
      "/aaa/three.html": HtmlFile("/aaa/three.html", ""),
      "/aaa/one.html": HtmlFile("/aaa/one.html", ""),
      "/aaa/four.html": HtmlFile("/aaa/four.html", ""),
      "/aaa/two.html": HtmlFile("/aaa/two.html", ""),
    };
    expect(sortHtmlFiles(files), equals, [
      "/aaa/one.html",
      "/aaa/two.html",
      "/aaa/three.html",
      "/aaa/four.html",
      "/bbb/one.html",
      "/bbb/two.html",
      "/bbb/three.html",
      "/bbb/four.html",
    ]);
  },

  "puts index.html first no matter what"() {
    const files = {
      "/order.txt": OrderFile(
        "/order.txt",
        trimMargin`
          aaa
          bbb
        `
      ),
      "/bbb/order.txt": OrderFile(
        "/bbb/order.txt",
        trimMargin`
          one.html
          index.html
        `
      ),
      "/aaa/order.txt": OrderFile(
        "/aaa/order.txt",
        trimMargin`
          one.html
          index.html
        `
      ),
      "/bbb/one.html": HtmlFile("/bbb/one.html", ""),
      "/aaa/one.html": HtmlFile("/aaa/one.html", ""),
      "/bbb/index.html": HtmlFile("/bbb/index.html", ""),
      "/aaa/index.html": HtmlFile("/aaa/index.html", ""),
      "/index.html": HtmlFile("/index.html", ""),
    };
    expect(sortHtmlFiles(files), equals, [
      "/index.html",
      "/aaa/index.html",
      "/aaa/one.html",
      "/bbb/index.html",
      "/bbb/one.html",
    ]);
  },
});
