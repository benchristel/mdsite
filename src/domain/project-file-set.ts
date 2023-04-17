import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { removeSuffix } from "../lib/strings";
import { unreachable } from "../lib/unreachable";
import { title } from "./title";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | MarkdownFile | HtmlFile;

export type OpaqueFile = {
  fate: "preserve";
  contents: Buffer;
};

export type MarkdownFile = {
  fate: "transform";
  markdown: string;
  rawHtml: string;
  title: string;
  htmlPath: string;
};

export type HtmlFile = {
  fate: "preserve-html";
  rawHtml: string;
  title: string;
  htmlPath: string;
};

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    const markdown = contents.toString();
    const rawHtml = htmlFromMarkdown(markdown).trim();
    const htmlPath = removeSuffix(path, ".md") + ".html";
    return {
      fate: "transform",
      markdown,
      rawHtml,
      title: title(htmlPath, rawHtml),
      htmlPath,
    };
  } else if (path.endsWith(".html")) {
    const rawHtml = contents.toString();
    return {
      fate: "preserve-html",
      rawHtml,
      title: title(path, rawHtml),
      htmlPath: path,
    };
  } else {
    return {
      fate: "preserve",
      contents,
    };
  }
}

export function parseProjectFiles(files: FileSet): ProjectFileSet {
  return Object.entries(files)
    .map(([srcPath, srcContents]) => {
      const projectFile = ProjectFile(srcPath, srcContents);
      switch (projectFile.fate) {
        case "preserve":
          return [srcPath, projectFile] as [string, ProjectFile];
        case "transform":
        case "preserve-html":
          return [projectFile.htmlPath, projectFile] as [string, ProjectFile];
        default:
          throw unreachable("unexpected fate for project file", projectFile);
      }
    })
    .reduce(intoObject, {});
}
