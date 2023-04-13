import { marked } from "marked";

import { test, expect, is } from "@benchristel/taste";

function htmlFromMarkdown(md: string): string {
  return marked.parse(md);
}

test("htmlFromMarkdown", {
  "renders an empty document"() {
    expect(htmlFromMarkdown(""), is, "");
  },

  "renders markdown to HTML"() {
    expect(htmlFromMarkdown("# Hello"), is, `<h1 id="hello">Hello</h1>\n`);
  },
});
