import { test, expect, is, equals } from "@benchristel/taste";
import { HtmlFile } from "./html-file";
import { MarkdownFile, replaceMarkdownHrefs } from "./markdown-file";
import { trimMargin } from "../../testing/formatting";
import { Project } from "../project";
test("HtmlFile", {
    "replaces absolute hrefs with relative ones"() {
        const project = new Project({}, "{{content}}");
        const file = new HtmlFile("/foo/bar.html", `<a href="/baz/kludge.html"></a>`);
        const [_, rendered] = file.render(project);
        expect(String(rendered), is, `<a href="../baz/kludge.html"></a>`);
    },
    "relativizes multiple hrefs"() {
        const project = new Project({}, "{{content}}");
        const file = new HtmlFile("/foo/bar.html", `<a href="/a/b.html"></a><a href="/foo/d.html"></a>`);
        const [_, rendered] = file.render(project);
        expect(String(rendered), is, `<a href="../a/b.html"></a><a href="d.html"></a>`);
    },
    "relativizes links in the template"() {
        const project = new Project({}, `<link rel="stylesheet" href="/assets/style.css">`);
        const file = new HtmlFile("/foo/bar.html", "");
        const [_, rendered] = file.render(project);
        expect(String(rendered), is, `<link rel="stylesheet" href="../assets/style.css">`);
    },
    "relativizes script src attributes"() {
        const project = new Project({}, `<script type="module" src="/js/main.js"></script>`);
        const file = new HtmlFile("/foo/bar.html", "");
        const [_, rendered] = file.render(project);
        expect(String(rendered), is, `<script type="module" src="../js/main.js"></script>`);
    },
    "leaves links in code tags alone"() {
        const project = new Project({}, "{{content}}");
        const file = MarkdownFile("/foo/bar.md", '`<a href="/baz/kludge.html"></a>`');
        const [_, rendered] = file.render(project);
        expect(String(rendered), is, `<p><code>&lt;a href=&quot;/baz/kludge.html&quot;&gt;&lt;/a&gt;</code></p>`);
    },
});
test("replaceMarkdownHrefs", {
    "converts a .md link to a .html link"() {
        expect(replaceMarkdownHrefs(`<a href="foo/bar.md">link</a>`), equals, `<a href="foo/bar.html">link</a>`);
    },
    "converts several .md links"() {
        expect(replaceMarkdownHrefs(trimMargin `
        <a href="one.md">one</a>
        <a href="two.md">two</a>
      `), equals, trimMargin `
        <a href="one.html">one</a>
        <a href="two.html">two</a>
      `);
    },
});
