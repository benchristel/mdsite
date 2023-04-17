import { htmlFromMarkdown } from "../lib/markdown";
import { removeSuffix } from "../lib/strings";
import { title } from "./title";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = PreservedFile | TransformedFile;

export type PreservedFile = {
  fate: "preserve";
  contents: Buffer;
};

export type TransformedFile = {
  fate: "transform";
  markdown: string;
  rawHtml: string;
  title: string;
  htmlPath: string;
};

export function ProjectFile(path: string, contents: Buffer) {
  if (path.endsWith(".md")) {
    const markdown = contents.toString();
    const rawHtml = htmlFromMarkdown(markdown);
    const htmlPath = removeSuffix(path, ".md") + ".html";
    return {
      fate: "transform",
      markdown,
      rawHtml,
      title: title(htmlPath, rawHtml),
      htmlPath,
    };
  } else {
    return {
      fate: "preserve",
      contents,
    };
  }
}
