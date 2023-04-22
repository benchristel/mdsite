import { basename } from "path";
import { trimMargin } from "../testing/formatting";

export const DEFAULT_INPUTDIR = "src";
export const DEFAULT_OUTPUTDIR = "docs";

export function defaultIndexMdContent(dir: string) {
  const title = dir === "/" ? "Homepage" : basename(dir);
  return "# " + title + "\n\n{{toc}}";
}

export const defaultTemplate = trimMargin`
  <!DOCTYPE html>
  <html>
    <head>
      <title>{{title}}</title>
    </head>
    <body>
      {{content}}
    </body>
  </html>
`;
