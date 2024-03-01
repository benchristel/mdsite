import { test, expect, is, equals } from "@benchristel/taste";
import { toc, htmlToc, leaf, branch } from "./toc.js";
test("toc", {
    "given an empty set of files"() {
        expect(toc([]), equals, []);
    },
    "excludes the root index.html file"() {
        const files = [{ type: "html", path: "/index.html", title: "whatever" }];
        expect(toc(files), equals, []);
    },
    "excludes the index.html under the given root"() {
        const files = [{ type: "html", path: "/foo/index.html", title: "whatever" }];
        expect(toc(files, "/foo"), equals, []);
    },
    "given several files"() {
        const files = [
            { type: "html", path: "/aaa.html", title: "aaa.html" },
            { type: "html", path: "/bbb.html", title: "bbb.html" },
        ];
        const expected = [
            leaf({ path: "/aaa.html", title: "aaa.html" }),
            leaf({ path: "/bbb.html", title: "bbb.html" }),
        ];
        expect(toc(files), equals, expected);
    },
    "given an index.html file in a subdirectory"() {
        const files = [{ type: "html", path: "/sub/index.html", title: "sub" }];
        const expected = [branch({ path: "/sub/index.html", title: "sub" })];
        expect(toc(files), equals, expected);
    },
    "given a subdirectory with several files"() {
        const files = [
            { type: "html", path: "/sub/index.html", title: "sub" },
            { type: "html", path: "/sub/aaa.html", title: "aaa.html" },
            { type: "html", path: "/sub/bbb.html", title: "bbb.html" },
        ];
        const expected = [
            branch({ path: "/sub/index.html", title: "sub" }, leaf({ path: "/sub/aaa.html", title: "aaa.html" }), leaf({ path: "/sub/bbb.html", title: "bbb.html" })),
        ];
        expect(toc(files), equals, expected);
    },
    "given a sub-subdirectory"() {
        const files = [
            { type: "html", path: "/sub/index.html", title: "sub" },
            { type: "html", path: "/sub/marine/index.html", title: "marine" },
            { type: "html", path: "/sub/marine/aaa.html", title: "aaa.html" },
            { type: "html", path: "/sub/marine/bbb.html", title: "bbb.html" },
            { type: "html", path: "/sub/marine/ccc.html", title: "ccc.html" },
        ];
        const expected = [
            branch({ path: "/sub/index.html", title: "sub" }, branch({ path: "/sub/marine/index.html", title: "marine" }, leaf({ path: "/sub/marine/aaa.html", title: "aaa.html" }), leaf({ path: "/sub/marine/bbb.html", title: "bbb.html" }), leaf({ path: "/sub/marine/ccc.html", title: "ccc.html" }))),
        ];
        expect(toc(files), equals, expected);
    },
    "keeps files in order"() {
        const files = [
            { type: "html", path: "/bbb.html", title: "1" },
            { type: "html", path: "/ddd.html", title: "2" },
            { type: "html", path: "/aaa.html", title: "3" },
            { type: "html", path: "/ccc.html", title: "4" },
        ];
        const expected = [
            leaf({ path: "/bbb.html", title: "1" }),
            leaf({ path: "/ddd.html", title: "2" }),
            leaf({ path: "/aaa.html", title: "3" }),
            leaf({ path: "/ccc.html", title: "4" }),
        ];
        expect(toc(files), equals, expected);
    },
    "keeps directories in order"() {
        const files = [
            { type: "html", path: "/index.html", title: "Homepage" },
            { type: "html", path: "/aaa/index.html", title: "aaa" },
            { type: "html", path: "/aaa/foo.html", title: "foo.html" },
            { type: "html", path: "/bbb/index.html", title: "bbb" },
            { type: "html", path: "/bbb/foo.html", title: "foo.html" },
            { type: "html", path: "/ccc/index.html", title: "ccc" },
            { type: "html", path: "/ccc/foo.html", title: "foo.html" },
            { type: "html", path: "/ddd/index.html", title: "ddd" },
            { type: "html", path: "/ddd/foo.html", title: "foo.html" },
        ];
        const expected = [
            branch({ path: "/aaa/index.html", title: "aaa" }, leaf({ path: "/aaa/foo.html", title: "foo.html" })),
            branch({ path: "/bbb/index.html", title: "bbb" }, leaf({ path: "/bbb/foo.html", title: "foo.html" })),
            branch({ path: "/ccc/index.html", title: "ccc" }, leaf({ path: "/ccc/foo.html", title: "foo.html" })),
            branch({ path: "/ddd/index.html", title: "ddd" }, leaf({ path: "/ddd/foo.html", title: "foo.html" })),
        ];
        expect(toc(files), equals, expected);
    },
});
test("htmlToc", {
    "given an empty set of files"() {
        expect(htmlToc([], "/index.html"), is, "");
    },
    "given a tree with one file"() {
        const files = [{ type: "html", path: "/foo.html", title: "This Is Foo" }];
        const expected = `<ul><li><a href="foo.html">This Is Foo</a></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
    "generates a list of multiple links"() {
        const files = [
            { type: "html", path: "/bar.html", title: "Bar" },
            { type: "html", path: "/foo.html", title: "Foo" },
        ];
        const expected = `<ul><li><a href="bar.html">Bar</a></li><li><a href="foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
    "creates relative links, starting from the linkOrigin"() {
        const files = [{ type: "html", path: "/foo.html", title: "Foo" }];
        const expected = `<ul><li><a href="../../../foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, "/one/two/three/foo.html", "/"), is, expected);
    },
    recurses() {
        const files = [
            { type: "html", path: "/bar/index.html", title: "Bar" },
            { type: "html", path: "/bar/baz.html", title: "Baz" },
        ];
        const expected = `<ul><li><a href="bar/index.html">Bar</a><ul><li><a href="bar/baz.html">Baz</a></li></ul></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
});
