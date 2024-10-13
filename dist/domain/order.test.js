import { test, expect, is, equals } from "@benchristel/taste";
import { HtmlFile } from "./files/html-file.js";
import { OrderFile } from "./files/order-file.js";
import { trimMargin } from "../testing/formatting.js";
import { isLatent, orderTxtRank, sortHtmlFiles, titleForOutputPath, } from "./order.js";
import { OutputPath } from "./output-path.js";
test("orderTxtRank", {
    "is [index, Infinity, <title>, <filename>] given /index.html"() {
        const files = {
            "/index.html": new HtmlFile("/index.html", "<h1>Hi</h1>"),
        };
        const rank = orderTxtRank(files["/index.html"], files);
        expect(rank, equals, ["index", Infinity, "Hi", "index.html"]);
    },
    "is [not-index, Infinity, <title>, <filename>] given a non-index file"() {
        const files = {
            "/foo.html": new HtmlFile("/foo.html", "<h1>Foo</h1>"),
        };
        const rank = orderTxtRank(files["/foo.html"], files);
        expect(rank, equals, ["not-index", Infinity, "Foo", "foo.html"]);
    },
    "defaults the title if the file contains none"() {
        const files = {
            "/foo.html": new HtmlFile("/foo.html", "no title here"),
        };
        const rank = orderTxtRank(files["/foo.html"], files);
        expect(rank, equals, ["not-index", Infinity, "foo.html", "foo.html"]);
    },
    "gives a file listed first in order.txt an index of 0"() {
        const files = {
            "/order.txt": OrderFile("/order.txt", "foo.html"),
            "/foo.html": new HtmlFile("/foo.html", "<h1>Foo</h1>"),
        };
        const rank = orderTxtRank(files["/foo.html"], files);
        expect(rank, equals, ["not-index", 0, "Foo", "foo.html"]);
    },
    "gives a file listed second in order.txt an index of 1"() {
        const files = {
            "/order.txt": OrderFile("/order.txt", "a.html\nfoo.html"),
            "/foo.html": new HtmlFile("/foo.html", "<h1>Foo</h1>"),
        };
        const rank = orderTxtRank(files["/foo.html"], files);
        expect(rank, equals, ["not-index", 1, "Foo", "foo.html"]);
    },
    "gives a file not listed in order.txt an index of Infinity"() {
        const files = {
            "/order.txt": OrderFile("/order.txt", ""),
            "/foo.html": new HtmlFile("/foo.html", "<h1>Foo</h1>"),
        };
        const rank = orderTxtRank(files["/foo.html"], files);
        expect(rank, equals, ["not-index", Infinity, "Foo", "foo.html"]);
    },
    "ranks files by parent directory first"() {
        const files = {
            "/a/foo.html": new HtmlFile("/a/foo.html", "<h1>Foo</h1>"),
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
test("isLatent", {
    "is true given a path not in the list"() {
        const path = "/foo.html";
        const files = [];
        expect(isLatent(path, files), is, true);
    },
    "is false given a path in the list"() {
        const path = "/foo.html";
        const files = ["/foo.html"];
        expect(isLatent(path, files), is, false);
    },
    "is false given an extant directory"() {
        const path = "/foo";
        const files = ["/foo/bar.md"];
        expect(isLatent(path, files), is, false);
    },
});
test("titleForOutputPath", {
    "returns the basename of the path string when the requested file does not exist"() {
        const files = {};
        expect(titleForOutputPath("/foo.html", files), is, "foo.html");
    },
    "returns the title of an HTML file with no <h1>"() {
        const files = {
            "/foo.html": new HtmlFile("/foo.html", ""),
        };
        expect(titleForOutputPath("/foo.html", files), is, "foo.html");
    },
    "returns the title of an HTML file with an <h1>"() {
        const files = {
            "/foo.html": new HtmlFile("/foo.html", "<h1>The Title</h1>"),
        };
        expect(titleForOutputPath("/foo.html", files), is, "The Title");
    },
    "returns the title of an index file given its directory"() {
        const files = {
            "/index.html": new HtmlFile("/index.html", "<h1>The Title</h1>"),
        };
        expect(titleForOutputPath("/", files), is, "The Title");
    },
});
test("sortHtmlFiles", {
    "gets the output path of one file"() {
        const files = {
            "": new HtmlFile("/foo.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [OutputPath.of("/foo.html")]);
    },
    "returns an empty array given no files"() {
        const files = {};
        expect(sortHtmlFiles(files), equals, []);
    },
    "returns a lone path"() {
        const files = {
            "/foo/bar.new html": new HtmlFile("/foo/bar.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [OutputPath.of("/foo/bar.html")]);
    },
    "orders files by filename in the absence of titles or order.txt files"() {
        const files = {
            "/ddd.html": new HtmlFile("/ddd.html", ""),
            "/aaa.html": new HtmlFile("/aaa.html", ""),
            "/ccc.html": new HtmlFile("/ccc.html", ""),
            "/bbb.html": new HtmlFile("/bbb.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/aaa.html"),
            OutputPath.of("/bbb.html"),
            OutputPath.of("/ccc.html"),
            OutputPath.of("/ddd.html"),
        ]);
    },
    "keeps siblings together"() {
        const files = {
            "/aaa/index.html": new HtmlFile("/aaa/index.html", "<h1>A</h1>"),
            "/aaa/zzz.html": new HtmlFile("/aaa/zzz.html", "<h1>Z</h1>"),
            "/bbb.html": new HtmlFile("/bbb.html", "<h1>B</h1>"),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/aaa/index.html"),
            OutputPath.of("/aaa/zzz.html"),
            OutputPath.of("/bbb.html"),
        ]);
    },
    "orders files by title in the absence of order.txt files"() {
        const files = {
            "/three.html": new HtmlFile("/three.html", "<h1>3</h1>"),
            "/one.html": new HtmlFile("/one.html", "<h1>1</h1>"),
            "/four.html": new HtmlFile("/four.html", "<h1>4</h1>"),
            "/two.html": new HtmlFile("/two.html", "<h1>2</h1>"),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/one.html"),
            OutputPath.of("/two.html"),
            OutputPath.of("/three.html"),
            OutputPath.of("/four.html"),
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
            "/three.html": new HtmlFile("/three.html", ""),
            "/one.html": new HtmlFile("/one.html", ""),
            "/four.html": new HtmlFile("/four.html", ""),
            "/two.html": new HtmlFile("/two.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/one.html"),
            OutputPath.of("/two.html"),
            OutputPath.of("/three.html"),
            OutputPath.of("/four.html"),
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
            "/bbb/three.html": new HtmlFile("/bbb/three.html", ""),
            "/bbb/one.html": new HtmlFile("/bbb/one.html", ""),
            "/bbb/four.html": new HtmlFile("/bbb/four.html", ""),
            "/bbb/two.html": new HtmlFile("/bbb/two.html", ""),
            "/aaa/three.html": new HtmlFile("/aaa/three.html", ""),
            "/aaa/one.html": new HtmlFile("/aaa/one.html", ""),
            "/aaa/four.html": new HtmlFile("/aaa/four.html", ""),
            "/aaa/two.html": new HtmlFile("/aaa/two.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/aaa/one.html"),
            OutputPath.of("/aaa/two.html"),
            OutputPath.of("/aaa/three.html"),
            OutputPath.of("/aaa/four.html"),
            OutputPath.of("/bbb/one.html"),
            OutputPath.of("/bbb/two.html"),
            OutputPath.of("/bbb/three.html"),
            OutputPath.of("/bbb/four.html"),
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
            "/bbb/one.html": new HtmlFile("/bbb/one.html", ""),
            "/aaa/one.html": new HtmlFile("/aaa/one.html", ""),
            "/bbb/index.html": new HtmlFile("/bbb/index.html", ""),
            "/aaa/index.html": new HtmlFile("/aaa/index.html", ""),
            "/index.html": new HtmlFile("/index.html", ""),
        };
        expect(sortHtmlFiles(files), equals, [
            OutputPath.of("/index.html"),
            OutputPath.of("/aaa/index.html"),
            OutputPath.of("/aaa/one.html"),
            OutputPath.of("/bbb/index.html"),
            OutputPath.of("/bbb/one.html"),
        ]);
    },
});
