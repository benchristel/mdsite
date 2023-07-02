import { basename } from "path";
import { trimMargin } from "../testing/formatting.js";
export const DEFAULT_INPUTDIR = "src";
export const DEFAULT_OUTPUTDIR = "docs";
export const DEFAULT_TEMPLATEFILE = "template.html";
export function defaultIndexMdContent(dir) {
    const title = dir === "/" ? "Homepage" : basename(dir);
    return "# " + title + "\n\n{{toc}}";
}
export const defaultTemplate = trimMargin `
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{content}}
      <nav>
        {{home}} | {{up}} | {{prev}} | {{next}}
      </nav>
    </body>
  </html>
`;
