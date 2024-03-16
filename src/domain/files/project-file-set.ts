import { OpaqueFile } from "./opaque-file.js";
import { HtmlFile } from "./html-file.js";
import { OrderFile } from "./order-file.js";
import { MarkdownFile } from "./markdown-file.js";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | HtmlFile | OrderFile;

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return new MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return new HtmlFile(path, contents.toString());
  } else if (path.endsWith("/order.txt")) {
    return OrderFile(path, contents.toString());
  } else {
    return OpaqueFile(path, contents);
  }
}

export function pathAndBufferToProjectFile([srcPath, srcContents]: [
  string,
  Buffer
]): [string, ProjectFile] {
  const projectFile = ProjectFile(srcPath, srcContents);
  return [projectFile.outputPath, projectFile];
}
