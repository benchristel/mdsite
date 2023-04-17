import { FileSet } from "../lib/files";
import { htmlFromMarkdown } from "../lib/markdown";
import { mapEntries } from "../lib/objects";
import { removeSuffix } from "../lib/strings";
import { title } from "./title";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | MarkdownFile | HtmlFile;

export type OpaqueFile = {
  type: "opaque";
  outputPath: string;
  contents: Buffer;
};

export type MarkdownFile = {
  type: "markdown";
  markdown: string;
  rawHtml: string;
  title: string;
  outputPath: string;
};

export type HtmlFile = {
  type: "html";
  rawHtml: string;
  title: string;
  outputPath: string;
};

export function MarkdownFile(path: string, markdown: string): MarkdownFile {
  const rawHtml = htmlFromMarkdown(markdown).trim();
  const htmlPath = removeSuffix(path, ".md") + ".html";
  return {
    type: "markdown",
    markdown,
    rawHtml,
    title: title(htmlPath, rawHtml),
    outputPath: htmlPath,
  };
}

export function HtmlFile(path: string, rawHtml: string): HtmlFile {
  return {
    type: "html",
    rawHtml,
    title: title(path, rawHtml),
    outputPath: path,
  };
}

export function OpaqueFile(path: string, contents: Buffer): OpaqueFile {
  return {
    type: "opaque",
    outputPath: path,
    contents,
  };
}

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return HtmlFile(path, contents.toString());
  } else {
    return OpaqueFile(path, contents);
  }
}

export function parseProjectFiles(files: FileSet): ProjectFileSet {
  return mapEntries(files, ([srcPath, srcContents]) => {
    const projectFile = ProjectFile(srcPath, srcContents);
    return [projectFile.outputPath, projectFile];
  });
}
