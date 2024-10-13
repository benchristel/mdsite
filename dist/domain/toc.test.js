import { test, expect, is, equals } from "@benchristel/taste";
import { toc, htmlToc, leaf, branch } from "./toc.js";
import { OutputPath } from "./output-path.js";
function of(s) {
    return OutputPath.of(s);
}
test("toc", {
    "given an empty set of files"() {
        expect(toc([]), equals, []);
    },
    "excludes the root index.html file"() {
        const files = [
            { type: "html", path: of("/index.html"), title: "whatever" },
        ];
        expect(toc(files), equals, []);
    },
    "excludes the index.html under the given root"() {
        const files = [
            { type: "html", path: of("/foo/index.html"), title: "whatever" },
        ];
        expect(toc(files, { root: "/foo" }), equals, []);
    },
    "given several files"() {
        const files = [
            { type: "html", path: of("/aaa.html"), title: "aaa.html" },
            { type: "html", path: of("/bbb.html"), title: "bbb.html" },
        ];
        const expected = [
            leaf({ path: of("/aaa.html"), title: "aaa.html" }),
            leaf({ path: of("/bbb.html"), title: "bbb.html" }),
        ];
        expect(toc(files), equals, expected);
    },
    "given an index.html file in a subdirectory"() {
        const files = [
            { type: "html", path: of("/sub/index.html"), title: "sub" },
        ];
        const expected = [branch({ path: of("/sub/index.html"), title: "sub" })];
        expect(toc(files), equals, expected);
    },
    "given a subdirectory with several files"() {
        const files = [
            { type: "html", path: of("/sub/index.html"), title: "sub" },
            { type: "html", path: of("/sub/aaa.html"), title: "aaa.html" },
            { type: "html", path: of("/sub/bbb.html"), title: "bbb.html" },
        ];
        const expected = [
            branch({ path: of("/sub/index.html"), title: "sub" }, leaf({ path: of("/sub/aaa.html"), title: "aaa.html" }), leaf({ path: of("/sub/bbb.html"), title: "bbb.html" })),
        ];
        expect(toc(files), equals, expected);
    },
    "given a sub-subdirectory"() {
        const files = [
            { type: "html", path: of("/sub/index.html"), title: "sub" },
            { type: "html", path: of("/sub/marine/index.html"), title: "marine" },
            { type: "html", path: of("/sub/marine/aaa.html"), title: "aaa.html" },
            { type: "html", path: of("/sub/marine/bbb.html"), title: "bbb.html" },
            { type: "html", path: of("/sub/marine/ccc.html"), title: "ccc.html" },
        ];
        const expected = [
            branch({ path: of("/sub/index.html"), title: "sub" }, branch({ path: of("/sub/marine/index.html"), title: "marine" }, leaf({ path: of("/sub/marine/aaa.html"), title: "aaa.html" }), leaf({ path: of("/sub/marine/bbb.html"), title: "bbb.html" }), leaf({ path: of("/sub/marine/ccc.html"), title: "ccc.html" }))),
        ];
        expect(toc(files), equals, expected);
    },
    "keeps files in order"() {
        const files = [
            { type: "html", path: of("/bbb.html"), title: "1" },
            { type: "html", path: of("/ddd.html"), title: "2" },
            { type: "html", path: of("/aaa.html"), title: "3" },
            { type: "html", path: of("/ccc.html"), title: "4" },
        ];
        const expected = [
            leaf({ path: of("/bbb.html"), title: "1" }),
            leaf({ path: of("/ddd.html"), title: "2" }),
            leaf({ path: of("/aaa.html"), title: "3" }),
            leaf({ path: of("/ccc.html"), title: "4" }),
        ];
        expect(toc(files), equals, expected);
    },
    "keeps directories in order"() {
        const files = [
            { type: "html", path: of("/index.html"), title: "Homepage" },
            { type: "html", path: of("/aaa/index.html"), title: "aaa" },
            { type: "html", path: of("/aaa/foo.html"), title: "foo.html" },
            { type: "html", path: of("/bbb/index.html"), title: "bbb" },
            { type: "html", path: of("/bbb/foo.html"), title: "foo.html" },
            { type: "html", path: of("/ccc/index.html"), title: "ccc" },
            { type: "html", path: of("/ccc/foo.html"), title: "foo.html" },
            { type: "html", path: of("/ddd/index.html"), title: "ddd" },
            { type: "html", path: of("/ddd/foo.html"), title: "foo.html" },
        ];
        const expected = [
            branch({ path: of("/aaa/index.html"), title: "aaa" }, leaf({ path: of("/aaa/foo.html"), title: "foo.html" })),
            branch({ path: of("/bbb/index.html"), title: "bbb" }, leaf({ path: of("/bbb/foo.html"), title: "foo.html" })),
            branch({ path: of("/ccc/index.html"), title: "ccc" }, leaf({ path: of("/ccc/foo.html"), title: "foo.html" })),
            branch({ path: of("/ddd/index.html"), title: "ddd" }, leaf({ path: of("/ddd/foo.html"), title: "foo.html" })),
        ];
        expect(toc(files), equals, expected);
    },
});
test("htmlToc", {
    "given an empty set of files"() {
        expect(htmlToc([], OutputPath.of("/index.html")), is, "");
    },
    "given a tree with one file"() {
        const files = [
            { type: "html", path: of("/foo.html"), title: "This Is Foo" },
        ];
        const expected = `<ul><li><a href="foo.html">This Is Foo</a></li></ul>`;
        expect(htmlToc(files, OutputPath.of("/index.html")), is, expected);
    },
    "generates a list of multiple links"() {
        const files = [
            { type: "html", path: of("/bar.html"), title: "Bar" },
            { type: "html", path: of("/foo.html"), title: "Foo" },
        ];
        const expected = `<ul><li><a href="bar.html">Bar</a></li><li><a href="foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, OutputPath.of("/index.html")), is, expected);
    },
    "creates relative links, starting from the linkOrigin"() {
        const files = [
            { type: "html", path: of("/foo.html"), title: "Foo" },
        ];
        const expected = `<ul><li><a href="../../../foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, OutputPath.of("/one/two/three/foo.html"), { root: "/" }), is, expected);
    },
    recurses() {
        const files = [
            { type: "html", path: of("/bar/index.html"), title: "Bar" },
            { type: "html", path: of("/bar/baz.html"), title: "Baz" },
        ];
        const expected = `<ul><li><a href="bar/index.html">Bar</a><ul><li><a href="bar/baz.html">Baz</a></li></ul></li></ul>`;
        expect(htmlToc(files, OutputPath.of("/index.html")), is, expected);
    },
});
