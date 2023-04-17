import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { intoObject } from "../lib/objects";
import { removeSuffix } from "../lib/strings";
import { unreachable } from "../lib/unreachable";
import { title } from "./title";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | MarkdownFile | HtmlFile;

export type OpaqueFile = {
  type: "opaque";
  contents: Buffer;
};

export type MarkdownFile = {
  type: "markdown";
  markdown: string;
  rawHtml: string;
  title: string;
  htmlPath: string;
};

export type HtmlFile = {
  type: "html";
  rawHtml: string;
  title: string;
  htmlPath: string;
};

export function MarkdownFile(path: string, markdown: string): MarkdownFile {
  const rawHtml = htmlFromMarkdown(markdown).trim();
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return {
    type: "markdown",
    markdown,
    rawHtml,
    title: title(htmlPath, rawHtml),
    htmlPath,
  };
}

export function HtmlFile(path: string, rawHtml: string): HtmlFile {
  return {
    type: "html",
    rawHtml,
    title: title(path, rawHtml),
    htmlPath: path,
  };
}

export function OpaqueFile(contents: Buffer): OpaqueFile {
  return {
    type: "opaque",
    contents,
  };
}

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return HtmlFile(path, contents.toString());
  } else {
    return OpaqueFile(contents);
  }
}

export function parseProjectFiles(files: FileSet): ProjectFileSet {
  return Object.entries(files)
    .map(([srcPath, srcContents]) => {
      const projectFile = ProjectFile(srcPath, srcContents);
      switch (projectFile.type) {
        case "opaque":
          return [srcPath, projectFile] as [string, ProjectFile];
        case "markdown":
        case "html":
          return [projectFile.htmlPath, projectFile] as [string, ProjectFile];
        default:
          throw unreachable("unexpected type of project file", projectFile);
      }
    })
    .reduce(intoObject, {});
}
