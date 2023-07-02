import { buffer } from "../lib/buffer.js";
import { htmlFromMarkdown } from "../lib/markdown.js";
import { removeSuffix } from "../lib/strings.js";
import { trimMargin } from "../testing/formatting.js";
import { title } from "./title.js";
import { test, expect, equals, is } from "@benchristel/taste";
import { htmlToc } from "./toc.js";
import { dirname, relative } from "path";
import { dummyProjectGlobalInfo, } from "./project-global-info.js";
import { homeLink, nextLink, prevLink, upLink } from "./links.js";
export function MarkdownFile(path, markdown) {
    const rawHtml = replaceMarkdownHrefs(htmlFromMarkdown(markdown).trim());
    const htmlPath = removeSuffix(path, ".md") + ".html";
    return HtmlFile(htmlPath, rawHtml);
}
export function HtmlFile(path, rawHtml) {
    const self = {
        type: "html",
        rawHtml,
        title: title(path, rawHtml),
        outputPath: path,
        render,
    };
    return self;
    function render(globalInfo) {
        return [
            self.outputPath,
            buffer(globalInfo.template
                .replace("{{content}}", self.rawHtml)
                .replace(/{{title}}/g, self.title)
                .replace(/{{toc}}/g, () => htmlToc(globalInfo, dirname(self.outputPath)))
                .replace(/{{next}}/g, () => nextLink(globalInfo, self.outputPath))
                .replace(/{{prev}}/g, () => prevLink(globalInfo, self.outputPath))
                .replace(/{{up}}/g, () => upLink(self.outputPath))
                .replace(/{{home}}/g, () => homeLink(self.outputPath))
                .replace(/{{macro ([^}]+)}}/g, "{{$1}}")
                // Relativize links
                .replace(/((?:href|src)=")(\/[^"]+)/g, (_, prefix, path) => prefix + relative(dirname(self.outputPath), path))),
        ];
    }
}
test("HtmlFile", {
    "replaces absolute hrefs with relative ones"() {
        const file = HtmlFile("/foo/bar.html", `<a href="/baz/kludge.html"></a>`);
        const [_, rendered] = file.render(Object.assign(Object.assign({}, dummyProjectGlobalInfo), { template: "{{content}}" }));
        expect(String(rendered), is, `<a href="../baz/kludge.html"></a>`);
    },
    "relativizes multiple hrefs"() {
        const file = HtmlFile("/foo/bar.html", `<a href="/a/b.html"></a><a href="/foo/d.html"></a>`);
        const [_, rendered] = file.render(Object.assign(Object.assign({}, dummyProjectGlobalInfo), { template: "{{content}}" }));
        expect(String(rendered), is, `<a href="../a/b.html"></a><a href="d.html"></a>`);
    },
    "relativizes links in the template"() {
        const file = HtmlFile("/foo/bar.html", "");
        const [_, rendered] = file.render(Object.assign(Object.assign({}, dummyProjectGlobalInfo), { template: `<link rel="stylesheet" href="/assets/style.css">` }));
        expect(String(rendered), is, `<link rel="stylesheet" href="../assets/style.css">`);
    },
    "relativizes script src attributes"() {
        const file = HtmlFile("/foo/bar.html", "");
        const [_, rendered] = file.render(Object.assign(Object.assign({}, dummyProjectGlobalInfo), { template: `<script type="module" src="/js/main.js"></script>` }));
        expect(String(rendered), is, `<script type="module" src="../js/main.js"></script>`);
    },
    "leaves links in code tags alone"() {
        const file = MarkdownFile("/foo/bar.md", '`<a href="/baz/kludge.html"></a>`');
        const [_, rendered] = file.render(Object.assign(Object.assign({}, dummyProjectGlobalInfo), { template: "{{content}}" }));
        expect(String(rendered), is, `<p><code>&lt;a href=&quot;/baz/kludge.html&quot;&gt;&lt;/a&gt;</code></p>`);
    },
});
function replaceMarkdownHrefs(html) {
    return html.replace(/(<a[^>]+href="[^"]+\.)md(")/g, "$1html$2");
}
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
