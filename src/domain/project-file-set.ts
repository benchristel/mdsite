import { OpaqueFile } from "./opaque-file";
import { HtmlFile, MarkdownFile } from "./html-file";
import { OrderFile } from "./order-file";

export type ProjectFileSet = Record<string, ProjectFile>;

export type ProjectFile = OpaqueFile | HtmlFile | OrderFile;

export function ProjectFile(path: string, contents: Buffer): ProjectFile {
  if (path.endsWith(".md")) {
    return MarkdownFile(path, contents.toString());
  } else if (path.endsWith(".html")) {
    return HtmlFile(path, contents.toString());
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
