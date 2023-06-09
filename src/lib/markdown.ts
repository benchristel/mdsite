import { marked } from "marked";

import { test, expect, is } from "@benchristel/taste";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { macroPattern } from "../domain/macros/parser";

export function htmlFromMarkdown(md: string): string {
  return marked.parse(md);
}

test("htmlFromMarkdown", {
  "renders an empty document"() {
    expect(htmlFromMarkdown(""), is, "");
  },

  "renders markdown to HTML"() {
    expect(htmlFromMarkdown("# Hello"), is, `<h1 id="hello">Hello</h1>\n`);
  },

  "converts wiki-style links to HTML links"() {
    expect(
      htmlFromMarkdown("[[MyWikiPage]]"),
      is,
      `<p><a href="MyWikiPage.html">MyWikiPage</a></p>\n`
    );
  },

  "ignores wiki-style links with an alias"() {
    // Obsidian and GitHub Pages have opposite conventions for which half is
    // the filename and which half is the alias, so we can't do anything
    // sensible with these links.
    expect(htmlFromMarkdown("[[Foo|Bar]]"), is, `<p>[[Foo|Bar]]</p>\n`);
  },
});

const wikiLink = {
  name: "wikiLink",
  level: "inline",
  start(src: string) {
    return src.match(/\[\[/)?.index;
  },
  tokenizer(src: string) {
    const rule = /^\[\[([^|\[\]]+)]]/;
    const match = rule.exec(src);
    if (match) {
      const token = {
        type: "wikiLink",
        raw: match[0],
        text: match[1].trim(),
        tokens: [],
      };
      return token;
    }
  },
  renderer(token: any): string {
    return `<a href="${token.text}.html">${token.text}</a>`;
  },
};

const macroRegex = new RegExp("^" + macroPattern);
const macro = {
  name: "macro",
  level: "inline",
  start(src: string) {
    return src.match(/{{/)?.index;
  },
  tokenizer(src: string) {
    const match = macroRegex.exec(src);
    if (match) {
      return {
        type: "macro",
        raw: match[0],
        text: match[0],
        tokens: [],
      };
    }
  },
  renderer(token: any) {
    return token.text;
  },
};

marked.use({ extensions: [wikiLink, macro] });
marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  })
);
