import { test, expect, is, equals } from "@benchristel/taste";
import { HtmlFile } from "./html-file.js";
import { OrderFile } from "./order-file.js";
import { trimMargin } from "../testing/formatting.js";
import { basename, dirname, join } from "path";
import { commonPrefix } from "../lib/strings.js";
import { ensureTrailingSlash } from "../lib/paths.js";
export function sortHtmlFiles(files) {
    return Object.values(files)
        .filter((f) => f.type === "html")
        .map((f) => [f, orderTxtRank(f, files)])
        .sort(([_, rankA], [__, rankB]) => byRank(rankA, rankB))
        .map(([f]) => f.outputPath);
}
function orderTxtRank(f, files) {
    let d = f.outputPath;
    let rank = [];
    do {
        let filename = basename(d);
        d = dirname(d);
        // index.html files should come before any of their siblings,
        // so we "promote" them to the top.
        const indexPromotion = filename === "index.html" ? "index" : "not-index";
        rank = [
            indexPromotion,
            orderFileIndex(d, filename, files),
            titleForOutputPath(join(d, filename), files),
            filename,
            ...rank,
        ];
    } while (d !== "/");
    return rank;
}
function orderFileIndex(dir, filename, files) {
    const orderFile = files[join(dir, "order.txt")];
    const orderFileIndex = (orderFile === null || orderFile === void 0 ? void 0 : orderFile.type) === "order"
        ? orderFile.filenames.indexOf(filename)
        : Infinity;
    return orderFileIndex < 0 ? Infinity : orderFileIndex;
}
function byRank(rankA, rankB) {
    for (let i = 0; i < rankA.length && i < rankB.length; i++) {
        if (rankA[i] < rankB[i])
            return -1;
        if (rankA[i] > rankB[i])
            return 1;
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
function byOrderTxtRank(files) {
    return (a, b) => {
        var _a, _b;
        const prefix = ensureTrailingSlash(commonPrefix(a.outputPath, b.outputPath).replace(/\/[^\/]*$/, ""));
        const orderFile = files[join(prefix, "order.txt")];
        const aName = a.outputPath.slice(prefix.length).split("/")[0];
        const bName = b.outputPath.slice(prefix.length).split("/")[0];
        if (aName === "index.html")
            return -1;
        if (bName === "index.html")
            return 1;
        if ((orderFile === null || orderFile === void 0 ? void 0 : orderFile.type) === "order") {
            const aIndex = orderFile.filenames.indexOf(aName);
            const bIndex = orderFile.filenames.indexOf(bName);
            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex > bIndex ? 1 : -1;
            }
            else if (bIndex !== -1) {
                return 1;
            }
            else if (aIndex !== -1) {
                return -1;
            }
        }
        const aTitle = (_a = titleForOutputPath(join(prefix, aName), files)) !== null && _a !== void 0 ? _a : "";
        const bTitle = (_b = titleForOutputPath(join(prefix, bName), files)) !== null && _b !== void 0 ? _b : "";
        if (aTitle > bTitle) {
            return 1;
        }
        else if (aTitle < bTitle) {
            return -1;
        }
        return 0;
    };
}
function titleForOutputPath(path, files) {
    var _a;
    const file = (_a = files[path]) !== null && _a !== void 0 ? _a : files[join(path, "index.html")];
    switch (file === null || file === void 0 ? void 0 : file.type) {
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
            "/order.txt": OrderFile("/order.txt", trimMargin `
        one.html
        two.html
        three.html
        four.html
      `),
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
            "/order.txt": OrderFile("/order.txt", trimMargin `
        aaa
        bbb
      `),
            "/bbb/order.txt": OrderFile("/bbb/order.txt", trimMargin `
        one.html
        two.html
        three.html
        four.html
      `),
            "/aaa/order.txt": OrderFile("/aaa/order.txt", trimMargin `
        one.html
        two.html
        three.html
        four.html
      `),
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
            "/order.txt": OrderFile("/order.txt", trimMargin `
          aaa
          bbb
        `),
            "/bbb/order.txt": OrderFile("/bbb/order.txt", trimMargin `
          one.html
          index.html
        `),
            "/aaa/order.txt": OrderFile("/aaa/order.txt", trimMargin `
          one.html
          index.html
        `),
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
