import { OpaqueFile } from "./opaque-file.js";
import { TemplatizedHtmlFile } from "./templatized-html-file.js";
import { OrderFile } from "./order-file.js";
import { MarkdownFile } from "./markdown-file.js";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | TemplatizedHtmlFile | OrderFile;

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return new MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return new TemplatizedHtmlFile(path, contents.toString());
  } else if (path.endsWith("/order.txt")) {
    return new OrderFile(path, contents.toString());
  } else {
    return OpaqueFile(path, contents);
  }
}

export function pathAndBufferToProjectFile([srcPath, srcContents]: [
  string,
  Buffer
]): [string, ProjectFile] {
  const projectFile = ProjectFile(srcPath, srcContents);
  return [projectFile.outputPath.toString(), projectFile];
}
