import { OpaqueFile } from "./opaque-file.js";
import { TemplatizedHtmlFile } from "./templatized-html-file.js";
import { OrderFile } from "./order-file.js";
import { MarkdownFile } from "./markdown-file.js";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | TemplatizedHtmlFile | OrderFile;

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  switch (true) {
    case isMarkdown():
      return new MarkdownFile(path, contents.toString());
    case isTemplatizedHtml():
      return new TemplatizedHtmlFile(path, contents.toString());
    case isOrderTxt():
      return new OrderFile(path, contents.toString());
    default:
      return OpaqueFile(path, contents);
  }

  function isMarkdown() {
    return path.endsWith(".md");
  }

  function isTemplatizedHtml() {
    return path.endsWith(".html");
  }

  function isOrderTxt() {
    return path.endsWith("/order.txt");
  }
}

export function pathAndBufferToProjectFile([srcPath, srcContents]: [
  string,
  Buffer
]): [string, ProjectFile] {
  const projectFile = ProjectFile(srcPath, srcContents);
  return [projectFile.outputPath.toString(), projectFile];
}
