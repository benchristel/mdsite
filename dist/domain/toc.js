export { htmlToc } from "./toc.impl.js";
import { test, expect, is, equals } from "@benchristel/taste";
import { toc, htmlToc, leaf, branch } from "./toc.impl.js";
{
    // htmlToc() generates an HTML "tree of contents" with <ul> and <li>
    // elements, and links.
    htmlToc;
}
test("toc", {
    "given an empty set of files"() {
        expect(toc([]), equals, []);
    },
    "excludes the root index.html file"() {
        const files = [{ path: "/index.html", title: "whatever" }];
        expect(toc(files), equals, []);
    },
    "excludes the index.html under the given root"() {
        const files = [{ path: "/foo/index.html", title: "whatever" }];
        expect(toc(files, "/foo"), equals, []);
    },
    "given several files"() {
        const files = [
            { path: "/aaa.html", title: "aaa.html" },
            { path: "/bbb.html", title: "bbb.html" },
        ];
        const expected = [
            leaf({ path: "/aaa.html", title: "aaa.html" }),
            leaf({ path: "/bbb.html", title: "bbb.html" }),
        ];
        expect(toc(files), equals, expected);
    },
    "given an index.html file in a subdirectory"() {
        const files = [{ path: "/sub/index.html", title: "sub" }];
        const expected = [branch({ path: "/sub/index.html", title: "sub" })];
        expect(toc(files), equals, expected);
    },
    "given a subdirectory with several files"() {
        const files = [
            { path: "/sub/index.html", title: "sub" },
            { path: "/sub/aaa.html", title: "aaa.html" },
            { path: "/sub/bbb.html", title: "bbb.html" },
        ];
        const expected = [
            branch({ path: "/sub/index.html", title: "sub" }, leaf({ path: "/sub/aaa.html", title: "aaa.html" }), leaf({ path: "/sub/bbb.html", title: "bbb.html" })),
        ];
        expect(toc(files), equals, expected);
    },
    "given a sub-subdirectory"() {
        const files = [
            { path: "/sub/index.html", title: "sub" },
            { path: "/sub/marine/index.html", title: "marine" },
            { path: "/sub/marine/aaa.html", title: "aaa.html" },
            { path: "/sub/marine/bbb.html", title: "bbb.html" },
            { path: "/sub/marine/ccc.html", title: "ccc.html" },
        ];
        const expected = [
            branch({ path: "/sub/index.html", title: "sub" }, branch({ path: "/sub/marine/index.html", title: "marine" }, leaf({ path: "/sub/marine/aaa.html", title: "aaa.html" }), leaf({ path: "/sub/marine/bbb.html", title: "bbb.html" }), leaf({ path: "/sub/marine/ccc.html", title: "ccc.html" }))),
        ];
        expect(toc(files), equals, expected);
    },
    "keeps files in order"() {
        const files = [
            { path: "/bbb.html", title: "1" },
            { path: "/ddd.html", title: "2" },
            { path: "/aaa.html", title: "3" },
            { path: "/ccc.html", title: "4" },
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
            { path: "/index.html", title: "Homepage" },
            { path: "/aaa/index.html", title: "aaa" },
            { path: "/aaa/foo.html", title: "foo.html" },
            { path: "/bbb/index.html", title: "bbb" },
            { path: "/bbb/foo.html", title: "foo.html" },
            { path: "/ccc/index.html", title: "ccc" },
            { path: "/ccc/foo.html", title: "foo.html" },
            { path: "/ddd/index.html", title: "ddd" },
            { path: "/ddd/foo.html", title: "foo.html" },
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
        const files = [{ path: "/foo.html", title: "This Is Foo" }];
        const expected = `<ul><li><a href="foo.html">This Is Foo</a></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
    "generates a list of multiple links"() {
        const files = [
            { path: "/bar.html", title: "Bar" },
            { path: "/foo.html", title: "Foo" },
        ];
        const expected = `<ul><li><a href="bar.html">Bar</a></li><li><a href="foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
    "creates relative links, starting from the linkOrigin"() {
        const files = [{ path: "/foo.html", title: "Foo" }];
        const expected = `<ul><li><a href="../../../foo.html">Foo</a></li></ul>`;
        expect(htmlToc(files, "/one/two/three/foo.html", "/"), is, expected);
    },
    recurses() {
        const files = [
            { path: "/bar/index.html", title: "Bar" },
            { path: "/bar/baz.html", title: "Baz" },
        ];
        const expected = `<ul><li><a href="bar/index.html">Bar</a><ul><li><a href="bar/baz.html">Baz</a></li></ul></li></ul>`;
        expect(htmlToc(files, "/index.html"), is, expected);
    },
});
