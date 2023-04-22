import { basename } from "path";

export const DEFAULT_INPUTDIR = "src";
export const DEFAULT_OUTPUTDIR = "docs";

export function defaultIndexMdContent(dir: string) {
  const title = dir === "/" ? "Homepage" : basename(dir);
  return "# " + title + "\n\n{{toc}}";
}
