import { test, expect, is } from "@benchristel/taste";
import { htmlFromMarkdown } from "./markdown.js";
test("htmlFromMarkdown", {
    "renders an empty document"() {
        expect(htmlFromMarkdown(""), is, "");
    },
    "renders markdown to HTML"() {
        expect(htmlFromMarkdown("# Hello"), is, `<h1 id="hello">Hello</h1>\n`);
    },
    "converts wiki-style links to HTML links"() {
        expect(htmlFromMarkdown("[[MyWikiPage]]"), is, `<p><a href="MyWikiPage.html">MyWikiPage</a></p>\n`);
    },
    "ignores wiki-style links with an alias"() {
        // Obsidian and GitHub Pages have opposite conventions for which half is
        // the filename and which half is the alias, so we can't do anything
        // sensible with these links.
        expect(htmlFromMarkdown("[[Foo|Bar]]"), is, `<p>[[Foo|Bar]]</p>\n`);
    },
});
