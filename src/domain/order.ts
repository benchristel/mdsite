import { test, expect, equals } from "@benchristel/taste";
import { ProjectFileSet } from "./project-file-set.js";
import { HtmlFile } from "./html-file.js";
import { Comparator } from "../lib/sorting.js";
import { OrderFile } from "./order-file.js";
import { trimMargin } from "../testing/formatting.js";
import { join } from "path";
import { commonPrefix } from "../lib/strings.js";
import { ensureTrailingSlash } from "../lib/paths.js";

export function sortHtmlFiles(files: ProjectFileSet): Array<string> {
  return Object.values(files)
    .filter((f): f is HtmlFile => f.type === "html")
    .sort(byOrderTxtRank(files))
    .map((f) => f.outputPath);
}

function byOrderTxtRank(files: ProjectFileSet): Comparator<HtmlFile> {
  return (a: HtmlFile, b: HtmlFile): 1 | 0 | -1 => {
    const prefix = ensureTrailingSlash(
      commonPrefix(a.outputPath, b.outputPath).replace(/\/[^\/]*$/, "")
    );
    const orderFile = files[join(prefix, "order.txt")];
    if (orderFile?.type === "order") {
      const aName = a.outputPath.slice(prefix.length).split("/")[0];
      const bName = b.outputPath.slice(prefix.length).split("/")[0];
      if (aName === "index.html") return -1;
      if (bName === "index.html") return 1;

      const aIndex = orderFile.filenames.indexOf(aName);
      const bIndex = orderFile.filenames.indexOf(bName);
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex > bIndex ? 1 : -1;
      } else if (bIndex !== -1) {
        return 1;
      } else if (aIndex !== -1) {
        return -1;
      }
    }

    if (a.title > b.title) {
      return 1;
    } else if (a.title < b.title) {
      return -1;
    }

    return 0;
  };
}

test("sortHtmlFiles", {
  "gets the output path of one file"() {
    const files = {
      "": HtmlFile("/foo.html", ""),
    };
    expect(sortHtmlFiles(files), equals, ["/foo.html"]);
  },
});

test("sortProjectFiles", {
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
