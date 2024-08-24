import { Marked } from "marked";

import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import { macroPattern } from "../domain/macros/parser.js";
import markedFootnote from "marked-footnote";
import { gfmHeadingId } from "marked-gfm-heading-id";

const marked = new Marked()
  .use(markedFootnote())
  .use(gfmHeadingId())
  .use({ extensions: [wikiLink(), macro()] })
  .use(
    markedHighlight({
      langPrefix: "hljs language-",
      highlight(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : "plaintext";
        return hljs.highlight(code, { language }).value;
      },
    })
  );

export function htmlFromMarkdown(md: string): string {
  // Unsafe cast: marked.parse() returns a Promise if there are async
  // extensions, but we aren't using any of those.
  return marked.parse(md) as string;
}

function wikiLink() {
  return {
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
}

const macroRegex = new RegExp("^" + macroPattern);
function macro() {
  return {
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
}
